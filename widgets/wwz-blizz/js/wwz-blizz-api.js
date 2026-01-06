/**
 * WWZBlizz - API Service
 */
(function() {
    'use strict';

    var EBB = window.WWZBlizz;
    var CONFIG = EBB.CONFIG;
    var SessionService = EBB.SessionService;

    EBB.APIService = {
        /**
         * Fetch with timeout support
         */
        fetchWithTimeout: function(url, options, timeout) {
            var timeoutMs = timeout || CONFIG.requestTimeout || 60000;

            return new Promise(function(resolve, reject) {
                var timeoutId = setTimeout(function() {
                    reject(new Error('TIMEOUT'));
                }, timeoutMs);

                fetch(url, options)
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

            // Handle simpleMessage format
            if (data && data.type === 'simpleMessage') {
                return {
                    type: 'simpleMessage',
                    message: data.message || '',
                    replies: data.message ? [data.message] : [],
                    suggestions: data.suggestions || [],
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
                isHtml: false
            };
        },

        /**
         * Send message to API
         */
        sendMessage: function(message) {
            var self = this;
            var payload = this.buildPayload(message);

            console.log('[WWZBlizz] Sending message');

            return this.fetchWithTimeout(CONFIG.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json, text/plain, */*'
                },
                body: JSON.stringify(payload)
            })
            .then(function(response) {
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

            return this.fetchWithTimeout(CONFIG.RATING_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json, text/plain, */*'
                },
                body: JSON.stringify(payload)
            })
            .then(function(response) {
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

            return this.fetchWithTimeout(CONFIG.RATING_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json, text/plain, */*'
                },
                body: JSON.stringify(payload)
            })
            .then(function(response) {
                return response.ok;
            })
            .catch(function(error) {
                console.error('[WWZBlizz] Message feedback submission failed:', error);
                return false;
            });
        },

        /**
         * Submit contact form
         */
        submitContactForm: function(formData) {
            var self = this;
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

            return this.fetchWithTimeout(CONFIG.CONTACT_FORM_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json, text/plain, */*'
                },
                body: JSON.stringify(payload)
            })
            .then(function(response) {
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
