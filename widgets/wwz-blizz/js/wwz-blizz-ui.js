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
            // Welcome screen elements
            this.elements.welcomeScreen = document.getElementById('wwz-blizz-welcome-screen');
            this.elements.welcomeMessageInput = document.getElementById('wwz-blizz-welcome-message-input');
            this.elements.welcomeSendBtn = document.getElementById('wwz-blizz-welcome-send-btn');
            this.elements.welcomeSuggestions = document.getElementById('wwz-blizz-welcome-suggestions');

            // Chat screen elements
            this.elements.chatScreen = document.getElementById('wwz-blizz-chat-screen');
            this.elements.messagesContainer = document.getElementById('wwz-blizz-messages-container');
            this.elements.suggestionsContainer = document.getElementById('wwz-blizz-suggestions-container');
            this.elements.messageInput = document.getElementById('wwz-blizz-message-input');
            this.elements.sendBtn = document.getElementById('wwz-blizz-send-btn');

            // Collapsed bar
            this.elements.collapsedBar = document.getElementById('wwz-blizz-collapsed-bar');
            this.elements.expandBtn = document.getElementById('wwz-blizz-expand-btn');
            this.elements.mainContent = document.getElementById('wwz-blizz-main');
            this.elements.closeBtn = document.getElementById('wwz-blizz-close-btn');

            // Overlay elements
            this.elements.chatContent = document.getElementById('wwz-blizz-chat-content');
            this.elements.closeConfirm = document.getElementById('wwz-blizz-close-confirm');
            this.elements.feedbackContainer = document.getElementById('wwz-blizz-feedback-container');
            this.elements.thankYou = document.getElementById('wwz-blizz-thank-you');
            this.elements.feedbackText = document.getElementById('wwz-blizz-feedback-text');

            // Contact form elements
            this.elements.contactForm = document.getElementById('wwz-blizz-contact-form');
            this.elements.contactFormBody = document.getElementById('wwz-blizz-contact-form-body');
            this.elements.contactFormClose = document.getElementById('wwz-blizz-contact-form-close');
            this.elements.contactSuccess = document.getElementById('wwz-blizz-contact-success');
            this.elements.contactSuccessClose = document.getElementById('wwz-blizz-contact-success-close');

            // Privacy modal elements
            this.elements.privacyBtn = document.getElementById('wwz-blizz-privacy-btn');
            this.elements.privacyModal = document.getElementById('wwz-blizz-privacy-modal');
            this.elements.privacyClose = document.getElementById('wwz-blizz-privacy-close');

            console.log('[WWZBlizz] UI elements initialized');
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
            this.elements.welcomeScreen.classList.add('wwz-blizz-hidden');
            this.elements.chatScreen.classList.remove('wwz-blizz-hidden');
            this.elements.messageInput.focus();
        },

        /**
         * Show welcome screen
         */
        showWelcomeScreen: function() {
            this.elements.welcomeScreen.classList.remove('wwz-blizz-hidden');
            this.elements.chatScreen.classList.add('wwz-blizz-hidden');
            this.elements.welcomeMessageInput.focus();
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
            var container = this.elements.messagesContainer;
            var messageDiv = document.createElement('div');
            var isHtml = message.isHtml || false;

            if (message.isUser) {
                messageDiv.className = 'wwz-blizz-message wwz-blizz-message-user';
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

                messageDiv.className = 'wwz-blizz-message wwz-blizz-message-bot';
                messageDiv.innerHTML =
                    '<div class="wwz-blizz-message-avatar">' +
                        '<img src="' + CONFIG.botAvatar + '" alt="' + CONFIG.botName + '">' +
                    '</div>' +
                    '<div class="wwz-blizz-message-content">' +
                        '<div class="wwz-blizz-message-bubble">' + this.formatBotMessage(message.text, isHtml) + '</div>' +
                        '<div class="wwz-blizz-message-actions">' +
                            '<button class="wwz-blizz-action-btn wwz-blizz-copy-btn" title="Kopieren" data-text="' + escapedPlainText + '">' +
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
                btn.className = 'wwz-blizz-suggestion-btn';
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
                btn.className = 'wwz-blizz-suggestion-btn';
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
            this.elements.closeConfirm.classList.add('wwz-blizz-hidden');
            this.elements.feedbackContainer.classList.add('wwz-blizz-hidden');
            this.elements.thankYou.classList.add('wwz-blizz-hidden');
            this.elements.contactForm.classList.add('wwz-blizz-hidden');
            this.elements.contactSuccess.classList.add('wwz-blizz-hidden');
            this.elements.privacyModal.classList.add('wwz-blizz-hidden');

            switch (viewName) {
                case 'chat':
                    break;
                case 'closeConfirm':
                    this.elements.closeConfirm.classList.remove('wwz-blizz-hidden');
                    break;
                case 'feedback':
                    this.elements.feedbackContainer.classList.remove('wwz-blizz-hidden');
                    break;
                case 'thankYou':
                    this.elements.thankYou.classList.remove('wwz-blizz-hidden');
                    break;
                case 'contactForm':
                    this.elements.contactForm.classList.remove('wwz-blizz-hidden');
                    break;
                case 'contactSuccess':
                    this.elements.contactSuccess.classList.remove('wwz-blizz-hidden');
                    break;
                case 'privacy':
                    this.elements.privacyModal.classList.remove('wwz-blizz-hidden');
                    break;
            }

            EBB.StateManager.setView(viewName);
        },

        /**
         * Show privacy modal
         */
        showPrivacyModal: function() {
            this.elements.privacyModal.classList.remove('wwz-blizz-hidden');
        },

        /**
         * Hide privacy modal
         */
        hidePrivacyModal: function() {
            this.elements.privacyModal.classList.add('wwz-blizz-hidden');
        },

        /**
         * Create YouTube video widget HTML
         */
        createVideoWidget: function(video) {
            return '<div class="enterprisebot-blizz-video-widget">' +
                '<p>Hier ist ein Video für Sie:</p>' +
                '<a href="' + video.url + '" target="_blank" rel="noopener noreferrer" class="enterprisebot-blizz-video-link">' +
                '<div class="enterprisebot-blizz-video-thumbnail">' +
                '<img src="' + video.thumbnail + '" alt="' + video.title + '">' +
                '<div class="enterprisebot-blizz-video-play-icon">' +
                '<svg width="48" height="48" viewBox="0 0 24 24" fill="white">' +
                '<path d="M8 5v14l11-7z"/>' +
                '</svg>' +
                '</div>' +
                '</div>' +
                '<div class="enterprisebot-blizz-video-title">' + video.title + '</div>' +
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
         */
        isShopOpen: function(hours) {
            if (!hours || hours.length === 0) return false;

            var now = new Date();
            var day = now.getDay(); // 0=Sun, 1=Mon, ...
            var currentTime = now.getHours() * 100 + now.getMinutes(); // e.g., 1430 for 14:30

            // Map day number to hours array index
            // hours[0] = Mo-Fr, hours[1] = Sa, hours[2] = So
            var todayHours = null;
            if (day >= 1 && day <= 5) { // Mon-Fri
                todayHours = hours[0];
            } else if (day === 6) { // Sat
                todayHours = hours[1];
            } else { // Sun
                todayHours = hours[2];
            }

            if (!todayHours || todayHours.time.toLowerCase() === 'geschlossen') {
                return false;
            }

            // Parse time ranges like "08:00 - 18:30" or "08:30 - 12:00, 13:30 - 18:00"
            var ranges = todayHours.time.split(',');
            for (var i = 0; i < ranges.length; i++) {
                var parts = ranges[i].trim().split(' - ');
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
         * Show error
         */
        showError: function(message) {
            var container = this.elements.suggestionsContainer;
            container.innerHTML =
                '<div class="wwz-blizz-error-message">' + this.escapeHtml(message) + '</div>' +
                '<button class="wwz-blizz-suggestion-btn" onclick="window.WWZBlizz.Events.retryLastMessage()">Erneut versuchen</button>' +
                '<button class="wwz-blizz-suggestion-btn" onclick="window.WWZBlizz.Events.startNewConversation()">Neues Gesprach</button>';
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
         * Show contact form
         */
        showContactForm: function() {
            this.updateView('contactForm');
            this.resetContactForm();
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
            this.elements.contactFormBody.reset();
            // Reset to default time values
            document.getElementById('wwz-blizz-contact-time-from').value = '09:00';
            document.getElementById('wwz-blizz-contact-time-to').value = '17:00';
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
