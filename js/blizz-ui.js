/**
 * EnterpriseBotBlizz - UI Rendering
 */
(function() {
    'use strict';

    var EBB = window.EnterpriseBotBlizz;
    var CONFIG = EBB.CONFIG;

    EBB.UI = {
        elements: {},

        /**
         * Initialize UI element references
         */
        init: function() {
            // Welcome screen elements
            this.elements.welcomeScreen = document.getElementById('enterprisebot-blizz-welcome-screen');
            this.elements.welcomeMessageInput = document.getElementById('enterprisebot-blizz-welcome-message-input');
            this.elements.welcomeSendBtn = document.getElementById('enterprisebot-blizz-welcome-send-btn');
            this.elements.welcomeSuggestions = document.getElementById('enterprisebot-blizz-welcome-suggestions');

            // Chat screen elements
            this.elements.chatScreen = document.getElementById('enterprisebot-blizz-chat-screen');
            this.elements.messagesContainer = document.getElementById('enterprisebot-blizz-messages-container');
            this.elements.suggestionsContainer = document.getElementById('enterprisebot-blizz-suggestions-container');
            this.elements.messageInput = document.getElementById('enterprisebot-blizz-message-input');
            this.elements.sendBtn = document.getElementById('enterprisebot-blizz-send-btn');

            // Collapsed bar
            this.elements.collapsedBar = document.getElementById('enterprisebot-blizz-collapsed-bar');
            this.elements.expandBtn = document.getElementById('enterprisebot-blizz-expand-btn');
            this.elements.mainContent = document.getElementById('enterprisebot-blizz-main');
            this.elements.closeBtn = document.getElementById('enterprisebot-blizz-close-btn');

            // Overlay elements
            this.elements.chatContent = document.getElementById('enterprisebot-blizz-chat-content');
            this.elements.closeConfirm = document.getElementById('enterprisebot-blizz-close-confirm');
            this.elements.feedbackContainer = document.getElementById('enterprisebot-blizz-feedback-container');
            this.elements.thankYou = document.getElementById('enterprisebot-blizz-thank-you');
            this.elements.feedbackText = document.getElementById('enterprisebot-blizz-feedback-text');

            console.log('[EnterpriseBotBlizz] UI elements initialized');
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
            formatted = formatted.replace(/\n/g, '<br>');

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
            this.elements.welcomeScreen.classList.add('enterprisebot-blizz-hidden');
            this.elements.chatScreen.classList.remove('enterprisebot-blizz-hidden');
            this.elements.messageInput.focus();
        },

        /**
         * Show welcome screen
         */
        showWelcomeScreen: function() {
            this.elements.welcomeScreen.classList.remove('enterprisebot-blizz-hidden');
            this.elements.chatScreen.classList.add('enterprisebot-blizz-hidden');
            this.elements.welcomeMessageInput.focus();
        },

        /**
         * Show collapsed state
         */
        showCollapsed: function() {
            this.elements.mainContent.classList.add('enterprisebot-blizz-hidden');
            this.elements.collapsedBar.classList.remove('enterprisebot-blizz-hidden');
        },

        /**
         * Show expanded state
         */
        showExpanded: function() {
            this.elements.collapsedBar.classList.add('enterprisebot-blizz-hidden');
            this.elements.mainContent.classList.remove('enterprisebot-blizz-hidden');
        },

        /**
         * Render a single message
         */
        renderMessage: function(message) {
            var container = this.elements.messagesContainer;
            var messageDiv = document.createElement('div');
            var isHtml = message.isHtml || false;

            if (message.isUser) {
                messageDiv.className = 'enterprisebot-blizz-message enterprisebot-blizz-message-user';
                messageDiv.innerHTML =
                    '<div class="enterprisebot-blizz-message-avatar">' +
                        '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">' +
                            '<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>' +
                        '</svg>' +
                    '</div>' +
                    '<div class="enterprisebot-blizz-message-content">' +
                        '<div class="enterprisebot-blizz-message-bubble">' + this.escapeHtml(message.text) + '</div>' +
                    '</div>';
            } else {
                var plainText = this.stripHtml(message.text);
                var escapedPlainText = plainText.replace(/'/g, "\\'").replace(/"/g, '&quot;');

                messageDiv.className = 'enterprisebot-blizz-message enterprisebot-blizz-message-bot';
                messageDiv.innerHTML =
                    '<div class="enterprisebot-blizz-message-avatar">' +
                        '<img src="' + CONFIG.botAvatar + '" alt="' + CONFIG.botName + '">' +
                    '</div>' +
                    '<div class="enterprisebot-blizz-message-content">' +
                        '<div class="enterprisebot-blizz-message-bubble">' + this.formatBotMessage(message.text, isHtml) + '</div>' +
                        '<div class="enterprisebot-blizz-message-actions">' +
                            '<button class="enterprisebot-blizz-action-btn enterprisebot-blizz-copy-btn" title="Kopieren" data-text="' + escapedPlainText + '">' +
                                '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                                    '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>' +
                                    '<path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>' +
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
         * Render suggestions
         */
        renderSuggestions: function(suggestions) {
            var self = this;
            var container = this.elements.suggestionsContainer;
            container.innerHTML = '';

            if (!suggestions || suggestions.length === 0) {
                return;
            }

            suggestions.forEach(function(text) {
                var btn = document.createElement('button');
                btn.className = 'enterprisebot-blizz-suggestion-btn';
                btn.textContent = text;
                btn.addEventListener('click', function() {
                    EBB.Events.handleSuggestionClick(text);
                });
                container.appendChild(btn);
            });
        },

        /**
         * Render welcome suggestions
         */
        renderWelcomeSuggestions: function(suggestions) {
            var self = this;
            var container = this.elements.welcomeSuggestions;
            container.innerHTML = '';

            if (!suggestions || suggestions.length === 0) {
                return;
            }

            suggestions.forEach(function(text) {
                var btn = document.createElement('button');
                btn.className = 'enterprisebot-blizz-suggestion-btn';
                btn.textContent = text;
                btn.addEventListener('click', function() {
                    EBB.Events.handleWelcomeSuggestionClick(text);
                });
                container.appendChild(btn);
            });
        },

        /**
         * Clear suggestions
         */
        clearSuggestions: function() {
            this.elements.suggestionsContainer.innerHTML = '';
        },

        /**
         * Show typing indicator
         */
        showTypingIndicator: function() {
            this.hideTypingIndicator();

            var container = this.elements.messagesContainer;
            var typingDiv = document.createElement('div');
            typingDiv.className = 'enterprisebot-blizz-message enterprisebot-blizz-message-bot';
            typingDiv.id = 'enterprisebot-blizz-typing-indicator';
            typingDiv.innerHTML =
                '<div class="enterprisebot-blizz-message-avatar">' +
                    '<img src="' + CONFIG.botAvatar + '" alt="' + CONFIG.botName + '">' +
                '</div>' +
                '<div class="enterprisebot-blizz-message-content">' +
                    '<div class="enterprisebot-blizz-typing-indicator">' +
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
            var typing = document.getElementById('enterprisebot-blizz-typing-indicator');
            if (typing) {
                typing.parentNode.removeChild(typing);
            }
        },

        /**
         * Scroll to bottom
         */
        scrollToBottom: function() {
            var container = this.elements.messagesContainer;
            container.scrollTop = container.scrollHeight;
        },

        /**
         * Update view
         */
        updateView: function(viewName) {
            this.elements.closeConfirm.classList.add('enterprisebot-blizz-hidden');
            this.elements.feedbackContainer.classList.add('enterprisebot-blizz-hidden');
            this.elements.thankYou.classList.add('enterprisebot-blizz-hidden');

            switch (viewName) {
                case 'chat':
                    break;
                case 'closeConfirm':
                    this.elements.closeConfirm.classList.remove('enterprisebot-blizz-hidden');
                    break;
                case 'feedback':
                    this.elements.feedbackContainer.classList.remove('enterprisebot-blizz-hidden');
                    break;
                case 'thankYou':
                    this.elements.thankYou.classList.remove('enterprisebot-blizz-hidden');
                    break;
            }

            EBB.StateManager.setView(viewName);
        },

        /**
         * Update smiley selection
         */
        updateSmileySelection: function(rating) {
            var wrappers = document.querySelectorAll('.enterprisebot-blizz-smiley-wrapper');
            for (var i = 0; i < wrappers.length; i++) {
                var wrapper = wrappers[i];
                var wrapperRating = parseInt(wrapper.getAttribute('data-rating'));
                if (wrapperRating === rating) {
                    wrapper.classList.add('enterprisebot-blizz-selected');
                } else {
                    wrapper.classList.remove('enterprisebot-blizz-selected');
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
         * Show error
         */
        showError: function(message) {
            var container = this.elements.suggestionsContainer;
            container.innerHTML =
                '<div class="enterprisebot-blizz-error-message">' + this.escapeHtml(message) + '</div>' +
                '<button class="enterprisebot-blizz-suggestion-btn" onclick="window.EnterpriseBotBlizz.Events.retryLastMessage()">Erneut versuchen</button>' +
                '<button class="enterprisebot-blizz-suggestion-btn" onclick="window.EnterpriseBotBlizz.Events.startNewConversation()">Neues Gesprach</button>';
        },

        /**
         * Show notification
         */
        showNotification: function(message, type) {
            type = type || 'info';

            var notification = document.createElement('div');
            notification.className = 'enterprisebot-blizz-notification enterprisebot-blizz-notification-' + type;
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
        }
    };

    console.log('[EnterpriseBotBlizz] UI loaded');
})();
