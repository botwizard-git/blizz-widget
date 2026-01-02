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

        // API Configuration
        apiEndpoint: 'https://blizz-api.botwizard.ch/chat',

        // Assets
        botAvatar: 'https://chatbot2go-hybrid.enterprisebot.co/assets/botForge/67031622bbfbfaaccecd88f0/wwz_rescaled_image.png',
        wwzLogo: 'https://chatbot2go-hybrid.enterprisebot.co/assets/botForge/67031622bbfbfaaccecd88f0/wwz_rescaled_image.png',
        launcherIcon: 'https://chatbot2go-hybrid.enterprisebot.co/assets/botForge/67031622bbfbfaaccecd88f0/rescaled_image.png',

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

        // Feedback screen
        feedbackQuestion: 'Wie war Ihre Erfahrung mit unserem digitalen Assistenten?',
        feedbackContinue: 'Weiter',
        feedbackDownload: 'Chat-Transkript',

        // Default suggestions
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
        retryDelay: 2000,
        maxRetries: 3,

        // Version
        version: '1.0.0'
    };
})();
