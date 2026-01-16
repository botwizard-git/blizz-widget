/**
 * WWZBlizz - API Service
 */
(function() {
    'use strict';

    var EBB = window.WWZBlizz;
    var CONFIG = EBB.CONFIG;
    var SessionService = EBB.SessionService;

    var STORAGE_KEYS = EBB.STORAGE_KEYS;

    EBB.APIService = {
        /**
         * Track if session cookie is initialized (in-memory flag)
         */
        _sessionInitialized: false,

        /**
         * Check if server cookie is still valid based on stored init time
         */
        _isCookieValid: function() {
            var initTime = localStorage.getItem(STORAGE_KEYS.COOKIE_INIT_TIME);
            if (!initTime) {
                return false;
            }

            var elapsed = Date.now() - parseInt(initTime, 10);
            var maxAge = CONFIG.cookieMaxAge || (23 * 60 * 60 * 1000); // 23 hours default

            return elapsed < maxAge;
        },

        /**
         * Store cookie init time
         */
        _setCookieInitTime: function() {
            localStorage.setItem(STORAGE_KEYS.COOKIE_INIT_TIME, Date.now().toString());
        },

        /**
         * Clear cookie init time (on session clear)
         */
        _clearCookieInitTime: function() {
            localStorage.removeItem(STORAGE_KEYS.COOKIE_INIT_TIME);
        },

        /**
         * Fetch with timeout support (includes credentials for cookies)
         */
        fetchWithTimeout: function(url, options, timeout) {
            var timeoutMs = timeout || CONFIG.requestTimeout || 60000;

            // Always include credentials for cookie support
            var fetchOptions = Object.assign({}, options, {
                credentials: 'include'
            });

            return new Promise(function(resolve, reject) {
                var timeoutId = setTimeout(function() {
                    reject(new Error('TIMEOUT'));
                }, timeoutMs);

                fetch(url, fetchOptions)
                    .then(function(response) {
                        clearTimeout(timeoutId);
                        resolve(response);
                    })
                    .catch(function(error) {
                        clearTimeout(timeoutId);
                        reject(error);
                    });
            });
        },

        /**
         * Initialize session with server (get cookie)
         * Called once when widget loads
         * @param {boolean} forceRefresh - Force a new init call even if already initialized
         */
        initSession: function(forceRefresh) {
            var self = this;

            // Already initialized in this page session
            if (this._sessionInitialized && !forceRefresh) {
                return Promise.resolve(true);
            }

            // Check if we have a valid cookie from previous page load
            // Skip /init call if cookie is still valid (avoids unnecessary API call on refresh)
            if (!forceRefresh && this._isCookieValid()) {
                console.log('[WWZBlizz] Using existing valid session cookie (skipping /init)');
                this._sessionInitialized = true;
                return Promise.resolve(true);
            }

            console.log('[WWZBlizz] Initializing session...');

            // Add cache-busting timestamp to prevent browser caching
            var initUrl = CONFIG.initEndpoint + '?_t=' + Date.now();

            return this.fetchWithTimeout(initUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                },
                cache: 'no-store'
            })
            .then(function(response) {
                if (!response.ok) {
                    console.error('[WWZBlizz] Session init failed:', response.status);
                    return false;
                }
                self._sessionInitialized = true;
                self._setCookieInitTime(); // Remember when we got the cookie
                console.log('[WWZBlizz] Session initialized successfully');
                return true;
            })
            .catch(function(error) {
                console.error('[WWZBlizz] Session init error:', error);
                return false;
            });
        },

        /**
         * Ensure session is initialized before making API calls
         */
        ensureSession: function() {
            var self = this;

            if (this._sessionInitialized) {
                return Promise.resolve(true);
            }

            return this.initSession();
        },

        /**
         * Build the request payload
         */
        buildPayload: function(message) {
            var sessionId = SessionService.getSessionId();

            if (!sessionId) {
                sessionId = SessionService.generateUUID();
                SessionService.setSessionId(sessionId);
            }

            return {
                blizzUserMsg: message,
                blizzSessionId: sessionId,
                blizzBotMessageId: SessionService.generateUUID(),
                clientUrl: window.location.href,
                widgetId: CONFIG.widgetId,
                agentId: CONFIG.AGENT_ID,
                isInternal: CONFIG.isInternal()
            };
        },

        /**
         * Parse API response
         */
        parseResponse: function(data) {
            // Extract message from various response formats
            var message = data.simpleMessage || data.message || data.text ||
                         (data.replies && data.replies[0] && (data.replies[0].text || data.replies[0].message));

            // Check for contact form payload prefix
            if (message && message.indexOf('CONTACTFORMPAYLOAD_') === 0) {
                try {
                    var jsonStr = message.substring('CONTACTFORMPAYLOAD_'.length);
                    var formData = JSON.parse(jsonStr);
                    return {
                        type: 'contactForm',
                        formData: formData,
                        suggestions: data.suggestions || []
                    };
                } catch (e) {
                    console.error('[WWZBlizz] Failed to parse contact form payload', e);
                }
            }

            // Handle simpleMessage format (including simpleMessage-ai)
            if (data && data.type && data.type.indexOf('simpleMessage') === 0) {
                return {
                    type: 'simpleMessage',
                    message: data.message || '',
                    replies: data.message ? [data.message] : [],
                    suggestions: data.suggestions || [],
                    shopList: data.shopList || [],
                    showAllShops: data.showAllShops || false,
                    isHtml: true
                };
            }

            // Handle legacy format
            var response = (data && data.response) || data || {};

            return {
                type: 'legacy',
                message: '',
                replies: response.replies || [],
                suggestions: response.suggestions || [],
                sessionId: response.sessionId || null,
                shopList: response.shopList || data.shopList || [],
                showAllShops: response.showAllShops || data.showAllShops || false,
                isHtml: false
            };
        },

        /**
         * Send message to API
         */
        sendMessage: function(message, isRetry) {
            var self = this;

            // Ensure session cookie exists before sending
            return this.ensureSession().then(function(hasSession) {
                if (!hasSession) {
                    console.warn('[WWZBlizz] No session, attempting to send anyway');
                }

                var payload = self.buildPayload(message);
                console.log('[WWZBlizz] Sending message');

                return self.fetchWithTimeout(CONFIG.apiEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json, text/plain, */*'
                    },
                    body: JSON.stringify(payload)
                });
            })
            .then(function(response) {
                // Handle 403 - session expired or invalid
                if (response.status === 403) {
                    self._sessionInitialized = false;
                    self._clearCookieInitTime(); // Cookie is invalid, clear stored time

                    // Retry once with fresh init
                    if (!isRetry) {
                        console.log('[WWZBlizz] Session expired, re-initializing and retrying...');
                        return self.initSession(true).then(function() {
                            return self.sendMessage(message, true);
                        });
                    }
                    throw new Error('SESSION_EXPIRED');
                }
                if (!response.ok) {
                    throw new Error('API Error: ' + response.status);
                }
                return response.json();
            })
            .then(function(data) {
                var parsed = self.parseResponse(data);

                if (parsed.sessionId) {
                    SessionService.setSessionId(parsed.sessionId);
                }

                return parsed;
            });
        },

        /**
         * Submit user feedback
         */
        submitFeedback: function(feedbackData) {
            var self = this;

            return this.ensureSession().then(function() {
                // Handle both old format (rating, comment) and new format (object)
                var payload = {
                    sessionId: SessionService.getSessionId(),
                    agentId: CONFIG.AGENT_ID,
                    widgetId: CONFIG.widgetId,
                    timestamp: new Date().toISOString(),
                    botName: "BLIZZ",
                    isInternal: CONFIG.isInternal()
                };

                if (typeof feedbackData === 'object' && feedbackData !== null) {
                    payload.rating = feedbackData.rating;
                    payload.options = feedbackData.options || [];
                    payload.additionalFeedback = feedbackData.additionalFeedback || '';
                } else {
                    // Legacy format - just rating number
                    payload.rating = feedbackData;
                    payload.options = [];
                    payload.additionalFeedback = '';
                }

                return self.fetchWithTimeout(CONFIG.RATING_API, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json, text/plain, */*'
                    },
                    body: JSON.stringify(payload)
                });
            })
            .then(function(response) {
                if (response.status === 403) {
                    self._sessionInitialized = false;
                }
                return response.ok;
            })
            .catch(function(error) {
                console.error('[WWZBlizz] Feedback submission failed:', error);
                return false;
            });
        },

        /**
         * Submit message-level feedback (thumbs up/down)
         */
        submitMessageFeedback: function(messageId, feedbackType, comment) {
            var self = this;
            var StateManager = EBB.StateManager;

            return this.ensureSession().then(function() {
                // Get the message text for context
                var messages = StateManager.getMessages();
                var message = null;
                for (var i = 0; i < messages.length; i++) {
                    if (messages[i].id === messageId) {
                        message = messages[i];
                        break;
                    }
                }

                var payload = {
                    sessionId: SessionService.getSessionId(),
                    messageId: messageId,
                    feedbackType: feedbackType,
                    comment: comment || '',
                    messageText: message ? message.text : '',
                    agentId: CONFIG.AGENT_ID,
                    widgetId: CONFIG.widgetId,
                    timestamp: new Date().toISOString(),
                    botName: "BLIZZ"
                };

                console.log('[WWZBlizz] Submitting message feedback:', payload);

                return self.fetchWithTimeout(CONFIG.RATING_API, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json, text/plain, */*'
                    },
                    body: JSON.stringify(payload)
                });
            })
            .then(function(response) {
                if (response.status === 403) {
                    self._sessionInitialized = false;
                }
                return response.ok;
            })
            .catch(function(error) {
                console.error('[WWZBlizz] Message feedback submission failed:', error);
                return false;
            });
        },

        /**
         * Fetch shop locations from API
         * Returns object with shops (keyed by ID) and mapPins (array)
         */
        fetchShops: function() {
            console.log('[WWZBlizz] Fetching shops...');

            return fetch(CONFIG.shopsEndpoint, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(function(response) {
                if (!response.ok) {
                    throw new Error('Failed to fetch shops: ' + response.status);
                }
                return response.json();
            })
            .then(function(data) {
                var result = {
                    shops: {},
                    mapPins: [],
                    metadata: data.metadata || {}
                };

                // Handle new format (shops as object, mapPins as array)
                if (data.shops && typeof data.shops === 'object' && !Array.isArray(data.shops)) {
                    result.shops = data.shops;
                    result.mapPins = data.mapPins || [];
                }
                // Handle legacy format (shops as array)
                else if (data.shops && Array.isArray(data.shops)) {
                    data.shops.forEach(function(shop) {
                        result.shops[shop.id] = shop;
                    });
                }

                console.log('[WWZBlizz] Loaded', Object.keys(result.shops).length, 'shops,', result.mapPins.length, 'map pins');
                return result;
            })
            .catch(function(error) {
                console.error('[WWZBlizz] Failed to fetch shops:', error);
                return { shops: {}, mapPins: [], metadata: {} };
            });
        },

        /**
         * Log client-side errors to the server
         */
        logError: function(error, context) {
            var self = this;

            return this.ensureSession().then(function() {
                var payload = {
                    error: error.message || String(error),
                    stack: error.stack || null,
                    context: context || {},
                    timestamp: new Date().toISOString(),
                    sessionId: SessionService.getSessionId(),
                    widgetId: CONFIG.widgetId,
                    userAgent: navigator.userAgent,
                    url: window.location.href
                };

                return self.fetchWithTimeout(CONFIG.logErrorsEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(payload)
                }, 5000); // Short timeout for error logging
            })
            .then(function(response) {
                return response.ok;
            })
            .catch(function(err) {
                // Silently fail - don't cause more errors while logging errors
                console.warn('[WWZBlizz] Failed to log error:', err);
                return false;
            });
        },

        /**
         * Submit contact form
         */
        submitContactForm: function(formData) {
            var self = this;

            return this.ensureSession().then(function() {
                console.log('[WWZBlizz] Submitting contact form');

                // Format payload as expected by blizz-proxy
                var payload = {
                    type: 'simpleMessage',
                    message: JSON.stringify(formData),
                    formData: formData,
                    sessionId: SessionService.getSessionId(),
                    timestamp: new Date().toISOString(),
                    widgetId: CONFIG.widgetId,
                    agentId: CONFIG.AGENT_ID
                };

                return self.fetchWithTimeout(CONFIG.CONTACT_FORM_API, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json, text/plain, */*'
                    },
                    body: JSON.stringify(payload)
                });
            })
            .then(function(response) {
                if (response.status === 403) {
                    self._sessionInitialized = false;
                    throw new Error('SESSION_EXPIRED');
                }
                if (!response.ok) {
                    throw new Error('Form submission failed: ' + response.status);
                }
                return response.json();
            })
            .then(function(data) {
                console.log('[WWZBlizz] Contact form submitted successfully');
                return { success: true, data: data };
            })
            .catch(function(error) {
                console.error('[WWZBlizz] Contact form submission failed:', error);
                return { success: false, error: error.message };
            });
        }
    };

    console.log('[WWZBlizz] APIService loaded');
})();
