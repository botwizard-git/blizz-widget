/**
 * WWZBlizz - Configuration
 */
(function() {
    'use strict';

    window.WWZBlizz = window.WWZBlizz || {};

    window.WWZBlizz.CONFIG = {
        // Widget identifier
        widgetId: 'wwz-blizz',

        // Agent ID for rating/feedback (bot-specific)
        AGENT_ID: 'blitz65aadf8a736349dd9ad6fd93ca69684f',

        // Bot display info
        botName: 'Ivy',
        botAvatar: 'https://chatbot2go-hybrid.enterprisebot.co/assets/botForge/67031622bbfbfaaccecd88f0/wwz_rescaled_image.png',

        // API endpoints (via proxy for security) - per-widget routes
        apiEndpoint: 'https://blizz-api.botwizard.ch/wwz-blizz/chat',
        RATING_API: 'https://blizz-api.botwizard.ch/wwz-blizz/feedback',
        CONTACT_FORM_API: 'https://blizz-api.botwizard.ch/wwz-blizz/contact',
        BOTFLOW_API: 'https://blizz-api.botwizard.ch/wwz-blizz/botflow',
        contactFormEndpoint: 'https://blizz-api.botwizard.ch/wwz-blizz/contact',

        // EB endpoint reference (for backend routing)
        EB_ENDPOINT_BASE: 'https://wwz-blitzico.enterprisebot.co',
        EB_AGENT_PATH: '/blitz65aadf8a736349dd9ad6fd93ca69684f',

        // Contact form trigger keyword
        contactFormTrigger: 'Kontaktformular',

        // UI settings
        welcomeMessage: 'Willkommen beim Chat Service. Ich bin Ivy und beantworte gerne Ihre Fragen zu unseren Produkten und Services.',

        // Default suggestions shown on welcome
        defaultSuggestions: [
            'Strom und Energie',
            'Wasser',
            'E-Mobilitat',
            'Kontaktformular'
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
                'Kontaktformular'
            ]
        },

        // Feedback screen configuration
        feedback: {
            question: 'Wie war Ihre Erfahrung mit unserem digitalen Assistenten?',
            ratingLabels: {
                1: 'Sehr mangelhaft',
                2: 'Mangelhaft',
                3: 'Befriedigend',
                4: 'Gut',
                5: 'Sehr gut'
            },
            // Per-rating follow-up questions
            ratingQuestions: {
                1: 'Was war das Problem?',
                2: 'Was war das Problem?',
                3: 'Was können wir verbessern?',
                4: 'Was hat Ihnen gefallen?',
                5: 'Was hat Ihnen gefallen?'
            },
            // Per-rating options
            ratingOptions: {
                1: [
                    'Falsche Antworten',
                    'Verstand mich nicht',
                    'Technisches Problem',
                    'Zu langsam'
                ],
                2: [
                    'Antworten nicht hilfreich',
                    'Problem nicht gelöst',
                    'Schwer zu bedienen',
                    'Dauerte zu lange'
                ],
                3: [
                    'Teilweise hilfreich',
                    'Könnte schneller sein',
                    'Mehr Details gewünscht',
                    'Benutzerfreundlichkeit'
                ],
                4: [
                    'Hilfreiche Antworten',
                    'Einfach zu verwenden',
                    'Schnelle Reaktion',
                    'Fast alles gelöst'
                ],
                5: [
                    'Sehr hilfreiche Antworten',
                    'Einfach zu verwenden',
                    'Hat mein Problem gelöst',
                    'Sehr effizient'
                ]
            },
            // Text input configuration
            additionalFeedbackLabel: 'Zusätzliches Feedback geben',
            additionalFeedbackPlaceholder: 'Ihr Feedback hier eingeben...',
            sendButton: 'Feedback senden',
            continueButton: 'Weiter',
            downloadButton: 'Chat-Transkript',
            skipButton: 'Feedback überspringen'
        },

        // Thank you screen
        thankyou: {
            title: 'Vielen Dank!',
            description: 'Ihr Feedback hilft uns, unseren Service zu verbessern.',
            closeButton: 'Schliessen'
        },

        // Error handling
        maxRetries: 3,
        retryDelay: 2000,

        // File upload limits
        maxFileSize: 10 * 1024 * 1024, // 10MB
        allowedFileTypes: '.pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif',

        // Dummy YouTube video for testing
        dummyYoutubeVideo: {
            title: 'WWZ Erklärvideo',
            thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
            videoId: 'dQw4w9WgXcQ',
            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        },

        // WWZ Shop locations for Google Maps
        wwzShops: {
            'metalli': {
                name: 'WWZ-Shop Zug (EKZ Metalli)',
                address: 'Baarerstrasse 20, 6300 Zug',
                phone: '+41 41 748 48 48',
                email: 'info@wwz.ch',
                query: 'WWZ+Shop+Metalli+Zug+Switzerland',
                hours: [
                    { days: 'Mo-Fr', time: '08:00 - 18:30' },
                    { days: 'Sa', time: '08:00 - 17:00' },
                    { days: 'So', time: 'Geschlossen' }
                ]
            },
            'affoltern': {
                name: 'WWZ-Shop Affoltern a.A.',
                address: 'Bahnhofstrasse 2, 8910 Affoltern am Albis',
                phone: '+41 41 748 48 48',
                email: 'info@wwz.ch',
                query: 'WWZ+Shop+Affoltern+am+Albis+Switzerland',
                hours: [
                    { days: 'Mo-Fr', time: '08:30 - 12:00, 13:30 - 18:00' },
                    { days: 'Sa', time: '08:30 - 12:00' },
                    { days: 'So', time: 'Geschlossen' }
                ]
            },
            'goldau': {
                name: 'WWZ-Shop Goldau',
                address: 'Parkstrasse 9, 6410 Goldau',
                phone: '+41 41 748 48 48',
                email: 'info@wwz.ch',
                query: 'WWZ+Shop+Goldau+Switzerland',
                hours: [
                    { days: 'Mo-Fr', time: '08:30 - 12:00, 13:30 - 18:00' },
                    { days: 'Sa', time: '08:30 - 12:00' },
                    { days: 'So', time: 'Geschlossen' }
                ]
            },
            'hochdorf': {
                name: 'WWZ-Shop Hochdorf',
                address: 'Hauptstrasse 10, 6280 Hochdorf',
                phone: '+41 41 748 48 48',
                email: 'info@wwz.ch',
                query: 'WWZ+Shop+Hochdorf+Switzerland',
                hours: [
                    { days: 'Mo-Fr', time: '08:30 - 12:00, 13:30 - 18:00' },
                    { days: 'Sa', time: '08:30 - 12:00' },
                    { days: 'So', time: 'Geschlossen' }
                ]
            },
            'kussnacht': {
                name: 'WWZ-Shop Küssnacht',
                address: 'Bahnhofstrasse 17, 6403 Küssnacht am Rigi',
                phone: '+41 41 748 48 48',
                email: 'info@wwz.ch',
                query: 'WWZ+Shop+Küssnacht+Switzerland',
                hours: [
                    { days: 'Mo-Fr', time: '08:30 - 12:00, 13:30 - 18:00' },
                    { days: 'Sa', time: '08:30 - 12:00' },
                    { days: 'So', time: 'Geschlossen' }
                ]
            },
            'reiden': {
                name: 'WWZ-Shop Reiden',
                address: 'Bahnhofstrasse 5, 6260 Reiden',
                phone: '+41 41 748 48 48',
                email: 'info@wwz.ch',
                query: 'WWZ+Shop+Reiden+Switzerland',
                hours: [
                    { days: 'Mo-Fr', time: '08:30 - 12:00, 13:30 - 18:00' },
                    { days: 'Sa', time: '08:30 - 12:00' },
                    { days: 'So', time: 'Geschlossen' }
                ]
            },
            'schoftland': {
                name: 'WWZ-Shop Schöftland',
                address: 'Hauptstrasse 12, 5040 Schöftland',
                phone: '+41 41 748 48 48',
                email: 'info@wwz.ch',
                query: 'WWZ+Shop+Schöftland+Switzerland',
                hours: [
                    { days: 'Mo-Fr', time: '08:30 - 12:00, 13:30 - 18:00' },
                    { days: 'Sa', time: '08:30 - 12:00' },
                    { days: 'So', time: 'Geschlossen' }
                ]
            },
            'unterageri': {
                name: 'WWZ-Shop Unterägeri',
                address: 'Zugerstrasse 45, 6314 Unterägeri',
                phone: '+41 41 748 48 48',
                email: 'info@wwz.ch',
                query: 'WWZ+Shop+Unterägeri+Switzerland',
                hours: [
                    { days: 'Mo-Fr', time: '08:30 - 12:00, 13:30 - 18:00' },
                    { days: 'Sa', time: '08:30 - 12:00' },
                    { days: 'So', time: 'Geschlossen' }
                ]
            }
        }
    };

    // Storage keys for localStorage (prefixed to avoid conflicts)
    window.WWZBlizz.STORAGE_KEYS = {
        USER_ID: 'wwz_blizz_userId',
        SESSION_ID: 'wwz_blizz_sessionId',
        MESSAGES: 'wwz_blizz_messages',
        SESSION_METADATA: 'wwz_blizz_sessionMeta',
        COLLAPSED: 'wwz_blizz_collapsed'
    };

    console.log('[WWZBlizz] Config loaded');
})();
