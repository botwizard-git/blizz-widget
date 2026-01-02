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

            console.log('[WWZBlizz] Initializing widget...');

            // Initialize UI element references
            UI.init();

            // Initialize event listeners
            Events.init();

            // Initialize state from localStorage
            StateManager.init();

            // Check collapsed state
            if (StateManager.isCollapsed()) {
                UI.showCollapsed();
            } else {
                UI.showExpanded();
                UI.showWelcomeScreen();
            }

            // Render welcome suggestions
            UI.renderWelcomeSuggestions(CONFIG.defaultSuggestions);

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
