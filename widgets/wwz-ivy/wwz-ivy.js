/**
 * WWZ Ivy Chatbot - Main Loader
 * Version: 1.0.0
 *
 * Usage:
 * <div id="wwz-ivy-parent"></div>
 * <script src="wwz-ivy.js"></script>
 */
(function () {
    'use strict';

    // Detect base URL from script src
    const scripts = document.getElementsByTagName('script');
    const currentScript = document.currentScript;
    if (!currentScript) {
        console.error('WWZIvy: currentScript not available');
    }
    const baseUrl = new URL('.', currentScript.src).href;
    const VERSION = '1.0.1'; // bump on each deploy

    // Module loading order
    const modules = [
        'js/wwz-ivy-config.js',
        'js/wwz-ivy-storage.js',
        'js/wwz-ivy-analytics.js',
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
        link.href = baseUrl + 'wwz-ivy.css?v=' + VERSION;
        document.head.appendChild(link);
    }

    /**
     * Load JavaScript module
     */
    function loadScript(src, callback) {
        const script = document.createElement('script');
        script.src = baseUrl + src + '?v=' + VERSION;
        script.onload = callback;
        script.onerror = function () {
            console.error('WWZIvy: Failed to load ' + src);
            console.error('WWZIvy: Failed to load', { src, baseUrl, event: e });
        };
        document.head.appendChild(script);
    }

    /**
     * Load all modules sequentially
     */
    function loadModules() {
        function loadNext() {
            if (loadedCount < modules.length) {
                loadScript(modules[loadedCount], function () {
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

        // Initialize Analytics (fail-safe, won't block if it fails)
        if (window.WWZIvy.Analytics) {
            window.WWZIvy.Analytics.init();
        }

        window.WWZIvy.UI.init(container);
        window.WWZIvy.Events.init();

        // Expose Main API
        window.WWZIvy.Main = {
            /**
             * Collapse the widget
             */
            collapse: function () {
                window.WWZIvy.State.set({ isCollapsed: true });
                window.WWZIvy.UI.hideWidget();
            },

            /**
             * Expand the widget
             */
            expand: function () {
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
            startNewSession: function () {
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
            getVersionInfo: function () {
                return {
                    name: 'WWZ Ivy Chatbot',
                    version: window.WWZIvy.Config.version,
                    botName: window.WWZIvy.Config.botName
                };
            },

            /**
             * Get current state
             */
            getState: function () {
                return window.WWZIvy.State.get();
            },

            /**
             * Send a message programmatically
             */
            sendMessage: function (message) {
                if (message && typeof message === 'string') {
                    window.WWZIvy.UI.getElements().input.value = message;
                    window.WWZIvy.UI.updateSendButton();
                    window.WWZIvy.Events.handleSendMessage();
                }
            }
        };

        // Auto-open if configured (after Main API is exposed)
        // Supports both boolean (legacy) and object (device-specific) config
        // ONLY auto-open for first-time visitors - respect user's close preference
        var autoOpenConfig = window.WWZIvy.Config.autoOpen;
        var shouldAutoOpen = false;

        // Check if user has ever closed/minimized the widget
        var hasStoredPreference = localStorage.getItem(window.WWZIvy.Config.storageKeys.collapsed) !== null;
        var storedCollapsed = window.WWZIvy.Storage.isCollapsed();

        if (typeof autoOpenConfig === 'boolean') {
            // Backward compatible: simple boolean
            // Only auto-open if user has never interacted with widget OR left it open last time
            shouldAutoOpen = autoOpenConfig && (!hasStoredPreference || !storedCollapsed);
        } else if (typeof autoOpenConfig === 'object' && autoOpenConfig !== null) {
            // Device-specific config: check viewport width (480px matches CSS mobile breakpoint)
            var isMobile = window.innerWidth <= 480;
            var configValue = isMobile ? autoOpenConfig.mobile : autoOpenConfig.desktop;
            // Only auto-open if user has never interacted with widget OR left it open last time
            shouldAutoOpen = configValue && (!hasStoredPreference || !storedCollapsed);
        }

        if (shouldAutoOpen) {
            setTimeout(function () {
                window.WWZIvy.Main.expand();
            }, 100);
        }

        // Check for switchBot redirect question (via URL param from cross-origin redirect)
        var urlParams = new URLSearchParams(window.location.search);
        var redirectQuestion = urlParams.get('wwzIvyRedirectQuestion');
        if (redirectQuestion) {
            // Clean up URL (remove query param without reload)
            var cleanUrl = new URL(window.location.href);
            cleanUrl.searchParams.delete('wwzIvyRedirectQuestion');
            history.replaceState(null, '', cleanUrl.toString());

            console.log('[WWZIvy] SwitchBot redirect question:', redirectQuestion);
            // Force a new session for switchBot redirect (avoid bugs with stale sessions)
            window.WWZIvy.State.startNewSession();
            window.WWZIvy.UI.getElements().messages.innerHTML = '';
            // Force clear collapsed state immediately (override any stored preference)
            window.WWZIvy.State.set({ isCollapsed: false });
            var state = window.WWZIvy.State.get();
            if (!state.termsAccepted) {
                window.WWZIvy.State.acceptTerms();
            }
            setTimeout(function() {
                window.WWZIvy.Main.expand();
                setTimeout(function() {
                    window.WWZIvy.Main.sendMessage(redirectQuestion);
                }, 300);
            }, 500);
        }

        console.log('WWZIvy: Chatbot initialized', window.WWZIvy.Main.getVersionInfo());
    }

    // Start loading
    loadCSS();
    loadModules();

})();
