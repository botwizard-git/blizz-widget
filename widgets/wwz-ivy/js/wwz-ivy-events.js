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
                const refDownloadLink = e.target.closest('.wwz-ivy-ref-download');
                const videoCard = e.target.closest('.wwz-ivy-video-card');

                if (copyBtn) {
                    this.handleCopyMessage(copyBtn.dataset.text);
                } else if (speakBtn) {
                    this.handleSpeakMessage(speakBtn.dataset.text);
                } else if (refDownloadLink) {
                    e.preventDefault();
                    this.handleReferenceDownload(refDownloadLink.dataset.url, refDownloadLink.dataset.filename);
                } else if (videoCard && !videoCard.classList.contains('wwz-ivy-video-playing')) {
                    var videoId = videoCard.getAttribute('data-video-id');
                    if (videoId) {
                        this.playYoutubeVideo(videoCard, videoId);
                    }
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

            // Feedback skip button
            if (elements.feedbackSkip) {
                elements.feedbackSkip.addEventListener('click', () => this.handleFeedbackSkip());
            }

            // Thank you screen
            elements.thankyouClose.addEventListener('click', () => this.handleThankyouClose());

            // Auto-expand textarea
            elements.input.addEventListener('input', () => this.autoExpandTextarea());

            // SwitchBot click handler (event delegation)
            document.addEventListener('click', function(e) {
                var btn = e.target.closest('.wwz-ivy-switchbot-btn');
                if (btn) {
                    var question = btn.getAttribute('data-question');
                    var redirectUrl = btn.getAttribute('data-redirect-url');
                    if (question && redirectUrl) {
                        var url = new URL(redirectUrl, window.location.href);
                        url.searchParams.set('wwzBlizzRedirectQuestion', question);
                        window.location.href = url.toString();
                    }
                }
            });

            return this;
        },

        /**
         * Handle launcher click
         */
        handleLauncherClick: function() {
            const state = State.get();
            State.set({ isCollapsed: false });

            // Track widget open
            if (window.WWZIvy.Analytics) {
                window.WWZIvy.Analytics.trackWidgetOpen({
                    source: 'launcher_click',
                    termsAccepted: state.termsAccepted,
                    hasExistingMessages: state.messages.length > 0
                });
            }

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

                    // Show default suggestions after welcome message
                    if (Config.defaultSuggestions && Config.defaultSuggestions.length > 0) {
                        UI.renderSuggestions(Config.defaultSuggestions);
                        State.setSuggestions(Config.defaultSuggestions);
                    }
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
            // Track widget minimize
            if (window.WWZIvy.Analytics) {
                window.WWZIvy.Analytics.trackWidgetMinimize();
            }

            State.set({ isCollapsed: true });
            UI.hideWidget();
        },

        /**
         * Handle close (show feedback)
         */
        handleClose: function() {
            const state = State.get();

            // Track widget close
            if (window.WWZIvy.Analytics) {
                window.WWZIvy.Analytics.trackWidgetClose({
                    messageCount: state.messages.length
                });
            }

            // Only show feedback if user has sent at least one message
            const hasUserMessage = state.messages.some(msg => msg.role === 'user');
            if (hasUserMessage) {
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
            // Track terms accepted
            if (window.WWZIvy.Analytics) {
                window.WWZIvy.Analytics.trackTermsAccepted();
            }

            State.acceptTerms();
            UI.showScreen('chat');

            // Add welcome message as first bot message from config
            const welcomeMessage = State.addMessage({
                role: 'bot',
                text: Config.welcomeMessage
            });
            UI.addMessage(welcomeMessage);

            // Show default suggestions after welcome message
            if (Config.defaultSuggestions && Config.defaultSuggestions.length > 0) {
                UI.renderSuggestions(Config.defaultSuggestions);
                State.setSuggestions(Config.defaultSuggestions);
            }
        },

        /**
         * Handle decline terms
         */
        handleDeclineTerms: function() {
            // Track terms declined
            if (window.WWZIvy.Analytics) {
                window.WWZIvy.Analytics.trackTermsDeclined();
            }

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

            const startTime = Date.now();

            // Track message sent
            if (window.WWZIvy.Analytics) {
                window.WWZIvy.Analytics.trackMessageSent({
                    messageLength: message.length,
                    wasSuggestion: false
                });
            }

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
                const responseTimeMs = Date.now() - startTime;

                // Hide typing
                UI.hideTyping();
                State.setLoading(false);

                // Check if this is a contact form response
                if (response.type === 'contactForm') {
                    // Track message received (contact form)
                    if (window.WWZIvy.Analytics) {
                        window.WWZIvy.Analytics.trackMessageReceived({
                            hasReferences: false,
                            hasSuggestions: false,
                            isContactForm: true,
                            responseTimeMs: responseTimeMs
                        });
                    }

                    UI.addMessage(response);
                    // Setup form event listeners after rendering
                    this.setupContactFormListeners();
                } else {
                    // Track message received
                    if (window.WWZIvy.Analytics) {
                        window.WWZIvy.Analytics.trackMessageReceived({
                            hasReferences: (response.references && response.references.length > 0) || false,
                            hasSuggestions: (response.suggestions && response.suggestions.length > 0) || false,
                            isContactForm: false,
                            responseTimeMs: responseTimeMs
                        });
                    }

                    // Add bot response (with video carousel and switchBot button if present)
                    var botText = response.message;
                    if (response.youtubeLinks && response.youtubeLinks.length > 0) {
                        botText += UI.createVideoCarousel(response.youtubeLinks);
                    }
                    if (response.switchBot) {
                        botText += UI.createSwitchBotButton(response.switchBot, message);
                    }
                    const botMessage = State.addMessage({
                        role: 'bot',
                        text: botText,
                        references: response.references || []
                    });
                    UI.addMessage(botMessage);

                    // Show suggestions
                    if (response.suggestions && response.suggestions.length > 0) {
                        UI.renderSuggestions(response.suggestions);
                        State.setSuggestions(response.suggestions);
                    }
                }

            } catch (error) {
                // Track API error
                if (window.WWZIvy.Analytics) {
                    window.WWZIvy.Analytics.trackAPIError({
                        endpoint: 'chat',
                        errorMessage: error.message,
                        isTimeout: error.message === 'TIMEOUT'
                    });
                }

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
            // Track suggestion clicked
            if (window.WWZIvy.Analytics) {
                window.WWZIvy.Analytics.trackSuggestionClicked(suggestion);
            }

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

            // Track voice input started
            if (window.WWZIvy.Analytics) {
                window.WWZIvy.Analytics.trackVoiceInputStarted();
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

                // Track voice input completed successfully
                if (window.WWZIvy.Analytics) {
                    window.WWZIvy.Analytics.trackVoiceInputCompleted({
                        success: true,
                        transcriptLength: transcript.length
                    });
                }
            };

            recognition.onerror = () => {
                micBtn.style.background = '';

                // Track voice input failed
                if (window.WWZIvy.Analytics) {
                    window.WWZIvy.Analytics.trackVoiceInputCompleted({
                        success: false,
                        transcriptLength: 0
                    });
                }
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
         * Handle reference download as blob via proxy (to bypass CORS)
         */
        handleReferenceDownload: async function(url, filename) {
            try {
                // Use the download proxy to bypass CORS
                const proxyUrl = 'https://blizz-api.botwizard.ch/download-proxy?url=' + encodeURIComponent(url);

                const response = await fetch(proxyUrl, {
                    method: 'GET',
                    credentials: 'include' // Include session cookie
                });

                if (!response.ok) {
                    throw new Error('Download failed: ' + response.status);
                }

                const blob = await response.blob();
                const blobUrl = URL.createObjectURL(blob);

                const a = document.createElement('a');
                a.href = blobUrl;
                a.download = filename || 'download.pdf';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(blobUrl);
            } catch (error) {
                console.error('WWZIvy: Download error', error);
                // Fallback: open in new tab
                window.open(url, '_blank');
            }
        },

        /**
         * Play YouTube video inline (replace card with iframe)
         */
        playYoutubeVideo: function(card, videoId) {
            card.classList.add('wwz-ivy-video-playing');
            card.innerHTML = '<iframe class="wwz-ivy-video-iframe" src="https://www.youtube.com/embed/' + videoId + '?autoplay=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
        },

        /**
         * Handle rating select
         */
        handleRatingSelect: function(rating) {
            // Track feedback rating selected
            if (window.WWZIvy.Analytics) {
                window.WWZIvy.Analytics.trackFeedbackRatingSelected(rating);
            }

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

            // Track feedback submitted
            if (window.WWZIvy.Analytics) {
                window.WWZIvy.Analytics.trackFeedbackSubmitted({
                    rating: rating,
                    options: selectedOptions,
                    additionalFeedback: additionalFeedback
                });
            }

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

                // Track feedback submitted
                if (window.WWZIvy.Analytics) {
                    window.WWZIvy.Analytics.trackFeedbackSubmitted({
                        rating: rating,
                        options: selectedOptions,
                        additionalFeedback: additionalFeedback
                    });
                }

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
         * Handle feedback skip
         */
        handleFeedbackSkip: function() {
            // Track feedback skipped
            if (window.WWZIvy.Analytics) {
                window.WWZIvy.Analytics.trackFeedbackSkipped();
            }

            // Skip feedback and start new session
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

                // Required field validation
                if (input.required && !input.value.trim()) {
                    isValid = false;
                    input.classList.add('wwz-ivy-invalid');
                    if (errorSpan) {
                        errorSpan.textContent = input.dataset.error || 'Dieses Feld ist erforderlich';
                    }
                    return;
                }

                // Custom validation for ivyCallbackDatetimeStart
                if (input.id === 'ivyCallbackDatetimeStart' && input.value) {
                    const selectedDate = new Date(input.value);
                    const now = new Date();
                    const minDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
                    const hours = selectedDate.getHours();
                    const dayOfWeek = selectedDate.getDay(); // 0 = Sunday, 6 = Saturday

                    let errorMessage = '';

                    // Check if at least 24 hours in the future
                    if (selectedDate < minDate) {
                        errorMessage = 'Der Termin muss mindestens 24 Stunden in der Zukunft liegen';
                    }
                    // Check if weekend
                    else if (dayOfWeek === 0 || dayOfWeek === 6) {
                        errorMessage = 'Termine sind nur an Werktagen möglich';
                    }
                    // Check if time is between 07:00 and 17:00
                    else if (hours < 7 || hours >= 17) {
                        errorMessage = 'Termine sind nur zwischen 07:00 und 17:00 Uhr möglich';
                    }

                    if (errorMessage) {
                        isValid = false;
                        input.classList.add('wwz-ivy-invalid');
                        if (errorSpan) {
                            errorSpan.textContent = errorMessage;
                        }
                        return;
                    }
                }

                // Clear error if valid
                input.classList.remove('wwz-ivy-invalid');
                if (errorSpan) {
                    errorSpan.textContent = '';
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

                // Track contact form submitted
                if (window.WWZIvy.Analytics) {
                    window.WWZIvy.Analytics.trackContactFormSubmitted({
                        success: success
                    });
                }

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
                // Track contact form error
                if (window.WWZIvy.Analytics) {
                    window.WWZIvy.Analytics.trackContactFormSubmitted({
                        success: false
                    });
                }

                console.error('WWZIvy: Contact form submission error', error);
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Absenden';
                }
            }
        }
    };
})();
