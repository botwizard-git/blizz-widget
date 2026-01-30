/**
 * WWZ Ivy Chatbot - Configuration
 */
(function() {
    'use strict';

    window.WWZIvy = window.WWZIvy || {};

    window.WWZIvy.Config = {
        // Bot identity
        botName: 'Ivy',
        botTitle: 'Chatbot - Ivy',

        // API Configuration - all calls go through blizz-proxy
        apiEndpoint: 'https://blizz-api.botwizard.ch/wwz-ivy/chat',
        contactEndpoint: 'https://blizz-api.botwizard.ch/wwz-ivy/contact',
        initEndpoint: 'https://blizz-api.botwizard.ch/wwz-ivy/init',

        // Internal vs External mode - detected from container class
        isInternal: function() {
            const container = document.getElementById('wwz-ivy-parent');
            return container && container.classList.contains('wwz-internal');
        },

        // Assets
        botAvatar: 'https://chatbot2go-hybrid.enterprisebot.co/assets/botForge/67031622bbfbfaaccecd88f0/wwz_rescaled_image.png',
        wwzLogo: 'https://chatbot2go-hybrid.enterprisebot.co/assets/botForge/67031622bbfbfaaccecd88f0/wwz_rescaled_image.png',
        launcherIcon: 'https://chatbot2go-hybrid.enterprisebot.co/assets/botForge/67031622bbfbfaaccecd88f0/rescaled_image.png',

        // Widget behavior - device-specific auto-open
        autoOpen: {
            desktop: true,   // Auto-open on desktop (viewport > 480px)
            mobile: false    // Do NOT auto-open on mobile (viewport <= 480px)
        },

        // Welcome message (first bot message in chat)
        welcomeMessage: 'Willkommen beim Chat Service von WWZ. Ich bin Ivy und beantworte gerne Ihre Fragen zu unseren Produkten und Services. Bitte beachten sie, dass ich keinen direkten Zugang zu Kundendaten habe. Schliessen Sie das Chatfenster mit dem Kreuzchen oben rechts, um nach der Konversation Feedback zu geben.',

        // Welcome screen content (German)
        welcomeTitle: 'Guten Tag!',
        welcomeDescription: 'Unsere digitale Assistentin Ivy hilft Ihnen gerne weiter. Sie hat jedoch keinen direkten Zugang zu Kunden- und Rechnungsinformationen.',

        // Terms of service
        termsTitle: 'Nutzungsbedingungen:',
        termsContent: 'Bitte beachten Sie, dass die Antworten, die Sie von unserem Chat-Assistenten erhalten, auf einer künstlichen Intelligenz basieren. Obwohl wir stets bemüht sind, genaue und relevante Informationen bereitzustellen, kann der Chat-Assistent möglicherweise nicht alle Anfragen korrekt oder vollständig beantworten (insbesondere Preisangaben sind nicht rechtsverbindlich). Für verbindliche Informationen und spezifische Anfragen empfehlen wir Ihnen, sich direkt an unseren Kundendienst zu wenden.',
        acceptButton: 'Annehmen',
        declineButton: 'Ablehnen',

        // Chat UI text
        inputPlaceholder: 'Tippen Sie hier oder nutzen Sie das Mikrofon ...',
        sendButton: 'Senden',

        // Menu items
        menuNewChat: 'Neues Gespräch',
        menuFullscreen: 'Vollbild',

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
            downloadButton: 'Chat-Transkript'
        },

        // Thank you screen
        thankyou: {
            title: 'Vielen Dank!',
            description: 'Ihr Feedback hilft uns, unseren Service zu verbessern.',
            closeButton: 'Schliessen'
        },

        // Default suggestions (shown after welcome message)
        defaultSuggestions: [
            'Produktberatung'
        ],

        // Suggestions (legacy/fallback)
        suggestions: [
            'Strom und Energie',
            'Wasser',
            'E-Mobilität',
            'Kontakt'
        ],

        // Storage keys (prefixed to avoid conflicts)
        storageKeys: {
            userId: 'wwz_ivy_user_id',
            sessionId: 'wwz_ivy_session_id',
            messages: 'wwz_ivy_messages',
            collapsed: 'wwz_ivy_collapsed',
            termsAccepted: 'wwz_ivy_terms_accepted'
        },

        // Timing
        typingDelay: 500,

        // Widget dimensions
        widget: {
            width: 350,              // Desktop width in px
            height: 700,             // Desktop height in px
            minHeight: 500,          // Minimum height in px
            maxHeight: '90vh'        // Maximum height (viewport relative)
        },

        // Launcher button configuration
        launcher: {
            size: 60,           // Button size in px
            sizeMobile: 50      // Button size on mobile
        },

        // Widget position on screen
        position: {
            bottom: 15,         // Distance from bottom in px
            right: 20,          // Distance from right in px
            bottomMobile: 10,
            rightMobile: 10
        },

        // Version
        version: '1.0.0'
    };
})();
