/**
 * WWZBlizz - UI Rendering
 */
(function() {
    'use strict';

    var EBB = window.WWZBlizz;
    var CONFIG = EBB.CONFIG;

    EBB.UI = {
        elements: {},

        /**
         * Initialize UI element references
         */
        init: function() {
            // Welcome screen elements (v3)
            this.elements.welcomeScreen = document.getElementById('wwz-blizz-welcome-screen');
            this.elements.welcomeMessageInput = document.getElementById('wwz-blizz-search-input');
            this.elements.welcomeSendBtn = document.getElementById('wwz-blizz-search-btn');

            // Chat screen elements (v3)
            this.elements.chatScreen = document.getElementById('wwz-blizz-chat-screen');
            this.elements.messagesContainer = document.getElementById('wwz-blizz-messages-container');
            this.elements.messageInput = document.getElementById('wwz-blizz-message-input');
            this.elements.sendBtn = document.getElementById('wwz-blizz-send-btn');

            // Privacy modal elements
            this.elements.privacyModal = document.getElementById('wwz-blizz-privacy-modal');
            this.elements.privacyClose = document.getElementById('wwz-blizz-privacy-close');

            // Floating input wrapper (v3)
            this.elements.floatingInput = document.getElementById('wwz-blizz-floating-input');

            // Suggestions container
            this.elements.suggestionsContainer = document.getElementById('wwz-blizz-suggestions-container');

            console.log('[WWZBlizz] UI elements initialized');
        },

        /**
         * Initialize scroll listener for showing/hiding scroll-to-bottom button
         */
        initScrollListener: function() {
            var self = this;
            var container = this.elements.messagesContainer;

            if (!container) return;

            container.addEventListener('scroll', function() {
                self.updateScrollButtonVisibility();
            });
        },

        /**
         * Update scroll-to-bottom button visibility based on scroll position
         */
        updateScrollButtonVisibility: function() {
            var container = this.elements.messagesContainer;
            var btn = this.elements.scrollToBottomBtn;

            if (!btn || !container) return;

            // Calculate how far user has scrolled from bottom
            var scrolledFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;

            // Show button if scrolled up more than 100px from bottom
            if (scrolledFromBottom > 100) {
                btn.classList.add('wwz-blizz-visible');
            } else {
                btn.classList.remove('wwz-blizz-visible');
            }
        },

        /**
         * Escape HTML to prevent XSS
         */
        escapeHtml: function(text) {
            var div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        },

        /**
         * Format bot message
         */
        formatBotMessage: function(text, isHtml) {
            if (isHtml) {
                return this.sanitizeHtml(text);
            }

            var formatted = this.escapeHtml(text);

            // Bold: **text**
            formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

            // Convert markdown lists to HTML
            // First, protect localized numbered lists if any (optional, but good practice)
            
            // Unordered Lists (* or -)
            // Look for blocks of lines starting with * or -
            // We'll do a simple line-by-line approach first which is safer for this context
            
            var lines = formatted.split('\n');
            var inUl = false;
            var inOl = false;
            var result = '';
            
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                var trimmed = line.trim();
                
                // Check for Unordered List Item
                if (trimmed.match(/^[*•-]\s+(.+)/)) {
                    if (!inUl) {
                        if (inOl) { result += '</ol>'; inOl = false; }
                        result += '<ul>';
                        inUl = true;
                    }
                    result += '<li>' + trimmed.replace(/^[*•-]\s+/, '') + '</li>';
                }
                // Check for Ordered List Item (1. Item)
                else if (trimmed.match(/^\d+\.\s+(.+)/)) {
                    if (!inOl) {
                        if (inUl) { result += '</ul>'; inUl = false; }
                        result += '<ol>';
                        inOl = true;
                    }
                    result += '<li>' + trimmed.replace(/^\d+\.\s+/, '') + '</li>';
                }
                // Normal line
                else {
                    if (inUl) { result += '</ul>'; inUl = false; }
                    if (inOl) { result += '</ol>'; inOl = false; }
                    
                    // Add br only if not empty line (or maybe always?)
                    // If it's an empty line, it might just be spacing.
                    if (i > 0) result += '<br>';
                    result += line;
                }
            }
            
            if (inUl) result += '</ul>';
            if (inOl) result += '</ol>';
            
            formatted = result;

            var urlRegex = /(https?:\/\/[^\s<]+)/g;
            formatted = formatted.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');

            return formatted;
        },

        /**
         * Sanitize HTML
         */
        sanitizeHtml: function(html) {
            var temp = document.createElement('div');
            temp.innerHTML = html;

            // Remove script tags
            var scripts = temp.querySelectorAll('script');
            for (var i = 0; i < scripts.length; i++) {
                scripts[i].parentNode.removeChild(scripts[i]);
            }

            // Remove event handlers
            var allElements = temp.querySelectorAll('*');
            for (var j = 0; j < allElements.length; j++) {
                var el = allElements[j];
                var attrs = el.attributes;
                for (var k = attrs.length - 1; k >= 0; k--) {
                    if (attrs[k].name.indexOf('on') === 0) {
                        el.removeAttribute(attrs[k].name);
                    }
                }
            }

            // Make links open in new tab
            var links = temp.querySelectorAll('a');
            for (var l = 0; l < links.length; l++) {
                links[l].setAttribute('target', '_blank');
                links[l].setAttribute('rel', 'noopener noreferrer');
            }

            return temp.innerHTML;
        },

        /**
         * Strip HTML tags
         */
        stripHtml: function(html) {
            var temp = document.createElement('div');
            temp.innerHTML = html;
            return temp.textContent || temp.innerText || '';
        },

        /**
         * Show chat screen
         */
        showChatScreen: function() {
            var welcomeScreen = document.getElementById('wwz-blizz-welcome-screen');
            var chatScreen = document.getElementById('wwz-blizz-chat-screen');
            var floatingInput = document.getElementById('wwz-blizz-floating-input');
            var messageInput = document.getElementById('wwz-blizz-message-input');

            if (welcomeScreen) welcomeScreen.classList.add('wwz-blizz-hidden');
            if (chatScreen) chatScreen.classList.remove('wwz-blizz-hidden');
            if (floatingInput) floatingInput.classList.remove('wwz-blizz-hidden');
            if (messageInput) {
                messageInput.focus();
                this.elements.messageInput = messageInput;
            }

            this.elements.welcomeScreen = welcomeScreen;
            this.elements.chatScreen = chatScreen;
            this.elements.floatingInput = floatingInput;
        },

        /**
         * Show welcome screen
         */
        showWelcomeScreen: function() {
            var welcomeScreen = document.getElementById('wwz-blizz-welcome-screen');
            var chatScreen = document.getElementById('wwz-blizz-chat-screen');
            var floatingInput = document.getElementById('wwz-blizz-floating-input');
            var searchInput = document.getElementById('wwz-blizz-search-input');

            if (welcomeScreen) welcomeScreen.classList.remove('wwz-blizz-hidden');
            if (chatScreen) chatScreen.classList.add('wwz-blizz-hidden');
            if (floatingInput) floatingInput.classList.add('wwz-blizz-hidden');
            if (searchInput) searchInput.focus();

            this.elements.welcomeScreen = welcomeScreen;
            this.elements.chatScreen = chatScreen;
            this.elements.floatingInput = floatingInput;
        },

        /**
         * Show collapsed state
         */
        showCollapsed: function() {
            this.elements.mainContent.classList.add('wwz-blizz-hidden');
            this.elements.collapsedBar.classList.remove('wwz-blizz-hidden');
        },

        /**
         * Show expanded state
         */
        showExpanded: function() {
            this.elements.collapsedBar.classList.add('wwz-blizz-hidden');
            this.elements.mainContent.classList.remove('wwz-blizz-hidden');
        },

        /**
         * Render a single message
         */
        renderMessage: function(message) {
            var CONFIG = EBB.CONFIG;
            var container = this.elements.messagesContainer;
            var messageDiv = document.createElement('div');
            var isHtml = message.isHtml || false;

            var hasVideo = message.text && message.text.indexOf('enterprisebot-blizz-video-widget') !== -1;
            var extraClass = hasVideo ? ' wwz-blizz-message-has-video' : '';

            if (message.isUser) {
                messageDiv.className = 'wwz-blizz-message wwz-blizz-message-user' + extraClass;
                messageDiv.innerHTML =
                    '<div class="wwz-blizz-message-avatar">' +
                        '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">' +
                            '<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>' +
                        '</svg>' +
                    '</div>' +
                    '<div class="wwz-blizz-message-content">' +
                        '<div class="wwz-blizz-message-bubble">' + this.escapeHtml(message.text) + '</div>' +
                    '</div>';
            } else {
                var plainText = this.stripHtml(message.text);
                var escapedPlainText = plainText.replace(/'/g, "\\'").replace(/"/g, '&quot;');

                messageDiv.className = 'wwz-blizz-message wwz-blizz-message-bot' + extraClass;
                messageDiv.innerHTML =
                    '<div class="wwz-blizz-message-avatar">' +
                        '<img src="' + CONFIG.botAvatar + '" alt="' + CONFIG.botName + '">' +
                    '</div>' +
                    '<div class="wwz-blizz-message-content">' +
                        '<div class="wwz-blizz-message-bubble">' + this.formatBotMessage(message.text, isHtml) + '</div>' +
                        '<div class="wwz-blizz-message-actions">' +

                            '<button class="wwz-blizz-action-btn wwz-blizz-thumbs-up-btn" title="Hilfreich" data-message-id="' + message.id + '">' +
                                '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                                    '<path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>' +
                                '</svg>' +
                            '</button>' +
                            '<button class="wwz-blizz-action-btn wwz-blizz-thumbs-down-btn" title="Nicht hilfreich" data-message-id="' + message.id + '">' +
                                '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                                    '<path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>' +
                                '</svg>' +
                            '</button>' +
                            '<button class="wwz-blizz-action-btn wwz-blizz-comment-btn" title="Kommentar" data-message-id="' + message.id + '">' +
                                '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                                    '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>' +
                                '</svg>' +
                            '</button>' +
                        '</div>' +
                    '</div>';
            }

            container.appendChild(messageDiv);
            this.scrollToBottom();
        },

        /**
         * Render multiple messages
         */
        renderMessages: function(messages) {
            var self = this;
            messages.forEach(function(message) {
                self.renderMessage(message);
            });
        },

        /**
         * Clear all messages
         */
        clearMessages: function() {
            this.elements.messagesContainer.innerHTML = '';
        },

        /**
         * Create thumbs down feedback popup HTML
         */
        createThumbsDownPopup: function(messageId) {
            return '<div class="wwz-blizz-thumbs-popup" data-message-id="' + messageId + '">' +
                '<div class="wwz-blizz-thumbs-popup-content">' +
                    '<div class="wwz-blizz-thumbs-popup-header">' +
                        '<span>Was war das Problem?</span>' +
                        '<button class="wwz-blizz-thumbs-popup-close" type="button">&times;</button>' +
                    '</div>' +
                    '<textarea class="wwz-blizz-thumbs-popup-textarea" ' +
                        'placeholder="Optional: Beschreiben Sie das Problem..." ' +
                        'rows="3" maxlength="500"></textarea>' +
                    '<div class="wwz-blizz-thumbs-popup-actions">' +
                        '<button class="wwz-blizz-thumbs-popup-skip" type="button">Uberspringen</button>' +
                        '<button class="wwz-blizz-thumbs-popup-submit" type="button">Senden</button>' +
                    '</div>' +
                '</div>' +
            '</div>';
        },

        /**
         * Show thumbs down popup
         */
        showThumbsDownPopup: function(messageId, buttonElement) {
            var self = this;

            // Remove any existing popup
            this.hideThumbsDownPopup();

            var popup = document.createElement('div');
            popup.innerHTML = this.createThumbsDownPopup(messageId);
            var popupElement = popup.firstChild;

            // Position relative to the message actions
            var messageActions = buttonElement.closest('.wwz-blizz-message-actions');
            if (messageActions) {
                messageActions.style.position = 'relative';
                messageActions.appendChild(popupElement);
            }

            // Focus the textarea
            var textarea = popupElement.querySelector('.wwz-blizz-thumbs-popup-textarea');
            if (textarea) {
                setTimeout(function() { textarea.focus(); }, 100);
            }
        },

        /**
         * Hide thumbs down popup
         */
        hideThumbsDownPopup: function() {
            var existingPopup = document.querySelector('.wwz-blizz-thumbs-popup');
            if (existingPopup) {
                existingPopup.remove();
            }
        },

        /**
         * Create comment popup HTML
         */
        createCommentPopup: function(messageId) {
            return '<div class="wwz-blizz-comment-popup" data-message-id="' + messageId + '">' +
                '<div class="wwz-blizz-comment-popup-content">' +
                    '<div class="wwz-blizz-comment-popup-header">' +
                        '<span>Kommentar hinzufugen</span>' +
                        '<button class="wwz-blizz-comment-popup-close" type="button">&times;</button>' +
                    '</div>' +
                    '<textarea class="wwz-blizz-comment-popup-textarea" ' +
                        'placeholder="Schreiben Sie Ihren Kommentar..." ' +
                        'rows="3" maxlength="500"></textarea>' +
                    '<div class="wwz-blizz-comment-popup-actions">' +
                        '<button class="wwz-blizz-comment-popup-cancel" type="button">Abbrechen</button>' +
                        '<button class="wwz-blizz-comment-popup-submit" type="button">Senden</button>' +
                    '</div>' +
                '</div>' +
            '</div>';
        },

        /**
         * Show comment popup
         */
        showCommentPopup: function(messageId, buttonElement) {
            var self = this;

            // Remove any existing popup
            this.hideCommentPopup();

            var popup = document.createElement('div');
            popup.innerHTML = this.createCommentPopup(messageId);
            var popupElement = popup.firstChild;

            // Position relative to the message actions
            var messageActions = buttonElement.closest('.wwz-blizz-message-actions');
            if (messageActions) {
                messageActions.style.position = 'relative';
                messageActions.appendChild(popupElement);
            }

            // Focus the textarea
            var textarea = popupElement.querySelector('.wwz-blizz-comment-popup-textarea');
            if (textarea) {
                setTimeout(function() { textarea.focus(); }, 100);
            }
        },

        /**
         * Hide comment popup
         */
        hideCommentPopup: function() {
            var existingPopup = document.querySelector('.wwz-blizz-comment-popup');
            if (existingPopup) {
                existingPopup.remove();
            }
        },

        /**
         * Update thumbs button state
         */
        updateThumbsState: function(messageId, feedbackType) {
            var container = this.elements.messagesContainer;
            var thumbsUp = container.querySelector('.wwz-blizz-thumbs-up-btn[data-message-id="' + messageId + '"]');
            var thumbsDown = container.querySelector('.wwz-blizz-thumbs-down-btn[data-message-id="' + messageId + '"]');

            if (thumbsUp && thumbsDown) {
                // Reset both
                thumbsUp.classList.remove('wwz-blizz-selected', 'wwz-blizz-disabled');
                thumbsDown.classList.remove('wwz-blizz-selected', 'wwz-blizz-disabled');

                if (feedbackType === 'positive') {
                    thumbsUp.classList.add('wwz-blizz-selected');
                    thumbsDown.classList.add('wwz-blizz-disabled');
                } else if (feedbackType === 'negative') {
                    thumbsDown.classList.add('wwz-blizz-selected');
                    thumbsUp.classList.add('wwz-blizz-disabled');
                }
            }
        },

        /**
         * Render suggestions
         */
        renderSuggestions: function(suggestions) {
            var self = this;
            var container = this.elements.suggestionsContainer;
            container.innerHTML = '';

            if (!suggestions || suggestions.length === 0) {
                return;
            }

            console.log('[WWZBlizz] Rendering', suggestions.length, 'chat suggestions:', suggestions);
            suggestions.forEach(function(text) {
                var btn = document.createElement('button');
                btn.className = 'wwz-blizz-suggestion-btn';
                btn.textContent = text;
                btn.dataset.suggestion = text;
                console.log('[WWZBlizz] Created suggestion button:', btn.className, btn.dataset.suggestion);
                container.appendChild(btn);
            });
        },

        /**
         * Render welcome suggestions
         */
        renderWelcomeSuggestions: function(suggestions) {
            var self = this;
            // Use the floating container so it aligns with input in welcome mode
            var container = this.elements.suggestionsContainer || document.getElementById('wwz-blizz-suggestions-container');
            
            if (!container) return;
            
            container.innerHTML = '';

            // Fallback suggestions if none provided
            if (!suggestions || suggestions.length === 0) {
                 if (EBB.CONFIG && EBB.CONFIG.suggestions) {
                     suggestions = EBB.CONFIG.suggestions;
                 } else {
                     // Hard fallback
                     suggestions = ['Was sind Mehrwertdienste?', 'Wo finde ich eine Bedienungsanleitung?', 'Was sind Mehrwertdienste?'];
                 }
            }

            if (!suggestions || suggestions.length === 0) return;

            // Force visibility and styling reset
            container.style.display = 'flex';
            container.style.opacity = '1';
            container.style.visibility = 'visible';
            
            console.log('[WWZBlizz] Rendering', suggestions.length, 'suggestions');

            suggestions.forEach(function(text) {
                var btn = document.createElement('button');
                btn.type = 'button'; // Explicit type
                btn.className = 'wwz-blizz-suggestion-btn';
                btn.textContent = text;
                btn.dataset.suggestion = text;
                
                // Direct click handler for robustness
                btn.onclick = function(e) {
                    e.preventDefault();
                    if (EBB.Events && EBB.Events.handleSuggestionClick) {
                        EBB.Events.handleSuggestionClick(text);
                    } else if (self.handleSuggestionClick) {
                        self.handleSuggestionClick(text);
                    }
                };

                container.appendChild(btn);
            });
        },

        /**
         * Clear suggestions
         */
        clearSuggestions: function() {
            if (this.elements.suggestionsContainer) {
                this.elements.suggestionsContainer.innerHTML = '';
            }
        },

        /**
         * Show typing indicator
         */
        showTypingIndicator: function() {
            var CONFIG = EBB.CONFIG;
            this.hideTypingIndicator();

            var container = this.elements.messagesContainer;
            var typingDiv = document.createElement('div');
            typingDiv.className = 'wwz-blizz-message wwz-blizz-message-bot';
            typingDiv.id = 'wwz-blizz-typing-indicator';
            typingDiv.innerHTML =
                '<div class="wwz-blizz-message-avatar">' +
                    '<img src="' + CONFIG.botAvatar + '" alt="' + CONFIG.botName + '">' +
                '</div>' +
                '<div class="wwz-blizz-message-content">' +
                    '<div class="wwz-blizz-typing-indicator">' +
                        '<span></span><span></span><span></span>' +
                    '</div>' +
                '</div>';
            container.appendChild(typingDiv);
            this.scrollToBottom();
        },

        /**
         * Hide typing indicator
         */
        hideTypingIndicator: function() {
            var typing = document.getElementById('wwz-blizz-typing-indicator');
            if (typing) {
                typing.parentNode.removeChild(typing);
            }
        },

        /**
         * Scroll to bottom (with optional smooth animation)
         * Only scrolls if content actually exceeds container height (ChatGPT behavior)
         * Thumbs visibility is handled by bottom padding in CSS
         */
        scrollToBottom: function(smooth) {
            var self = this;
            var container = this.elements.messagesContainer;

            if (!container) return;

            // Only scroll if content exceeds container height (has overflow)
            // This prevents scrolling to empty space when there's only 1-2 messages
            if (container.scrollHeight > container.clientHeight) {
                // Scroll to actual bottom - thumbs visibility handled by bottom padding
                var scrollTarget = container.scrollHeight - container.clientHeight;

                if (smooth) {
                    container.scrollTo({
                        top: scrollTarget,
                        behavior: 'smooth'
                    });
                } else {
                    container.scrollTop = scrollTarget;
                }
            }

            // Update button visibility after scroll completes
            setTimeout(function() {
                self.updateScrollButtonVisibility();
            }, smooth ? 300 : 0);
        },

        /**
         * Update view
         */
        updateView: function(viewName) {
            // Hide all overlays (with null checks)
            if (this.elements.closeConfirm) this.elements.closeConfirm.classList.add('wwz-blizz-hidden');
            if (this.elements.feedbackContainer) this.elements.feedbackContainer.classList.add('wwz-blizz-hidden');
            if (this.elements.thankYou) this.elements.thankYou.classList.add('wwz-blizz-hidden');
            if (this.elements.contactForm) this.elements.contactForm.classList.add('wwz-blizz-hidden');
            if (this.elements.contactSuccess) this.elements.contactSuccess.classList.add('wwz-blizz-hidden');
            if (this.elements.privacyModal) this.elements.privacyModal.classList.add('wwz-blizz-hidden');

            switch (viewName) {
                case 'chat':
                    break;
                case 'closeConfirm':
                    if (this.elements.closeConfirm) this.elements.closeConfirm.classList.remove('wwz-blizz-hidden');
                    break;
                case 'feedback':
                    if (this.elements.feedbackContainer) this.elements.feedbackContainer.classList.remove('wwz-blizz-hidden');
                    break;
                case 'thankYou':
                    if (this.elements.thankYou) this.elements.thankYou.classList.remove('wwz-blizz-hidden');
                    break;
                case 'contactForm':
                    if (this.elements.contactForm) this.elements.contactForm.classList.remove('wwz-blizz-hidden');
                    break;
                case 'contactSuccess':
                    if (this.elements.contactSuccess) this.elements.contactSuccess.classList.remove('wwz-blizz-hidden');
                    break;
                case 'privacy':
                    if (this.elements.privacyModal) this.elements.privacyModal.classList.remove('wwz-blizz-hidden');
                    break;
            }

            EBB.StateManager.setView(viewName);
        },

        /**
         * Show privacy modal
         */
        showPrivacyModal: function() {
            if (this.elements.privacyModal) {
                this.elements.privacyModal.classList.remove('wwz-blizz-hidden');
            }
        },

        /**
         * Hide privacy modal
         */
        hidePrivacyModal: function() {
            if (this.elements.privacyModal) {
                this.elements.privacyModal.classList.add('wwz-blizz-hidden');
            }
        },

        /**
         * Show category label
         */
        showCategoryLabel: function(categoryName) {
            if (this.elements.categoryLabel) {
                this.elements.categoryLabel.textContent = categoryName;
                this.elements.categoryLabel.classList.remove('wwz-blizz-hidden');
            }
        },

        /**
         * Hide category label
         */
        hideCategoryLabel: function() {
            if (this.elements.categoryLabel) {
                this.elements.categoryLabel.classList.add('wwz-blizz-hidden');
            }
        },

        /**
         * Toggle privacy modal
         */
        togglePrivacyModal: function() {
            if (this.elements.privacyModal) {
                this.elements.privacyModal.classList.toggle('wwz-blizz-hidden');
            }
        },

        /**
         * Extract YouTube video ID from URL
         */
        extractYoutubeVideoId: function(url) {
            var match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([^&\s?/]+)/);
            return match ? match[1] : '';
        },

        /**
         * Create logomark button HTML
         * Yellow button with WWZ logo and content (e.g. phone number)
         * @param {string} logomark - The logomark content (e.g. phone number)
         */
        createLogomarkButton: function(logomark) {
            if (!logomark) return '';

            var content = this.escapeHtml(logomark);
            // Check if it looks like a phone number
            var cleaned = logomark.replace(/\s/g, '');
            var isPhone = /^[+]?\d[\d\s()-]{6,}$/.test(cleaned);
            var href = isPhone ? 'tel:' + cleaned : '#';
            var tag = isPhone ? 'a' : 'div';
            var hrefAttr = isPhone ? ' href="' + href + '"' : '';

            return '<' + tag + hrefAttr + ' class="wwz-blizz-logomark-btn">' +
                '<img src="' + CONFIG.wwzLogo + '" alt="WWZ" class="wwz-blizz-logomark-logo" >' +
                '<span class="wwz-blizz-logomark-text">' + content + '</span>' +
                '<svg class="wwz-blizz-logomark-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                    '<path d="M5 12h14M12 5l7 7-7 7"/>' +
                '</svg>' +
                '</' + tag + '>';
        },

        /**
         * Create search results widget HTML
         * Simplified inline design - appears within bot message bubble
         * @param {Array} searchResults - Array of {title, url, icon} objects
         */
        createSearchResultsWidget: function(searchResults) {
            if (!searchResults || searchResults.length === 0) {
                return '';
            }

            var linksHtml = '';
            for (var i = 0; i < searchResults.length; i++) {
                var item = searchResults[i];
                var iconSvg = '';

                if (item.icon === 'doc') {
                    // Document/file icon
                    iconSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                        '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>' +
                        '<polyline points="14 2 14 8 20 8"/>' +
                        '<line x1="16" y1="13" x2="8" y2="13"/>' +
                        '<line x1="16" y1="17" x2="8" y2="17"/>' +
                        '<polyline points="10 9 9 9 8 9"/>' +
                        '</svg>';
                } else {
                    // Globe/web icon
                    iconSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                        '<circle cx="12" cy="12" r="10"/>' +
                        '<path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>' +
                        '<path d="M2 12h20"/>' +
                        '</svg>';
                }

                linksHtml += '<a href="' + this.escapeHtml(item.url) + '" target="_blank" rel="noopener noreferrer" class="wwz-blizz-search-result-link">' +
                    '<span class="wwz-blizz-search-result-icon">' + iconSvg + '</span>' +
                    '<span class="wwz-blizz-search-result-text">' + this.escapeHtml(item.title) + '</span>' +
                    '</a>';
            }

            return '<div class="wwz-blizz-search-results">' +
                '<div class="wwz-blizz-search-results-title">Hilfe zum Nachlesen</div>' +
                linksHtml +
                '</div>';
        },

        /**
         * Create YouTube video widget HTML
         */
        createVideoWidget: function(video) {
            var videoId = this.extractYoutubeVideoId(video.url);
            var thumbnailUrl = 'https://img.youtube.com/vi/' + videoId + '/maxresdefault.jpg';
            
            return '<p style="margin-bottom: 8px; font-size: 15px; font-weight: 700; color: #000;">Hier ist ein Video für Sie:</p>' +
                '<div class="enterprisebot-blizz-video-widget">' +
                '<div class="enterprisebot-blizz-video-link" data-video-id="' + videoId + '">' +
                '<div class="enterprisebot-blizz-video-thumbnail">' +
                '<img src="' + thumbnailUrl + '" alt="' + video.title + '">' +
                '<div class="enterprisebot-blizz-video-play-icon">' +
                '<svg width="48" height="48" viewBox="0 0 24 24" fill="white">' +
                '<path d="M8 5v14l11-7z"/>' +
                '</svg>' +
                '</div>' +
                '</div>' +
                '<div class="enterprisebot-blizz-video-title">' + video.title + '</div>' +
                '</div>' +
                '</div>';
        },

        /**
         * Create Google Maps widget from mapsLink
         */
        createMapsLinkWidget: function(mapsLink) {
            if (!mapsLink) {
                return '';
            }

            var embedUrl = mapsLink;
            var CONFIG = EBB.CONFIG;

            // Handle different Google Maps URL formats
            if (mapsLink.indexOf('google.com/maps') !== -1) {
                // Case 1: Already an embed URL - use as-is
                if (mapsLink.indexOf('/maps/embed') !== -1) {
                    embedUrl = mapsLink;
                }
                // Case 2: My Maps URL (custom maps) - convert to embed format
                else if (mapsLink.indexOf('/maps/d/') !== -1) {
                    // Extract map ID from various My Maps URL formats
                    var midMatch = mapsLink.match(/mid=([^&]+)/);
                    if (midMatch) {
                        embedUrl = 'https://www.google.com/maps/d/embed?mid=' + midMatch[1];
                    } else {
                        // Try to extract from URL path: /maps/d/viewer?mid=xxx or /maps/d/u/0/viewer?mid=xxx
                        var urlParts = mapsLink.split('?');
                        if (urlParts.length > 1) {
                            var params = urlParts[1];
                            midMatch = params.match(/mid=([^&]+)/);
                            if (midMatch) {
                                embedUrl = 'https://www.google.com/maps/d/embed?mid=' + midMatch[1];
                            }
                        }
                    }
                }
                // Case 3: Regular Google Maps URL - convert to Embed API format
                else {
                    // Extract query/location information
                    var query = '';

                    // Try to extract from q parameter
                    var qMatch = mapsLink.match(/[?&]q=([^&]+)/);
                    if (qMatch) {
                        query = decodeURIComponent(qMatch[1].replace(/\+/g, ' '));
                    }
                    // Try to extract from place information
                    else if (mapsLink.indexOf('/place/') !== -1) {
                        var placeMatch = mapsLink.match(/\/place\/([^\/]+)/);
                        if (placeMatch) {
                            query = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
                        }
                    }
                    // Try to extract from search query
                    else if (mapsLink.indexOf('/search/') !== -1) {
                        var searchMatch = mapsLink.match(/\/search\/([^\/]+)/);
                        if (searchMatch) {
                            query = decodeURIComponent(searchMatch[1].replace(/\+/g, ' '));
                        }
                    }

                    // If we have an API key, use the Embed API
                    if (CONFIG.googleMapsApiKey && query) {
                        embedUrl = 'https://www.google.com/maps/embed/v1/place?key=' +
                                   CONFIG.googleMapsApiKey + '&q=' + encodeURIComponent(query);
                    }
                    // Fallback: try using the URL as-is (might work for some cases)
                    else {
                        embedUrl = mapsLink;
                    }
                }
            }

            return '<div class="wwz-blizz-maps-widget">' +
                '<iframe ' +
                'class="wwz-blizz-maps-iframe" ' +
                'src="' + embedUrl + '" ' +
                'width="100%" ' +
                'height="300" ' +
                'style="border:0;" ' +
                'allowfullscreen="" ' +
                'loading="lazy" ' +
                'referrerpolicy="no-referrer-when-downgrade" ' +
                'onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'block\';">' +
                '</iframe>' +
                '<a href="' + this.escapeHtml(mapsLink) + '" target="_blank" rel="noopener noreferrer" class="wwz-blizz-maps-fallback-link" style="display:none;padding:16px;text-align:center;color:var(--eb-primary);text-decoration:none;font-weight:500;">' +
                '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:8px;">' +
                '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>' +
                '<circle cx="12" cy="10" r="3"/>' +
                '</svg>' +
                'Auf Google Maps anzeigen' +
                '</a>' +
                '</div>';
        },

        /**
         * Detect shop mention in text
         */
        detectShopMention: function(text) {
            var lowerText = text.toLowerCase();
            var shops = EBB.CONFIG.wwzShops;
            for (var key in shops) {
                if (shops.hasOwnProperty(key) && lowerText.indexOf(key) !== -1) {
                    return shops[key];
                }
            }
            return null;
        },

        /**
         * Check if shop is currently open based on hours
         * Supports both formats:
         * - Per-day: hours[0]=Mo, hours[1]=Di, ..., hours[6]=So (7 entries)
         * - Legacy:  hours[0]=Mo-Fr, hours[1]=Sa, hours[2]=So (3 entries)
         */
        isShopOpen: function(hours) {
            if (!hours || hours.length === 0) return false;

            var now = new Date();
            var jsDay = now.getDay(); // 0=Sun, 1=Mon, 2=Tue, ...
            var currentTime = now.getHours() * 100 + now.getMinutes(); // e.g., 1430 for 14:30

            var todayHours = null;

            if (hours.length === 7) {
                // Per-day format: hours[0]=Mo, hours[1]=Di, ..., hours[6]=So
                // Map JS day (0=Sun) to array index (0=Mo, 6=So)
                var dayIndex = jsDay === 0 ? 6 : jsDay - 1;
                todayHours = hours[dayIndex];
            } else if (hours.length === 3) {
                // Legacy format: hours[0]=Mo-Fr, hours[1]=Sa, hours[2]=So
                if (jsDay >= 1 && jsDay <= 5) {
                    todayHours = hours[0];
                } else if (jsDay === 6) {
                    todayHours = hours[1];
                } else {
                    todayHours = hours[2];
                }
            } else {
                return false;
            }

            if (!todayHours || todayHours.time.toLowerCase() === 'geschlossen') {
                return false;
            }

            // Parse time ranges like "08:00-18:30" or "08:30-12:00, 13:30-18:00"
            var ranges = todayHours.time.split(',');
            for (var i = 0; i < ranges.length; i++) {
                var range = ranges[i].trim();
                // Handle both "08:00 - 18:30" and "08:00-18:30" formats
                var parts = range.split(/\s*-\s*/);
                if (parts.length === 2) {
                    var open = parseInt(parts[0].replace(':', ''), 10);
                    var close = parseInt(parts[1].replace(':', ''), 10);
                    if (currentTime >= open && currentTime <= close) {
                        return true;
                    }
                }
            }
            return false;
        },

        /**
         * Create Google Maps widget HTML
         */
        createMapWidget: function(shop) {
            var self = this;
            var googleMapsUrl = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(shop.query.replace(/\+/g, ' '));
            var phoneLink = 'tel:' + shop.phone.replace(/\s/g, '');
            var emailLink = 'mailto:' + shop.email;

            // Check if shop is currently open
            var isOpen = this.isShopOpen(shop.hours);
            var statusClass = isOpen ? 'enterprisebot-blizz-status-open' : 'enterprisebot-blizz-status-closed';
            var statusText = isOpen ? 'Jetzt geoffnet' : 'Geschlossen';

            // Build hours HTML
            var hoursHtml = '';
            if (shop.hours && shop.hours.length > 0) {
                for (var i = 0; i < shop.hours.length; i++) {
                    var h = shop.hours[i];
                    var isClosed = h.time.toLowerCase() === 'geschlossen';
                    hoursHtml += '<div class="enterprisebot-blizz-hours-row">' +
                        '<span class="enterprisebot-blizz-hours-day">' + h.days + '</span>' +
                        '<span class="enterprisebot-blizz-hours-time' + (isClosed ? ' enterprisebot-blizz-hours-closed' : '') + '">' + h.time + '</span>' +
                        '</div>';
                }
            }

            return '<div class="enterprisebot-blizz-location-card">' +
                // Header with status badge
                '<div class="enterprisebot-blizz-location-header">' +
                '<svg class="enterprisebot-blizz-location-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">' +
                '<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>' +
                '</svg>' +
                '<span class="enterprisebot-blizz-location-name">' + shop.name + '</span>' +
                '<span class="enterprisebot-blizz-location-status ' + statusClass + '">' + statusText + '</span>' +
                '</div>' +
                // Body - side by side on desktop
                '<div class="enterprisebot-blizz-location-body">' +
                // Map (left on desktop)
                '<div class="enterprisebot-blizz-location-map">' +
                '<iframe ' +
                'src="https://www.google.com/maps?q=' + shop.query + '&output=embed" ' +
                'width="100%" ' +
                'height="100%" ' +
                'style="border:0;" ' +
                'allowfullscreen="" ' +
                'loading="lazy" ' +
                'referrerpolicy="no-referrer-when-downgrade">' +
                '</iframe>' +
                '</div>' +
                // Info Section (right on desktop)
                '<div class="enterprisebot-blizz-location-info">' +
                // Address
                '<div class="enterprisebot-blizz-location-row">' +
                '<svg class="enterprisebot-blizz-location-row-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>' +
                '</svg>' +
                '<span>' + shop.address + '</span>' +
                '</div>' +
                // Phone
                '<a href="' + phoneLink + '" class="enterprisebot-blizz-location-row enterprisebot-blizz-location-link">' +
                '<svg class="enterprisebot-blizz-location-row-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                '<path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>' +
                '</svg>' +
                '<span>' + shop.phone + '</span>' +
                '</a>' +
                // Email
                '<a href="' + emailLink + '" class="enterprisebot-blizz-location-row enterprisebot-blizz-location-link">' +
                '<svg class="enterprisebot-blizz-location-row-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>' +
                '<polyline points="22,6 12,13 2,6"/>' +
                '</svg>' +
                '<span>' + shop.email + '</span>' +
                '</a>' +
                // Opening Hours
                '<div class="enterprisebot-blizz-location-hours">' +
                '<div class="enterprisebot-blizz-location-hours-title">' +
                '<svg class="enterprisebot-blizz-location-row-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>' +
                '</svg>' +
                '<span>Offnungszeiten</span>' +
                '</div>' +
                '<div class="enterprisebot-blizz-location-hours-list">' +
                hoursHtml +
                '</div>' +
                '</div>' +
                '</div>' +
                // Directions Button - floating on map
                '<a href="' + googleMapsUrl + '" target="_blank" rel="noopener noreferrer" class="enterprisebot-blizz-location-btn">' +
                '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                '<polygon points="3 11 22 2 13 21 11 13 3 11"/>' +
                '</svg>' +
                '<span style="color:#ffffff;">Route planen</span>' +
                '</a>' +
                '</div>' +
                '</div>';
        },

        /**
         * Create aggregated map view with all shop locations
         * Uses Google Maps JavaScript API to show all pins with hover info
         * @param {Array} mapPins - Array of map pin objects from API
         */
        createAggregatedMapView: function(mapPins) {
            var self = this;
            var CONFIG = EBB.CONFIG;

            if (!mapPins || mapPins.length === 0) {
                console.warn('[WWZBlizz] No map pins available for aggregated view');
                return '';
            }

            // Generate unique ID for this map instance
            var mapId = 'wwz-blizz-map-' + Date.now();

            // Calculate center point (average of all coordinates)
            var centerLat = 0, centerLng = 0;
            for (var i = 0; i < mapPins.length; i++) {
                centerLat += mapPins[i].lat;
                centerLng += mapPins[i].lng;
            }
            centerLat /= mapPins.length;
            centerLng /= mapPins.length;

            // Build list HTML for sidebar
            var listHtml = '';
            for (var j = 0; j < mapPins.length; j++) {
                var pin = mapPins[j];
                var statusClass = pin.openNow ? 'enterprisebot-blizz-status-open' : 'enterprisebot-blizz-status-closed';
                var statusText = pin.openNow ? 'Offen' : 'Geschlossen';

                listHtml += '<div class="wwz-blizz-map-list-item" data-shop-id="' + pin.id + '">' +
                    '<div class="wwz-blizz-map-list-name">' + pin.name + '</div>' +
                    '<div class="wwz-blizz-map-list-address">' + pin.address + '</div>' +
                    '<span class="wwz-blizz-map-list-status ' + statusClass + '">' + statusText + '</span>' +
                    '</div>';
            }

            // Build the aggregated map container HTML
            var html = '<div class="wwz-blizz-aggregated-map-container">' +
                '<div class="wwz-blizz-aggregated-map-header">' +
                '<svg class="enterprisebot-blizz-location-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">' +
                '<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>' +
                '</svg>' +
                '<span>Unsere Standorte (' + mapPins.length + ')</span>' +
                '</div>' +
                '<div class="wwz-blizz-aggregated-map-body">' +
                '<div class="wwz-blizz-aggregated-map-canvas" id="' + mapId + '"></div>' +
                '<div class="wwz-blizz-aggregated-map-list">' + listHtml + '</div>' +
                '</div>' +
                '</div>';

            // Load Google Maps and initialize after DOM is ready
            setTimeout(function() {
                self.initGoogleMap(mapId, mapPins, centerLat, centerLng);
            }, 100);

            return html;
        },

        /**
         * Initialize Google Maps with markers
         * @param {string} mapId - DOM element ID for the map
         * @param {Array} mapPins - Array of map pin objects
         * @param {number} centerLat - Center latitude
         * @param {number} centerLng - Center longitude
         */
        initGoogleMap: function(mapId, mapPins, centerLat, centerLng) {
            var self = this;
            var CONFIG = EBB.CONFIG;

            // Check if Google Maps is already loaded
            if (window.google && window.google.maps) {
                self.createMapWithMarkers(mapId, mapPins, centerLat, centerLng);
                return;
            }

            // Load Google Maps JavaScript API
            if (!window.wwzBlizzGoogleMapsLoading) {
                window.wwzBlizzGoogleMapsLoading = true;

                var script = document.createElement('script');
                script.src = 'https://maps.googleapis.com/maps/api/js?key=' + CONFIG.googleMapsApiKey + '&callback=wwzBlizzInitMap';
                script.async = true;
                script.defer = true;

                // Store pending map data for callback
                window.wwzBlizzPendingMaps = window.wwzBlizzPendingMaps || [];
                window.wwzBlizzPendingMaps.push({ mapId: mapId, mapPins: mapPins, centerLat: centerLat, centerLng: centerLng });

                // Global callback for Google Maps
                window.wwzBlizzInitMap = function() {
                    var pending = window.wwzBlizzPendingMaps || [];
                    for (var i = 0; i < pending.length; i++) {
                        var data = pending[i];
                        EBB.UI.createMapWithMarkers(data.mapId, data.mapPins, data.centerLat, data.centerLng);
                    }
                    window.wwzBlizzPendingMaps = [];
                };

                document.head.appendChild(script);
            } else {
                // API already loading, add to pending
                window.wwzBlizzPendingMaps = window.wwzBlizzPendingMaps || [];
                window.wwzBlizzPendingMaps.push({ mapId: mapId, mapPins: mapPins, centerLat: centerLat, centerLng: centerLng });
            }
        },

        /**
         * Create Google Map with markers once API is loaded
         */
        createMapWithMarkers: function(mapId, mapPins, centerLat, centerLng) {
            var self = this;
            var CONFIG = EBB.CONFIG;

            var mapElement = document.getElementById(mapId);
            if (!mapElement) {
                console.warn('[WWZBlizz] Map element not found:', mapId);
                return;
            }

            var map = new google.maps.Map(mapElement, {
                center: { lat: centerLat, lng: centerLng },
                zoom: 9,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: true,
                zoomControl: true,
                styles: [
                    { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }
                ]
            });

            var infoWindow = new google.maps.InfoWindow();
            var markers = [];

            // Add markers for each shop
            for (var i = 0; i < mapPins.length; i++) {
                (function(pin) {
                    var statusClass = pin.openNow ? 'open' : 'closed';
                    var statusText = pin.openNow ? 'Jetzt geoffnet' : 'Geschlossen';

                    var marker = new google.maps.Marker({
                        position: { lat: pin.lat, lng: pin.lng },
                        map: map,
                        title: pin.name,
                        icon: {
                            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
                                '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="' + (pin.openNow ? '#22c55e' : '#ef4444') + '">' +
                                '<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>' +
                                '</svg>'
                            ),
                            scaledSize: new google.maps.Size(32, 32)
                        }
                    });

                    markers.push(marker);

                    // Info window content
                    var infoContent = '<div style="font-family: system-ui, sans-serif; padding: 8px; min-width: 180px;">' +
                        '<div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">' + pin.name + '</div>' +
                        '<div style="font-size: 12px; color: #666; margin-bottom: 6px;">' + pin.address + '</div>' +
                        '<div style="font-size: 11px; font-weight: 500; color: ' + (pin.openNow ? '#22c55e' : '#ef4444') + ';">' + statusText + '</div>' +
                        '<a href="https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(pin.address) + '" ' +
                        'target="_blank" rel="noopener noreferrer" ' +
                        'style="display: inline-block; margin-top: 8px; font-size: 12px; color: #0066cc; text-decoration: none;">Route planen</a>' +
                        '</div>';

                    marker.addListener('click', function() {
                        infoWindow.setContent(infoContent);
                        infoWindow.open(map, marker);
                    });

                    // Highlight corresponding list item on hover
                    marker.addListener('mouseover', function() {
                        var listItem = document.querySelector('.wwz-blizz-map-list-item[data-shop-id="' + pin.id + '"]');
                        if (listItem) listItem.classList.add('wwz-blizz-highlighted');
                    });

                    marker.addListener('mouseout', function() {
                        var listItem = document.querySelector('.wwz-blizz-map-list-item[data-shop-id="' + pin.id + '"]');
                        if (listItem) listItem.classList.remove('wwz-blizz-highlighted');
                    });
                })(mapPins[i]);
            }

            // Add click handlers to list items
            var listItems = document.querySelectorAll('.wwz-blizz-map-list-item');
            for (var k = 0; k < listItems.length; k++) {
                (function(item, index) {
                    item.addEventListener('click', function() {
                        var shopId = item.getAttribute('data-shop-id');
                        for (var m = 0; m < mapPins.length; m++) {
                            if (mapPins[m].id === shopId && markers[m]) {
                                map.panTo(markers[m].getPosition());
                                map.setZoom(14);
                                google.maps.event.trigger(markers[m], 'click');
                                break;
                            }
                        }
                    });
                })(listItems[k], k);
            }

            // Fit bounds to show all markers
            if (markers.length > 1) {
                var bounds = new google.maps.LatLngBounds();
                for (var j = 0; j < markers.length; j++) {
                    bounds.extend(markers[j].getPosition());
                }
                map.fitBounds(bounds);
            }
        },

        /**
         * Update smiley selection
         */
        updateSmileySelection: function(rating) {
            var wrappers = document.querySelectorAll('.wwz-blizz-smiley-wrapper');
            for (var i = 0; i < wrappers.length; i++) {
                var wrapper = wrappers[i];
                var wrapperRating = parseInt(wrapper.getAttribute('data-rating'));
                if (wrapperRating === rating) {
                    wrapper.classList.add('wwz-blizz-selected');
                } else {
                    wrapper.classList.remove('wwz-blizz-selected');
                }
            }
        },

        /**
         * Clear input
         */
        clearInput: function() {
            this.elements.messageInput.value = '';
            this.elements.messageInput.style.height = 'auto';
        },

        /**
         * Clear welcome input
         */
        clearWelcomeInput: function() {
            this.elements.welcomeMessageInput.value = '';
            this.elements.welcomeMessageInput.style.height = 'auto';
        },

        /**
         * Get input value
         */
        getInputValue: function() {
            return this.elements.messageInput.value.trim();
        },

        /**
         * Get welcome input value
         */
        getWelcomeInputValue: function() {
            return this.elements.welcomeMessageInput.value.trim();
        },

        /**
         * Show error with action buttons
         */
        showError: function(message) {
            var container = this.elements.suggestionsContainer;
            container.innerHTML =
                '<div class="wwz-blizz-error-container">' +
                    '<div class="wwz-blizz-error-status">' +
                        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                            '<circle cx="12" cy="12" r="10"/>' +
                            '<line x1="12" y1="8" x2="12" y2="12"/>' +
                            '<line x1="12" y1="16" x2="12.01" y2="16"/>' +
                        '</svg>' +
                        '<span>' + this.escapeHtml(message) + '</span>' +
                    '</div>' +
                    '<div class="wwz-blizz-error-actions">' +
                        '<button class="wwz-blizz-error-btn wwz-blizz-error-btn-primary" onclick="window.WWZBlizz.Events.retryLastMessage()">' +
                            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                                '<path d="M23 4v6h-6M1 20v-6h6"/>' +
                                '<path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>' +
                            '</svg>' +
                            'Erneut versuchen' +
                        '</button>' +
                        '<button class="wwz-blizz-error-btn wwz-blizz-error-btn-secondary" onclick="window.WWZBlizz.Events.startNewConversation()">' +
                            'Neues Gespräch' +
                        '</button>' +
                    '</div>' +
                '</div>';
        },

        /**
         * Show notification
         */
        showNotification: function(message, type) {
            type = type || 'info';

            var notification = document.createElement('div');
            notification.className = 'wwz-blizz-notification wwz-blizz-notification-' + type;
            notification.textContent = message;

            document.body.appendChild(notification);

            setTimeout(function() {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 3000);
        },

        /**
         * Copy to clipboard
         */
        copyToClipboard: function(text) {
            var self = this;

            if (navigator.clipboard) {
                navigator.clipboard.writeText(text)
                    .then(function() {
                        self.showNotification('Kopiert!', 'success');
                    })
                    .catch(function() {
                        self.showNotification('Kopieren fehlgeschlagen', 'error');
                    });
            } else {
                // Fallback
                var textarea = document.createElement('textarea');
                textarea.value = text;
                document.body.appendChild(textarea);
                textarea.select();
                try {
                    document.execCommand('copy');
                    self.showNotification('Kopiert!', 'success');
                } catch (e) {
                    self.showNotification('Kopieren fehlgeschlagen', 'error');
                }
                document.body.removeChild(textarea);
            }
        },

        /**
         * Render contact form field
         */
        renderFormField: function(field) {
            // Map field type to HTML input type
            var inputType = 'text';
            var fieldId = field.id;
            var fieldType = (field.type || '').toLowerCase();

            if (fieldType === 'datetime') {
                inputType = 'datetime-local';
            } else if (fieldType === 'email') {
                inputType = 'email';
            } else if (fieldType === 'tel' || fieldType === 'phone' || fieldType === 'telephone') {
                inputType = 'tel';
                inputType = 'tel';
            } else if (fieldType === 'time') {
                inputType = 'time';
            } else if (fieldType === 'date') {
                inputType = 'date';
            } else if (fieldType === 'textarea') {
                inputType = 'textarea';
            }

            var isRequired = field['required'];
            var formFieldPlaceholder = field['placeholder'];
            var errorMsg = field['error message'] || 'Dieses Feld ist erforderlich';

            var inputElement;
            
            if (inputType === 'textarea') {
                inputElement = '<textarea ' +
                    'id="' + fieldId + '" ' +
                    'name="' + this.escapeHtml(field.name) + '" ' +
                    'class="wwz-blizz-form-input" ' +
                    (isRequired ? 'required ' : '') +
                    (formFieldPlaceholder ? 'placeholder="' + this.escapeHtml(formFieldPlaceholder) + '" ' : '') +
                    'data-error="' + this.escapeHtml(errorMsg) + '" ' +
                    'rows="3"' +
                '></textarea>';
            } else if (fieldType === 'radio' && field.options) {
                // Radio buttons
                var radioOptions = '';
                var safeName = this.escapeHtml(field.name);
                
                for (var j = 0; j < field.options.length; j++) {
                    var option = field.options[j];
                    radioOptions += 
                        '<label class="wwz-blizz-radio-option">' +
                            '<input type="radio" ' +
                                'name="' + safeName + '" ' +
                                'value="' + this.escapeHtml(option) + '" ' +
                                (isRequired ? 'required ' : '') + 
                            '>' +
                            '<span class="wwz-blizz-radio-custom"></span>' +
                            '<span class="wwz-blizz-radio-label">' + this.escapeHtml(option) + '</span>' +
                        '</label>';
                }
                
                inputElement = '<div class="wwz-blizz-radio-group">' + radioOptions + '</div>';
            } else {
                inputElement = '<input ' +
                    'id="' + fieldId + '" ' +
                    'type="' + inputType + '" ' +
                    'name="' + this.escapeHtml(field.name) + '" ' +
                    'class="wwz-blizz-form-input" ' +
                    (isRequired ? 'required ' : '') +
                    (formFieldPlaceholder ? 'placeholder="' + this.escapeHtml(formFieldPlaceholder) + '" ' : '') +
                    'data-error="' + this.escapeHtml(errorMsg) + '" ' +
                '/>';
            }

            return '<div class="wwz-blizz-form-field">' +
                '<div class="wwz-blizz-form-label">' + this.escapeHtml(field.name) + '</div>' +
                inputElement +
                '<span class="wwz-blizz-form-error"></span>' +
                '</div>';
        },

        /**
         * Render contact form
         */
        renderContactForm: function(formData) {
            var self = this;
            var fieldsHtml = '';
            for (var i = 0; i < formData.fields.length; i++) {
                fieldsHtml += self.renderFormField(formData.fields[i]);
            }

            return '<div class="wwz-blizz-contact-form">' +
                '<h3 class="wwz-blizz-form-title">' + this.escapeHtml(formData.title) + '</h3>' +
                '<form id="wwz-blizz-contact-form-element">' +
                    fieldsHtml +
                    '<button type="submit" class="wwz-blizz-btn wwz-blizz-btn-primary wwz-blizz-form-submit">' +
                        'Absenden' +
                    '</button>' +
                '</form>' +
                '</div>';
        },

        /**
         * Add contact form message
         */
        addContactFormMessage: function(response) {
            var container = this.elements.messagesContainer;
            var messageDiv = document.createElement('div');
            messageDiv.className = 'wwz-blizz-message wwz-blizz-message-bot';

            messageDiv.innerHTML =
                '<div class="wwz-blizz-message-avatar">' +
                    '<img src="' + CONFIG.botAvatar + '" alt="' + CONFIG.botName + '">' +
                '</div>' +
                '<div class="wwz-blizz-message-content">' +
                    '<div class="wwz-blizz-message-bubble wwz-blizz-form-bubble">' +
                        this.renderContactForm(response.formData) +
                    '</div>' +
                '</div>';

            container.appendChild(messageDiv);
            this.scrollToBottom();
        },

        /**
         * Disable submitted form
         */
        disableContactForm: function() {
            var form = document.getElementById('wwz-blizz-contact-form-element');
            if (form) {
                var inputs = form.querySelectorAll('input, button');
                for (var i = 0; i < inputs.length; i++) {
                    inputs[i].disabled = true;
                }
                form.classList.add('wwz-blizz-form-submitted');
            }
        },

        /**
         * Show form success message
         */
        showFormSuccess: function() {
            var successDiv = document.createElement('div');
            successDiv.className = 'wwz-blizz-form-success-message';
            successDiv.innerHTML = '<span>✓ Formular erfolgreich gesendet</span>';

            var form = document.getElementById('wwz-blizz-contact-form-element');
            if (form && form.parentNode) {
                form.parentNode.appendChild(successDiv);
            }
        },

        /**
         * Show contact form
         */
        showContactForm: function() {
            this.updateView('contactForm');
            this.resetContactForm();
        },

        /**
         * Show feedback screen
         */
        showFeedbackScreen: function() {
            var feedbackScreen = document.getElementById('wwz-blizz-feedback-screen');
            var chatScreen = document.getElementById('wwz-blizz-chat-screen');

            if (feedbackScreen && chatScreen) {
                chatScreen.classList.add('wwz-blizz-hidden');
                feedbackScreen.classList.remove('wwz-blizz-hidden');
            }
        },

        /**
         * Hide feedback screen
         */
        hideFeedbackScreen: function() {
            var feedbackScreen = document.getElementById('wwz-blizz-feedback-screen');
            var chatScreen = document.getElementById('wwz-blizz-chat-screen');

            if (feedbackScreen && chatScreen) {
                feedbackScreen.classList.add('wwz-blizz-hidden');
                chatScreen.classList.remove('wwz-blizz-hidden');
            }
        },

        /**
         * Select rating
         */
        selectRating: function(rating) {
            var CONFIG = EBB.CONFIG;
            var ratingButtons = document.querySelectorAll('.wwz-blizz-rating-btn');

            // Remove selected class from all buttons
            for (var i = 0; i < ratingButtons.length; i++) {
                ratingButtons[i].classList.remove('wwz-blizz-selected');
            }

            // Add selected class to clicked button
            var selectedBtn = document.querySelector('.wwz-blizz-rating-btn[data-rating="' + rating + '"]');
            if (selectedBtn) {
                selectedBtn.classList.add('wwz-blizz-selected');
            }

            var ratingNum = parseInt(rating);

            // Update second question
            var secondTitle = document.getElementById('wwz-blizz-feedback-second-title');
            if (secondTitle) {
                secondTitle.textContent = CONFIG.feedback.ratingQuestions[ratingNum];
            }

            // Update options
            var options = CONFIG.feedback.ratingOptions[ratingNum] || [];
            var optionsContainer = document.getElementById('wwz-blizz-feedback-options');
            if (optionsContainer) {
                optionsContainer.innerHTML = options.map(function(option) {
                    return '<button class="wwz-blizz-feedback-option" data-option="' +
                           EBB.UI.escapeHtml(option) + '">' +
                           EBB.UI.escapeHtml(option) + '</button>';
                }).join('');
            }

            // Show second question and text toggle
            var secondQuestion = document.getElementById('wwz-blizz-feedback-second-question');
            var textToggleWrapper = document.getElementById('wwz-blizz-feedback-text-toggle-wrapper');

            if (secondQuestion) {
                secondQuestion.classList.remove('wwz-blizz-hidden');
            }
            if (textToggleWrapper) {
                textToggleWrapper.classList.remove('wwz-blizz-hidden');
            }
        },

        /**
         * Toggle feedback text panel
         */
        toggleFeedbackTextPanel: function() {
            var textPanel = document.getElementById('wwz-blizz-feedback-text-panel');
            var textToggleWrapper = document.getElementById('wwz-blizz-feedback-text-toggle-wrapper');

            if (textPanel) {
                textPanel.classList.toggle('wwz-blizz-expanded');
            }
            if (textToggleWrapper) {
                textToggleWrapper.classList.add('wwz-blizz-hidden');
            }
        },

        /**
         * Reset feedback form
         */
        resetFeedbackForm: function() {
            var ratingButtons = document.querySelectorAll('.wwz-blizz-rating-btn');
            for (var i = 0; i < ratingButtons.length; i++) {
                ratingButtons[i].classList.remove('wwz-blizz-selected');
            }

            var secondQuestion = document.getElementById('wwz-blizz-feedback-second-question');
            if (secondQuestion) {
                secondQuestion.classList.add('wwz-blizz-hidden');
            }

            var textToggleWrapper = document.getElementById('wwz-blizz-feedback-text-toggle-wrapper');
            if (textToggleWrapper) {
                textToggleWrapper.classList.add('wwz-blizz-hidden');
            }

            var textPanel = document.getElementById('wwz-blizz-feedback-text-panel');
            if (textPanel) {
                textPanel.classList.remove('wwz-blizz-expanded');
            }

            var textInput = document.getElementById('wwz-blizz-feedback-text-input');
            if (textInput) {
                textInput.value = '';
            }

            var optionButtons = document.querySelectorAll('.wwz-blizz-feedback-option');
            for (var i = 0; i < optionButtons.length; i++) {
                optionButtons[i].classList.remove('wwz-blizz-selected');
            }

            // Reset state
            EBB.StateManager.setFeedbackRating(null);
        },

        /**
         * Show thank you screen
         */
        showThankYou: function() {
            var feedbackScreen = document.getElementById('wwz-blizz-feedback-screen');
            var thankYouScreen = document.getElementById('wwz-blizz-thank-you');

            if (feedbackScreen) {
                feedbackScreen.classList.add('wwz-blizz-hidden');
            }
            if (thankYouScreen) {
                thankYouScreen.classList.remove('wwz-blizz-hidden');
            }
        },

        /**
         * Download transcript
         */
        downloadTranscript: function() {
            var StateManager = EBB.StateManager;
            var messages = StateManager.getMessages();

            if (!messages || messages.length === 0) {
                console.log('[WWZBlizz] No messages to download');
                return;
            }

            var transcript = '=== WWZ Chat Transcript ===\n';
            transcript += 'Datum: ' + new Date().toLocaleString('de-DE') + '\n\n';

            for (var i = 0; i < messages.length; i++) {
                var msg = messages[i];
                var sender = msg.isUser ? 'Sie' : 'Ivy';
                var time = new Date(msg.timestamp).toLocaleTimeString('de-DE');
                transcript += '[' + time + '] ' + sender + ': ' + msg.text + '\n\n';
            }

            // Create download
            var blob = new Blob([transcript], { type: 'text/plain;charset=utf-8' });
            var url = window.URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'wwz-chat-transcript-' + new Date().getTime() + '.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        },

        /**
         * Hide contact form
         */
        hideContactForm: function() {
            var source = EBB.StateManager.getContactFormSource();
            this.updateView('chat'); // This hides the overlay
            if (source === 'welcome') {
                this.showWelcomeScreen();
            }
        },

        /**
         * Reset contact form
         */
        resetContactForm: function() {
            var contactFormBody = document.getElementById('wwz-blizz-contact-form-body');
            if (contactFormBody) {
                contactFormBody.reset();
            }

            // Reset to default time values if they exist
            var timeFrom = document.getElementById('wwz-blizz-contact-time-from');
            var timeTo = document.getElementById('wwz-blizz-contact-time-to');
            if (timeFrom) timeFrom.value = '09:00';
            if (timeTo) timeTo.value = '17:00';
        },

        /**
         * Get contact form data
         */
        getContactFormData: function() {
            return {
                name: document.getElementById('wwz-blizz-contact-name').value.trim(),
                email: document.getElementById('wwz-blizz-contact-email').value.trim(),
                phone: document.getElementById('wwz-blizz-contact-phone').value.trim(),
                timeFrom: document.getElementById('wwz-blizz-contact-time-from').value,
                timeTo: document.getElementById('wwz-blizz-contact-time-to').value,
                date: document.getElementById('wwz-blizz-contact-date').value,
                comment: document.getElementById('wwz-blizz-contact-comment').value.trim()
            };
        },

        /**
         * Validate contact form
         */
        validateContactForm: function() {
            var data = this.getContactFormData();
            var errors = [];

            if (!data.name) {
                errors.push('Name ist erforderlich');
            }
            if (!data.email) {
                errors.push('E-Mail Adresse ist erforderlich');
            } else if (!this.isValidEmail(data.email)) {
                errors.push('Ungultige E-Mail Adresse');
            }
            if (!data.phone) {
                errors.push('Telefon ist erforderlich');
            }
            if (!data.comment) {
                errors.push('Bemerkung ist erforderlich');
            }

            return {
                valid: errors.length === 0,
                errors: errors
            };
        },

        /**
         * Validate email format
         */
        isValidEmail: function(email) {
            var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        },

        /**
         * Show contact form success
         */
        showContactSuccess: function() {
            this.updateView('contactSuccess');
        }
    };

    console.log('[WWZBlizz] UI loaded');
})();
