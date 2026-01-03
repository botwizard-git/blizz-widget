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
         * Send message to chat API
         */
        sendMessage: async function(message, retryCount = 0) {
            const payload = this.buildPayload(message);

            try {
                const response = await fetch(Config.apiEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json, text/plain, */*'
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                return this.parseResponse(data);

            } catch (error) {
                console.error('WWZIvy: API error', error);

                // Retry logic
                if (retryCount < Config.maxRetries) {
                    await this.delay(Config.retryDelay);
                    return this.sendMessage(message, retryCount + 1);
                }

                throw error;
            }
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
                        suggestions: data.suggestions || []
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
                    actionType: data.actionType || null
                };
            }

            // Handle legacy format with replies array
            if (data.replies && data.replies.length > 0) {
                const reply = data.replies[0];
                return {
                    message: reply.text || reply.message || '',
                    suggestions: data.suggestions || reply.suggestions || [],
                    action: data.action || null,
                    actionType: data.actionType || null
                };
            }

            // Handle direct message format
            if (data.message || data.text) {
                return {
                    message: data.message || data.text,
                    suggestions: data.suggestions || [],
                    action: data.action || null,
                    actionType: data.actionType || null
                };
            }

            // Fallback
            return {
                message: 'Es tut mir leid, ich konnte Ihre Anfrage nicht verarbeiten.',
                suggestions: Config.suggestions,
                action: null,
                actionType: null
            };
        },

        /**
         * Delay helper
         */
        delay: function(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        },

        /**
         * Submit feedback
         */
        submitFeedback: async function(feedbackData, sessionId) {
            // Feedback endpoint - via blizz-proxy
            const feedbackEndpoint = Config.apiEndpoint.replace('/chat', '/feedback');

            try {
                const payload = {
                    sessionId: sessionId || Storage.getSessionId(),
                    timestamp: new Date().toISOString()
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

                const response = await fetch(feedbackEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                return response.ok;
            } catch (error) {
                console.warn('WWZIvy: Feedback submission failed', error);
                return false;
            }
        },

        /**
         * Submit contact form
         */
        submitContactForm: async function(formData) {
            const contactEndpoint = Config.contactEndpoint;

            // Format payload as expected by blizz-proxy
            const payload = {
                type: 'simpleMessage',
                message: JSON.stringify(formData),
                formData: formData,
                sessionId: Storage.getSessionId(),
                timestamp: new Date().toISOString()
            };

            try {
                const response = await fetch(contactEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                return response.ok;
            } catch (error) {
                console.error('WWZIvy: Contact form submission failed', error);
                return false;
            }
        }
    };
})();
