/**
 * WWZ Blizz Chatbot - Configuration
 */
(function() {
    'use strict';

    window.WWZBlizz = window.WWZBlizz || {};

    window.WWZBlizz.CONFIG = {
        // Bot identity
        botName: 'Ivy',
        botTitle: 'Chatbot - Ivy',
        widgetId: 'wwz-blizz',

        // Agent ID for rating/feedback (bot-specific)
        agentId: 'blitz65aadf8a736349dd9ad6fd93ca69684f',

        // API Configuration - all calls go through blizz-proxy
        apiEndpoint: 'https://blizz-api.botwizard.ch/wwz-blizz/chat',
        feedbackEndpoint: 'https://blizz-api.botwizard.ch/wwz-blizz/feedback',
        contactEndpoint: 'https://blizz-api.botwizard.ch/wwz-blizz/contact',

        // Assets
        botAvatar: 'https://chatbot2go-hybrid.enterprisebot.co/assets/botForge/67031622bbfbfaaccecd88f0/wwz_rescaled_image.png',
        wwzLogo: 'https://chatbot2go-hybrid.enterprisebot.co/assets/botForge/67031622bbfbfaaccecd88f0/wwz_rescaled_image.png',

        // Widget behavior
        autoOpen: false,

        // Welcome screen content
        welcomeTitle: 'Wie kann ich Ihnen helfen?',
        welcomeSubtitle: 'Ihr digitaler Assistent.',
        welcomeDescription: 'Unsere digitale Assistentin Ivy hilft Ihnen gerne weiter. Sie hat jedoch keinen direkten Zugang zu Kunden- und Rechnungsinformationen.',

        // Chat UI text
        inputPlaceholder: 'Stellen Sie mir eine Frage...',
        sendButton: 'Senden',
        disclaimerText: 'Der Chatbot kann Fehler machen. Bitte überprüfen Sie wichtige Informationen.',

        // Privacy/Disclaimer popup
        privacy: {
            title: 'der digitale Assistent der WWZ.',
            description: 'Meine Antworten werden von einer künstlichen Intelligenz generiert und sind deshalb nicht immer korrekt. Wenn Sie mich aktivieren, unterstütze ich Sie bei der Suche nach den richtigen Informationen.',
            linkText: 'Datenschutzbestimmungen',
            linkUrl: 'https://www.wwz.ch/datenschutz'
        },

        // End chat button
        endChatButton: 'Chat beenden & Feedback geben',

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
            ratingQuestions: {
                1: 'Was war das Problem?',
                2: 'Was war das Problem?',
                3: 'Was können wir verbessern?',
                4: 'Was hat Ihnen gefallen?',
                5: 'Was hat Ihnen gefallen?'
            },
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
            additionalFeedbackLabel: 'Zusätzliches Feedback geben',
            additionalFeedbackPlaceholder: 'Ihr Feedback hier eingeben...',
            sendButton: 'Feedback senden',
            downloadButton: 'Chat-Transkript',
            skipButton: 'Feedback überspringen'
        },

        // Thank you screen
        thankyou: {
            title: 'Vielen Dank!',
            description: 'Ihr Feedback hilft uns, unseren Service zu verbessern.',
            closeButton: 'Schliessen'
        },

        // Default suggestions
        suggestions: [
            'Internet',
            'Mobile',
            'TV',
            'Festnetz'
        ],

        // Contact form trigger keyword
        contactFormTrigger: 'Kontaktformular',

        // Auto-reply greetings (no API call needed)
        greetings: {
            keywords: [
                'hi', 'hello', 'hey', 'hallo', 'guten tag', 'guten morgen',
                'guten abend', 'gruss', 'gruezi', 'servus', 'moin', 'hoi',
                'greetings', 'good morning', 'good evening', 'good afternoon'
            ],
            response: 'Hallo! Wie kann ich Ihnen heute helfen? Sie können mir Ihre Frage direkt stellen oder eine der Optionen unten wählen.',
            suggestions: [
                'Strom und Energie',
                'Wasser',
                'E-Mobilität',
                'Kontaktformular'
            ]
        },

        // Storage keys (prefixed to avoid conflicts)
        storageKeys: {
            userId: 'wwz_blizz_userId',
            sessionId: 'wwz_blizz_sessionId',
            messages: 'wwz_blizz_messages',
            sessionMeta: 'wwz_blizz_sessionMeta',
            collapsed: 'wwz_blizz_collapsed'
        },

        // Timing
        typingDelay: 500,
        requestTimeout: 120000, // 120 seconds (2 minutes) timeout for API calls

        // Error handling
        maxRetries: 3,
        retryDelay: 2000,

        // Version
        version: '1.0.0'
    };

    // Legacy support - map old property names
    window.WWZBlizz.CONFIG.AGENT_ID = window.WWZBlizz.CONFIG.agentId;
    window.WWZBlizz.CONFIG.RATING_API = window.WWZBlizz.CONFIG.feedbackEndpoint;
    window.WWZBlizz.CONFIG.CONTACT_FORM_API = window.WWZBlizz.CONFIG.contactEndpoint;
    window.WWZBlizz.CONFIG.defaultSuggestions = window.WWZBlizz.CONFIG.suggestions;

    // Legacy storage keys support
    window.WWZBlizz.STORAGE_KEYS = {
        USER_ID: window.WWZBlizz.CONFIG.storageKeys.userId,
        SESSION_ID: window.WWZBlizz.CONFIG.storageKeys.sessionId,
        MESSAGES: window.WWZBlizz.CONFIG.storageKeys.messages,
        SESSION_METADATA: window.WWZBlizz.CONFIG.storageKeys.sessionMeta,
        COLLAPSED: window.WWZBlizz.CONFIG.storageKeys.collapsed
    };

    console.log('[WWZBlizz] Config loaded');
})();
