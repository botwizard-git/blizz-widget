/**
 * WWZBlizz - Main Entry Point
 */
(function() {
    'use strict';

    var EBB = window.WWZBlizz;

    EBB.Main = {
        /**
         * Initialize the chatbot widget
         */
        init: function() {
            var CONFIG = EBB.CONFIG;
            var UI = EBB.UI;
            var Events = EBB.Events;
            var StateManager = EBB.StateManager;
            var APIService = EBB.APIService;

            console.log('[WWZBlizz] Initializing widget...');

            // Clear category localStorage on page load
            localStorage.removeItem('enterprisebot-blizz-product-category');

            // Initialize session cookie immediately (async, doesn't block UI)
            APIService.initSession().then(function(success) {
                if (!success) {
                    console.warn('[WWZBlizz] Session init failed - API calls may fail');
                }
            });

            // Load shop locations (async, doesn't block UI)
            APIService.fetchShops().then(function(result) {
                CONFIG.wwzShops = result.shops;
                CONFIG.wwzShopsMapPins = result.mapPins;
                console.log('[WWZBlizz] Shops loaded:', Object.keys(result.shops).length, 'shops,', result.mapPins.length, 'map pins');
            });

            // Initialize UI element references
            UI.init();

            // Initialize event listeners
            Events.init();

            // Initialize state from localStorage
            StateManager.init();

            // Check collapsed state and restore session if exists
            // Set initial visibility
            if (StateManager.isCollapsed()) {
                UI.showCollapsed();
            } else {
                UI.showExpanded();
            }

            // Always initialize content (welcome or restored messages)
            // Always initialize content (welcome or restored messages)
            try {
                var messages = StateManager.getMessages();
                // Strict check: must be array and have length > 0
                if (Array.isArray(messages) && messages.length > 0) {
                    // Restore existing conversation
                    console.log('[WWZBlizz] Restored', messages.length, 'messages from previous session');
                    UI.showChatScreen();
                    UI.renderMessages(messages);
                    // No existing session, show welcome screen
                    console.log('[WWZBlizz] Main.init: No session, showing welcome screen');
                    // Force welcome mode explicitly
                    UI.clearMessages(); // Ensure clean slate
                    UI.showWelcomeScreen();
                    // Use CONFIG.suggestions directly for reliability
                    UI.renderWelcomeSuggestions(CONFIG.suggestions || CONFIG.defaultSuggestions);
                }
            } catch (e) {
                console.error('[WWZBlizz] Error in Main.init content loading:', e);
                // Fallback to welcome screen on error
                UI.showWelcomeScreen();
                UI.renderWelcomeSuggestions(CONFIG.suggestions || CONFIG.defaultSuggestions);
            }

            // Check for switchBot redirect question (via URL param from cross-origin redirect)
            var urlParams = new URLSearchParams(window.location.search);
            var redirectQuestion = urlParams.get('wwzBlizzRedirectQuestion');
            if (redirectQuestion) {
                // Clean up URL (remove query param without reload)
                var cleanUrl = new URL(window.location.href);
                cleanUrl.searchParams.delete('wwzBlizzRedirectQuestion');
                history.replaceState(null, '', cleanUrl.toString());

                console.log('[WWZBlizz] SwitchBot redirect question:', redirectQuestion);
                UI.showExpanded();
                StateManager.setCollapsed(false);
                setTimeout(function() {
                    UI.showChatScreen();
                    var userMessage = StateManager.addMessage(redirectQuestion, true);
                    UI.renderMessage(userMessage);
                    EBB.Events.sendMessageToAPI(redirectQuestion);
                }, 500);
            }

            console.log('[WWZBlizz] Initialization complete');
        },

        /**
         * Restore conversation from localStorage
         */
        restoreConversation: function() {
            var UI = EBB.UI;
            var StateManager = EBB.StateManager;

            var messages = StateManager.getMessages();
            console.log('[WWZBlizz] Restoring', messages.length, 'messages');

            UI.showChatScreen();
            UI.renderMessages(messages);
            UI.showNotification('Gesprach wiederhergestellt', 'info');
        },

        /**
         * Start a new chat session
         */
        startNewSession: function() {
            var CONFIG = EBB.CONFIG;
            var UI = EBB.UI;
            var StateManager = EBB.StateManager;

            console.log('[WWZBlizz] Starting new session...');

            StateManager.reset();
            UI.showWelcomeScreen();
            UI.renderWelcomeSuggestions(CONFIG.defaultSuggestions);

            console.log('[WWZBlizz] New session started');
        },

        /**
         * Collapse the widget programmatically
         */
        collapse: function() {
            EBB.Events.collapseWidget();
        },

        /**
         * Expand the widget programmatically
         */
        expand: function() {
            EBB.Events.expandWidget();
        },

        /**
         * Get version info
         */
        getVersionInfo: function() {
            return {
                name: 'WWZBlizz Widget',
                version: '1.0.0',
                bot: EBB.CONFIG.botName
            };
        }
    };

    console.log('[WWZBlizz] Main loaded');
})();
