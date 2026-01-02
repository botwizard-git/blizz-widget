/**
 * WWZ Ivy Chatbot - Storage Service
 */
(function() {
    'use strict';

    window.WWZIvy = window.WWZIvy || {};

    const Config = window.WWZIvy.Config;

    /**
     * Generate UUID v4
     */
    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    window.WWZIvy.Storage = {
        /**
         * Get or create user ID
         */
        getUserId: function() {
            let userId = localStorage.getItem(Config.storageKeys.userId);
            if (!userId) {
                userId = generateUUID();
                localStorage.setItem(Config.storageKeys.userId, userId);
            }
            return userId;
        },

        /**
         * Get or create session ID
         */
        getSessionId: function() {
            let sessionId = localStorage.getItem(Config.storageKeys.sessionId);
            if (!sessionId) {
                sessionId = generateUUID();
                localStorage.setItem(Config.storageKeys.sessionId, sessionId);
            }
            return sessionId;
        },

        /**
         * Create new session ID
         */
        createNewSession: function() {
            const sessionId = generateUUID();
            localStorage.setItem(Config.storageKeys.sessionId, sessionId);
            this.clearMessages();
            return sessionId;
        },

        /**
         * Generate new message ID
         */
        generateMessageId: function() {
            return generateUUID();
        },

        /**
         * Save messages to storage
         */
        saveMessages: function(messages) {
            try {
                localStorage.setItem(Config.storageKeys.messages, JSON.stringify(messages));
            } catch (e) {
                console.warn('WWZIvy: Failed to save messages', e);
            }
        },

        /**
         * Load messages from storage
         */
        loadMessages: function() {
            try {
                const stored = localStorage.getItem(Config.storageKeys.messages);
                return stored ? JSON.parse(stored) : [];
            } catch (e) {
                console.warn('WWZIvy: Failed to load messages', e);
                return [];
            }
        },

        /**
         * Clear messages
         */
        clearMessages: function() {
            localStorage.removeItem(Config.storageKeys.messages);
        },

        /**
         * Get collapsed state
         */
        isCollapsed: function() {
            return localStorage.getItem(Config.storageKeys.collapsed) === 'true';
        },

        /**
         * Set collapsed state
         */
        setCollapsed: function(collapsed) {
            localStorage.setItem(Config.storageKeys.collapsed, collapsed ? 'true' : 'false');
        },

        /**
         * Check if terms are accepted
         */
        isTermsAccepted: function() {
            return localStorage.getItem(Config.storageKeys.termsAccepted) === 'true';
        },

        /**
         * Set terms accepted
         */
        setTermsAccepted: function(accepted) {
            localStorage.setItem(Config.storageKeys.termsAccepted, accepted ? 'true' : 'false');
        },

        /**
         * Clear all storage
         */
        clearAll: function() {
            Object.values(Config.storageKeys).forEach(key => {
                localStorage.removeItem(key);
            });
        }
    };
})();
