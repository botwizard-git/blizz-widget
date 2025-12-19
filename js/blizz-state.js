/**
 * EnterpriseBotBlizz - State Management
 */
(function() {
    'use strict';

    var EBB = window.EnterpriseBotBlizz;
    var SessionService = EBB.SessionService;

    // Application state
    var state = {
        userId: null,
        sessionId: null,
        messages: [],
        isLoading: false,
        isCollapsed: false,
        currentView: 'chat',
        selectedRating: null,
        feedbackText: '',
        lastError: null,
        retryCount: 0,
        lastUserMessage: null
    };

    EBB.StateManager = {
        /**
         * Initialize state from localStorage
         */
        init: function() {
            state.userId = SessionService.getUserId();
            state.sessionId = SessionService.getSessionId();
            state.messages = SessionService.getMessages();
            state.isCollapsed = SessionService.isCollapsed();

            console.log('[EnterpriseBotBlizz] State initialized:', {
                userId: state.userId,
                sessionId: state.sessionId,
                messageCount: state.messages.length,
                isCollapsed: state.isCollapsed
            });
        },

        /**
         * Add a message to state and storage
         */
        addMessage: function(text, isUser, metadata) {
            metadata = metadata || {};

            var message = {
                id: SessionService.generateUUID(),
                text: text,
                isUser: isUser,
                timestamp: new Date().toISOString()
            };

            // Merge metadata
            for (var key in metadata) {
                if (metadata.hasOwnProperty(key)) {
                    message[key] = metadata[key];
                }
            }

            state.messages.push(message);
            SessionService.saveMessages(state.messages);

            return message;
        },

        /**
         * Get all messages
         */
        getMessages: function() {
            return state.messages;
        },

        /**
         * Set loading state
         */
        setLoading: function(isLoading) {
            state.isLoading = isLoading;
        },

        /**
         * Check if currently loading
         */
        isLoading: function() {
            return state.isLoading;
        },

        /**
         * Set collapsed state
         */
        setCollapsed: function(collapsed) {
            state.isCollapsed = collapsed;
            SessionService.setCollapsed(collapsed);
        },

        /**
         * Check if widget is collapsed
         */
        isCollapsed: function() {
            return state.isCollapsed;
        },

        /**
         * Set current view
         */
        setView: function(view) {
            state.currentView = view;
        },

        /**
         * Get current view
         */
        getView: function() {
            return state.currentView;
        },

        /**
         * Set feedback rating
         */
        setRating: function(rating) {
            state.selectedRating = rating;
        },

        /**
         * Get feedback rating
         */
        getRating: function() {
            return state.selectedRating;
        },

        /**
         * Clear error state
         */
        clearError: function() {
            state.lastError = null;
            state.retryCount = 0;
        },

        /**
         * Set error
         */
        setError: function(error) {
            state.lastError = error;
        },

        /**
         * Increment retry count
         */
        incrementRetry: function() {
            state.retryCount++;
            return state.retryCount;
        },

        /**
         * Reset retry count
         */
        resetRetryCount: function() {
            state.retryCount = 0;
        },

        /**
         * Store last user message for retry
         */
        setLastUserMessage: function(message) {
            state.lastUserMessage = message;
        },

        /**
         * Get last user message for retry
         */
        getLastUserMessageText: function() {
            return state.lastUserMessage;
        },

        /**
         * Update sessionId
         */
        setSessionId: function(sessionId) {
            state.sessionId = sessionId;
        },

        /**
         * Check if there's an existing session with messages
         */
        hasExistingSession: function() {
            return !!(state.sessionId && state.messages.length > 0);
        },

        /**
         * Reset state for new conversation
         */
        reset: function() {
            SessionService.clearSession();

            state.sessionId = null;
            state.messages = [];
            state.selectedRating = null;
            state.feedbackText = '';
            state.currentView = 'chat';
            state.lastError = null;
            state.retryCount = 0;
            state.lastUserMessage = null;

            console.log('[EnterpriseBotBlizz] State reset');
        }
    };

    console.log('[EnterpriseBotBlizz] StateManager loaded');
})();
