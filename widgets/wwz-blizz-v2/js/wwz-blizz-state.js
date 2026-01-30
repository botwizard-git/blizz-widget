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
        messageFeedback: {},      // { messageId: { type: 'positive'|'negative', comment: '' } }
        selectedCategory: null,   // Selected sidebar category
        hasAnswerInConversation: false  // Track if at least one bot answer exists
    };

    EBB.StateManager = {
        /**
         * Initialize state from localStorage
         * Checks for session expiry and clears expired sessions
         */
        init: function() {
            state.userId = SessionService.getUserId();
            state.isCollapsed = SessionService.isCollapsed();

            // Check if existing session is still valid (not expired)
            if (SessionService.hasExistingSession()) {
                // Session is valid, restore it
                state.sessionId = SessionService.getSessionId();
                state.messages = SessionService.getMessages();

                // Restore hasAnswerInConversation flag - compute from messages
                state.hasAnswerInConversation = false;
                for (var i = 0; i < state.messages.length; i++) {
                    if (!state.messages[i].isUser) {
                        state.hasAnswerInConversation = true;
                        break;
                    }
                }

                console.log('[WWZBlizz] Valid session restored');
            } else {
                // No valid session or expired - start fresh
                state.sessionId = null;
                state.messages = [];
                state.hasAnswerInConversation = false;
                console.log('[WWZBlizz] No valid session, starting fresh');
            }

            console.log('[WWZBlizz] State initialized:', {
                userId: state.userId,
                sessionId: state.sessionId,
                messageCount: state.messages.length,
                isCollapsed: state.isCollapsed,
                hasAnswerInConversation: state.hasAnswerInConversation
            });
        },

        /**
         * Check if current session is expired
         */
        isSessionExpired: function() {
            return SessionService.isSessionExpired();
        },

        /**
         * Get remaining session time in milliseconds
         */
        getRemainingSessionTime: function() {
            return SessionService.getRemainingSessionTime();
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
         * Check if there's an existing valid (non-expired) session with messages
         */
        hasExistingSession: function() {
            // Use SessionService which checks for expiry
            return SessionService.hasExistingSession();
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
         * Set selected category
         */
        setSelectedCategory: function(category) {
            state.selectedCategory = category;
        },

        /**
         * Get selected category
         */
        getSelectedCategory: function() {
            return state.selectedCategory;
        },

        /**
         * Set hasAnswerInConversation flag
         */
        setHasAnswerInConversation: function(value) {
            var previousValue = state.hasAnswerInConversation;
            state.hasAnswerInConversation = value;
            // Persist to localStorage
            SessionService.saveHasAnswer(value);

            // Log state transitions
            if (previousValue !== value) {
                if (value) {
                    console.log("there is now at least one message on the window");
                } else {
                    console.log("there is now no message on the window");
                }
            }
        },

        /**
         * Check if conversation has at least one bot answer
         * Computes from messages if needed
         */
        hasAnswerInConversation: function() {
            // If flag is already true, return immediately
            if (state.hasAnswerInConversation) {
                return true;
            }

            // Otherwise, compute from messages (in case of restore from storage)
            var messages = state.messages;
            for (var i = 0; i < messages.length; i++) {
                if (!messages[i].isUser) {
                    state.hasAnswerInConversation = true;
                    return true;
                }
            }
            return false;
        },

        /**
         * Reset state for new conversation
         * Optionally force re-initialization of server session
         */
        reset: function(reinitServerSession) {
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
            state.selectedCategory = null;
            this.setHasAnswerInConversation(false);

            // Reset the API session initialized flag so it re-initializes on next call
            if (EBB.APIService) {
                EBB.APIService._sessionInitialized = false;
            }

            // Optionally force re-init server session immediately
            if (reinitServerSession && EBB.APIService) {
                EBB.APIService.initSession(true);
            }

            console.log('[WWZBlizz] State reset');
        },

        /**
         * Manually end the session (user action)
         * This clears all session data
         */
        endSession: function() {
            this.reset(false);
            console.log('[WWZBlizz] Session ended by user');
        }
    };

    console.log('[WWZBlizz] StateManager loaded');
})();
