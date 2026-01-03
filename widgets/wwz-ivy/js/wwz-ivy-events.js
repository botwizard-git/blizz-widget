/**
 * WWZ Ivy Chatbot - Event Handling
 */
(function() {
    'use strict';

    window.WWZIvy = window.WWZIvy || {};

    const Config = window.WWZIvy.Config;
    const State = window.WWZIvy.State;
    const UI = window.WWZIvy.UI;
    const API = window.WWZIvy.API;

    window.WWZIvy.Events = {
        /**
         * Initialize event listeners
         */
        init: function() {
            const elements = UI.getElements();

            // Launcher click
            elements.launcher.addEventListener('click', () => this.handleLauncherClick());

            // Header buttons
            elements.backBtn.addEventListener('click', () => this.handleBackClick());
            elements.fullscreenBtn.addEventListener('click', () => this.handleFullscreen());
            elements.minimizeBtn.addEventListener('click', () => this.handleMinimize());
            elements.closeBtn.addEventListener('click', () => this.handleClose());

            // Welcome screen
            elements.acceptBtn.addEventListener('click', () => this.handleAcceptTerms());
            elements.declineBtn.addEventListener('click', () => this.handleDeclineTerms());

            // Chat input
            elements.input.addEventListener('input', () => this.handleInputChange());
            elements.input.addEventListener('keydown', (e) => this.handleInputKeydown(e));
            elements.sendBtn.addEventListener('click', () => this.handleSendMessage());
            elements.micBtn.addEventListener('click', () => this.handleMicClick());

            // Suggestions
            elements.suggestions.addEventListener('click', (e) => {
                if (e.target.classList.contains('wwz-ivy-suggestion')) {
                    this.handleSuggestionClick(e.target.dataset.suggestion);
                }
            });

            // Message actions
            elements.messages.addEventListener('click', (e) => {
                const copyBtn = e.target.closest('.wwz-ivy-copy-btn');
                const speakBtn = e.target.closest('.wwz-ivy-speak-btn');

                if (copyBtn) {
                    this.handleCopyMessage(copyBtn.dataset.text);
                } else if (speakBtn) {
                    this.handleSpeakMessage(speakBtn.dataset.text);
                }
            });

            // Feedback screen
            elements.rating.addEventListener('click', (e) => {
                if (e.target.classList.contains('wwz-ivy-rating-btn')) {
                    this.handleRatingSelect(parseInt(e.target.dataset.rating));
                }
            });
            
            // Feedback options
            if (elements.feedbackOptions) {
                elements.feedbackOptions.addEventListener('click', (e) => {
                    if (e.target.classList.contains('wwz-ivy-feedback-option')) {
                        e.target.classList.toggle('wwz-ivy-selected');
                    }
                });
            }
            
            // Feedback send button
            if (elements.feedbackSend) {
                elements.feedbackSend.addEventListener('click', () => this.handleFeedbackSend());
            }

            // Feedback text toggle button
            if (elements.feedbackTextToggle) {
                elements.feedbackTextToggle.addEventListener('click', () => UI.toggleFeedbackTextPanel());
            }

            elements.feedbackContinue.addEventListener('click', () => this.handleFeedbackContinue());
            elements.downloadTranscript.addEventListener('click', () => UI.downloadTranscript());

            // Thank you screen
            elements.thankyouClose.addEventListener('click', () => this.handleThankyouClose());

            // Auto-expand textarea
            elements.input.addEventListener('input', () => this.autoExpandTextarea());

            return this;
        },

        /**
         * Handle launcher click
         */
        handleLauncherClick: function() {
            const state = State.get();
            State.set({ isCollapsed: false });

            if (state.termsAccepted) {
                UI.showScreen('chat');
                if (state.messages.length > 0) {
                    UI.renderMessages(state.messages);
                } else {
                    // Add welcome message as first bot message if no messages exist
                    const welcomeMessage = State.addMessage({
                        role: 'bot',
                        text: Config.welcomeMessage
                    });
                    UI.addMessage(welcomeMessage);
                }
            } else {
                UI.showScreen('welcome');
            }

            UI.showWidget();
        },

        /**
         * Handle back button click
         */
        handleBackClick: function() {
            UI.showScreen('chat');
        },

        /**
         * Handle minimize
         */
        handleMinimize: function() {
            State.set({ isCollapsed: true });
            UI.hideWidget();
        },

        /**
         * Handle close (show feedback)
         */
        handleClose: function() {
            const state = State.get();
            if (state.messages.length > 0) {
                UI.resetFeedbackForm();
                UI.showScreen('feedback');
            } else {
                this.handleMinimize();
            }
        },

        /**
         * Handle fullscreen toggle
         */
        handleFullscreen: function() {
            UI.toggleFullscreen();
        },

        /**
         * Handle accept terms
         */
        handleAcceptTerms: function() {
            State.acceptTerms();
            UI.showScreen('chat');

            // Add welcome message as first bot message from config
            const welcomeMessage = State.addMessage({
                role: 'bot',
                text: Config.welcomeMessage
            });
            UI.addMessage(welcomeMessage);
        },

        /**
         * Handle decline terms
         */
        handleDeclineTerms: function() {
            State.declineTerms();
            UI.hideWidget();
        },

        /**
         * Handle input change
         */
        handleInputChange: function() {
            UI.updateSendButton();
        },

        /**
         * Handle input keydown
         */
        handleInputKeydown: function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSendMessage();
            }
        },

        /**
         * Auto-expand textarea
         */
        autoExpandTextarea: function() {
            const input = UI.getElements().input;
            input.style.height = 'auto';
            input.style.height = Math.min(input.scrollHeight, 100) + 'px';
        },

        /**
         * Handle send message
         */
        handleSendMessage: async function() {
            const message = UI.getInputValue();
            if (!message || State.get().isLoading) return;

            // Add user message
            const userMessage = State.addMessage({
                role: 'user',
                text: message
            });
            UI.addMessage(userMessage);
            UI.clearInput();
            UI.renderSuggestions([]);

            // Show typing indicator
            State.setLoading(true);
            UI.showTyping();

            try {
                // Send to API
                const response = await API.sendMessage(message);

                // Hide typing
                UI.hideTyping();
                State.setLoading(false);

                // Check if this is a contact form response
                if (response.type === 'contactForm') {
                    UI.addMessage(response);
                    // Setup form event listeners after rendering
                    this.setupContactFormListeners();
                } else {
                    // Add bot response
                    const botMessage = State.addMessage({
                        role: 'bot',
                        text: response.message
                    });
                    UI.addMessage(botMessage);

                    // Show suggestions
                    if (response.suggestions && response.suggestions.length > 0) {
                        UI.renderSuggestions(response.suggestions);
                        State.setSuggestions(response.suggestions);
                    }
                }

            } catch (error) {
                UI.hideTyping();
                State.setLoading(false);
                State.setError(error.message);

                // Add error message
                const errorMessage = State.addMessage({
                    role: 'bot',
                    text: 'Es tut mir leid, es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.'
                });
                UI.addMessage(errorMessage);
            }
        },

        /**
         * Handle suggestion click
         */
        handleSuggestionClick: function(suggestion) {
            UI.getElements().input.value = suggestion;
            UI.updateSendButton();
            this.handleSendMessage();
        },

        /**
         * Handle mic click (speech-to-text)
         */
        handleMicClick: function() {
            if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
                alert('Spracherkennung wird von Ihrem Browser nicht unterstützt.');
                return;
            }

            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();

            recognition.lang = 'de-DE';
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            const micBtn = UI.getElements().micBtn;
            micBtn.style.background = '#e74c3c';

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                UI.getElements().input.value = transcript;
                UI.updateSendButton();
                micBtn.style.background = '';
            };

            recognition.onerror = () => {
                micBtn.style.background = '';
            };

            recognition.onend = () => {
                micBtn.style.background = '';
            };

            recognition.start();
        },

        /**
         * Handle copy message
         */
        handleCopyMessage: function(text) {
            navigator.clipboard.writeText(text).then(() => {
                console.log('Text copied to clipboard');
            }).catch(err => {
                console.error('Failed to copy text:', err);
            });
        },

        /**
         * Handle speak message (text-to-speech)
         */
        handleSpeakMessage: function(text) {
            if (!('speechSynthesis' in window)) {
                alert('Text-to-Speech wird von Ihrem Browser nicht unterstützt.');
                return;
            }

            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'de-DE';
            utterance.rate = 1;
            utterance.pitch = 1;

            window.speechSynthesis.speak(utterance);
        },

        /**
         * Handle rating select
         */
        handleRatingSelect: function(rating) {
            State.setFeedbackRating(rating);
            UI.selectRating(rating);
        },

        /**
         * Handle feedback send
         */
        handleFeedbackSend: async function() {
            const rating = State.get().feedbackRating;
            if (!rating) return;

            const elements = UI.getElements();
            const selectedOptions = [];
            if (elements.feedbackOptions) {
                const selected = elements.feedbackOptions.querySelectorAll('.wwz-ivy-feedback-option.wwz-ivy-selected');
                selected.forEach(btn => selectedOptions.push(btn.dataset.option));
            }
            
            const additionalFeedback = elements.feedbackTextInput ? elements.feedbackTextInput.value.trim() : '';

            // Submit feedback to API
            await API.submitFeedback({
                rating: rating,
                options: selectedOptions,
                additionalFeedback: additionalFeedback
            });

            UI.showThankYou();
        },

        /**
         * Handle feedback continue
         */
        handleFeedbackContinue: async function() {
            const rating = State.get().feedbackRating;

            if (rating) {
                const elements = UI.getElements();
                const selectedOptions = [];
                if (elements.feedbackOptions) {
                    const selected = elements.feedbackOptions.querySelectorAll('.wwz-ivy-feedback-option.wwz-ivy-selected');
                    selected.forEach(btn => selectedOptions.push(btn.dataset.option));
                }
                
                const additionalFeedback = elements.feedbackTextInput ? elements.feedbackTextInput.value.trim() : '';

                await API.submitFeedback({
                    rating: rating,
                    options: selectedOptions,
                    additionalFeedback: additionalFeedback
                });
            }

            UI.showThankYou();
        },

        /**
         * Handle thank you close
         */
        handleThankyouClose: function() {
            // Start new session to clear messages after feedback
            State.startNewSession();
            State.set({ isCollapsed: true, feedbackRating: null });
            State.setScreen('launcher');
            UI.getElements().messages.innerHTML = '';
            UI.hideWidget();
        },

        /**
         * Setup contact form event listeners
         */
        setupContactFormListeners: function() {
            const form = document.getElementById('wwz-ivy-contact-form-element');
            if (form) {
                form.addEventListener('submit', (e) => this.handleContactFormSubmit(e));
            }
        },

        /**
         * Handle contact form submission
         */
        handleContactFormSubmit: async function(e) {
            e.preventDefault();
            const form = e.target;
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            // Validate all fields
            let isValid = true;
            form.querySelectorAll('.wwz-ivy-form-input').forEach(input => {
                const errorSpan = input.nextElementSibling;
                if (input.required && !input.value.trim()) {
                    isValid = false;
                    input.classList.add('wwz-ivy-invalid');
                    if (errorSpan) {
                        errorSpan.textContent = input.dataset.error || 'Dieses Feld ist erforderlich';
                    }
                } else {
                    input.classList.remove('wwz-ivy-invalid');
                    if (errorSpan) {
                        errorSpan.textContent = '';
                    }
                }
            });

            if (!isValid) return;

            // Disable form while submitting
            const submitBtn = form.querySelector('.wwz-ivy-form-submit');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Wird gesendet...';
            }

            try {
                // Submit form data to API
                const success = await API.submitContactForm(data);

                if (success) {
                    // Disable the form
                    UI.disableContactForm();
                    // Show success message
                    UI.showFormSuccess();
                } else {
                    // Re-enable submit button on failure
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = 'Absenden';
                    }
                    // Show error message
                    const errorMessage = State.addMessage({
                        role: 'bot',
                        text: 'Es tut mir leid, das Formular konnte nicht gesendet werden. Bitte versuchen Sie es erneut.'
                    });
                    UI.addMessage(errorMessage);
                }
            } catch (error) {
                console.error('WWZIvy: Contact form submission error', error);
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Absenden';
                }
            }
        }
    };
})();
