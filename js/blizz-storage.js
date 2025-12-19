/**
 * EnterpriseBotBlizz - Session Storage Service
 */
(function() {
    'use strict';

    var EBB = window.EnterpriseBotBlizz;
    var STORAGE_KEYS = EBB.STORAGE_KEYS;
    var CHAT_HISTORY_KEY = 'enterprisebot_blizz_history';

    EBB.SessionService = {
        /**
         * Generate a UUID v4
         */
        generateUUID: function() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random() * 16 | 0;
                var v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        },

        /**
         * Get or create userId
         */
        getUserId: function() {
            var userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
            if (!userId) {
                userId = this.generateUUID();
                localStorage.setItem(STORAGE_KEYS.USER_ID, userId);
                console.log('[EnterpriseBotBlizz] Created new userId:', userId);
            }
            return userId;
        },

        /**
         * Get sessionId from storage
         */
        getSessionId: function() {
            return localStorage.getItem(STORAGE_KEYS.SESSION_ID);
        },

        /**
         * Store sessionId
         */
        setSessionId: function(sessionId) {
            if (sessionId) {
                localStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
            }
        },

        /**
         * Save messages to localStorage
         */
        saveMessages: function(messages) {
            try {
                localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
            } catch (e) {
                console.error('[EnterpriseBotBlizz] Failed to save messages:', e);
            }
        },

        /**
         * Get messages from localStorage
         */
        getMessages: function() {
            try {
                var stored = localStorage.getItem(STORAGE_KEYS.MESSAGES);
                return stored ? JSON.parse(stored) : [];
            } catch (e) {
                console.error('[EnterpriseBotBlizz] Failed to get messages:', e);
                return [];
            }
        },

        /**
         * Save collapsed state
         */
        setCollapsed: function(collapsed) {
            localStorage.setItem(STORAGE_KEYS.COLLAPSED, collapsed ? '1' : '0');
        },

        /**
         * Get collapsed state
         */
        isCollapsed: function() {
            return localStorage.getItem(STORAGE_KEYS.COLLAPSED) === '1';
        },

        /**
         * Clear current session
         */
        clearSession: function() {
            localStorage.removeItem(STORAGE_KEYS.SESSION_ID);
            localStorage.removeItem(STORAGE_KEYS.MESSAGES);
            localStorage.removeItem(STORAGE_KEYS.SESSION_METADATA);
            console.log('[EnterpriseBotBlizz] Session cleared');
        },

        /**
         * Check if there's an existing session
         */
        hasExistingSession: function() {
            var sessionId = this.getSessionId();
            var messages = this.getMessages();
            return !!(sessionId && messages.length > 0);
        }
    };

    console.log('[EnterpriseBotBlizz] SessionService loaded');
})();
