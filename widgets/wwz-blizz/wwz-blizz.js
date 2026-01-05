/**
 * WWZBlizz - Embeddable Chatbot Widget Loader
 * Loads into <div id="wwz-blizz-parent"></div>
 */
(function() {
    'use strict';

    // Global namespace
    window.WWZBlizz = window.WWZBlizz || {};

    // Base URL for loading resources (auto-detect from script src)
    var scripts = document.getElementsByTagName('script');
    var currentScript = scripts[scripts.length - 1];
    var baseUrl = currentScript.src.replace(/wwz-blizz\.js.*$/, '');

    // Module loading order
    var modules = [
        'js/wwz-blizz-config.js',
        'js/wwz-blizz-storage.js',
        'js/wwz-blizz-api.js',
        'js/wwz-blizz-state.js',
        'js/wwz-blizz-ui.js',
        'js/wwz-blizz-events.js',
        'js/wwz-blizz-main.js'
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
            console.error('[WWZBlizz] Failed to load CSS:', href);
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
            console.error('[WWZBlizz] Failed to load script:', src);
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
            console.log('[WWZBlizz] Loaded module:', modules[index]);
            loadModules(index + 1);
        });
    }

    /**
     * Inject HTML template into parent div
     */
    function injectHTML() {
        var parent = document.getElementById('wwz-blizz-parent');
        if (!parent) {
            console.error('[WWZBlizz] Parent element #wwz-blizz-parent not found');
            return;
        }

        var CONFIG = window.WWZBlizz.CONFIG;

        parent.innerHTML = '\
            <div class="wwz-blizz-app-container" id="wwz-blizz-container">\
                <!-- Collapsed State Bar -->\
                <div class="wwz-blizz-collapsed-bar wwz-blizz-hidden" id="wwz-blizz-collapsed-bar">\
                    <span class="wwz-blizz-collapsed-title">' + CONFIG.botTitle + '</span>\
                    <button class="wwz-blizz-expand-btn" id="wwz-blizz-expand-btn" title="Erweitern">\
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">\
                            <path d="M12 5v14M5 12h14"/>\
                        </svg>\
                    </button>\
                </div>\
                \
                <!-- Expanded Chat -->\
                <main class="wwz-blizz-main-content" id="wwz-blizz-main">\
                    <!-- Header -->\
                    <header class="wwz-blizz-chat-header">\
                        <div class="wwz-blizz-header-title">\
                            <span>' + CONFIG.botTitle + '</span>\
                        </div>\
                        <div class="wwz-blizz-header-actions">\
                            <button class="wwz-blizz-header-btn enterprisebot-blizz-info-btn" id="wwz-blizz-privacy-btn" title="Datenschutz">\
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">\
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>\
                                </svg>\
                            </button>\
                            <button class="wwz-blizz-header-btn" id="wwz-blizz-close-btn" title="Minimieren">\
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">\
                                    <path d="M5 12h14"/>\
                                </svg>\
                            </button>\
                        </div>\
                    </header>\
                    \
                    <!-- Privacy Popup -->\
                    <div class="enterprisebot-blizz-privacy-popup wwz-blizz-hidden" id="wwz-blizz-privacy-modal">\
                        <button class="enterprisebot-blizz-privacy-close-btn" id="wwz-blizz-privacy-close">\
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">\
                                <line x1="18" y1="6" x2="6" y2="18"/>\
                                <line x1="6" y1="6" x2="18" y2="18"/>\
                            </svg>\
                        </button>\
                        <div class="enterprisebot-blizz-privacy-header">\
                            <img src="' + CONFIG.botAvatar + '" alt="' + CONFIG.botName + '" class="enterprisebot-blizz-privacy-avatar">\
                            <h3 class="enterprisebot-blizz-privacy-title">Ich bin ' + CONFIG.botName + ', ' + CONFIG.privacy.title + '</h3>\
                        </div>\
                        <p class="enterprisebot-blizz-privacy-text">\
                            ' + CONFIG.privacy.description + '\
                        </p>\
                        <a href="' + CONFIG.privacy.linkUrl + '" target="_blank" rel="noopener noreferrer" class="enterprisebot-blizz-privacy-link">\
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">\
                                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>\
                                <polyline points="15 3 21 3 21 9"/>\
                                <line x1="10" y1="14" x2="21" y2="3"/>\
                            </svg>\
                            ' + CONFIG.privacy.linkText + '\
                        </a>\
                    </div>\
                    \
                    <!-- Chat Content -->\
                    <div class="wwz-blizz-chat-content" id="wwz-blizz-chat-content">\
                        <!-- Welcome Screen -->\
                        <div class="wwz-blizz-welcome-screen" id="wwz-blizz-welcome-screen">\
                            <div class="wwz-blizz-welcome-content">\
                                <img src="' + CONFIG.botAvatar + '" alt="' + CONFIG.botName + '" class="wwz-blizz-welcome-avatar">\
                                <h1 class="wwz-blizz-welcome-title">' + CONFIG.welcomeTitle + '</h1>\
                                <p class="wwz-blizz-welcome-subtitle">Ich bin ' + CONFIG.botName + ', ' + CONFIG.welcomeSubtitle + '</p>\
                            </div>\
                            \
                            <div class="wwz-blizz-welcome-input-wrapper">\
                                <div class="wwz-blizz-input-container wwz-blizz-welcome-input">\
                                    <textarea id="wwz-blizz-welcome-message-input" placeholder="' + CONFIG.inputPlaceholder + '" rows="1" autocomplete="off"></textarea>\
                                    <div class="wwz-blizz-input-actions">\
                                        <button class="wwz-blizz-input-btn wwz-blizz-send-btn" id="wwz-blizz-welcome-send-btn" title="Senden">\
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">\
                                                <path d="M12 19V5M5 12l7-7 7 7"/>\
                                            </svg>\
                                        </button>\
                                    </div>\
                                </div>\
                                \
                                <div class="wwz-blizz-welcome-suggestions" id="wwz-blizz-welcome-suggestions"></div>\
                            </div>\
                        </div>\
                        \
                        <!-- Active Chat Screen -->\
                        <div class="wwz-blizz-chat-screen wwz-blizz-hidden" id="wwz-blizz-chat-screen">\
                            <div class="wwz-blizz-messages-container" id="wwz-blizz-messages-container"></div>\
                            \
                            <div class="wwz-blizz-bottom-input-wrapper">\
                                <div class="wwz-blizz-suggestions-container" id="wwz-blizz-suggestions-container"></div>\
                                \
                                <div class="wwz-blizz-input-container">\
                                    <textarea id="wwz-blizz-message-input" placeholder="' + CONFIG.inputPlaceholder + '" rows="1" autocomplete="off"></textarea>\
                                    <div class="wwz-blizz-input-actions">\
                                        <button class="wwz-blizz-input-btn wwz-blizz-send-btn" id="wwz-blizz-send-btn" title="Senden">\
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">\
                                                <path d="M12 19V5M5 12l7-7 7 7"/>\
                                            </svg>\
                                        </button>\
                                    </div>\
                                </div>\
                                \
                                <p class="wwz-blizz-disclaimer">' + CONFIG.disclaimerText + '</p>\
                                <button class="enterprisebot-blizz-end-chat-btn" id="wwz-blizz-end-chat-btn">' + CONFIG.endChatButton + '</button>\
                            </div>\
                        </div>\
                    </div>\
                    \
                    <!-- Close Confirm -->\
                    <div class="wwz-blizz-overlay-screen wwz-blizz-hidden" id="wwz-blizz-close-confirm">\
                        <div class="wwz-blizz-overlay-content">\
                            <h2>Vielen Dank, dass Sie den Chat-Service nutzen.</h2>\
                            <button class="wwz-blizz-primary-btn" id="wwz-blizz-end-session-btn">Chat beenden</button>\
                        </div>\
                    </div>\
                    \
                    <!-- Feedback Screen -->\
                    <div class="wwz-blizz-overlay-screen wwz-blizz-hidden" id="wwz-blizz-feedback-screen">\
                        <div class="wwz-blizz-overlay-content wwz-blizz-feedback-content">\
                            <h2 class="wwz-blizz-feedback-question">' + CONFIG.feedback.question + '</h2>\
                            <div class="wwz-blizz-rating" id="wwz-blizz-rating">\
                                <div class="wwz-blizz-rating-item">\
                                    <button class="wwz-blizz-rating-btn wwz-blizz-rating-1" data-rating="1">1</button>\
                                    <span class="wwz-blizz-rating-label">' + CONFIG.feedback.ratingLabels[1] + '</span>\
                                </div>\
                                <div class="wwz-blizz-rating-item">\
                                    <button class="wwz-blizz-rating-btn wwz-blizz-rating-2" data-rating="2">2</button>\
                                    <span class="wwz-blizz-rating-label">' + CONFIG.feedback.ratingLabels[2] + '</span>\
                                </div>\
                                <div class="wwz-blizz-rating-item">\
                                    <button class="wwz-blizz-rating-btn wwz-blizz-rating-3" data-rating="3">3</button>\
                                    <span class="wwz-blizz-rating-label">' + CONFIG.feedback.ratingLabels[3] + '</span>\
                                </div>\
                                <div class="wwz-blizz-rating-item">\
                                    <button class="wwz-blizz-rating-btn wwz-blizz-rating-4" data-rating="4">4</button>\
                                    <span class="wwz-blizz-rating-label">' + CONFIG.feedback.ratingLabels[4] + '</span>\
                                </div>\
                                <div class="wwz-blizz-rating-item">\
                                    <button class="wwz-blizz-rating-btn wwz-blizz-rating-5" data-rating="5">5</button>\
                                    <span class="wwz-blizz-rating-label">' + CONFIG.feedback.ratingLabels[5] + '</span>\
                                </div>\
                            </div>\
                            <div class="wwz-blizz-feedback-second-question wwz-blizz-hidden" id="wwz-blizz-feedback-second-question">\
                                <h3 class="wwz-blizz-feedback-second-title" id="wwz-blizz-feedback-second-title"></h3>\
                                <div class="wwz-blizz-feedback-options" id="wwz-blizz-feedback-options"></div>\
                            </div>\
                            <div class="wwz-blizz-feedback-text-toggle-wrapper wwz-blizz-hidden" id="wwz-blizz-feedback-text-toggle-wrapper">\
                                <button class="wwz-blizz-btn wwz-blizz-btn-outline" id="wwz-blizz-feedback-text-toggle">\
                                    <span>' + CONFIG.feedback.additionalFeedbackLabel + '</span>\
                                </button>\
                            </div>\
                            <div class="wwz-blizz-feedback-text-panel" id="wwz-blizz-feedback-text-panel">\
                                <textarea\
                                    class="wwz-blizz-feedback-text-input"\
                                    id="wwz-blizz-feedback-text-input"\
                                    placeholder="' + CONFIG.feedback.additionalFeedbackPlaceholder + '"\
                                    rows="3"\
                                ></textarea>\
                            </div>\
                            <div class="wwz-blizz-feedback-actions">\
                                <button class="wwz-blizz-btn wwz-blizz-btn-primary" id="wwz-blizz-feedback-send-btn">\
                                    ' + CONFIG.feedback.sendButton + '\
                                </button>\
                                <button class="wwz-blizz-feedback-btn" id="wwz-blizz-download-transcript">\
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>\
                                    <span>' + CONFIG.feedback.downloadButton + '</span>\
                                </button>\
                                <button class="wwz-blizz-feedback-btn" id="wwz-blizz-feedback-skip">\
                                    <span>' + CONFIG.feedback.skipButton + '</span>\
                                </button>\
                            </div>\
                        </div>\
                    </div>\
                    \
                    <!-- Thank You -->\
                    <div class="wwz-blizz-overlay-screen wwz-blizz-hidden" id="wwz-blizz-thank-you">\
                        <div class="wwz-blizz-overlay-content wwz-blizz-thankyou-content">\
                            <div class="wwz-blizz-checkmark-wrapper">\
                                <svg class="wwz-blizz-checkmark" viewBox="0 0 52 52">\
                                    <circle class="wwz-blizz-checkmark-circle" cx="26" cy="26" r="25" fill="none"/>\
                                    <path class="wwz-blizz-checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>\
                                </svg>\
                            </div>\
                            <h2 class="wwz-blizz-thankyou-title">' + CONFIG.thankyou.title + '</h2>\
                            <p class="wwz-blizz-thankyou-desc">' + CONFIG.thankyou.description + '</p>\
                            <button class="wwz-blizz-btn wwz-blizz-btn-primary" id="wwz-blizz-thankyou-close">' + CONFIG.thankyou.closeButton + '</button>\
                        </div>\
                    </div>\
                </main>\
            </div>\
        ';

        // Initialize the widget
        if (window.WWZBlizz.Main) {
            window.WWZBlizz.Main.init();
        }

        console.log('[WWZBlizz] Widget initialized');
    }

    /**
     * Initialize loader
     */
    function init() {
        console.log('[WWZBlizz] Starting loader...');

        // Load CSS first
        loadCSS(baseUrl + 'wwz-blizz.css', function() {
            console.log('[WWZBlizz] CSS loaded');
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
