/**
 * EnterpriseBotBlizz - API Service
 */
(function() {
    'use strict';

    var EBB = window.EnterpriseBotBlizz;
    var CONFIG = EBB.CONFIG;
    var SessionService = EBB.SessionService;

    EBB.APIService = {
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
                clientUrl: window.location.href
            };
        },

        /**
         * Parse API response
         */
        parseResponse: function(data) {
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

            console.log('[EnterpriseBotBlizz] Sending message');

            return fetch(CONFIG.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json, text/plain, */*',
                    'api-key': CONFIG.apiKey
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
        submitFeedback: function(rating, comment) {
            var payload = {
                blizzSessionId: SessionService.getSessionId(),
                rating: rating,
                comment: comment || ''
            };

            var feedbackEndpoint = CONFIG.apiEndpoint.replace(/\/blitz[^/]+$/, '/feedback');

            return fetch(feedbackEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json, text/plain, */*',
                    'api-key': CONFIG.apiKey
                },
                body: JSON.stringify(payload)
            })
            .then(function(response) {
                return response.ok;
            })
            .catch(function(error) {
                console.error('[EnterpriseBotBlizz] Feedback submission failed:', error);
                return false;
            });
        }
    };

    console.log('[EnterpriseBotBlizz] APIService loaded');
})();
