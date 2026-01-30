/**
 * WWZBlizz - Event Handlers
 */
(function() {
    'use strict';
    console.log('[WWZBlizz] Events module loaded (v2)');

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
            var welcomeSendBtn = document.getElementById('wwz-blizz-welcome-send-btn');
            if (welcomeSendBtn) {
                welcomeSendBtn.addEventListener('click', function() {
                    self.handleWelcomeSend();
                });
            }

            // Welcome screen - Enter key
            var welcomeInput = document.getElementById('wwz-blizz-welcome-message-input');
            if (welcomeInput) {
                welcomeInput.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        self.handleWelcomeSend();
                    }
                });

                // Auto-resize welcome textarea
                welcomeInput.addEventListener('input', function() {
                    this.style.height = 'auto';
                    this.style.height = Math.min(this.scrollHeight, 120) + 'px';
                });
            }

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

            // Close/minimize button (Old) - Removed
            // document.getElementById('wwz-blizz-close-btn').addEventListener('click', function() {
            //     self.collapseWidget();
            // });

            // New Chat Button
            var newChatBtn = document.getElementById('wwz-blizz-new-chat-btn');
            if (newChatBtn) {
                newChatBtn.addEventListener('click', function() {
                    // Check if chat is active, maybe ask for confirmation or just clear
                    self.startNewConversation();
                });
            }

            // Help Button
            var helpBtn = document.getElementById('wwz-blizz-help-btn');
            if (helpBtn) {
                helpBtn.addEventListener('click', function() {
                    // Toggle privacy/info modal as help
                    self.togglePrivacyModal();
                });
            }

            // Privacy Modal Close Button
            var privacyCloseBtn = document.getElementById('wwz-blizz-privacy-close');
            if (privacyCloseBtn) {
                privacyCloseBtn.addEventListener('click', function() {
                    self.hidePrivacyModal();
                });
            }

            // Expand button
            document.getElementById('wwz-blizz-expand-btn').addEventListener('click', function() {
                self.expandWidget();
            });

            // Collapsed bar click
            document.getElementById('wwz-blizz-collapsed-bar').addEventListener('click', function() {
                self.expandWidget();
            });

            // End session button
            var endSessionBtn = document.getElementById('wwz-blizz-end-session-btn');
            if (endSessionBtn) {
                endSessionBtn.addEventListener('click', function() {
                    self.endConversation();
                });
            }

            // Welcome suggestions (event delegation)
            var welcomeSuggestionsEl = document.getElementById('wwz-blizz-welcome-suggestions');
            if (welcomeSuggestionsEl) {
                welcomeSuggestionsEl.addEventListener('click', function(e) {
                    if (e.target.classList.contains('wwz-blizz-suggestion-btn')) {
                        self.handleWelcomeSuggestionClick(e.target.dataset.suggestion);
                    }
                });
            }

            // Chat suggestions (event delegation)
            var chatSuggestionsEl = document.getElementById('wwz-blizz-suggestions-container');
            if (chatSuggestionsEl) {
                chatSuggestionsEl.addEventListener('click', function(e) {
                    console.log('[WWZBlizz] Chat suggestions click detected', e.target);
                    if (e.target.classList.contains('wwz-blizz-suggestion-btn')) {
                        console.log('[WWZBlizz] Suggestion button clicked:', e.target.dataset.suggestion);
                        self.handleSuggestionClick(e.target.dataset.suggestion);
                    }
                });
            } else {
                console.error('[WWZBlizz] Chat suggestions container not found during init');
            }

            // Scroll indicator click
            var scrollIndicator = document.querySelector('.wwz-blizz-scroll-to-bottom');
            if (scrollIndicator) {
                scrollIndicator.addEventListener('click', function() {
                    // Scroll to input or next section
                     document.getElementById('wwz-blizz-message-input').focus();
                     // Or smooth scroll messages container
                     EBB.UI.scrollToBottom(true);
                });
            }

            // Feedback rating buttons (event delegation)
            var feedbackScreen = document.getElementById('wwz-blizz-feedback-screen');
            if (feedbackScreen) {
                feedbackScreen.addEventListener('click', function(e) {
                    if (e.target.classList.contains('wwz-blizz-rating-btn')) {
                        self.handleRatingSelect(parseInt(e.target.dataset.rating));
                    }
                });
            }

            // Feedback options (event delegation)
            var feedbackOptions = document.getElementById('wwz-blizz-feedback-options');
            if (feedbackOptions) {
                feedbackOptions.addEventListener('click', function(e) {
                    if (e.target.classList.contains('wwz-blizz-feedback-option')) {
                        e.target.classList.toggle('wwz-blizz-selected');
                    }
                });
            }

            // Welcome Screen Feedback Toggle
            // Note: This needs to use delegation because the welcome screen is inside chat-content
            var chatContent = document.getElementById('wwz-blizz-chat-content');
            if (chatContent) {
                chatContent.addEventListener('click', function(e) {
                    var btn = e.target.closest('.wwz-blizz-thumbs-up-btn, .wwz-blizz-thumbs-down-btn');
                    // Ensure it's inside the welcome feedback section specifically
                    if (btn && btn.closest('.wwz-blizz-welcome-feedback')) {
                        // Toggle active class
                        btn.classList.toggle('wwz-blizz-active');
                        
                        // Remove active from siblings
                        var siblings = btn.parentNode.children;
                        for (var i = 0; i < siblings.length; i++) {
                            if (siblings[i] !== btn && siblings[i].classList.contains('wwz-blizz-active')) {
                                siblings[i].classList.remove('wwz-blizz-active');
                            }
                        }
                    }
                });
            }

            // General Chat Message Feedback (Thumbs Up/Down)
            // General Chat Message Feedback (Thumbs Up/Down)
            // Use document delegation to ensure we catch events even if DOM changes
            document.addEventListener('click', function(e) {
                // Ensure we are inside the widget
                if (!e.target.closest('.wwz-blizz-app-container')) return;

                var btn = e.target.closest('.wwz-blizz-thumbs-up-btn, .wwz-blizz-thumbs-down-btn');
                
                // Ensure it is a chat message action (not welcome screen feedback)
                if (btn && btn.closest('.wwz-blizz-message-actions')) {
                    e.preventDefault(); 
                    console.log('[WWZBlizz] Feedback button clicked via Document');
                    
                    var isSelected = btn.classList.contains('wwz-blizz-selected');
                    
                    var parent = btn.parentElement;
                    var siblings = parent.querySelectorAll('.wwz-blizz-action-btn');
                    siblings.forEach(function(sib) {
                        sib.classList.remove('wwz-blizz-selected');
                    });

                    if (!isSelected) {
                        btn.classList.add('wwz-blizz-selected');
                        var type = btn.classList.contains('wwz-blizz-thumbs-up-btn') ? 'up' : 'down';
                        console.log('[WWZBlizz] Feedback selected:', type);
                        
                        // API Call
                        if (EBB.APIService && EBB.APIService.submitMessageFeedback) {
                            var messageId = btn.dataset.messageId;
                            console.log('[WWZBlizz] Sending API request for message:', messageId);
                            EBB.APIService.submitMessageFeedback(messageId, type, null)
                                .then(function(success) {
                                    console.log('[WWZBlizz] Feedback API result:', success);
                                });
                        } else {
                            console.warn('[WWZBlizz] APIService not available for feedback');
                        }
                    }
                }
            });

            // Feedback text panel toggle
            var textToggle = document.getElementById('wwz-blizz-feedback-text-toggle');
            if (textToggle) {
                textToggle.addEventListener('click', function() {
                    self.toggleFeedbackText();
                });
            }

            // Feedback send button
            var sendBtn = document.getElementById('wwz-blizz-feedback-send-btn');
            if (sendBtn) {
                sendBtn.addEventListener('click', function() {
                    self.submitNewFeedback();
                });
            }

            // Feedback skip button
            var skipBtn = document.getElementById('wwz-blizz-feedback-skip');
            if (skipBtn) {
                skipBtn.addEventListener('click', function() {
                    self.skipNewFeedback();
                });
            }

            // Feedback download button
            var downloadBtn = document.getElementById('wwz-blizz-download-transcript');
            if (downloadBtn) {
                downloadBtn.addEventListener('click', function() {
                    self.downloadTranscript();
                });
            }

            // Feedback close button
            var feedbackClose = document.getElementById('wwz-blizz-feedback-close-btn');
            if (feedbackClose) {
                feedbackClose.addEventListener('click', function() {
                    self.closeFeedbackScreen();
                });
            }

            // Copy message and thumbs feedback (event delegation)
            document.getElementById('wwz-blizz-messages-container').addEventListener('click', function(e) {
                // Copy button handler
                var copyBtn = e.target.closest('.wwz-blizz-copy-btn');
                if (copyBtn) {
                    var text = copyBtn.getAttribute('data-text');
                    self.copyMessage(text);
                    return;
                }

                // (Legacy thumbs handlers removed to avoid conflict with new document-level listener)
                /*
                // Thumbs up handler
                var thumbsUpBtn = e.target.closest('.wwz-blizz-thumbs-up-btn');
                if (thumbsUpBtn && !thumbsUpBtn.classList.contains('wwz-blizz-disabled')) {
                    var messageId = thumbsUpBtn.getAttribute('data-message-id');
                    self.handleThumbsUp(messageId);
                    return;
                }

                // Thumbs down handler
                var thumbsDownBtn = e.target.closest('.wwz-blizz-thumbs-down-btn');
                if (thumbsDownBtn && !thumbsDownBtn.classList.contains('wwz-blizz-disabled')) {
                    var messageId = thumbsDownBtn.getAttribute('data-message-id');
                    self.handleThumbsDown(messageId, thumbsDownBtn);
                    return;
                }
                */

                // Popup close button
                var popupClose = e.target.closest('.wwz-blizz-thumbs-popup-close');
                if (popupClose) {
                    EBB.UI.hideThumbsDownPopup();
                    return;
                }

                // Popup skip button
                var popupSkip = e.target.closest('.wwz-blizz-thumbs-popup-skip');
                if (popupSkip) {
                    var popup = popupSkip.closest('.wwz-blizz-thumbs-popup');
                    var msgId = popup.getAttribute('data-message-id');
                    self.submitThumbsDownFeedback(msgId, '');
                    return;
                }

                // Popup submit button
                var popupSubmit = e.target.closest('.wwz-blizz-thumbs-popup-submit');
                if (popupSubmit) {
                    var popup = popupSubmit.closest('.wwz-blizz-thumbs-popup');
                    var msgId = popup.getAttribute('data-message-id');
                    var textarea = popup.querySelector('.wwz-blizz-thumbs-popup-textarea');
                    var comment = textarea ? textarea.value.trim() : '';
                    self.submitThumbsDownFeedback(msgId, comment);
                    return;
                }

                // Comment button handler
                var commentBtn = e.target.closest('.wwz-blizz-comment-btn');
                if (commentBtn) {
                    var messageId = commentBtn.getAttribute('data-message-id');
                    EBB.UI.showCommentPopup(messageId, commentBtn);
                    return;
                }

                // Comment popup close button
                var commentPopupClose = e.target.closest('.wwz-blizz-comment-popup-close');
                if (commentPopupClose) {
                    EBB.UI.hideCommentPopup();
                    return;
                }

                // Comment popup cancel button
                var commentPopupCancel = e.target.closest('.wwz-blizz-comment-popup-cancel');
                if (commentPopupCancel) {
                    EBB.UI.hideCommentPopup();
                    return;
                }

                // Comment popup submit button
                var commentPopupSubmit = e.target.closest('.wwz-blizz-comment-popup-submit');
                if (commentPopupSubmit) {
                    var popup = commentPopupSubmit.closest('.wwz-blizz-comment-popup');
                    var msgId = popup.getAttribute('data-message-id');
                    var textarea = popup.querySelector('.wwz-blizz-comment-popup-textarea');
                    var comment = textarea ? textarea.value.trim() : '';
                    self.submitComment(msgId, comment);
                    return;
                }

                // YouTube video play handler
                var videoLink = e.target.closest('.enterprisebot-blizz-video-link');
                if (videoLink && !videoLink.classList.contains('playing')) {
                    var videoId = videoLink.getAttribute('data-video-id');
                    if (videoId) {
                        self.playYoutubeVideo(videoLink, videoId);
                        return;
                    }
                }
            });

            // Close thumbs popup when clicking outside
            document.addEventListener('click', function(e) {
                var popup = document.querySelector('.wwz-blizz-thumbs-popup');
                if (popup && !popup.contains(e.target) && !e.target.closest('.wwz-blizz-thumbs-down-btn')) {
                    EBB.UI.hideThumbsDownPopup();
                }
            });

            // Close comment popup when clicking outside
            document.addEventListener('click', function(e) {
                var popup = document.querySelector('.wwz-blizz-comment-popup');
                if (popup && !popup.contains(e.target) && !e.target.closest('.wwz-blizz-comment-btn')) {
                    EBB.UI.hideCommentPopup();
                }
            });

            // Contact form - Close button
            var contactFormClose = document.getElementById('wwz-blizz-contact-form-close');
            if (contactFormClose) {
                contactFormClose.addEventListener('click', function() {
                    self.handleContactFormClose();
                });
            }

            // Contact form - Submit
            var contactFormBody = document.getElementById('wwz-blizz-contact-form-body');
            if (contactFormBody) {
                contactFormBody.addEventListener('submit', function(e) {
                    e.preventDefault();
                    self.handleContactFormSubmit();
                });
            }

            // Contact form success - Close button
            var contactSuccessClose = document.getElementById('wwz-blizz-contact-success-close');
            if (contactSuccessClose) {
                contactSuccessClose.addEventListener('click', function() {
                    self.handleContactSuccessClose();
                });
            }

            // Privacy modal - Open button
            var privacyBtn = document.getElementById('wwz-blizz-privacy-btn');
            if (privacyBtn) {
                privacyBtn.addEventListener('click', function() {
                    self.showPrivacyModal();
                });
            }

            // Privacy modal - Close button
            var privacyClose = document.getElementById('wwz-blizz-privacy-close');
            if (privacyClose) {
                privacyClose.addEventListener('click', function() {
                    self.hidePrivacyModal();
                });
            }

            // End chat & feedback button
            var endChatBtn = document.getElementById('wwz-blizz-end-chat-btn');
            if (endChatBtn) {
                endChatBtn.addEventListener('click', function() {
                    self.handleEndChatAndFeedback();
                });
            }

            // Thank you close button
            var thankyouCloseBtn = document.getElementById('wwz-blizz-thankyou-close');
            if (thankyouCloseBtn) {
                thankyouCloseBtn.addEventListener('click', function() {
                    self.handleThankYouClose();
                });
            }

            // Scroll to bottom button (ChatGPT-style)
            var scrollToBottomBtn = document.getElementById('wwz-blizz-scroll-to-bottom');
            if (scrollToBottomBtn) {
                scrollToBottomBtn.addEventListener('click', function() {
                    EBB.UI.scrollToBottom(true); // true = smooth scroll
                });
            }

            // Listen for category selection from host page
            document.addEventListener('wwzBlizzCategorySelected', function(e) {
                if (e.detail && e.detail.category) {
                    EBB.StateManager.setSelectedCategory(e.detail.category);
                    EBB.UI.showCategoryLabel(e.detail.category);
                }
            });

            // Expose public API for setting category
            EBB.setCategory = function(categoryName) {
                EBB.StateManager.setSelectedCategory(categoryName);
                EBB.UI.showCategoryLabel(categoryName);
            };

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
            var CONFIG = EBB.CONFIG;
            var UI = EBB.UI;
            var StateManager = EBB.StateManager;

            // Blur input to prevent focus issues on mobile
            if (document.activeElement) {
                document.activeElement.blur();
            }

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

            UI.showChatScreen();
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
            var CONFIG = EBB.CONFIG;
            var UI = EBB.UI;
            var StateManager = EBB.StateManager;

            console.log('[WWZBlizz] handleSuggestionClick called with:', text);

            // Blur input to prevent focus issues on mobile
            if (document.activeElement) {
                document.activeElement.blur();
            }

            if (StateManager.isLoading()) {
                console.log('[WWZBlizz] Skipping - already loading');
                return;
            }

            console.log('[WWZBlizz] Sending message to API');
            
            // Ensure we switch to chat screen (Essential for Welcome Mode clicks)
            if (EBB.UI.showChatScreen) {
                EBB.UI.showChatScreen();
            }

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
                // Mark that we have an answer in the conversation
                StateManager.setHasAnswerInConversation(true);

                UI.renderSuggestions(CONFIG.greetings.suggestions);
            }, 600);
        },

        /**
         * Handle YouTube request with video widget
         */
        handleYoutubeRequest: function(text) {
            var CONFIG = EBB.CONFIG;
            var UI = EBB.UI;
            var StateManager = EBB.StateManager;

            console.log('[EnterpriseBotBlizz] YouTube request detected:', text);

            StateManager.setLoading(true);
            UI.showTypingIndicator();

            setTimeout(function() {
                UI.hideTypingIndicator();
                StateManager.setLoading(false);

                var videoHtml = UI.createVideoWidget(CONFIG.dummyYoutubeVideo);
                var botMessage = StateManager.addMessage(videoHtml, false, { isHtml: true });
                UI.renderMessage(botMessage);
                // Mark that we have an answer in the conversation
                StateManager.setHasAnswerInConversation(true);

                UI.renderSuggestions(CONFIG.defaultSuggestions);
            }, 800);
        },

        /**
         * Simple fuzzy match score between query and target string
         * Returns score 0-1, higher is better match
         */
        fuzzyMatchScore: function(query, target) {
            // Normalize both strings
            query = query.toLowerCase().trim();
            target = target.toLowerCase().trim();

            // Exact substring match
            if (target.indexOf(query) !== -1) return 1.0;

            // Word-based matching
            var queryWords = query.split(/\s+/);
            var targetWords = target.split(/\s+/);
            var matchedWords = 0;

            queryWords.forEach(function(qWord) {
                if (qWord.length < 3) return; // Skip short words
                targetWords.forEach(function(tWord) {
                    if (tWord.indexOf(qWord) !== -1 || qWord.indexOf(tWord) !== -1) {
                        matchedWords++;
                    }
                });
            });

            return matchedWords / Math.max(queryWords.length, 1);
        },

        /**
         * Find best matching video from library
         * Returns video object or null if no good match
         */
        findMatchingVideo: function(text) {
            var CONFIG = EBB.CONFIG;
            var self = this;

            if (!CONFIG.videoLibrary || CONFIG.videoLibrary.length === 0) {
                return null;
            }

            // Remove "video" keyword from search text
            var searchText = text.toLowerCase()
                .replace(/video/gi, '')
                .trim();

            if (searchText.length < 3) return null;

            var bestMatch = null;
            var bestScore = 0.3; // Minimum threshold

            CONFIG.videoLibrary.forEach(function(video) {
                var score = self.fuzzyMatchScore(searchText, video.title);
                if (score > bestScore) {
                    bestScore = score;
                    bestMatch = video;
                }
            });

            console.log('[WWZBlizz] Video search:', searchText, '-> Best match:', bestMatch ? bestMatch.title : 'none', '(score:', bestScore + ')');
            return bestMatch;
        },

        /**
         * Handle matched video from library
         */
        handleVideoMatch: function(text, video) {
            var UI = EBB.UI;
            var StateManager = EBB.StateManager;

            console.log('[WWZBlizz] Video match found:', video.title);

            StateManager.setLoading(true);
            UI.showTypingIndicator();

            setTimeout(function() {
                UI.hideTypingIndicator();
                StateManager.setLoading(false);

                // Extract video ID from embed URL
                var videoId = video.url.split('/').pop();
                var videoData = {
                    url: 'https://www.youtube.com/watch?v=' + videoId,
                    thumbnail: 'https://img.youtube.com/vi/' + videoId + '/maxresdefault.jpg',
                    title: video.title
                };

                var videoHtml = UI.createVideoWidget(videoData);
                var botMessage = StateManager.addMessage(videoHtml, false, { isHtml: true });
                UI.renderMessage(botMessage);
                // Mark that we have an answer in the conversation
                StateManager.setHasAnswerInConversation(true);

                UI.renderSuggestions(EBB.CONFIG.defaultSuggestions);
            }, 800);
        },

        /**
         * Handle shop request with map widget
         */
        handleShopRequest: function(text, shop) {
            var CONFIG = EBB.CONFIG;
            var UI = EBB.UI;
            var StateManager = EBB.StateManager;

            console.log('[EnterpriseBotBlizz] Shop request detected:', shop.name);

            StateManager.setLoading(true);
            UI.showTypingIndicator();

            setTimeout(function() {
                UI.hideTypingIndicator();
                StateManager.setLoading(false);

                // First add a text response
                var textResponse = 'Hier finden Sie Informationen zum ' + shop.name + ':';
                var textMessage = StateManager.addMessage(textResponse, false);
                UI.renderMessage(textMessage);
                // Mark that we have an answer in the conversation
                StateManager.setHasAnswerInConversation(true);

                // Then add the map widget
                setTimeout(function() {
                    var mapHtml = UI.createMapWidget(shop);
                    var mapMessage = StateManager.addMessage(mapHtml, false, { isHtml: true });
                    UI.renderMessage(mapMessage);

                    UI.renderSuggestions(CONFIG.defaultSuggestions);
                }, 300);
            }, 800);
        },

        /**
         * Convert shop data from JSON format to widget format
         */
        convertShopForWidget: function(shop) {
            var address = shop.address;
            // Format address as 2 lines: street on line 1, PLZ + city on line 2
            var fullAddress = address.street + '<br>' + address.plz + ' ' + address.city;

            // Convert per-day hours to array format for createMapWidget
            var hours = [];
            var daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
            var dayLabels = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

            daysOfWeek.forEach(function(day, index) {
                var time = shop.hours[day] || 'Closed';
                if (time.toLowerCase() === 'closed') {
                    time = 'Geschlossen';
                } else {
                    // Format time with spaces around dash: "09:00-19:00" -> "09:00 - 19:00"
                    time = time.replace(/-/g, ' - ').replace(/,\s*/g, ', ');
                }
                hours.push({
                    days: dayLabels[index],
                    time: time
                });
            });

            return {
                name: shop.name,
                address: fullAddress,
                phone: shop.contact.phone,
                email: shop.contact.email,
                query: shop.googleMapsQuery,
                hours: hours
            };
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

            // Note: Greeting interceptor removed - all messages go to API
            // This ensures questions like "hello I have doubt about X" are processed properly

            // Check for video keyword - attempt fuzzy match from library
            if (text.toLowerCase().indexOf('video') !== -1) {
                var matchedVideo = self.findMatchingVideo(text);
                if (matchedVideo) {
                    self.handleVideoMatch(text, matchedVideo);
                    return;
                }
                // If no match found, continue to API
            }

            // Check for YouTube keyword - show dummy video widget
            if (text.toLowerCase().indexOf('youtube') !== -1) {
                self.handleYoutubeRequest(text);
                return;
            }

            // Note: Shop detection removed - all messages go to /chat API
            // Shop cards are displayed when API returns shopList in response

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

                    // Check if this is a contact form response
                    if (response.type === 'contactForm') {
                        UI.addContactFormMessage(response);
                        // Setup form event listeners after rendering
                        setTimeout(function() {
                            self.setupContactFormListeners();
                        }, 100);
                        return;
                    }

                    var isHtml = response.isHtml || false;

                    // Get search results from API response
                    var searchResults = response.searchResults || [];

                    // Create search results HTML to append to bot message
                    var searchHtml = (searchResults && searchResults.length > 0)
                        ? UI.createSearchResultsWidget(searchResults)
                        : '';

                    // Create Google Maps widget HTML if mapsLink is present
                    var mapsHtml = response.mapsLink
                        ? UI.createMapsLinkWidget(response.mapsLink)
                        : '';

                    if (response.replies && response.replies.length > 0) {
                        response.replies.forEach(function(reply, index) {
                            setTimeout(function() {
                                var replyContent = reply;
                                var replyIsHtml = isHtml;
                                // Append maps widget and search results to the last reply
                                // Order: Text -> Maps Widget -> Search Results
                                if (index === response.replies.length - 1) {
                                    if (mapsHtml) {
                                        replyContent = reply + mapsHtml;
                                        replyIsHtml = true; // Force HTML mode since we're adding HTML
                                    }
                                    if (searchHtml) {
                                        replyContent = replyContent + searchHtml;
                                        replyIsHtml = true; // Force HTML mode since we're adding HTML
                                    }
                                }
                                var botMessage = StateManager.addMessage(replyContent, false, { isHtml: replyIsHtml });
                                UI.renderMessage(botMessage);
                                // Mark that we have an answer in the conversation
                                StateManager.setHasAnswerInConversation(true);
                            }, index * 300);
                        });
                    } else if (response.message) {
                        var messageContent = response.message;
                        var messageIsHtml = isHtml;
                        // Append maps widget and search results to the message
                        // Order: Text -> Maps Widget -> Search Results
                        if (mapsHtml) {
                            messageContent = response.message + mapsHtml;
                            messageIsHtml = true; // Force HTML mode since we're adding HTML
                        }
                        if (searchHtml) {
                            messageContent = messageContent + searchHtml;
                            messageIsHtml = true; // Force HTML mode since we're adding HTML
                        }
                        var botMessage = StateManager.addMessage(messageContent, false, { isHtml: messageIsHtml });
                        UI.renderMessage(botMessage);
                        // Mark that we have an answer in the conversation
                        StateManager.setHasAnswerInConversation(true);
                    } else {
                        var defaultContent = 'Entschuldigung, ich konnte keine passende Antwort finden.';
                        // Append maps widget and search results to the default reply
                        // Order: Text -> Maps Widget -> Search Results
                        if (mapsHtml) {
                            defaultContent = defaultContent + mapsHtml;
                        }
                        if (searchHtml) {
                            defaultContent = defaultContent + searchHtml;
                        }
                        var defaultReply = StateManager.addMessage(defaultContent, false, { isHtml: !!(searchHtml || mapsHtml) });
                        UI.renderMessage(defaultReply);
                        // Mark that we have an answer in the conversation
                        StateManager.setHasAnswerInConversation(true);
                    }

                    // Calculate base delay after text replies
                    // Search results are now part of the message, so no extra delay needed
                    var baseDelay = (response.replies ? response.replies.length : 1) * 300 + 200;

                    // Handle shopList - render location cards for matched shops
                    if (response.shopList && response.shopList.length > 0) {
                        var shopDelay = baseDelay;
                        var shouldAutoScroll = response.shopList.length === 1 && response.mapsLink;

                        response.shopList.forEach(function(shopId, shopIndex) {
                            setTimeout(function() {
                                // Normalize shopId to lowercase for lookup
                                var normalizedId = shopId.toLowerCase();
                                var shop = CONFIG.wwzShops[normalizedId];
                                if (shop) {
                                    // Convert shop data to format expected by createMapWidget
                                    var shopData = self.convertShopForWidget(shop);
                                    var mapHtml = UI.createMapWidget(shopData);
                                    var mapMessage = StateManager.addMessage(mapHtml, false, { isHtml: true });
                                    UI.renderMessage(mapMessage);
                                    // Mark that we have an answer in the conversation
                                    StateManager.setHasAnswerInConversation(true);

                                    // Auto-scroll to shop card when single shop + mapsLink
                                    if (shouldAutoScroll) {
                                        setTimeout(function() {
                                            var messagesContainer = document.querySelector('.wwz-blizz-messages');
                                            if (messagesContainer) {
                                                // Scroll to show the shop card (scroll to bottom)
                                                messagesContainer.scrollTop = messagesContainer.scrollHeight;
                                            }
                                        }, 100); // Small delay to ensure DOM is updated
                                    }
                                } else {
                                    console.warn('[WWZBlizz] Shop not found:', shopId, '(normalized:', normalizedId + ')');
                                }
                            }, shopDelay + (shopIndex * 400));
                        });
                    }

                    // Handle showAllShops - render aggregated map view with all shop pins
                    if (response.showAllShops && CONFIG.wwzShopsMapPins && CONFIG.wwzShopsMapPins.length > 0) {
                        var mapDelay = baseDelay;
                        // Add extra delay if individual shop cards are being rendered
                        if (response.shopList && response.shopList.length > 0) {
                            mapDelay += response.shopList.length * 400 + 200;
                        }
                        setTimeout(function() {
                            var aggregatedMapHtml = UI.createAggregatedMapView(CONFIG.wwzShopsMapPins);
                            if (aggregatedMapHtml) {
                                var mapMessage = StateManager.addMessage(aggregatedMapHtml, false, { isHtml: true });
                                UI.renderMessage(mapMessage);
                                // Mark that we have an answer in the conversation
                                StateManager.setHasAnswerInConversation(true);
                            }
                        }, mapDelay);
                    }

                    // Handle youtubeLinks - render video widgets for each YouTube link
                    if (response.youtubeLinks && response.youtubeLinks.length > 0) {
                        var youtubeDelay = baseDelay;
                        // Add extra delay if shop cards are being rendered
                        if (response.shopList && response.shopList.length > 0) {
                            youtubeDelay += response.shopList.length * 400 + 200;
                        }

                        response.youtubeLinks.forEach(function(videoItem, videoIndex) {
                            setTimeout(function() {
                                var videoData = {
                                    url: videoItem.url,
                                    title: videoItem.title || 'YouTube Video'
                                };

                                var videoHtml = UI.createVideoWidget(videoData);
                                var videoMessage = StateManager.addMessage(videoHtml, false, { isHtml: true });
                                UI.renderMessage(videoMessage);
                                StateManager.setHasAnswerInConversation(true);
                            }, youtubeDelay + (videoIndex * 400));
                        });
                    }

                    if (response.suggestions && response.suggestions.length > 0) {
                        var suggestDelay = baseDelay - 100;
                        // Add extra delay if shop cards are being rendered
                        if (response.shopList && response.shopList.length > 0) {
                            suggestDelay += response.shopList.length * 400 + 200;
                        }
                        // Add extra delay if aggregated map is being rendered
                        if (response.showAllShops && CONFIG.wwzShopsMapPins && CONFIG.wwzShopsMapPins.length > 0) {
                            suggestDelay += 500;
                        }
                        // Add extra delay if YouTube videos are being rendered
                        if (response.youtubeLinks && response.youtubeLinks.length > 0) {
                            suggestDelay += response.youtubeLinks.length * 400 + 200;
                        }
                        setTimeout(function() {
                            UI.renderSuggestions(response.suggestions);
                        }, suggestDelay);
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
            var UI = EBB.UI;
            var StateManager = EBB.StateManager;
            var APIService = EBB.APIService;
            var CONFIG = EBB.CONFIG;

            StateManager.setError(error);

            var errorText;
            var statusText;
            var errorType;

            // Check for timeout error
            if (error && error.message === 'TIMEOUT') {
                errorText = 'Die Anfrage hat zu lange gedauert. Bitte versuchen Sie es erneut.';
                statusText = 'Zeitüberschreitung';
                errorType = 'timeout';
            } else if (error && error.message && error.message.indexOf('API Error: 404') !== -1) {
                // 404 means the backend couldn't find an answer
                errorText = 'Entschuldigung, ich konnte keine passende Antwort auf Ihre Frage finden. Bitte formulieren Sie Ihre Frage anders oder wählen Sie eine der Optionen unten.';
                statusText = 'Keine Antwort gefunden';
                errorType = 'no_answer';
                // Show default suggestions to help user
                setTimeout(function() {
                    UI.renderSuggestions(CONFIG.suggestions);
                }, 100);
            } else if (error && error.message && error.message.indexOf('API Error') !== -1) {
                errorText = 'Der Server ist momentan nicht erreichbar. Bitte versuchen Sie es später erneut.';
                statusText = 'Server nicht erreichbar';
                errorType = 'server_error';
            } else {
                errorText = 'Es tut mir leid, es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.';
                statusText = 'Verbindung fehlgeschlagen';
                errorType = 'unknown';
            }

            // Log the error to server
            APIService.logError(error, {
                errorType: errorType,
                statusText: statusText,
                lastUserMessage: StateManager.getLastUserMessageText()
            });

            var errorMessage = StateManager.addMessage(errorText, false);
            UI.renderMessage(errorMessage);
            UI.showError(statusText);
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
            var self = this;
            var isEndChat = EBB.StateManager.isEndChatFeedback();

            EBB.UI.updateView('thankYou');

            // If from end chat button, return to welcome screen after delay
            if (isEndChat) {
                setTimeout(function() {
                    EBB.UI.updateView('chat');
                    EBB.StateManager.reset();
                    EBB.UI.clearMessages();
                    EBB.UI.showWelcomeScreen();
                    EBB.UI.renderWelcomeSuggestions(EBB.CONFIG.defaultSuggestions);
                }, 2000);
            }
        },

        /**
         * Copy message
         */
        copyMessage: function(text) {
            EBB.UI.copyToClipboard(text);
        },

        /**
         * Setup contact form event listeners
         */
        setupContactFormListeners: function() {
            var self = this;
            var form = document.getElementById('wwz-blizz-contact-form-element');
            if (form) {
                form.addEventListener('submit', function(e) {
                    self.handleContactFormSubmit(e);
                });
            }
        },

        /**
         * Handle contact form submission
         */
        handleContactFormSubmit: function(e) {
            e.preventDefault();
            var self = this;
            var UI = EBB.UI;
            var APIService = EBB.APIService;
            var StateManager = EBB.StateManager;

            var form = e.target;
            var formData = new FormData(form);
            var data = {};
            formData.forEach(function(value, key) {
                data[key] = value;
            });

            // Validate all fields
            var isValid = true;
            var inputs = form.querySelectorAll('.wwz-blizz-form-input');
            for (var i = 0; i < inputs.length; i++) {
                var input = inputs[i];
                var errorSpan = input.nextElementSibling;

                // Required field validation
                if (input.required && !input.value.trim()) {
                    isValid = false;
                    input.classList.add('wwz-blizz-invalid');
                    if (errorSpan) {
                        errorSpan.textContent = input.dataset.error || 'Dieses Feld ist erforderlich';
                    }
                    continue;
                }

                // Custom validation for callback datetime
                if (input.id === 'blizzCallbackDatetimeStart' && input.value) {
                    var selectedDate = new Date(input.value);
                    var now = new Date();
                    var minDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
                    var hours = selectedDate.getHours();
                    var dayOfWeek = selectedDate.getDay(); // 0 = Sunday, 6 = Saturday

                    var errorMessage = '';

                    // Check if at least 24 hours in the future
                    if (selectedDate < minDate) {
                        errorMessage = 'Der Termin muss mindestens 24 Stunden in der Zukunft liegen';
                    }
                    // Check if weekend
                    else if (dayOfWeek === 0 || dayOfWeek === 6) {
                        errorMessage = 'Termine sind nur an Werktagen moglich';
                    }
                    // Check if time is between 07:00 and 17:00
                    else if (hours < 7 || hours >= 17) {
                        errorMessage = 'Termine sind nur zwischen 07:00 und 17:00 Uhr moglich';
                    }

                    if (errorMessage) {
                        isValid = false;
                        input.classList.add('wwz-blizz-invalid');
                        if (errorSpan) {
                            errorSpan.textContent = errorMessage;
                        }
                        continue;
                    }
                }

                // Clear error if valid
                input.classList.remove('wwz-blizz-invalid');
                if (errorSpan) {
                    errorSpan.textContent = '';
                }
            }

            if (!isValid) return;

            // Disable form while submitting
            var submitBtn = form.querySelector('.wwz-blizz-form-submit');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Wird gesendet...';
            }

            // Submit form data to API
            APIService.submitContactForm(data)
                .then(function(result) {
                    if (result.success) {
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
                        var errorMessage = StateManager.addMessage(
                            'Es tut mir leid, das Formular konnte nicht gesendet werden. Bitte versuchen Sie es erneut.',
                            false
                        );
                        UI.renderMessage(errorMessage);
                    }
                })
                .catch(function(error) {
                    console.error('[WWZBlizz] Contact form submission error', error);
                    // Re-enable submit button on error
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = 'Absenden';
                    }
                    // Show error message
                    var errorMessage = StateManager.addMessage(
                        'Es tut mir leid, das Formular konnte nicht gesendet werden. Bitte versuchen Sie es erneut.',
                        false
                    );
                    UI.renderMessage(errorMessage);
                });
        },

        /**
         * Handle contact form close
         */
        handleContactFormClose: function() {
            EBB.UI.hideContactForm();
        },

        /**
         * Handle contact success close
         */
        handleContactSuccessClose: function() {
            var source = EBB.StateManager.getContactFormSource();
            EBB.UI.updateView('chat'); // Hides overlay
            if (source === 'welcome') {
                EBB.UI.showWelcomeScreen();
            }
            EBB.UI.resetContactForm();
        },

        /**
         * Show privacy modal
         */
        showPrivacyModal: function() {
            EBB.UI.showPrivacyModal();
        },

        /**
         * Hide privacy modal
         */
        hidePrivacyModal: function() {
            EBB.UI.hidePrivacyModal();
        },

        /**
         * Toggle privacy modal
         */
        togglePrivacyModal: function() {
            EBB.UI.togglePrivacyModal();
        },

        /**
         * Handle end chat and feedback button
         */
        handleEndChatAndFeedback: function() {
            console.log('[EnterpriseBotBlizz] End chat and feedback clicked');
            EBB.StateManager.setEndChatFeedback(true);
            EBB.UI.updateView('feedback');
        },

        /**
         * Handle feedback trigger button
         */
        handleFeedbackTrigger: function() {
            console.log('[WWZBlizz] Opening feedback screen');
            EBB.UI.showFeedbackScreen();
        },

        /**
         * Handle rating selection
         */
        handleRatingSelect: function(rating) {
            var UI = EBB.UI;
            var StateManager = EBB.StateManager;

            console.log('[WWZBlizz] Rating selected:', rating);

            StateManager.setFeedbackRating(rating);
            UI.selectRating(rating);
        },

        /**
         * Toggle feedback text panel
         */
        toggleFeedbackText: function() {
            EBB.UI.toggleFeedbackTextPanel();
        },

        /**
         * Submit new feedback
         */
        submitNewFeedback: function() {
            var StateManager = EBB.StateManager;
            var APIService = EBB.APIService;
            var UI = EBB.UI;

            var rating = StateManager.getFeedbackRating();

            if (!rating) {
                console.log('[WWZBlizz] No rating selected');
                return;
            }

            // Collect selected options
            var selectedOptions = [];
            var feedbackOptions = document.getElementById('wwz-blizz-feedback-options');
            if (feedbackOptions) {
                var selected = feedbackOptions.querySelectorAll('.wwz-blizz-feedback-option.wwz-blizz-selected');
                selected.forEach(function(btn) {
                    selectedOptions.push(btn.dataset.option);
                });
            }

            // Get additional text
            var feedbackTextarea = document.getElementById('wwz-blizz-feedback-text');
            var additionalText = feedbackTextarea ? feedbackTextarea.value.trim() : '';

            // Build feedback data object
            var feedbackData = {
                rating: rating,
                options: selectedOptions,
                additionalFeedback: additionalText
            };

            console.log('[WWZBlizz] Submitting feedback:', feedbackData);

            // Submit to API
            APIService.submitFeedback(feedbackData)
                .then(function() {
                    UI.showThankYou();
                    setTimeout(function() {
                        // Clean up session and return to welcome screen
                        UI.updateView('chat');
                        StateManager.reset();
                        UI.clearMessages();
                        UI.showWelcomeScreen();
                        UI.renderWelcomeSuggestions(EBB.CONFIG.defaultSuggestions);
                        UI.resetFeedbackForm();
                    }, 2000);
                })
                .catch(function(error) {
                    console.error('[WWZBlizz] Feedback submission failed:', error);
                    UI.showThankYou();
                    setTimeout(function() {
                        // Clean up session and return to welcome screen
                        UI.updateView('chat');
                        StateManager.reset();
                        UI.clearMessages();
                        UI.showWelcomeScreen();
                        UI.renderWelcomeSuggestions(EBB.CONFIG.defaultSuggestions);
                        UI.resetFeedbackForm();
                    }, 2000);
                });
        },

        /**
         * Skip new feedback
         */
        skipNewFeedback: function() {
            console.log('[WWZBlizz] skipNewFeedback called - starting reset');

            // Switch from feedback view to chat view
            console.log('[WWZBlizz] Calling updateView("chat")');
            EBB.UI.updateView('chat');

            // Reset state (clear messages, session, etc.)
            console.log('[WWZBlizz] Resetting state');
            EBB.StateManager.reset();

            // Clear messages from UI
            console.log('[WWZBlizz] Clearing messages');
            EBB.UI.clearMessages();

            // Show fresh welcome screen
            console.log('[WWZBlizz] Showing welcome screen');
            EBB.UI.showWelcomeScreen();

            // Render default suggestions
            console.log('[WWZBlizz] Rendering welcome suggestions');
            EBB.UI.renderWelcomeSuggestions(EBB.CONFIG.defaultSuggestions);

            // Reset feedback form
            console.log('[WWZBlizz] Resetting feedback form');
            EBB.UI.resetFeedbackForm();

            console.log('[WWZBlizz] skipNewFeedback completed');
        },

        /**
         * Download transcript
         */
        downloadTranscript: function() {
            console.log('[WWZBlizz] Downloading transcript');
            EBB.UI.downloadTranscript();
        },

        /**
         * Close feedback screen
         */
        closeFeedbackScreen: function() {
            console.log('[WWZBlizz] Closing feedback screen');
            EBB.UI.hideFeedbackScreen();
            EBB.UI.resetFeedbackForm();
        },

        /**
         * Handle thank you close button
         */
        handleThankYouClose: function() {
            console.log('[WWZBlizz] Closing thank you screen');
            EBB.UI.updateView('chat');
            EBB.StateManager.reset();
            EBB.UI.clearMessages();
            EBB.UI.showWelcomeScreen();
            EBB.UI.renderWelcomeSuggestions(EBB.CONFIG.defaultSuggestions);
        },

        /**
         * Handle thumbs up click
         */
        handleThumbsUp: function(messageId) {
            var StateManager = EBB.StateManager;
            var UI = EBB.UI;
            var APIService = EBB.APIService;

            // Check if already gave feedback
            if (StateManager.hasMessageFeedback(messageId)) {
                console.log('[WWZBlizz] Feedback already given for message:', messageId);
                return;
            }

            console.log('[WWZBlizz] Thumbs up for message:', messageId);

            // Update UI immediately
            UI.updateThumbsState(messageId, 'positive');

            // Store feedback in state
            StateManager.setMessageFeedback(messageId, 'positive', '');

            // Submit to API
            APIService.submitMessageFeedback(messageId, 'positive', '')
                .then(function(success) {
                    if (success) {
                        console.log('[WWZBlizz] Message feedback submitted successfully');
                    }
                })
                .catch(function(error) {
                    console.error('[WWZBlizz] Failed to submit feedback:', error);
                });
        },

        /**
         * Handle thumbs down click
         */
        handleThumbsDown: function(messageId, buttonElement) {
            var StateManager = EBB.StateManager;
            var UI = EBB.UI;

            // Check if already gave feedback
            if (StateManager.hasMessageFeedback(messageId)) {
                console.log('[WWZBlizz] Feedback already given for message:', messageId);
                return;
            }

            console.log('[WWZBlizz] Thumbs down for message:', messageId);

            // Show popup for additional feedback
            UI.showThumbsDownPopup(messageId, buttonElement);
        },

        /**
         * Submit thumbs down feedback
         */
        submitThumbsDownFeedback: function(messageId, comment) {
            var StateManager = EBB.StateManager;
            var UI = EBB.UI;
            var APIService = EBB.APIService;

            // Hide popup
            UI.hideThumbsDownPopup();

            // Update UI
            UI.updateThumbsState(messageId, 'negative');

            // Store feedback in state
            StateManager.setMessageFeedback(messageId, 'negative', comment);

            // Submit to API
            APIService.submitMessageFeedback(messageId, 'negative', comment)
                .then(function(success) {
                    if (success) {
                        console.log('[WWZBlizz] Message feedback submitted successfully');
                    }
                })
                .catch(function(error) {
                    console.error('[WWZBlizz] Failed to submit feedback:', error);
                });
        },

        /**
         * Submit standalone comment (without thumbs feedback)
         */
        submitComment: function(messageId, comment) {
            var UI = EBB.UI;
            var APIService = EBB.APIService;

            // Hide popup
            UI.hideCommentPopup();

            if (!comment) {
                console.log('[WWZBlizz] Empty comment, skipping submission');
                return;
            }

            console.log('[WWZBlizz] Submitting comment for message:', messageId);

            // Submit to API with thumb: null for standalone comment
            APIService.submitMessageFeedback(messageId, null, comment)
                .then(function(success) {
                    if (success) {
                        console.log('[WWZBlizz] Comment submitted successfully');
                        UI.showNotification('Kommentar gesendet', 'success');
                    }
                })
                .catch(function(error) {
                    console.error('[WWZBlizz] Failed to submit comment:', error);
                    UI.showNotification('Fehler beim Senden', 'error');
                });
        },

        /**
         * Play YouTube video inline
         */
        playYoutubeVideo: function(container, videoId) {
            var embedUrl = 'https://www.youtube.com/embed/' + videoId + '?autoplay=1';
            var iframe = '<iframe class="enterprisebot-blizz-video-iframe" ' +
                'src="' + embedUrl + '" ' +
                'frameborder="0" ' +
                'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" ' +
                'allowfullscreen></iframe>';

            container.innerHTML = iframe;
            container.classList.add('playing');
            console.log('[WWZBlizz] Playing YouTube video:', videoId);
        }
    };

    console.log('[WWZBlizz] Events loaded');
})();
