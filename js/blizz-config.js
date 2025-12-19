/**
 * EnterpriseBotBlizz - Configuration
 */
(function() {
    'use strict';

    window.EnterpriseBotBlizz = window.EnterpriseBotBlizz || {};

    window.EnterpriseBotBlizz.CONFIG = {
        // Bot display info
        botName: 'Ivy',
        botAvatar: 'https://chatbot2go-hybrid.enterprisebot.co/assets/botForge/67031622bbfbfaaccecd88f0/wwz_rescaled_image.png',

        // API configuration
        apiEndpoint: 'https://wwz-blitzico.enterprisebot.co/blitzef18241476b1474580d2f58390a9cbae',
        apiKey: '6RVK0CSH6RS34RK2CSH6CRB1CDHPARV470W6CC3W64VK4E1J6MTKACSH6RSKJ',

        // UI settings
        welcomeMessage: 'Willkommen beim Chat Service. Ich bin Ivy und beantworte gerne Ihre Fragen zu unseren Produkten und Services.',

        // Default suggestions shown on welcome
        defaultSuggestions: [
            'Strom und Energie',
            'Wasser',
            'E-Mobilitat',
            'Kontakt'
        ],

        // Auto-reply greetings (no API call needed)
        greetings: {
            keywords: [
                'hi', 'hello', 'hey', 'hallo', 'guten tag', 'guten morgen',
                'guten abend', 'gruss', 'gruezi', 'servus', 'moin', 'hoi',
                'greetings', 'good morning', 'good evening', 'good afternoon'
            ],
            response: 'Hallo! Wie kann ich Ihnen heute helfen? Sie konnen mir Ihre Frage direkt stellen oder eine der Optionen unten wahlen.',
            suggestions: [
                'Strom und Energie',
                'Wasser',
                'E-Mobilitat',
                'Kontakt'
            ]
        },

        // Error handling
        maxRetries: 3,
        retryDelay: 2000,

        // File upload limits
        maxFileSize: 10 * 1024 * 1024, // 10MB
        allowedFileTypes: '.pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif'
    };

    // Storage keys for localStorage (prefixed to avoid conflicts)
    window.EnterpriseBotBlizz.STORAGE_KEYS = {
        USER_ID: 'enterprisebot_blizz_userId',
        SESSION_ID: 'enterprisebot_blizz_sessionId',
        MESSAGES: 'enterprisebot_blizz_messages',
        SESSION_METADATA: 'enterprisebot_blizz_sessionMeta',
        COLLAPSED: 'enterprisebot_blizz_collapsed'
    };

    console.log('[EnterpriseBotBlizz] Config loaded');
})();
