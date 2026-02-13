/**
 * WWZ Ivy Chatbot - API Service
 */
(function() {
    'use strict';

    window.WWZIvy = window.WWZIvy || {};

    const Config = window.WWZIvy.Config;
    const Storage = window.WWZIvy.Storage;

    window.WWZIvy.API = {
        /**
         * Track if session cookie is initialized
         */
        _sessionInitialized: false,

        /**
         * Fetch with timeout support (includes credentials for cookies)
         */
        fetchWithTimeout: function(url, options, timeout) {
            var timeoutMs = timeout || 60000;

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
         */
        initSession: function() {
            var self = this;

            if (this._sessionInitialized) {
                return Promise.resolve(true);
            }

            console.log('[WWZIvy] Initializing session...');

            return this.fetchWithTimeout(Config.initEndpoint, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(function(response) {
                if (!response.ok) {
                    console.error('[WWZIvy] Session init failed:', response.status);
                    return false;
                }
                self._sessionInitialized = true;
                console.log('[WWZIvy] Session initialized successfully');
                return true;
            })
            .catch(function(error) {
                console.error('[WWZIvy] Session init error:', error);
                return false;
            });
        },

        /**
         * Ensure session is initialized before making API calls
         */
        ensureSession: function() {
            if (this._sessionInitialized) {
                return Promise.resolve(true);
            }
            return this.initSession();
        },

        /**
         * Build request payload
         */
        buildPayload: function(message) {
            return {
                blizzUserMsg: message,
                blizzSessionId: Storage.getSessionId(),
                blizzBotMessageId: Storage.generateMessageId(),
                clientUrl: window.location.href
            };
        },

        /**
         * Send message to chat API (with auto-retry on session error)
         */
        sendMessage: function(message, retryCount) {
            var self = this;
            var currentRetry = retryCount || 0;
            var MAX_RETRIES = 1;

            return this.ensureSession().then(function(hasSession) {
                if (!hasSession) {
                    console.warn('[WWZIvy] No session, attempting to send anyway');
                }

                var payload = self.buildPayload(message);

                return self.fetchWithTimeout(Config.apiEndpoint, {
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
                    // Auto-retry with fresh session
                    if (currentRetry < MAX_RETRIES) {
                        console.log('[WWZIvy] Session expired, reinitializing...');
                        self._sessionInitialized = false;
                        return self.initSession().then(function(success) {
                            if (success) {
                                return self.sendMessage(message, currentRetry + 1);
                            }
                            throw new Error('SESSION_EXPIRED');
                        });
                    }
                    self._sessionInitialized = false;
                    throw new Error('SESSION_EXPIRED');
                }
                if (!response.ok) {
                    throw new Error('HTTP ' + response.status + ': ' + response.statusText);
                }
                return response.json();
            })
            .then(function(data) {
                return self.parseResponse(data);
            });
        },

        /**
         * Parse API response
         */
        parseResponse: function(data) {
            // Extract message from various response formats
            let message = data.simpleMessage || data.message || data.text ||
                         (data.replies && data.replies[0] && (data.replies[0].text || data.replies[0].message));

            // Check for contact form payload prefix
            if (message && message.startsWith('CONTACTFORMPAYLOAD_')) {
                try {
                    const jsonStr = message.substring('CONTACTFORMPAYLOAD_'.length);
                    const formData = JSON.parse(jsonStr);
                    return {
                        type: 'contactForm',
                        formData: formData,
                        suggestions: data.suggestions || [],
                        references: data.references || []
                    };
                } catch (e) {
                    console.error('WWZIvy: Failed to parse contact form payload', e);
                }
            }

            // Handle simpleMessage format
            if (data.simpleMessage) {
                return {
                    message: data.simpleMessage,
                    suggestions: data.suggestions || [],
                    action: data.action || null,
                    actionType: data.actionType || null,
                    references: data.references || [],
                    switchBot: data.switchBot || null,
                    youtubeLinks: data.youtubeLinks || []
                };
            }

            // Handle legacy format with replies array
            if (data.replies && data.replies.length > 0) {
                const reply = data.replies[0];
                return {
                    message: reply.text || reply.message || '',
                    suggestions: data.suggestions || reply.suggestions || [],
                    action: data.action || null,
                    actionType: data.actionType || null,
                    references: data.references || [],
                    switchBot: data.switchBot || null,
                    youtubeLinks: data.youtubeLinks || []
                };
            }

            // Handle direct message format
            if (data.message || data.text) {
                return {
                    message: data.message || data.text,
                    suggestions: data.suggestions || [],
                    action: data.action || null,
                    actionType: data.actionType || null,
                    references: data.references || [],
                    switchBot: data.switchBot || null,
                    youtubeLinks: data.youtubeLinks || []
                };
            }

            // Fallback
            return {
                message: 'Es tut mir leid, ich konnte Ihre Anfrage nicht verarbeiten.',
                suggestions: Config.suggestions,
                action: null,
                actionType: null,
                references: [],
                switchBot: null,
                youtubeLinks: []
            };
        },

        /**
         * Submit feedback (with auto-retry on session error)
         */
        submitFeedback: function(feedbackData, sessionId, retryCount) {
            var self = this;
            var currentRetry = retryCount || 0;
            var MAX_RETRIES = 1;
            // Feedback endpoint - via blizz-proxy
            var feedbackEndpoint = Config.apiEndpoint.replace('/chat', '/feedback');

            return this.ensureSession().then(function() {
                var payload = {
                    sessionId: sessionId || Storage.getSessionId(),
                    timestamp: new Date().toISOString(),
                    isInternal: Config.isInternal()
                };

                // Handle both old format (just rating) and new format (object)
                if (typeof feedbackData === 'object' && feedbackData !== null) {
                    payload.rating = feedbackData.rating;
                    payload.options = feedbackData.options || [];
                    payload.additionalFeedback = feedbackData.additionalFeedback || '';
                } else {
                    // Legacy format - just rating number
                    payload.rating = feedbackData;
                }

                return self.fetchWithTimeout(feedbackEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });
            })
            .then(function(response) {
                if (response.status === 403) {
                    // Auto-retry with fresh session
                    if (currentRetry < MAX_RETRIES) {
                        console.log('[WWZIvy] Session expired on feedback, reinitializing...');
                        self._sessionInitialized = false;
                        return self.initSession().then(function(success) {
                            if (success) {
                                return self.submitFeedback(feedbackData, sessionId, currentRetry + 1);
                            }
                            return false;
                        });
                    }
                    self._sessionInitialized = false;
                    return false;
                }
                return response.ok;
            })
            .catch(function(error) {
                console.warn('[WWZIvy] Feedback submission failed', error);
                return false;
            });
        },

        /**
         * Submit contact form (with auto-retry on session error)
         */
        submitContactForm: function(formData, retryCount) {
            var self = this;
            var currentRetry = retryCount || 0;
            var MAX_RETRIES = 1;

            return this.ensureSession().then(function() {
                // Format payload as expected by blizz-proxy
                var payload = {
                    type: 'simpleMessage',
                    message: JSON.stringify(formData),
                    formData: formData,
                    sessionId: Storage.getSessionId(),
                    timestamp: new Date().toISOString()
                };

                return self.fetchWithTimeout(Config.contactEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });
            })
            .then(function(response) {
                if (response.status === 403) {
                    // Auto-retry with fresh session
                    if (currentRetry < MAX_RETRIES) {
                        console.log('[WWZIvy] Session expired on contact form, reinitializing...');
                        self._sessionInitialized = false;
                        return self.initSession().then(function(success) {
                            if (success) {
                                return self.submitContactForm(formData, currentRetry + 1);
                            }
                            throw new Error('SESSION_EXPIRED');
                        });
                    }
                    self._sessionInitialized = false;
                    throw new Error('SESSION_EXPIRED');
                }
                return response.ok;
            })
            .catch(function(error) {
                console.error('[WWZIvy] Contact form submission failed', error);
                return false;
            });
        }
    };
})();
