/**
 * WWZBlizz - Session Storage Service
 */
(function() {
    'use strict';

    var EBB = window.WWZBlizz;
    var STORAGE_KEYS = EBB.STORAGE_KEYS;
    var CONFIG = EBB.CONFIG;

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
                console.log('[WWZBlizz] Created new userId:', userId);
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
         * Store sessionId and record session start time if new session
         */
        setSessionId: function(sessionId) {
            if (sessionId) {
                var existingSessionId = this.getSessionId();
                localStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);

                // If this is a new session, record the start time
                if (!existingSessionId || existingSessionId !== sessionId) {
                    this.setSessionStartTime();
                }
            }
        },

        /**
         * Get session start time
         */
        getSessionStartTime: function() {
            var startTime = localStorage.getItem(STORAGE_KEYS.SESSION_START_TIME);
            return startTime ? parseInt(startTime, 10) : null;
        },

        /**
         * Set session start time to current time
         */
        setSessionStartTime: function() {
            localStorage.setItem(STORAGE_KEYS.SESSION_START_TIME, Date.now().toString());
            console.log('[WWZBlizz] Session start time recorded');
        },

        /**
         * Check if the current session has expired based on configurable timeout
         * Returns true if session is expired, false otherwise
         */
        isSessionExpired: function() {
            var sessionTimeout = CONFIG.sessionTimeout;

            // If timeout is 0, null, or undefined, session never expires (manual end only)
            if (!sessionTimeout) {
                return false;
            }

            var startTime = this.getSessionStartTime();

            // No start time recorded means no active session
            if (!startTime) {
                return false;
            }

            var elapsed = Date.now() - startTime;
            var isExpired = elapsed > sessionTimeout;

            if (isExpired) {
                console.log('[WWZBlizz] Session expired after', Math.round(elapsed / 1000 / 60), 'minutes');
            }

            return isExpired;
        },

        /**
         * Get remaining session time in milliseconds
         * Returns null if timeout is disabled, 0 if expired
         */
        getRemainingSessionTime: function() {
            var sessionTimeout = CONFIG.sessionTimeout;

            if (!sessionTimeout) {
                return null; // No timeout configured
            }

            var startTime = this.getSessionStartTime();
            if (!startTime) {
                return sessionTimeout; // Full time if no session started
            }

            var elapsed = Date.now() - startTime;
            var remaining = sessionTimeout - elapsed;
            return remaining > 0 ? remaining : 0;
        },

        /**
         * Save messages to localStorage
         */
        saveMessages: function(messages) {
            try {
                localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
            } catch (e) {
                console.error('[WWZBlizz] Failed to save messages:', e);
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
                console.error('[WWZBlizz] Failed to get messages:', e);
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
         * Save hasAnswer flag
         */
        saveHasAnswer: function(hasAnswer) {
            localStorage.setItem(STORAGE_KEYS.HAS_ANSWER, hasAnswer ? '1' : '0');
        },

        /**
         * Get hasAnswer flag
         */
        getHasAnswer: function() {
            return localStorage.getItem(STORAGE_KEYS.HAS_ANSWER) === '1';
        },

        /**
         * Clear current session
         */
        clearSession: function() {
            localStorage.removeItem(STORAGE_KEYS.SESSION_ID);
            localStorage.removeItem(STORAGE_KEYS.MESSAGES);
            localStorage.removeItem(STORAGE_KEYS.SESSION_METADATA);
            localStorage.removeItem(STORAGE_KEYS.SESSION_START_TIME);
            localStorage.removeItem(STORAGE_KEYS.HAS_ANSWER);
            console.log('[WWZBlizz] Session cleared');
        },

        /**
         * Check if there's an existing valid (non-expired) session
         */
        hasExistingSession: function() {
            var sessionId = this.getSessionId();
            var messages = this.getMessages();

            // No session if no sessionId or messages
            if (!sessionId || messages.length === 0) {
                return false;
            }

            // Check if session has expired
            if (this.isSessionExpired()) {
                console.log('[WWZBlizz] Existing session found but expired, clearing...');
                this.clearSession();
                return false;
            }

            return true;
        },

        /**
         * Start a new session - clears old data and sets new start time
         */
        startNewSession: function() {
            this.clearSession();
            var newSessionId = this.generateUUID();
            localStorage.setItem(STORAGE_KEYS.SESSION_ID, newSessionId);
            this.setSessionStartTime();
            console.log('[WWZBlizz] New session started:', newSessionId);
            return newSessionId;
        }
    };

    console.log('[WWZBlizz] SessionService loaded');
})();
