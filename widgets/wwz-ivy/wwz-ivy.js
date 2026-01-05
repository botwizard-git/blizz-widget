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
     * Apply config values as CSS custom properties
     */
    function applyConfigStyles(container) {
        const Config = window.WWZIvy.Config;

        // Apply launcher size
        if (Config.launcher?.size) {
            container.style.setProperty('--wwz-ivy-launcher-size', Config.launcher.size + 'px');
        }
        if (Config.launcher?.sizeMobile) {
            container.style.setProperty('--wwz-ivy-launcher-size-mobile', Config.launcher.sizeMobile + 'px');
        }

        // Apply position
        if (Config.position?.bottom !== undefined) {
            container.style.setProperty('--wwz-ivy-position-bottom', Config.position.bottom + 'px');
        }
        if (Config.position?.right !== undefined) {
            container.style.setProperty('--wwz-ivy-position-right', Config.position.right + 'px');
        }
        if (Config.position?.bottomMobile !== undefined) {
            container.style.setProperty('--wwz-ivy-position-bottom-mobile', Config.position.bottomMobile + 'px');
        }
        if (Config.position?.rightMobile !== undefined) {
            container.style.setProperty('--wwz-ivy-position-right-mobile', Config.position.rightMobile + 'px');
        }

        // Apply widget dimensions
        if (Config.widget?.width) {
            container.style.setProperty('--wwz-ivy-widget-width', Config.widget.width + 'px');
        }
        if (Config.widget?.height) {
            container.style.setProperty('--wwz-ivy-widget-height', Config.widget.height + 'px');
        }
        if (Config.widget?.minHeight) {
            container.style.setProperty('--wwz-ivy-widget-min-height', Config.widget.minHeight + 'px');
        }
        if (Config.widget?.maxHeight) {
            container.style.setProperty('--wwz-ivy-widget-max-height', Config.widget.maxHeight);
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

        // Apply configurable styles as CSS custom properties
        applyConfigStyles(container);

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
                        // Add welcome message as first bot message if no messages exist
                        const welcomeMessage = window.WWZIvy.State.addMessage({
                            role: 'bot',
                            text: window.WWZIvy.Config.welcomeMessage
                        });
                        window.WWZIvy.UI.addMessage(welcomeMessage);
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

                // Add welcome message as first bot message
                const welcomeMessage = window.WWZIvy.State.addMessage({
                    role: 'bot',
                    text: window.WWZIvy.Config.welcomeMessage
                });
                window.WWZIvy.UI.addMessage(welcomeMessage);

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

        // Auto-open if configured (after Main API is exposed)
        // Supports both boolean (legacy) and object (device-specific) config
        var autoOpenConfig = window.WWZIvy.Config.autoOpen;
        var shouldAutoOpen = false;

        if (typeof autoOpenConfig === 'boolean') {
            // Backward compatible: simple boolean
            shouldAutoOpen = autoOpenConfig;
        } else if (typeof autoOpenConfig === 'object' && autoOpenConfig !== null) {
            // Device-specific config: check viewport width (480px matches CSS mobile breakpoint)
            var isMobile = window.innerWidth <= 480;
            shouldAutoOpen = isMobile ? autoOpenConfig.mobile : autoOpenConfig.desktop;
        }

        if (shouldAutoOpen) {
            setTimeout(function() {
                window.WWZIvy.Main.expand();
            }, 100);
        }

        console.log('WWZIvy: Chatbot initialized', window.WWZIvy.Main.getVersionInfo());
    }

    // Start loading
    loadCSS();
    loadModules();

})();
