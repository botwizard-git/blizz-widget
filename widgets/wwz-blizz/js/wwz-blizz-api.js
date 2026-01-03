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

            console.log('[WWZBlizz] Sending message');

            return fetch(CONFIG.apiEndpoint, {
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
        submitFeedback: function(rating, comment) {
            var payload = {
                blizzSessionId: SessionService.getSessionId(),
                rating: rating,
                comment: comment || ''
            };

            var feedbackEndpoint = CONFIG.apiEndpoint.replace(/\/chat$/, '/feedback');

            return fetch(feedbackEndpoint, {
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
         * Submit contact form
         */
        submitContactForm: function(formData) {
            console.log('[EnterpriseBotBlizz] Submitting contact form');

            var payload = {
                formpayload: {
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    preferredTimeFrom: formData.timeFrom || '',
                    preferredTimeTo: formData.timeTo || '',
                    preferredDate: formData.date || '',
                    comment: formData.comment,
                    blizzSessionId: SessionService.getSessionId()
                }
            };

            return fetch(CONFIG.contactFormEndpoint, {
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
                console.log('[EnterpriseBotBlizz] Contact form submitted successfully');
                return { success: true, data: data };
            })
            .catch(function(error) {
                console.error('[EnterpriseBotBlizz] Contact form submission failed:', error);
                return { success: false, error: error.message };
            });
        }
    };

    console.log('[WWZBlizz] APIService loaded');
})();
