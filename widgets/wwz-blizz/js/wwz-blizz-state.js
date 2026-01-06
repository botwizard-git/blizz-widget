/**
 * WWZBlizz - State Management
 */
(function() {
    'use strict';

    var EBB = window.WWZBlizz;
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
        lastUserMessage: null,
        contactFormSource: null,  // 'welcome' or 'chat'
        endChatFeedback: false,   // true when feedback from end chat button
        messageFeedback: {}       // { messageId: { type: 'positive'|'negative', comment: '' } }
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

            console.log('[WWZBlizz] State initialized:', {
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
         * Set contact form source (where it was opened from)
         */
        setContactFormSource: function(source) {
            state.contactFormSource = source;
        },

        /**
         * Get contact form source
         */
        getContactFormSource: function() {
            return state.contactFormSource;
        },

        /**
         * Set end chat feedback flag
         */
        setEndChatFeedback: function(value) {
            state.endChatFeedback = value;
        },

        /**
         * Set feedback rating
         */
        setFeedbackRating: function(rating) {
            state.selectedRating = rating;
        },

        /**
         * Get feedback rating
         */
        getFeedbackRating: function() {
            return state.selectedRating;
        },

        /**
         * Set feedback text
         */
        setFeedbackText: function(text) {
            state.feedbackText = text;
        },

        /**
         * Get feedback text
         */
        getFeedbackText: function() {
            return state.feedbackText;
        },

        /**
         * Get end chat feedback flag
         */
        isEndChatFeedback: function() {
            return state.endChatFeedback;
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
         * Check if message has feedback
         */
        hasMessageFeedback: function(messageId) {
            return !!state.messageFeedback[messageId];
        },

        /**
         * Set message feedback
         */
        setMessageFeedback: function(messageId, feedbackType, comment) {
            state.messageFeedback[messageId] = {
                type: feedbackType,
                comment: comment || '',
                timestamp: new Date().toISOString()
            };
        },

        /**
         * Get message feedback
         */
        getMessageFeedback: function(messageId) {
            return state.messageFeedback[messageId] || null;
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
            state.messageFeedback = {};

            console.log('[WWZBlizz] State reset');
        }
    };

    console.log('[WWZBlizz] StateManager loaded');
})();
