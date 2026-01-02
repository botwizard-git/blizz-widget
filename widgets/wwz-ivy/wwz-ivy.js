/**
 * WWZ Ivy Chatbot - Main Loader
 * Version: 1.0.0
 *
 * Usage:
 * <div id="wwz-ivy-parent"></div>
 * <script src="wwz-ivy.js"></script>
 */
(function() {
    'use strict';

    // Detect base URL from script src
    const scripts = document.getElementsByTagName('script');
    const currentScript = scripts[scripts.length - 1];
    const baseUrl = currentScript.src.substring(0, currentScript.src.lastIndexOf('/') + 1);

    // Module loading order
    const modules = [
        'js/wwz-ivy-config.js',
        'js/wwz-ivy-storage.js',
        'js/wwz-ivy-api.js',
        'js/wwz-ivy-state.js',
        'js/wwz-ivy-ui.js',
        'js/wwz-ivy-events.js'
    ];

    let loadedCount = 0;

    /**
     * Load CSS
     */
    function loadCSS() {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = baseUrl + 'wwz-ivy.css';
        document.head.appendChild(link);
    }

    /**
     * Load JavaScript module
     */
    function loadScript(src, callback) {
        const script = document.createElement('script');
        script.src = baseUrl + src;
        script.onload = callback;
        script.onerror = function() {
            console.error('WWZIvy: Failed to load ' + src);
        };
        document.head.appendChild(script);
    }

    /**
     * Load all modules sequentially
     */
    function loadModules() {
        function loadNext() {
            if (loadedCount < modules.length) {
                loadScript(modules[loadedCount], function() {
                    loadedCount++;
                    loadNext();
                });
            } else {
                // All modules loaded, initialize
                init();
            }
        }
        loadNext();
    }

    /**
     * Initialize the chatbot
     */
    function init() {
        // Wait for DOM ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initWidget);
        } else {
            initWidget();
        }
    }

    /**
     * Initialize widget
     */
    function initWidget() {
        // Find or create container
        let container = document.getElementById('wwz-ivy-parent');
        if (!container) {
            container = document.createElement('div');
            container.id = 'wwz-ivy-parent';
            document.body.appendChild(container);
        }

        // Add container class
        container.className = 'wwz-ivy-container';

        // Initialize modules
        window.WWZIvy.State.init();
        window.WWZIvy.UI.init(container);
        window.WWZIvy.Events.init();

        // Expose Main API
        window.WWZIvy.Main = {
            /**
             * Collapse the widget
             */
            collapse: function() {
                window.WWZIvy.State.set({ isCollapsed: true });
                window.WWZIvy.UI.hideWidget();
            },

            /**
             * Expand the widget
             */
            expand: function() {
                window.WWZIvy.State.set({ isCollapsed: false });
                const state = window.WWZIvy.State.get();

                if (state.termsAccepted) {
                    window.WWZIvy.UI.showScreen('chat');
                    if (state.messages.length > 0) {
                        window.WWZIvy.UI.renderMessages(state.messages);
                    } else {
                        window.WWZIvy.UI.renderSuggestions(window.WWZIvy.Config.suggestions);
                    }
                } else {
                    window.WWZIvy.UI.showScreen('welcome');
                }

                window.WWZIvy.UI.showWidget();
            },

            /**
             * Start a new chat session
             */
            startNewSession: function() {
                window.WWZIvy.State.startNewSession();
                window.WWZIvy.UI.getElements().messages.innerHTML = '';
                window.WWZIvy.UI.renderSuggestions(window.WWZIvy.Config.suggestions);
                window.WWZIvy.UI.showScreen('chat');
            },

            /**
             * Get version info
             */
            getVersionInfo: function() {
                return {
                    name: 'WWZ Ivy Chatbot',
                    version: window.WWZIvy.Config.version,
                    botName: window.WWZIvy.Config.botName
                };
            },

            /**
             * Get current state
             */
            getState: function() {
                return window.WWZIvy.State.get();
            },

            /**
             * Send a message programmatically
             */
            sendMessage: function(message) {
                if (message && typeof message === 'string') {
                    window.WWZIvy.UI.getElements().input.value = message;
                    window.WWZIvy.UI.updateSendButton();
                    window.WWZIvy.Events.handleSendMessage();
                }
            }
        };

        console.log('WWZIvy: Chatbot initialized', window.WWZIvy.Main.getVersionInfo());
    }

    // Start loading
    loadCSS();
    loadModules();

})();
