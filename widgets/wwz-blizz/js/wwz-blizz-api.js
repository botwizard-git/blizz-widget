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
                clientUrl: window.location.href,
                widgetId: CONFIG.widgetId,
                agentId: CONFIG.AGENT_ID
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
                ratingComment: comment || '',
                agentId: CONFIG.AGENT_ID,
                widgetId: CONFIG.widgetId,
                timestamp: new Date().toISOString()
            };

            return fetch(CONFIG.RATING_API, {
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
            console.log('[WWZBlizz] Submitting contact form');

            // Build contact form payload in required format
            var contactFormPayload = {
                "title": "Kontaktformular",
                "fields": [
                    {"name": "Message", "type": "string", "rules": [], "error message": "This field is mandatory"},
                    {"name": "Telefon", "type": "string", "rules": [], "error message": "This field is mandatory"},
                    {"name": "Date of callback", "type": "datetime", "rules": [], "error message": "This field is mandatory"}
                ]
            };

            // Wrap in simpleMessage format to avoid 500 on EB side
            var payload = {
                type: "simpleMessage",
                message: "CONTACTFORMPAYLOAD_" + JSON.stringify(contactFormPayload),
                formData: {
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    preferredTimeFrom: formData.timeFrom || '',
                    preferredTimeTo: formData.timeTo || '',
                    preferredDate: formData.date || '',
                    comment: formData.comment,
                    blizzSessionId: SessionService.getSessionId()
                },
                widgetId: CONFIG.widgetId,
                agentId: CONFIG.AGENT_ID
            };

            return fetch(CONFIG.CONTACT_FORM_API, {
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
