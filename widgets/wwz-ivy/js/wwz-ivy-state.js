/**
 * WWZ Ivy Chatbot - State Management
 */
(function() {
    'use strict';

    window.WWZIvy = window.WWZIvy || {};

    const Storage = window.WWZIvy.Storage;

    window.WWZIvy.State = {
        // Current state
        data: {
            userId: null,
            sessionId: null,
            messages: [],
            isLoading: false,
            isCollapsed: true,
            isFullscreen: false,
            termsAccepted: false,
            currentScreen: 'launcher', // launcher, welcome, chat, feedback, thankyou
            feedbackRating: null,
            lastError: null,
            suggestions: []
        },

        /**
         * Initialize state from storage
         */
        init: function() {
            this.data.userId = Storage.getUserId();
            this.data.sessionId = Storage.getSessionId();
            this.data.messages = Storage.loadMessages();
            this.data.isCollapsed = Storage.isCollapsed();
            this.data.termsAccepted = Storage.isTermsAccepted();

            // Set initial screen based on state
            if (this.data.isCollapsed) {
                this.data.currentScreen = 'launcher';
            } else if (!this.data.termsAccepted) {
                this.data.currentScreen = 'welcome';
            } else if (this.data.messages.length > 0) {
                this.data.currentScreen = 'chat';
            } else {
                this.data.currentScreen = 'welcome';
            }

            return this.data;
        },

        /**
         * Get current state
         */
        get: function() {
            return this.data;
        },

        /**
         * Update state
         */
        set: function(updates) {
            Object.assign(this.data, updates);

            // Persist relevant changes
            if ('isCollapsed' in updates) {
                Storage.setCollapsed(updates.isCollapsed);
            }
            if ('termsAccepted' in updates) {
                Storage.setTermsAccepted(updates.termsAccepted);
            }
            if ('messages' in updates) {
                Storage.saveMessages(updates.messages);
            }

            return this.data;
        },

        /**
         * Add message
         */
        addMessage: function(message) {
            const newMessage = {
                id: Storage.generateMessageId(),
                ...message,
                timestamp: new Date().toISOString()
            };

            this.data.messages.push(newMessage);
            Storage.saveMessages(this.data.messages);

            return newMessage;
        },

        /**
         * Get messages
         */
        getMessages: function() {
            return this.data.messages;
        },

        /**
         * Clear messages
         */
        clearMessages: function() {
            this.data.messages = [];
            Storage.clearMessages();
        },

        /**
         * Set loading state
         */
        setLoading: function(isLoading) {
            this.data.isLoading = isLoading;
        },

        /**
         * Set current screen
         */
        setScreen: function(screen) {
            this.data.currentScreen = screen;
        },

        /**
         * Toggle collapsed state
         */
        toggleCollapsed: function() {
            this.data.isCollapsed = !this.data.isCollapsed;
            Storage.setCollapsed(this.data.isCollapsed);
            return this.data.isCollapsed;
        },

        /**
         * Toggle fullscreen
         */
        toggleFullscreen: function() {
            this.data.isFullscreen = !this.data.isFullscreen;
            return this.data.isFullscreen;
        },

        /**
         * Accept terms
         */
        acceptTerms: function() {
            this.data.termsAccepted = true;
            Storage.setTermsAccepted(true);
            this.data.currentScreen = 'chat';
        },

        /**
         * Decline terms
         */
        declineTerms: function() {
            this.data.isCollapsed = true;
            this.data.currentScreen = 'launcher';
            Storage.setCollapsed(true);
        },

        /**
         * Set feedback rating
         */
        setFeedbackRating: function(rating) {
            this.data.feedbackRating = rating;
        },

        /**
         * Start new session
         */
        startNewSession: function() {
            this.data.sessionId = Storage.createNewSession();
            this.data.messages = [];
            this.data.feedbackRating = null;
            this.data.currentScreen = 'chat';
            return this.data.sessionId;
        },

        /**
         * Set error
         */
        setError: function(error) {
            this.data.lastError = error;
        },

        /**
         * Clear error
         */
        clearError: function() {
            this.data.lastError = null;
        },

        /**
         * Set suggestions
         */
        setSuggestions: function(suggestions) {
            this.data.suggestions = suggestions || [];
        }
    };
})();
