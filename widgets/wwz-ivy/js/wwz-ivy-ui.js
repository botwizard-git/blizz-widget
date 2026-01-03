/**
 * WWZ Ivy Chatbot - UI Rendering
 */
(function() {
    'use strict';

    window.WWZIvy = window.WWZIvy || {};

    const Config = window.WWZIvy.Config;
    const State = window.WWZIvy.State;

    // SVG Icons
    const Icons = {
        back: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>',
        fullscreen: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>',
        minimize: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="7 13 12 18 17 13"></polyline><polyline points="7 6 12 11 17 6"></polyline></svg>',
        close: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
        send: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>',
        mic: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>',
        copy: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>',
        speaker: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>',
        download: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>',
        arrow: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>',
        thumbUp: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>',
        thumbDown: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path></svg>',
        check: '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>',
        success: `<svg class="wwz-ivy-success-animation" xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle class="wwz-ivy-success-circle" cx="12" cy="12" r="10" fill="none"/>
            <polyline class="wwz-ivy-success-check" points="9 12 11 14 15 10"/>
        </svg>`,
        user: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
        comment: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>'
    };

    // DOM element cache
    let elements = {};

    window.WWZIvy.UI = {
        /**
         * Initialize UI
         */
        init: function(container) {
            this.container = container;
            this.render();
            this.cacheElements();
            return this;
        },

        /**
         * Render main HTML structure
         */
        render: function() {
            this.container.innerHTML = `
                <!-- Launcher Bubble -->
                <button class="wwz-ivy-launcher" id="wwz-ivy-launcher" aria-label="Open chat">
                    <img src="${Config.launcherIcon}" alt="Chat" class="wwz-ivy-launcher-img">
                </button>

                <!-- Widget Window -->
                <div class="wwz-ivy-widget" id="wwz-ivy-widget">
                    <!-- Header -->
                    <div class="wwz-ivy-header">
                        <div class="wwz-ivy-header-left">
                            <button class="wwz-ivy-back-btn wwz-ivy-hidden" id="wwz-ivy-back-btn" aria-label="Go back">
                                ${Icons.back}
                            </button>
                            <span class="wwz-ivy-header-title">${Config.botTitle}</span>
                        </div>
                        <div class="wwz-ivy-header-actions">
                            <button class="wwz-ivy-header-btn" id="wwz-ivy-fullscreen-btn" aria-label="Fullscreen">
                                ${Icons.fullscreen}
                            </button>
                            <button class="wwz-ivy-header-btn" id="wwz-ivy-minimize-btn" aria-label="Minimize">
                                ${Icons.minimize}
                            </button>
                            <button class="wwz-ivy-header-btn" id="wwz-ivy-close-btn" aria-label="Close">
                                ${Icons.close}
                            </button>
                        </div>
                    </div>

                    <!-- Content Screens -->
                    <div class="wwz-ivy-content" id="wwz-ivy-content">
                        <!-- Welcome Screen -->
                        <div class="wwz-ivy-welcome" id="wwz-ivy-welcome">
                            <!-- Blue header section with greeting -->
                            <div class="wwz-ivy-welcome-header">
                                <h1 class="wwz-ivy-welcome-title">${Config.welcomeTitle}</h1>
                                <p class="wwz-ivy-welcome-desc">${Config.welcomeDescription}</p>
                            </div>
                            <!-- White terms card -->
                            <div class="wwz-ivy-terms">
                                <div class="wwz-ivy-terms-block">
                                    <span class="wwz-ivy-terms-accent"></span>
                                    <div class="wwz-ivy-terms-content-wrapper">
                                        <h2 class="wwz-ivy-terms-title">${Config.termsTitle}</h2>
                                        <div class="wwz-ivy-terms-text">${Config.termsContent}</div>
                                    </div>
                                </div>
                                <div class="wwz-ivy-terms-actions">
                                    <button class="wwz-ivy-btn wwz-ivy-btn-secondary" id="wwz-ivy-decline">
                                        <span>${Config.declineButton}</span>
                                        ${Icons.thumbDown}
                                    </button>
                                    <button class="wwz-ivy-btn wwz-ivy-btn-accept" id="wwz-ivy-accept">
                                        <span>${Config.acceptButton}</span>
                                        ${Icons.thumbUp}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Chat Screen -->
                        <div class="wwz-ivy-chat wwz-ivy-hidden" id="wwz-ivy-chat">
                            <div class="wwz-ivy-messages" id="wwz-ivy-messages"></div>
                            <div class="wwz-ivy-suggestions wwz-ivy-hidden" id="wwz-ivy-suggestions"></div>
                            <div class="wwz-ivy-input-area">
                                <div class="wwz-ivy-input-wrapper">
                                    <textarea
                                        class="wwz-ivy-input"
                                        id="wwz-ivy-input"
                                        placeholder="${Config.inputPlaceholder}"
                                        rows="1"
                                    ></textarea>
                                </div>
                                <button class="wwz-ivy-send-btn wwz-ivy-hidden" id="wwz-ivy-send-btn" aria-label="Send">
                                    ${Icons.send}
                                </button>
                                <button class="wwz-ivy-mic-btn" id="wwz-ivy-mic-btn" aria-label="Voice input">
                                    ${Icons.mic}
                                </button>
                            </div>
                        </div>

                        <!-- Feedback Screen -->
                        <div class="wwz-ivy-feedback wwz-ivy-hidden" id="wwz-ivy-feedback">
                            <div class="wwz-ivy-feedback-content">
                                <h2 class="wwz-ivy-feedback-question">${Config.feedback.question}</h2>
                                <div class="wwz-ivy-rating" id="wwz-ivy-rating">
                                    ${Object.keys(Config.feedback.ratingLabels).map(rating => `
                                        <div class="wwz-ivy-rating-item">
                                            <button class="wwz-ivy-rating-btn wwz-ivy-rating-${rating}" data-rating="${rating}">${rating}</button>
                                            <span class="wwz-ivy-rating-label">${Config.feedback.ratingLabels[rating]}</span>
                                        </div>
                                    `).join('')}
                                </div>
                                <div class="wwz-ivy-feedback-second-question wwz-ivy-hidden" id="wwz-ivy-feedback-second-question">
                                    <h3 class="wwz-ivy-feedback-second-title" id="wwz-ivy-feedback-second-title"></h3>
                                    <div class="wwz-ivy-feedback-options" id="wwz-ivy-feedback-options"></div>
                                </div>
                                <div class="wwz-ivy-feedback-text-toggle-wrapper wwz-ivy-hidden" id="wwz-ivy-feedback-text-toggle-wrapper">
                                    <button class="wwz-ivy-btn wwz-ivy-btn-outline" id="wwz-ivy-feedback-text-toggle">
                                        <span>${Config.feedback.additionalFeedbackLabel}</span>
                                        ${Icons.comment}
                                    </button>
                                </div>
                                <div class="wwz-ivy-feedback-text-panel" id="wwz-ivy-feedback-text-panel">
                                    <textarea
                                        class="wwz-ivy-feedback-text-input"
                                        id="wwz-ivy-feedback-text-input"
                                        placeholder="${Config.feedback.additionalFeedbackPlaceholder}"
                                        rows="3"
                                    ></textarea>
                                </div>
                                <div class="wwz-ivy-feedback-actions">
                                    <button class="wwz-ivy-btn wwz-ivy-btn-primary" id="wwz-ivy-feedback-send">
                                        ${Config.feedback.sendButton}
                                    </button>
                                    <button class="wwz-ivy-feedback-btn wwz-ivy-feedback-continue" id="wwz-ivy-feedback-continue">
                                        <span>${Config.feedback.continueButton}</span>
                                        ${Icons.arrow}
                                    </button>
                                    <button class="wwz-ivy-feedback-btn" id="wwz-ivy-download-transcript">
                                        ${Icons.download}
                                        <span>${Config.feedback.downloadButton}</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Thank You Screen -->
                        <div class="wwz-ivy-thankyou wwz-ivy-hidden" id="wwz-ivy-thankyou">
                            <div class="wwz-ivy-thankyou-icon">
                                ${Icons.success}
                            </div>
                            <h2 class="wwz-ivy-thankyou-title">${Config.thankyou.title}</h2>
                            <p class="wwz-ivy-thankyou-desc">${Config.thankyou.description}</p>
                            <button class="wwz-ivy-btn wwz-ivy-btn-primary" id="wwz-ivy-thankyou-close">
                                ${Config.thankyou.closeButton}
                            </button>
                        </div>
                    </div>
                </div>
            `;
        },

        /**
         * Cache DOM elements
         */
        cacheElements: function() {
            elements = {
                launcher: document.getElementById('wwz-ivy-launcher'),
                widget: document.getElementById('wwz-ivy-widget'),
                backBtn: document.getElementById('wwz-ivy-back-btn'),
                fullscreenBtn: document.getElementById('wwz-ivy-fullscreen-btn'),
                minimizeBtn: document.getElementById('wwz-ivy-minimize-btn'),
                closeBtn: document.getElementById('wwz-ivy-close-btn'),
                content: document.getElementById('wwz-ivy-content'),
                welcome: document.getElementById('wwz-ivy-welcome'),
                chat: document.getElementById('wwz-ivy-chat'),
                feedback: document.getElementById('wwz-ivy-feedback'),
                thankyou: document.getElementById('wwz-ivy-thankyou'),
                acceptBtn: document.getElementById('wwz-ivy-accept'),
                declineBtn: document.getElementById('wwz-ivy-decline'),
                messages: document.getElementById('wwz-ivy-messages'),
                suggestions: document.getElementById('wwz-ivy-suggestions'),
                input: document.getElementById('wwz-ivy-input'),
                sendBtn: document.getElementById('wwz-ivy-send-btn'),
                micBtn: document.getElementById('wwz-ivy-mic-btn'),
                rating: document.getElementById('wwz-ivy-rating'),
                feedbackSecondQuestion: document.getElementById('wwz-ivy-feedback-second-question'),
                feedbackSecondTitle: document.getElementById('wwz-ivy-feedback-second-title'),
                feedbackOptions: document.getElementById('wwz-ivy-feedback-options'),
                feedbackTextToggleWrapper: document.getElementById('wwz-ivy-feedback-text-toggle-wrapper'),
                feedbackTextToggle: document.getElementById('wwz-ivy-feedback-text-toggle'),
                feedbackTextPanel: document.getElementById('wwz-ivy-feedback-text-panel'),
                feedbackTextInput: document.getElementById('wwz-ivy-feedback-text-input'),
                feedbackSend: document.getElementById('wwz-ivy-feedback-send'),
                feedbackContinue: document.getElementById('wwz-ivy-feedback-continue'),
                downloadTranscript: document.getElementById('wwz-ivy-download-transcript'),
                thankyouClose: document.getElementById('wwz-ivy-thankyou-close')
            };
        },

        /**
         * Get elements
         */
        getElements: function() {
            return elements;
        },

        /**
         * Show screen
         */
        showScreen: function(screenName) {
            const screens = ['welcome', 'chat', 'feedback', 'thankyou'];
            screens.forEach(screen => {
                const el = elements[screen];
                if (el) {
                    if (screen === screenName) {
                        el.classList.remove('wwz-ivy-hidden');
                    } else {
                        el.classList.add('wwz-ivy-hidden');
                    }
                }
            });

            // Show/hide back button
            const showBack = screenName === 'feedback';
            if (showBack) {
                elements.backBtn.classList.remove('wwz-ivy-hidden');
            } else {
                elements.backBtn.classList.add('wwz-ivy-hidden');
            }

            State.setScreen(screenName);
        },

        /**
         * Show widget
         */
        showWidget: function() {
            elements.widget.classList.add('wwz-ivy-visible');
            elements.launcher.classList.add('wwz-ivy-hidden');
        },

        /**
         * Hide widget
         */
        hideWidget: function() {
            elements.widget.classList.remove('wwz-ivy-visible');
            elements.launcher.classList.remove('wwz-ivy-hidden');
        },

        /**
         * Toggle fullscreen
         */
        toggleFullscreen: function() {
            const isFullscreen = State.toggleFullscreen();
            if (isFullscreen) {
                elements.widget.classList.add('wwz-ivy-fullscreen');
            } else {
                elements.widget.classList.remove('wwz-ivy-fullscreen');
            }
            return isFullscreen;
        },

        /**
         * Add message to chat
         */
        addMessage: function(message) {
            const messageEl = document.createElement('div');
            messageEl.className = `wwz-ivy-message wwz-ivy-message-${message.role}`;
            messageEl.dataset.id = message.id;

            if (message.role === 'bot') {
                messageEl.innerHTML = `
                    <div class="wwz-ivy-message-bubble">${this.formatMessage(message.text)}</div>
                    <div class="wwz-ivy-message-footer">
                        <div class="wwz-ivy-message-avatar">
                            <img src="${Config.botAvatar}" alt="${Config.botName}">
                        </div>
                        <div class="wwz-ivy-message-actions">
                            <button class="wwz-ivy-message-action wwz-ivy-copy-btn" aria-label="Copy" data-text="${this.escapeHtml(this.extractPlainText(message.text))}">
                                ${Icons.copy}
                            </button>
                            <button class="wwz-ivy-message-action wwz-ivy-speak-btn" aria-label="Read aloud" data-text="${this.escapeHtml(this.extractPlainText(message.text))}">
                                ${Icons.speaker}
                            </button>
                        </div>
                    </div>
                `;
            } else {
                // User message with avatar on right
                messageEl.innerHTML = `
                    <div class="wwz-ivy-message-bubble">${this.formatMessage(message.text)}</div>
                    <div class="wwz-ivy-message-footer wwz-ivy-message-footer-right">
                        <div class="wwz-ivy-message-avatar wwz-ivy-user-avatar">
                            ${Icons.user}
                        </div>
                    </div>
                `;
            }

            elements.messages.appendChild(messageEl);
            this.scrollToBottom();

            return messageEl;
        },

        /**
         * Show typing indicator
         */
        showTyping: function() {
            const typingEl = document.createElement('div');
            typingEl.className = 'wwz-ivy-message wwz-ivy-message-bot';
            typingEl.id = 'wwz-ivy-typing';
            typingEl.innerHTML = `
                <div class="wwz-ivy-typing">
                    <span class="wwz-ivy-typing-dot"></span>
                    <span class="wwz-ivy-typing-dot"></span>
                    <span class="wwz-ivy-typing-dot"></span>
                </div>
            `;
            elements.messages.appendChild(typingEl);
            this.scrollToBottom();
        },

        /**
         * Hide typing indicator
         */
        hideTyping: function() {
            const typingEl = document.getElementById('wwz-ivy-typing');
            if (typingEl) {
                typingEl.remove();
            }
        },

        /**
         * Render suggestions
         */
        renderSuggestions: function(suggestions) {
            if (!suggestions || suggestions.length === 0) {
                elements.suggestions.innerHTML = '';
                elements.suggestions.classList.add('wwz-ivy-hidden');
                return;
            }

            elements.suggestions.innerHTML = suggestions.map(suggestion =>
                `<button class="wwz-ivy-suggestion" data-suggestion="${this.escapeHtml(suggestion)}">${this.escapeHtml(suggestion)}</button>`
            ).join('');
            elements.suggestions.classList.remove('wwz-ivy-hidden');
        },

        /**
         * Render all messages
         */
        renderMessages: function(messages) {
            elements.messages.innerHTML = '';
            messages.forEach(message => this.addMessage(message));
        },

        /**
         * Select rating
         */
        selectRating: function(rating) {
            const buttons = elements.rating.querySelectorAll('.wwz-ivy-rating-btn');
            buttons.forEach(btn => {
                if (parseInt(btn.dataset.rating) === rating) {
                    btn.classList.add('wwz-ivy-selected');
                } else {
                    btn.classList.remove('wwz-ivy-selected');
                }
            });

            // Show second question and options based on rating
            const ratingNum = parseInt(rating);

            // Update second question based on specific rating
            elements.feedbackSecondTitle.textContent = Config.feedback.ratingQuestions[ratingNum];

            // Update options based on specific rating
            const options = Config.feedback.ratingOptions[ratingNum] || [];
            
            elements.feedbackOptions.innerHTML = options.map(option => 
                `<button class="wwz-ivy-feedback-option" data-option="${this.escapeHtml(option)}">${this.escapeHtml(option)}</button>`
            ).join('');
            
            // Show second question and text toggle button
            elements.feedbackSecondQuestion.classList.remove('wwz-ivy-hidden');
            elements.feedbackTextToggleWrapper.classList.remove('wwz-ivy-hidden');
        },

        /**
         * Toggle feedback text panel visibility
         */
        toggleFeedbackTextPanel: function() {
            elements.feedbackTextPanel.classList.toggle('wwz-ivy-expanded');
            elements.feedbackTextToggleWrapper.classList.add('wwz-ivy-hidden');
        },

        /**
         * Reset feedback form
         */
        resetFeedbackForm: function() {
            if (elements.rating) {
                const buttons = elements.rating.querySelectorAll('.wwz-ivy-rating-btn');
                buttons.forEach(btn => btn.classList.remove('wwz-ivy-selected'));
            }
            if (elements.feedbackSecondQuestion) {
                elements.feedbackSecondQuestion.classList.add('wwz-ivy-hidden');
            }
            if (elements.feedbackTextToggleWrapper) {
                elements.feedbackTextToggleWrapper.classList.add('wwz-ivy-hidden');
            }
            if (elements.feedbackTextPanel) {
                elements.feedbackTextPanel.classList.remove('wwz-ivy-expanded');
            }
            if (elements.feedbackTextInput) {
                elements.feedbackTextInput.value = '';
            }
            if (elements.feedbackOptions) {
                const optionButtons = elements.feedbackOptions.querySelectorAll('.wwz-ivy-feedback-option');
                optionButtons.forEach(btn => btn.classList.remove('wwz-ivy-selected'));
            }
            // Reset state
            State.setFeedbackRating(null);
        },

        /**
         * Show thank you screen with animation
         */
        showThankYou: function() {
            this.showScreen('thankyou');
            // Reset animation by removing and re-adding the SVG
            const iconEl = elements.thankyou.querySelector('.wwz-ivy-thankyou-icon');
            if (iconEl) {
                const svg = iconEl.querySelector('.wwz-ivy-success-animation');
                if (svg) {
                    svg.style.animation = 'none';
                    setTimeout(() => {
                        svg.style.animation = '';
                    }, 10);
                }
            }
        },

        /**
         * Update send button visibility
         */
        updateSendButton: function() {
            const hasText = elements.input.value.trim().length > 0;
            if (hasText) {
                elements.sendBtn.classList.remove('wwz-ivy-hidden');
                elements.micBtn.classList.add('wwz-ivy-hidden');
            } else {
                elements.sendBtn.classList.add('wwz-ivy-hidden');
                elements.micBtn.classList.remove('wwz-ivy-hidden');
            }
        },

        /**
         * Clear input
         */
        clearInput: function() {
            elements.input.value = '';
            elements.input.style.height = 'auto';
            this.updateSendButton();
        },

        /**
         * Get input value
         */
        getInputValue: function() {
            return elements.input.value.trim();
        },

        /**
         * Scroll to bottom
         */
        scrollToBottom: function() {
            elements.messages.scrollTop = elements.messages.scrollHeight;
        },

        /**
         * Format message (render HTML from API, sanitize dangerous content)
         */
        formatMessage: function(text) {
            if (!text) return '';
            
            // The API returns HTML, so we need to render it properly
            // But we still need to sanitize dangerous scripts and events
            let formatted = text;
            
            // Create a temporary div to parse and sanitize HTML
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = formatted;
            
            // Remove script tags and event handlers
            const scripts = tempDiv.querySelectorAll('script');
            scripts.forEach(script => script.remove());
            
            // Remove event handlers from all elements
            const allElements = tempDiv.querySelectorAll('*');
            allElements.forEach(el => {
                // Remove all event handlers by cloning without attributes
                Array.from(el.attributes).forEach(attr => {
                    if (attr.name.startsWith('on')) {
                        el.removeAttribute(attr.name);
                    }
                });
            });
            
            // Get sanitized HTML
            formatted = tempDiv.innerHTML;
            
            // If no HTML tags were present, convert newlines to <br> for plain text
            if (!/<[^>]+>/.test(text)) {
                formatted = formatted.replace(/\n/g, '<br>');
            }
            
            return formatted;
        },

        /**
         * Escape HTML
         */
        escapeHtml: function(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        },

        /**
         * Extract plain text from HTML (for copy/speak functionality)
         */
        extractPlainText: function(html) {
            if (!html) return '';
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            return tempDiv.textContent || tempDiv.innerText || '';
        },

        /**
         * Generate transcript
         */
        generateTranscript: function() {
            const messages = State.getMessages();
            let transcript = `Chat Transcript - ${Config.botTitle}\n`;
            transcript += `Date: ${new Date().toLocaleString('de-DE')}\n`;
            transcript += `${'='.repeat(50)}\n\n`;

            messages.forEach(msg => {
                const time = new Date(msg.timestamp).toLocaleTimeString('de-DE');
                const sender = msg.role === 'user' ? 'Sie' : Config.botName;
                transcript += `[${time}] ${sender}:\n${msg.text}\n\n`;
            });

            return transcript;
        },

        /**
         * Download transcript
         */
        downloadTranscript: function() {
            const transcript = this.generateTranscript();
            const blob = new Blob([transcript], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `chat-transcript-${new Date().toISOString().split('T')[0]}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };
})();
