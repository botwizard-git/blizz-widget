/**
 * WWZBlizz - Event Handlers
 */
(function() {
    'use strict';

    var EBB = window.WWZBlizz;

    EBB.Events = {
        /**
         * Initialize all event listeners
         */
        init: function() {
            var self = this;
            var CONFIG = EBB.CONFIG;
            var UI = EBB.UI;
            var StateManager = EBB.StateManager;

            // Welcome screen - Send button
            document.getElementById('wwz-blizz-welcome-send-btn').addEventListener('click', function() {
                self.handleWelcomeSend();
            });

            // Welcome screen - Enter key
            document.getElementById('wwz-blizz-welcome-message-input').addEventListener('keypress', function(e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    self.handleWelcomeSend();
                }
            });

            // Auto-resize welcome textarea
            document.getElementById('wwz-blizz-welcome-message-input').addEventListener('input', function() {
                this.style.height = 'auto';
                this.style.height = Math.min(this.scrollHeight, 120) + 'px';
            });

            // Chat screen - Send button
            document.getElementById('wwz-blizz-send-btn').addEventListener('click', function() {
                self.handleSend();
            });

            // Chat screen - Enter key
            document.getElementById('wwz-blizz-message-input').addEventListener('keypress', function(e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    self.handleSend();
                }
            });

            // Auto-resize chat textarea
            document.getElementById('wwz-blizz-message-input').addEventListener('input', function() {
                this.style.height = 'auto';
                this.style.height = Math.min(this.scrollHeight, 120) + 'px';
            });

            // Close/minimize button
            document.getElementById('wwz-blizz-close-btn').addEventListener('click', function() {
                self.collapseWidget();
            });

            // Expand button
            document.getElementById('wwz-blizz-expand-btn').addEventListener('click', function() {
                self.expandWidget();
            });

            // Collapsed bar click
            document.getElementById('wwz-blizz-collapsed-bar').addEventListener('click', function() {
                self.expandWidget();
            });

            // End session button
            document.getElementById('wwz-blizz-end-session-btn').addEventListener('click', function() {
                self.endConversation();
            });

            // Feedback smileys
            var smileys = document.querySelectorAll('.wwz-blizz-smiley-wrapper');
            for (var i = 0; i < smileys.length; i++) {
                (function(wrapper) {
                    wrapper.addEventListener('click', function() {
                        var rating = parseInt(wrapper.getAttribute('data-rating'));
                        self.handleSmileyClick(rating);
                    });
                })(smileys[i]);
            }

            // Feedback buttons
            document.getElementById('wwz-blizz-submit-feedback-btn').addEventListener('click', function() {
                self.submitFeedback();
            });

            document.getElementById('wwz-blizz-feedback-skip-btn').addEventListener('click', function() {
                self.skipFeedback();
            });

            // Copy message (event delegation)
            document.getElementById('wwz-blizz-messages-container').addEventListener('click', function(e) {
                var copyBtn = e.target.closest('.wwz-blizz-copy-btn');
                if (copyBtn) {
                    var text = copyBtn.getAttribute('data-text');
                    self.copyMessage(text);
                }
            });

            console.log('[WWZBlizz] Events initialized');
        },

        /**
         * Collapse widget
         */
        collapseWidget: function() {
            EBB.StateManager.setCollapsed(true);
            EBB.UI.showCollapsed();
        },

        /**
         * Expand widget
         */
        expandWidget: function() {
            EBB.StateManager.setCollapsed(false);
            EBB.UI.showExpanded();
        },

        /**
         * Handle send from welcome screen
         */
        handleWelcomeSend: function() {
            var self = this;
            var UI = EBB.UI;
            var StateManager = EBB.StateManager;

            var text = UI.getWelcomeInputValue();

            if (!text || StateManager.isLoading()) {
                return;
            }

            UI.clearWelcomeInput();
            UI.showChatScreen();

            StateManager.setLastUserMessage(text);

            var userMessage = StateManager.addMessage(text, true);
            UI.renderMessage(userMessage);

            self.sendMessageToAPI(text);
        },

        /**
         * Handle suggestion click from welcome screen
         */
        handleWelcomeSuggestionClick: function(text) {
            var self = this;
            var UI = EBB.UI;
            var StateManager = EBB.StateManager;

            if (StateManager.isLoading()) return;

            UI.showChatScreen();
            StateManager.setLastUserMessage(text);

            var userMessage = StateManager.addMessage(text, true);
            UI.renderMessage(userMessage);

            self.sendMessageToAPI(text);
        },

        /**
         * Handle send from chat screen
         */
        handleSend: function() {
            var self = this;
            var UI = EBB.UI;
            var StateManager = EBB.StateManager;

            var text = UI.getInputValue();

            if (!text || StateManager.isLoading()) {
                return;
            }

            UI.clearInput();
            UI.clearSuggestions();

            StateManager.setLastUserMessage(text);

            var userMessage = StateManager.addMessage(text, true);
            UI.renderMessage(userMessage);

            self.sendMessageToAPI(text);
        },

        /**
         * Handle suggestion click
         */
        handleSuggestionClick: function(text) {
            var self = this;
            var UI = EBB.UI;
            var StateManager = EBB.StateManager;

            if (StateManager.isLoading()) return;

            StateManager.setLastUserMessage(text);

            var userMessage = StateManager.addMessage(text, true);
            UI.renderMessage(userMessage);
            UI.clearSuggestions();

            self.sendMessageToAPI(text);
        },

        /**
         * Check if message is a greeting
         */
        isGreeting: function(text) {
            var CONFIG = EBB.CONFIG;
            var lowerText = text.toLowerCase().trim();

            for (var i = 0; i < CONFIG.greetings.keywords.length; i++) {
                var keyword = CONFIG.greetings.keywords[i];
                if (lowerText === keyword ||
                    lowerText.indexOf(keyword + ' ') === 0 ||
                    lowerText.indexOf(keyword + '!') === 0 ||
                    lowerText.indexOf(keyword + ',') === 0) {
                    return true;
                }
            }
            return false;
        },

        /**
         * Handle greeting with auto-reply
         */
        handleGreeting: function(text) {
            var self = this;
            var CONFIG = EBB.CONFIG;
            var UI = EBB.UI;
            var StateManager = EBB.StateManager;

            console.log('[WWZBlizz] Auto-reply for greeting:', text);

            StateManager.setLoading(true);
            UI.showTypingIndicator();

            setTimeout(function() {
                UI.hideTypingIndicator();
                StateManager.setLoading(false);

                var botMessage = StateManager.addMessage(CONFIG.greetings.response, false);
                UI.renderMessage(botMessage);

                UI.renderSuggestions(CONFIG.greetings.suggestions);
            }, 600);
        },

        /**
         * Send message to API
         */
        sendMessageToAPI: function(text) {
            var self = this;
            var CONFIG = EBB.CONFIG;
            var UI = EBB.UI;
            var StateManager = EBB.StateManager;
            var APIService = EBB.APIService;

            if (self.isGreeting(text)) {
                self.handleGreeting(text);
                return;
            }

            StateManager.setLoading(true);
            UI.showTypingIndicator();

            APIService.sendMessage(text)
                .then(function(response) {
                    UI.hideTypingIndicator();
                    StateManager.setLoading(false);
                    StateManager.clearError();

                    if (response.sessionId) {
                        StateManager.setSessionId(response.sessionId);
                    }

                    var isHtml = response.isHtml || false;

                    if (response.replies && response.replies.length > 0) {
                        response.replies.forEach(function(reply, index) {
                            setTimeout(function() {
                                var botMessage = StateManager.addMessage(reply, false, { isHtml: isHtml });
                                UI.renderMessage(botMessage);
                            }, index * 300);
                        });
                    } else if (response.message) {
                        var botMessage = StateManager.addMessage(response.message, false, { isHtml: isHtml });
                        UI.renderMessage(botMessage);
                    } else {
                        var defaultReply = StateManager.addMessage(
                            'Entschuldigung, ich konnte keine passende Antwort finden.',
                            false
                        );
                        UI.renderMessage(defaultReply);
                    }

                    if (response.suggestions && response.suggestions.length > 0) {
                        var delay = (response.replies ? response.replies.length : 1) * 300 + 100;
                        setTimeout(function() {
                            UI.renderSuggestions(response.suggestions);
                        }, delay);
                    }
                })
                .catch(function(error) {
                    console.error('[WWZBlizz] API Error:', error);
                    UI.hideTypingIndicator();
                    StateManager.setLoading(false);
                    self.handleAPIError(error);
                });
        },

        /**
         * Handle API errors
         */
        handleAPIError: function(error) {
            var self = this;
            var CONFIG = EBB.CONFIG;
            var UI = EBB.UI;
            var StateManager = EBB.StateManager;

            var retryCount = StateManager.incrementRetry();

            if (retryCount <= CONFIG.maxRetries) {
                UI.showNotification(
                    'Verbindungsfehler. Erneuter Versuch ' + retryCount + '/' + CONFIG.maxRetries + '...',
                    'error'
                );

                setTimeout(function() {
                    var lastMessage = StateManager.getLastUserMessageText();
                    if (lastMessage) {
                        self.sendMessageToAPI(lastMessage);
                    }
                }, CONFIG.retryDelay);
            } else {
                StateManager.setError(error);
                var errorMessage = StateManager.addMessage(
                    'Es tut mir leid, es ist ein Fehler aufgetreten. Bitte versuchen Sie es spater erneut.',
                    false
                );
                UI.renderMessage(errorMessage);
                UI.showError('Verbindung fehlgeschlagen');
            }
        },

        /**
         * Retry last message
         */
        retryLastMessage: function() {
            var StateManager = EBB.StateManager;
            var UI = EBB.UI;

            StateManager.resetRetryCount();
            var lastMessage = StateManager.getLastUserMessageText();

            if (lastMessage) {
                UI.clearSuggestions();
                this.sendMessageToAPI(lastMessage);
            }
        },

        /**
         * Start new conversation
         */
        startNewConversation: function() {
            var CONFIG = EBB.CONFIG;
            var UI = EBB.UI;
            var StateManager = EBB.StateManager;

            StateManager.reset();
            UI.clearMessages();
            UI.clearSuggestions();
            UI.showWelcomeScreen();
            UI.renderWelcomeSuggestions(CONFIG.defaultSuggestions);

            console.log('[WWZBlizz] Started new conversation');
        },

        /**
         * Show close confirmation
         */
        showCloseConfirm: function() {
            EBB.UI.updateView('closeConfirm');
        },

        /**
         * End conversation
         */
        endConversation: function() {
            console.log('[WWZBlizz] Ending conversation');
            EBB.UI.updateView('feedback');
        },

        /**
         * Handle smiley click
         */
        handleSmileyClick: function(rating) {
            EBB.StateManager.setRating(rating);
            EBB.UI.updateSmileySelection(rating);
        },

        /**
         * Submit feedback
         */
        submitFeedback: function() {
            var self = this;
            var StateManager = EBB.StateManager;
            var APIService = EBB.APIService;

            var rating = StateManager.getRating();
            var comment = document.getElementById('wwz-blizz-feedback-text').value.trim();

            console.log('[WWZBlizz] Submitting feedback:', { rating: rating, comment: comment });

            APIService.submitFeedback(rating, comment)
                .then(function() {
                    self.showThankYou();
                })
                .catch(function(error) {
                    console.error('[WWZBlizz] Feedback submission failed:', error);
                    self.showThankYou();
                });
        },

        /**
         * Skip feedback
         */
        skipFeedback: function() {
            this.showThankYou();
        },

        /**
         * Show thank you screen
         */
        showThankYou: function() {
            EBB.UI.updateView('thankYou');
            EBB.StateManager.reset();
        },

        /**
         * Copy message
         */
        copyMessage: function(text) {
            EBB.UI.copyToClipboard(text);
        }
    };

    console.log('[WWZBlizz] Events loaded');
})();
