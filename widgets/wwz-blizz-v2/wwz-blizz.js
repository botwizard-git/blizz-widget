/**
 * WWZBlizz v3 - Exact Design Implementation
 */
(function() {
    'use strict';

    window.WWZBlizz = window.WWZBlizz || {};

    var scripts = document.getElementsByTagName('script');
    var currentScript = scripts[scripts.length - 1];
    var baseUrl = currentScript.src.replace(/wwz-blizz\.js.*$/, '');

    var modules = [
        'js/wwz-blizz-config.js',
        'js/wwz-blizz-storage.js',
        'js/wwz-blizz-api.js',
        'js/wwz-blizz-state.js',
        'js/wwz-blizz-ui.js',
        'js/wwz-blizz-events.js',
        'js/wwz-blizz-main.js'
    ];

    function loadCSS(href, callback) {
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.onload = callback;
        link.onerror = function() { if (callback) callback(); };
        document.head.appendChild(link);
    }

    function loadScript(src, callback) {
        var script = document.createElement('script');
        script.src = src;
        script.onload = callback;
        script.onerror = function() { if (callback) callback(); };
        document.body.appendChild(script);
    }

    function loadModules(index) {
        if (index >= modules.length) {
            injectHTML();
            return;
        }
        loadScript(baseUrl + modules[index] + '?v=' + Date.now(), function() {
            loadModules(index + 1);
        });
    }

    function injectHTML() {
        var parent = document.getElementById('wwz-blizz-parent');
        if (!parent) {
            console.error('[WWZBlizz] Parent not found');
            return;
        }

        var CONFIG = window.WWZBlizz.CONFIG || {};
        if (CONFIG.botAvatar) {
            CONFIG.botAvatar = baseUrl + 'assets/bot_with_star.png';
        }

        parent.innerHTML = 
            '<div class="wwz-blizz-app-container" id="wwz-blizz-container">' +
                
                // Header - No buttons in chat view (moved to bottom tabs)
                
                // Main Content
                '<main class="wwz-blizz-main-content" id="wwz-blizz-main">' +
                    
                    // Privacy Popup
                    '<div class="wwz-blizz-privacy-popup wwz-blizz-hidden" id="wwz-blizz-privacy-modal">' +
                        '<button class="wwz-blizz-privacy-close" id="wwz-blizz-privacy-close">' +
                            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                                '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>' +
                            '</svg>' +
                        '</button>' +
                        '<div class="wwz-blizz-privacy-header">' +
                            '<img src="' + baseUrl + 'assets/bot_with_star.png" alt="Blizz" class="wwz-blizz-privacy-avatar">' +
                            '<h3 class="wwz-blizz-privacy-title">Ich bin Blizz, der digitale Assistent der WWZ.</h3>' +
                        '</div>' +
                        '<p class="wwz-blizz-privacy-text">Meine Antworten werden von einer künstlichen Intelligenz generiert und sind deshalb nicht immer korrekt. Wenn Du mich aktivierst, unterstütze ich Dich bei der Suche nach den richtigen Informationen.</p>' +
                        '<a href="https://www.wwz.ch/datenschutz" target="_blank" class="wwz-blizz-privacy-link">' +
                            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                                '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>' +
                                '<polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>' +
                            '</svg>' +
                            'Datenschutzbestimmungen' +
                        '</a>' +
                    '</div>' +
                    
                    // Welcome Screen - IMAGE 2
                    '<div class="wwz-blizz-welcome-screen" id="wwz-blizz-welcome-screen">' +
                        
                        // Logo
                        '<div class="wwz-blizz-welcome-logo">' +
                            '<img src="' + baseUrl + 'assets/blizz-logo.svg" alt="Blizz">' +
                        '</div>' +
                        
                        // Title
                        '<h1 class="wwz-blizz-welcome-title">Wie kann<br>ich dir helfen?</h1>' +
                        
                        // Search Box
                        '<div class="wwz-blizz-search-wrapper">' +
                            '<div class="wwz-blizz-search-box">' +
                                '<input type="text" class="wwz-blizz-search-input" id="wwz-blizz-search-input" placeholder="Stelle eine Frage" autocomplete="off">' +
                                '<button class="wwz-blizz-search-btn" id="wwz-blizz-search-btn">' +
                                    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">' +
                                        '<line x1="12" y1="19" x2="12" y2="5"></line>' +
                                        '<polyline points="5 12 12 5 19 12"></polyline>' +
                                    '</svg>' +
                                '</button>' +
                            '</div>' +
                        '</div>' +
                        
                        // Suggestion Links
                        '<div class="wwz-blizz-suggestion-links">' +
                            '<div class="wwz-blizz-suggestion-link" data-suggestion="Wie kontaktiere ich Blizz">Wie kontaktiere ich Blizz</div>' +
                            '<div class="wwz-blizz-suggestion-link" data-suggestion="Wo finde ich eine Bedienungsanleitung?">Wo finde ich eine Bedienungsanleitung?</div>' +
                            '<div class="wwz-blizz-suggestion-link" data-suggestion="Was sind Mehrwert-dienste?">Was sind Mehrwert-dienste?</div>' +
                        '</div>' +
                        
                        // Tabs
                        '<div class="wwz-blizz-tabs">' +
                            '<button class="wwz-blizz-tab active" data-tab="themen">' +
                                '<span class="wwz-blizz-tab-icon">' +
                                    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">' +
                                        '<circle cx="12" cy="12" r="10"/>' +
                                        '<polyline points="8 12 12 16 16 12"/>' +
                                        '<line x1="12" y1="8" x2="12" y2="16"/>' +
                                    '</svg>' +
                                '</span>' +
                                'Themen' +
                            '</button>' +
                            '<button class="wwz-blizz-tab" data-tab="info">' +
                                '<span class="wwz-blizz-tab-icon">' +
                                    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">' +
                                        '<circle cx="12" cy="12" r="9"/>' +
                                        '<line x1="12" y1="11" x2="12" y2="16" stroke-width="2"/>' +
                                        '<circle cx="12" cy="7.5" r="1" fill="currentColor" stroke="none"/>' +
                                    '</svg>' +
                                '</span>' +
                                'Info' +
                            '</button>' +
                        '</div>' +
                        
                        // Categories
                        '<div class="wwz-blizz-categories">' +
                            
                            // Mobile Daten - Non-collapsible with checkmarks
                            '<div class="wwz-blizz-category-card" data-category="mobile">' +
                                '<div class="wwz-blizz-category-header">' +
                                    '<div class="wwz-blizz-category-icon">' +
                                        '<img src="' + baseUrl + 'assets/icon-mobile.svg" alt="">' +
                                    '</div>' +
                                    '<div class="wwz-blizz-category-title">Mobile Daten</div>' +
                                '</div>' +
                                '<div class="wwz-blizz-category-items">' +
                                    '<div class="wwz-blizz-category-item" data-item="mobile-1">' +
                                        '<span class="wwz-blizz-category-item-text" data-xurrentarticle="485233">Festnetz</span>' +
                                        '<div class="wwz-blizz-category-item-check">' +
                                            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">' +
                                                '<polyline points="6 9 12 15 18 9"></polyline>' +
                                            '</svg>' +
                                        '</div>' +
                                    '</div>' +
                                    '<div class="wwz-blizz-category-item" data-item="mobile-2">' +
                                        '<span class="wwz-blizz-category-item-text">Festnetz</span>' +
                                        '<div class="wwz-blizz-category-item-check">' +
                                            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">' +
                                                '<polyline points="6 9 12 15 18 9"></polyline>' +
                                            '</svg>' +
                                        '</div>' +
                                    '</div>' +
                                    '<div class="wwz-blizz-category-item" data-item="mobile-3">' +
                                        '<span class="wwz-blizz-category-item-text">Festnetz</span>' +
                                        '<div class="wwz-blizz-category-item-check">' +
                                            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">' +
                                                '<polyline points="6 9 12 15 18 9"></polyline>' +
                                            '</svg>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                            
                            // Internet - Non-collapsible with checkmarks
                            '<div class="wwz-blizz-category-card" data-category="internet">' +
                                '<div class="wwz-blizz-category-header">' +
                                    '<div class="wwz-blizz-category-icon">' +
                                        '<img src="' + baseUrl + 'assets/icon-internet.svg" alt="">' +
                                    '</div>' +
                                    '<div class="wwz-blizz-category-title">Internet</div>' +
                                '</div>' +
                                '<div class="wwz-blizz-category-items">' +
                                    '<div class="wwz-blizz-category-item" data-item="internet-1">' +
                                        '<span class="wwz-blizz-category-item-text">Festnetz</span>' +
                                        '<div class="wwz-blizz-category-item-check">' +
                                            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">' +
                                                '<polyline points="6 9 12 15 18 9"></polyline>' +
                                            '</svg>' +
                                        '</div>' +
                                    '</div>' +
                                    '<div class="wwz-blizz-category-item" data-item="internet-2">' +
                                        '<span class="wwz-blizz-category-item-text">Festnetz</span>' +
                                        '<div class="wwz-blizz-category-item-check">' +
                                            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">' +
                                                '<polyline points="6 9 12 15 18 9"></polyline>' +
                                            '</svg>' +
                                        '</div>' +
                                    '</div>' +
                                    '<div class="wwz-blizz-category-item" data-item="internet-3">' +
                                        '<span class="wwz-blizz-category-item-text">Festnetz</span>' +
                                        '<div class="wwz-blizz-category-item-check">' +
                                            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">' +
                                                '<polyline points="6 9 12 15 18 9"></polyline>' +
                                            '</svg>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                            
                        '</div>' +
                        
                        // Contact Section
                        '<div class="wwz-blizz-contact-section">' +
                            '<div class="wwz-blizz-contact-text">Keine passende Antwort gefunden?</div>' +
                            '<button class="wwz-blizz-contact-btn" id="wwz-blizz-contact-btn">Kontaktiere uns</button>' +
                        '</div>' +
                        
                    '</div>' +
                    
                    // Chat Screen - IMAGE 3
                    '<div class="wwz-blizz-chat-screen wwz-blizz-hidden" id="wwz-blizz-chat-screen">' +
                        '<div class="wwz-blizz-messages-container" id="wwz-blizz-messages-container"></div>' +
                    '<div class="wwz-blizz-suggestions-container" id="wwz-blizz-suggestions-container"></div>' +
                    '</div>' +
                    
                    // Floating Input - IMAGE 3
                    '<div class="wwz-blizz-floating-input-wrapper wwz-blizz-hidden" id="wwz-blizz-floating-input">' +
                        
                        // Input Box
                        '<div class="wwz-blizz-chat-input-wrapper">' +
                            '<div class="wwz-blizz-chat-input-box">' +
                                '<textarea class="wwz-blizz-chat-input" id="wwz-blizz-message-input" placeholder="Stelle eine Frage" rows="1" autocomplete="off"></textarea>' +
                                '<button class="wwz-blizz-chat-send-btn" id="wwz-blizz-send-btn">' +
                                    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">' +
                                        '<line x1="12" y1="19" x2="12" y2="5"></line>' +
                                        '<polyline points="5 12 12 5 19 12"></polyline>' +
                                    '</svg>' +
                                '</button>' +
                            '</div>' +
                        '</div>' +
                        
                        // Disclaimer
                        '<p class="wwz-blizz-disclaimer">Alle Angaben ohne Gewähr. Hinweis auf die <a href="#">AGB\'s</a></p>' +
                        
                        // Bottom Tabs
                        '<div class="wwz-blizz-bottom-tabs">' +
                            '<button class="wwz-blizz-bottom-tab" id="wwz-blizz-bottom-themen">' +
                                '<span class="wwz-blizz-bottom-tab-icon">' +
                                    '<img src="' + baseUrl + 'assets/circle-arrow-down.svg" alt="">' +
                                '</span>' +
                                'Themen' +
                            '</button>' +
                            '<button class="wwz-blizz-bottom-tab" id="wwz-blizz-bottom-info">' +
                                '<span class="wwz-blizz-bottom-tab-icon">' +
                                    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">' +
                                        '<circle cx="12" cy="12" r="9"/>' +
                                        '<line x1="12" y1="11" x2="12" y2="16" stroke-width="2"/>' +
                                        '<circle cx="12" cy="7.5" r="1" fill="currentColor" stroke="none"/>' +
                                    '</svg>' +
                                '</span>' +
                                'Info' +
                            '</button>' +
                            '<button class="wwz-blizz-bottom-tab" id="wwz-blizz-bottom-newchat">' +
                                '<span class="wwz-blizz-bottom-tab-icon">' +
                                    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">' +
                                        '<circle cx="12" cy="12" r="10"/>' +
                                        '<line x1="12" y1="8" x2="12" y2="16"/>' +
                                        '<line x1="8" y1="12" x2="16" y2="12"/>' +
                                    '</svg>' +
                                '</span>' +
                                'Neuer Chat' +
                            '</button>' +
                        '</div>' +
                        
                    '</div>' +
                    
                '</main>' +
            '</div>';

        initInteractions();

        if (window.WWZBlizz.Main) {
            window.WWZBlizz.Main.init();
        }
    }

    function initInteractions() {
        // Category items click
        document.querySelectorAll('.wwz-blizz-category-item').forEach(function(item) {
            item.addEventListener('click', function() {
                var textSpan = this.querySelector('.wwz-blizz-category-item-text');
                var xurrentArticleId = textSpan ? textSpan.getAttribute('data-xurrentarticle') : null;

                // Always save category from parent card
                var card = this.closest('.wwz-blizz-category-card');
                if (card) {
                    var category = card.getAttribute('data-category');
                    if (category) {
                        localStorage.setItem('enterprisebot-blizz-product-category', category);
                        console.log('[WWZBlizz] Category saved to localStorage:', category);
                    }
                }

                // If xurrent article → show text as user msg, send XURRENT_{id} to API
                if (xurrentArticleId) {
                    var displayText = textSpan ? textSpan.innerHTML : '';
                    if (window.WWZBlizz.Events && window.WWZBlizz.Events.handleXurrentArticleClick) {
                        window.WWZBlizz.Events.handleXurrentArticleClick(xurrentArticleId, displayText);
                    }
                }
            });
        });

        // Category header click - save category to localStorage
        document.querySelectorAll('.wwz-blizz-category-header').forEach(function(header) {
            header.addEventListener('click', function() {
                var card = this.closest('.wwz-blizz-category-card');
                if (card) {
                    var category = card.getAttribute('data-category');
                    if (category) {
                        localStorage.setItem('enterprisebot-blizz-product-category', category);
                        console.log('[WWZBlizz] Category saved from header click:', category);
                    }
                }
            });
        });

        // Tab switching
        document.querySelectorAll('.wwz-blizz-tab').forEach(function(tab) {
            tab.addEventListener('click', function() {
                document.querySelectorAll('.wwz-blizz-tab').forEach(function(t) { t.classList.remove('active'); });
                this.classList.add('active');
            });
        });

        // Search
        var searchInput = document.getElementById('wwz-blizz-search-input');
        var searchBtn = document.getElementById('wwz-blizz-search-btn');
        
        if (searchBtn && searchInput) {
            searchBtn.addEventListener('click', function() {
                var text = searchInput.value.trim();
                if (text && window.WWZBlizz.Events) {
                    window.WWZBlizz.Events.handleSuggestionClick(text);
                }
            });
            searchInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    var text = this.value.trim();
                    if (text && window.WWZBlizz.Events) {
                        window.WWZBlizz.Events.handleSuggestionClick(text);
                    }
                }
            });
        }

        // Suggestion links
        document.querySelectorAll('.wwz-blizz-suggestion-link').forEach(function(link) {
            link.addEventListener('click', function() {
                var text = this.getAttribute('data-suggestion');
                if (text && window.WWZBlizz.Events) {
                    window.WWZBlizz.Events.handleSuggestionClick(text);
                }
            });
        });

        // Contact button
        var contactBtn = document.getElementById('wwz-blizz-contact-btn');
        if (contactBtn) {
            contactBtn.addEventListener('click', function() {
                if (window.WWZBlizz.Events) {
                    window.WWZBlizz.Events.handleSuggestionClick('Kontaktformular');
                }
            });
        }

        // Bottom tabs
        var themenTab = document.getElementById('wwz-blizz-bottom-themen');
        if (themenTab) {
            themenTab.addEventListener('click', function() {
                if (window.WWZBlizz.UI && window.WWZBlizz.UI.showWelcomeScreen) {
                    window.WWZBlizz.UI.showWelcomeScreen();
                }
            });
        }

        var newChatTab = document.getElementById('wwz-blizz-bottom-newchat');
        if (newChatTab) {
            newChatTab.addEventListener('click', function() {
                if (window.WWZBlizz.Main && window.WWZBlizz.Main.startNewSession) {
                    window.WWZBlizz.Main.startNewSession();
                }
            });
        }
    }

    function init() {
        loadCSS(baseUrl + 'wwz-blizz.css', function() {
            loadModules(0);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
