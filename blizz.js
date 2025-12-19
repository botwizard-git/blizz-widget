/**
 * EnterpriseBotBlizz - Embeddable Chatbot Widget Loader
 * Loads into <div id="enterprisebot-blizz-parent"></div>
 */
(function() {
    'use strict';

    // Global namespace
    window.EnterpriseBotBlizz = window.EnterpriseBotBlizz || {};

    // Base URL for loading resources (auto-detect from script src)
    var scripts = document.getElementsByTagName('script');
    var currentScript = scripts[scripts.length - 1];
    var baseUrl = currentScript.src.replace(/blizz\.js.*$/, '');

    // Module loading order
    var modules = [
        'js/blizz-config.js',
        'js/blizz-storage.js',
        'js/blizz-api.js',
        'js/blizz-state.js',
        'js/blizz-ui.js',
        'js/blizz-events.js',
        'js/blizz-main.js'
    ];

    var loadedModules = 0;

    /**
     * Load a CSS file dynamically
     */
    function loadCSS(href, callback) {
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.onload = callback;
        link.onerror = function() {
            console.error('[EnterpriseBotBlizz] Failed to load CSS:', href);
            if (callback) callback();
        };
        document.head.appendChild(link);
    }

    /**
     * Load a script file dynamically
     */
    function loadScript(src, callback) {
        var script = document.createElement('script');
        script.src = src;
        script.onload = callback;
        script.onerror = function() {
            console.error('[EnterpriseBotBlizz] Failed to load script:', src);
            if (callback) callback();
        };
        document.body.appendChild(script);
    }

    /**
     * Load modules sequentially
     */
    function loadModules(index) {
        if (index >= modules.length) {
            // All modules loaded, inject HTML and initialize
            injectHTML();
            return;
        }

        loadScript(baseUrl + modules[index], function() {
            loadedModules++;
            console.log('[EnterpriseBotBlizz] Loaded module:', modules[index]);
            loadModules(index + 1);
        });
    }

    /**
     * Inject HTML template into parent div
     */
    function injectHTML() {
        var parent = document.getElementById('enterprisebot-blizz-parent');
        if (!parent) {
            console.error('[EnterpriseBotBlizz] Parent element #enterprisebot-blizz-parent not found');
            return;
        }

        var CONFIG = window.EnterpriseBotBlizz.CONFIG;

        parent.innerHTML = '\
            <div class="enterprisebot-blizz-app-container" id="enterprisebot-blizz-container">\
                <!-- Collapsed State Bar -->\
                <div class="enterprisebot-blizz-collapsed-bar enterprisebot-blizz-hidden" id="enterprisebot-blizz-collapsed-bar">\
                    <span class="enterprisebot-blizz-collapsed-title">Chatbot - ' + CONFIG.botName + '</span>\
                    <button class="enterprisebot-blizz-expand-btn" id="enterprisebot-blizz-expand-btn" title="Erweitern">\
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">\
                            <path d="M12 5v14M5 12h14"/>\
                        </svg>\
                    </button>\
                </div>\
                \
                <!-- Expanded Chat -->\
                <main class="enterprisebot-blizz-main-content" id="enterprisebot-blizz-main">\
                    <!-- Header -->\
                    <header class="enterprisebot-blizz-chat-header">\
                        <div class="enterprisebot-blizz-header-title">\
                            <span>Chatbot - ' + CONFIG.botName + '</span>\
                        </div>\
                        <div class="enterprisebot-blizz-header-actions">\
                            <button class="enterprisebot-blizz-header-btn" id="enterprisebot-blizz-close-btn" title="Minimieren">\
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">\
                                    <path d="M5 12h14"/>\
                                </svg>\
                            </button>\
                        </div>\
                    </header>\
                    \
                    <!-- Chat Content -->\
                    <div class="enterprisebot-blizz-chat-content" id="enterprisebot-blizz-chat-content">\
                        <!-- Welcome Screen -->\
                        <div class="enterprisebot-blizz-welcome-screen" id="enterprisebot-blizz-welcome-screen">\
                            <div class="enterprisebot-blizz-welcome-content">\
                                <img src="' + CONFIG.botAvatar + '" alt="' + CONFIG.botName + '" class="enterprisebot-blizz-welcome-avatar">\
                                <h1 class="enterprisebot-blizz-welcome-title">Wie kann ich Ihnen helfen?</h1>\
                                <p class="enterprisebot-blizz-welcome-subtitle">Ich bin ' + CONFIG.botName + ', Ihr digitaler Assistent.</p>\
                            </div>\
                            \
                            <div class="enterprisebot-blizz-welcome-input-wrapper">\
                                <div class="enterprisebot-blizz-input-container enterprisebot-blizz-welcome-input">\
                                    <textarea id="enterprisebot-blizz-welcome-message-input" placeholder="Stellen Sie mir eine Frage..." rows="1" autocomplete="off"></textarea>\
                                    <div class="enterprisebot-blizz-input-actions">\
                                        <button class="enterprisebot-blizz-input-btn enterprisebot-blizz-send-btn" id="enterprisebot-blizz-welcome-send-btn" title="Senden">\
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">\
                                                <path d="M12 19V5M5 12l7-7 7 7"/>\
                                            </svg>\
                                        </button>\
                                    </div>\
                                </div>\
                                \
                                <div class="enterprisebot-blizz-welcome-suggestions" id="enterprisebot-blizz-welcome-suggestions"></div>\
                            </div>\
                        </div>\
                        \
                        <!-- Active Chat Screen -->\
                        <div class="enterprisebot-blizz-chat-screen enterprisebot-blizz-hidden" id="enterprisebot-blizz-chat-screen">\
                            <div class="enterprisebot-blizz-messages-container" id="enterprisebot-blizz-messages-container"></div>\
                            \
                            <div class="enterprisebot-blizz-bottom-input-wrapper">\
                                <div class="enterprisebot-blizz-suggestions-container" id="enterprisebot-blizz-suggestions-container"></div>\
                                \
                                <div class="enterprisebot-blizz-input-container">\
                                    <textarea id="enterprisebot-blizz-message-input" placeholder="Nachricht..." rows="1" autocomplete="off"></textarea>\
                                    <div class="enterprisebot-blizz-input-actions">\
                                        <button class="enterprisebot-blizz-input-btn enterprisebot-blizz-send-btn" id="enterprisebot-blizz-send-btn" title="Senden">\
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">\
                                                <path d="M12 19V5M5 12l7-7 7 7"/>\
                                            </svg>\
                                        </button>\
                                    </div>\
                                </div>\
                                \
                                <p class="enterprisebot-blizz-disclaimer">Der Chatbot kann Fehler machen. Bitte uberprufen Sie wichtige Informationen.</p>\
                            </div>\
                        </div>\
                    </div>\
                    \
                    <!-- Close Confirm -->\
                    <div class="enterprisebot-blizz-overlay-screen enterprisebot-blizz-hidden" id="enterprisebot-blizz-close-confirm">\
                        <div class="enterprisebot-blizz-overlay-content">\
                            <h2>Vielen Dank, dass Sie den Chat-Service nutzen.</h2>\
                            <button class="enterprisebot-blizz-primary-btn" id="enterprisebot-blizz-end-session-btn">Chat beenden</button>\
                        </div>\
                    </div>\
                    \
                    <!-- Feedback Form -->\
                    <div class="enterprisebot-blizz-overlay-screen enterprisebot-blizz-hidden" id="enterprisebot-blizz-feedback-container">\
                        <div class="enterprisebot-blizz-overlay-content enterprisebot-blizz-feedback-content">\
                            <h3 class="enterprisebot-blizz-feedback-title">Wie war Ihre Erfahrung?</h3>\
                            \
                            <div class="enterprisebot-blizz-feedback-smileys" id="enterprisebot-blizz-feedback-smileys">\
                                <div class="enterprisebot-blizz-smiley-wrapper" data-rating="1">\
                                    <button class="enterprisebot-blizz-smiley-btn" title="Sehr mangelhaft">1</button>\
                                    <span class="enterprisebot-blizz-smiley-label">Sehr mangelhaft</span>\
                                </div>\
                                <div class="enterprisebot-blizz-smiley-wrapper" data-rating="2">\
                                    <button class="enterprisebot-blizz-smiley-btn" title="Mangelhaft">2</button>\
                                    <span class="enterprisebot-blizz-smiley-label">Mangelhaft</span>\
                                </div>\
                                <div class="enterprisebot-blizz-smiley-wrapper" data-rating="3">\
                                    <button class="enterprisebot-blizz-smiley-btn" title="Befriedigend">3</button>\
                                    <span class="enterprisebot-blizz-smiley-label">Befriedigend</span>\
                                </div>\
                                <div class="enterprisebot-blizz-smiley-wrapper" data-rating="4">\
                                    <button class="enterprisebot-blizz-smiley-btn" title="Gut">4</button>\
                                    <span class="enterprisebot-blizz-smiley-label">Gut</span>\
                                </div>\
                                <div class="enterprisebot-blizz-smiley-wrapper" data-rating="5">\
                                    <button class="enterprisebot-blizz-smiley-btn" title="Sehr gut">5</button>\
                                    <span class="enterprisebot-blizz-smiley-label">Sehr gut</span>\
                                </div>\
                            </div>\
                            \
                            <textarea class="enterprisebot-blizz-feedback-textarea" id="enterprisebot-blizz-feedback-text" placeholder="Kommentar (optional)"></textarea>\
                            \
                            <div class="enterprisebot-blizz-feedback-buttons">\
                                <button class="enterprisebot-blizz-secondary-btn" id="enterprisebot-blizz-feedback-skip-btn">Uberspringen</button>\
                                <button class="enterprisebot-blizz-primary-btn" id="enterprisebot-blizz-submit-feedback-btn">Feedback senden</button>\
                            </div>\
                        </div>\
                    </div>\
                    \
                    <!-- Thank You -->\
                    <div class="enterprisebot-blizz-overlay-screen enterprisebot-blizz-hidden" id="enterprisebot-blizz-thank-you">\
                        <div class="enterprisebot-blizz-overlay-content">\
                            <div class="enterprisebot-blizz-thank-you-icon">\
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#147bd1" stroke-width="2">\
                                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>\
                                    <polyline points="22 4 12 14.01 9 11.01"/>\
                                </svg>\
                            </div>\
                            <h2>Vielen Dank!</h2>\
                            <p>Ihr Feedback wurde ubermittelt.</p>\
                        </div>\
                    </div>\
                </main>\
            </div>\
        ';

        // Initialize the widget
        if (window.EnterpriseBotBlizz.Main) {
            window.EnterpriseBotBlizz.Main.init();
        }

        console.log('[EnterpriseBotBlizz] Widget initialized');
    }

    /**
     * Initialize loader
     */
    function init() {
        console.log('[EnterpriseBotBlizz] Starting loader...');

        // Load CSS first
        loadCSS(baseUrl + 'blizz.css', function() {
            console.log('[EnterpriseBotBlizz] CSS loaded');
            // Then load modules sequentially
            loadModules(0);
        });
    }

    // Start loading when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
