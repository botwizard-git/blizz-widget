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

    // Override botAvatar with local asset (assuming CONFIG is initialized by wwz-blizz-config.js)
    // This line will be executed after wwz-blizz-config.js has loaded and initialized WWZBlizz.CONFIG
    // The actual update will happen in the init function after modules are loaded.
    // For now, we'll just define the baseUrl. The actual assignment to CONFIG.botAvatar
    // needs to happen after CONFIG is available.

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

        loadScript(baseUrl + modules[index] + '?v=' + Date.now(), function() {
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
        
        // Override botAvatar with local asset for UI consistency
        if (CONFIG) {
            CONFIG.botAvatar = baseUrl + 'assets/bot_with_star.png';
        }

        // Generate dynamic suggestions HTML
        var suggestionsHtml = '';
        var suggestionsList = (CONFIG && CONFIG.suggestions) ? CONFIG.suggestions : ['Was sind Mehrwertdienste?', 'Wo finde ich eine Bedienungsanleitung?'];
        
        for (var i = 0; i < suggestionsList.length; i++) {
             var safeText = suggestionsList[i].replace(/"/g, '&quot;');
             suggestionsHtml += '<button class="wwz-blizz-suggestion-btn" type="button" data-suggestion="' + safeText + '">' + suggestionsList[i] + '</button>';
        }

        parent.innerHTML = 
            '<div class="wwz-blizz-app-container" id="wwz-blizz-container">' +
                '<!-- Collapsed State Bar -->' +
                '<div class="wwz-blizz-collapsed-bar wwz-blizz-hidden" id="wwz-blizz-collapsed-bar">' +
                    '<span class="wwz-blizz-collapsed-title">' + CONFIG.botTitle + '</span>' +
                    '<button class="wwz-blizz-expand-btn" id="wwz-blizz-expand-btn" title="Erweitern">' +
                        '<img src="' + baseUrl + 'assets/keyboard_arrow_up.svg" width="24" height="24" alt="Expand">' +
                    '</button>' +
                '</div>' +
                
                '<!-- Expanded Chat -->' +
                '<main class="wwz-blizz-main-content wwz-blizz-mode-welcome" id="wwz-blizz-main">' +
                    '<!-- Header -->' +
                    '<header class="wwz-blizz-chat-header">' +
                        '<div class="wwz-blizz-header-spacer"></div>' +
                        '<div class="wwz-blizz-header-actions">' +
                            '<button class="wwz-blizz-new-chat-btn" id="wwz-blizz-new-chat-btn">' +
                                'Neuer Chat <span class="wwz-blizz-new-chat-icon">+</span>' +
                            '</button>' +
                            '<button class="wwz-blizz-help-btn" id="wwz-blizz-help-btn" title="Hilfe">' +
                                '<img src="' + baseUrl + 'assets/question_mark.svg" width="24" height="24" alt="Hilfe">' +
                            '</button>' +
                        '</div>' +
                    '</header>' +
                    
                    '<!-- Privacy Popup -->' +
                    '<div class="enterprisebot-blizz-privacy-popup wwz-blizz-hidden" id="wwz-blizz-privacy-modal">' +
                        '<button class="enterprisebot-blizz-privacy-close-btn" id="wwz-blizz-privacy-close">' +
                            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                                '<line x1="18" y1="6" x2="6" y2="18"/>' +
                                '<line x1="6" y1="6" x2="18" y2="18"/>' +
                            '</svg>' +
                        '</button>' +
                        '<div class="enterprisebot-blizz-privacy-header">' +
                            '<img src="' + baseUrl + 'assets/bot_with_star.png" alt="' + CONFIG.botName + '" class="enterprisebot-blizz-privacy-avatar">' +
                            '<h3 class="enterprisebot-blizz-privacy-title">Ich bin ' + CONFIG.botName + ', ' + CONFIG.privacy.title + '</h3>' +
                        '</div>' +
                        '<p class="enterprisebot-blizz-privacy-text">' +
                            CONFIG.privacy.description +
                        '</p>' +
                        '<a href="' + CONFIG.privacy.linkUrl + '" target="_blank" rel="noopener noreferrer" class="enterprisebot-blizz-privacy-link">' +
                            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                                '<path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>' +
                                '<polyline points="15 3 21 3 21 9"/>' +
                                '<line x1="10" y1="14" x2="21" y2="3"/>' +
                            '</svg>' +
                            CONFIG.privacy.linkText +
                        '</a>' +
                    '</div>' +
                    
                    '<!-- Chat Content -->' +
                    '<div class="wwz-blizz-chat-content" id="wwz-blizz-chat-content">' +
                        '<!-- Welcome Screen -->' +
                        '<div class="wwz-blizz-welcome-screen" id="wwz-blizz-welcome-screen">' +
                            '<div class="wwz-blizz-welcome-content">' +
                                '<h2 class="wwz-blizz-welcome-title">' + CONFIG.welcomeTitle + '</h2>' +
                                '<p class="wwz-blizz-welcome-subtitle">' + CONFIG.welcomeSubtitle + '</p>' +
                                '<p class="wwz-blizz-welcome-text">' + CONFIG.welcomeDescription + '</p>' +
                            '</div>' +
                            '<div class="wwz-blizz-welcome-suggestions" id="wwz-blizz-welcome-suggestions"></div>' +
                        '</div>' +
                        
                        '<!-- Active Chat Screen -->' +
                        '<div class="wwz-blizz-chat-screen wwz-blizz-hidden" id="wwz-blizz-chat-screen">' +
                            '<div class="wwz-blizz-messages-container" id="wwz-blizz-messages-container"></div>' +
                        '</div>' +
                    '</div>' +
                    
                   '<!-- Floating Input Area -->' +
                    '<div class="wwz-blizz-floating-input-wrapper">' +
                        '<div class="wwz-blizz-suggestions-container" id="wwz-blizz-suggestions-container" style="display: flex; opacity: 1; visibility: visible;">' +
                            suggestionsHtml +
                        '</div>' +
                        '<div class="wwz-blizz-scroll-to-bottom" id="wwz-blizz-scroll-to-bottom">' +
                             '<img src="' + baseUrl + 'assets/circle-arrow-down.svg" width="24" height="24" alt="Scroll">' +
                        '</div>' +
                        '<div class="wwz-blizz-input-container">' +
                            '<textarea id="wwz-blizz-message-input" placeholder="Stelle eine Frage" rows="1" autocomplete="off"></textarea>' +
                            '<div class="wwz-blizz-input-actions">' +
                                '<button class="wwz-blizz-input-btn wwz-blizz-send-btn" id="wwz-blizz-send-btn" title="Senden">' +
                                     '<img src="' + baseUrl + 'assets/send.svg" width="20" height="20" alt="Send">' +
                                '</button>' +
                            '</div>' +
                        '</div>' +
                         '<p class="wwz-blizz-disclaimer">Hier kommt ein rechtlicher Satz, Hinweis auf die <a href="#">AGB\'s</a></p>' +
                    '</div>' +
                '</main>' +
            '</div>';

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
