/**
 * WWZ Blizz Chatbot - Configuration
 */
(function() {
    'use strict';

    window.WWZBlizz = window.WWZBlizz || {};

    window.WWZBlizz.CONFIG = {
        // Bot identity
        botName: 'Blizz',
        botTitle: 'Chatbot - Blizz',
        widgetId: 'wwz-blizz',

        // Agent ID for rating/feedback (bot-specific)
        agentId: 'blitz65aadf8a736349dd9ad6fd93ca69684f',

        // API Configuration - all calls go through blizz-proxy
        apiEndpoint: 'https://blizz-api.botwizard.ch/wwz-blizz/chat-v2',
        feedbackEndpoint: 'https://blizz-api.botwizard.ch/wwz-blizz/feedback',
        thumbsFeedbackEndpoint: 'https://blizz-api.botwizard.ch/wwz-blizz/thumbs-feedback',
        contactEndpoint: 'https://blizz-api.botwizard.ch/wwz-blizz/contact',
        initEndpoint: 'https://blizz-api.botwizard.ch/wwz-blizz/init',
        logErrorsEndpoint: 'https://blizz-api.botwizard.ch/wwz-blizz/log_errors',
        shopsEndpoint: 'https://blizz-api.botwizard.ch/shops',

        // Google Maps API Configuration
        googleMapsApiKey: '', // Add your Google Maps Embed API key here

        // Internal vs External mode - detected from container class
        isInternal: function() {
            var container = document.getElementById('wwz-blizz-parent');
            return container && container.classList.contains('wwz-internal');
        },

        // Assets
        botAvatar: 'https://chatbot2go-hybrid.enterprisebot.co/assets/botForge/67031622bbfbfaaccecd88f0/wwz_rescaled_image.png',
        wwzLogo: 'https://chatbot2go-hybrid.enterprisebot.co/assets/botForge/67031622bbfbfaaccecd88f0/wwz_rescaled_image.png',

        // Widget behavior
        autoOpen: false,

        // Welcome screen content
        welcomeTitle: 'Wie kann ich dir<br>helfen?',
        welcomeSubtitle: '',
        welcomeDescription: 'Unsere digitale Assistentin Blizz hilft Dir gerne weiter. Sie hat jedoch keinen direkten Zugang zu Kunden- und Rechnungsinformationen.',

        // Chat UI text
        inputPlaceholder: 'Stelle mir eine Frage...',
        sendButton: 'Senden',
        disclaimerText: 'Der Chatbot kann Fehler machen. Bitte überprüfe wichtige Informationen.',

        // Privacy/Disclaimer popup
        privacy: {
            title: 'der digitale Assistent der WWZ.',
            description: 'Meine Antworten werden von einer künstlichen Intelligenz generiert und sind deshalb nicht immer korrekt. Wenn Du mich aktivierst, unterstütze ich Dich bei der Suche nach den richtigen Informationen.',
            linkText: 'Datenschutzbestimmungen',
            linkUrl: 'https://www.wwz.ch/datenschutz'
        },

        // End chat button
        endChatButton: 'Chat beenden & Feedback geben',

        // Feedback screen configuration
        feedback: {
            question: 'Wie war Deine Erfahrung mit unserem digitalen Assistenten?',
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
                4: 'Was hat Dir gefallen?',
                5: 'Was hat Dir gefallen?'
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
            additionalFeedbackPlaceholder: 'Dein Feedback hier eingeben...',
            sendButton: 'Feedback senden',
            downloadButton: 'Chat-Transkript',
            skipButton: 'Feedback überspringen'
        },

        // Thank you screen
        thankyou: {
            title: 'Vielen Dank!',
            description: 'Dein Feedback hilft uns, unseren Service zu verbessern.',
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

        // Dummy YouTube video for demo
        dummyYoutubeVideo: {
            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
            title: 'WWZ Video'
        },

        // Demo search_results for testing (used when API doesn't return search_results)
        demoSearchResults: [
            { title: "Blizz Mobile", url: "https://www.wwz.ch/-/media/hilfe/anleitungen/mobile-anleitungen/kurznummern_blizz_mobile.pdf", icon: "doc" },
            { title: "www.wwz.ch", url: "https://www.wwz.ch/de/privatpersonen/telekommunikation/mobile", icon: "web" }
        ],

        // Video library for fuzzy matching
        videoLibrary: [
            {"title": "Installationsvideo WLAN-Router Calix GS5229E-2", "url": "https://www.youtube.com/embed/zVmJKCJIoOA"},
            {"title": "Nachts über die Autobahn: So entsteht ein Energie-Meilenstein", "url": "https://www.youtube.com/embed/yud39q1Y6vQ"},
            {"title": "Swiss Arc Award 2025 für Energiezentrale Unterfeld", "url": "https://www.youtube.com/embed/G-WzBVVF6fw"},
            {"title": "Installationsvideo Glasfasermodem (FTTH)", "url": "https://www.youtube.com/embed/2S-mVp0zHzM"},
            {"title": "Sanierung im Rebberg – mit Präzision, Innovation und Teamarbeit.", "url": "https://www.youtube.com/embed/FFv8hVr9ZPk"},
            {"title": "Generalprobe Rohrbrücke Hochdorf – Ausbau Fernwärmenetz Ennetsee", "url": "https://www.youtube.com/embed/Zd3CgFvwF_g"},
            {"title": "Licht an: Die Industriestrasse in Zug erstrahlt neu", "url": "https://www.youtube.com/embed/-HdaubjC0fg"},
            {"title": "WWZ engagiert sich für Bienen und Biodiversität", "url": "https://www.youtube.com/embed/ulx8-Z2aCVY"},
            {"title": "Start Guide - Blizz TV", "url": "https://www.youtube.com/embed/fW35Rjc4-P8"},
            {"title": "Installationsvideo Blizz TV-Box", "url": "https://www.youtube.com/embed/K9ez2riI6uc"},
            {"title": "Wir sind WWZ", "url": "https://www.youtube.com/embed/L-YBhstryxc"},
            {"title": "Abwärme ist eine wertvolle Ressource", "url": "https://www.youtube.com/embed/nrlyq9B-cJc"},
            {"title": "Baustart Wärmeverbund Steinhausen", "url": "https://www.youtube.com/embed/xwon3ZnPY_s"},
            {"title": "Erklärvideo: Installation WWZ-Calix GS5229E-2 WLAN-Router", "url": "https://www.youtube.com/embed/Idbjw8R4GJ0"},
            {"title": "WWZ-Wärme- und Kälteverbund: Die Vorteile im Überblick", "url": "https://www.youtube.com/embed/chwA3MoCCEs"},
            {"title": "Werde Netzelektriker/in EFZ – deine Zukunft beginnt hier", "url": "https://www.youtube.com/embed/C8W88IMpH6k"},
            {"title": "Nachhaltige Energie aus dem Herzen von Zug", "url": "https://www.youtube.com/embed/VOdhc3ooCPQ"},
            {"title": "Was machst du am 1. August?", "url": "https://www.youtube.com/embed/fhgo8D73wPs"},
            {"title": "Sicherstellung der Stromversorgung für unsere Kunden", "url": "https://www.youtube.com/embed/34gEX1dMm1U"},
            {"title": "Von Öl zu Fernwärme: Ein Gemeinschaftsprojekt in Hünenberg See", "url": "https://www.youtube.com/embed/08JGc28DWoo"},
            {"title": "Transportleitung Wärmeverbund Ennetsee: Zweite Etappe", "url": "https://www.youtube.com/embed/MCt4q5jksWQ"},
            {"title": "Kids-Watch Erfahrungsbericht: Sicherheit und Spass im Alltag", "url": "https://www.youtube.com/embed/6gkOB3P8qbY"},
            {"title": "Hinter den Kulissen: Erneuerung des Trinkwassernetzes in Zug", "url": "https://www.youtube.com/embed/nLhx55YwQp8"},
            {"title": "Digitales Meldewesen bei WWZ", "url": "https://www.youtube.com/embed/XVdLTOy6x44"},
            {"title": "Erklärvideo: Installation WWZ-Zyxel WLAN-Routers", "url": "https://www.youtube.com/embed/BKJPiaHyz2Q"},
            {"title": "Erklärvideo: Installation WWZ-Calix GS2028E-2 WLAN-Routers", "url": "https://www.youtube.com/embed/aVwmf3fOFKU"},
            {"title": "Erklärvideo: Installation WWZ-Kabelmodem Sagemcom", "url": "https://www.youtube.com/embed/Zhj62j66v24"},
            {"title": "Erklärvideo: Installation WWZ-Kabelmodem Infinity", "url": "https://www.youtube.com/embed/N6kF-nPSetY"},
            {"title": "Erklärvideo: Installation TV-Box von WWZ", "url": "https://www.youtube.com/embed/iDwMY3lnjDo"},
            {"title": "Erklärvideo: Installation FTTH-Modem von WWZ", "url": "https://www.youtube.com/embed/LoJ7JmFa3wU"},
            {"title": "Wichtige Tipps für die Installation von PV-Anlagen, Wärmepumpe oder einer Ladelösung", "url": "https://www.youtube.com/embed/bzPWVsoHjec"},
            {"title": "WWZ-App readyhome+", "url": "https://www.youtube.com/embed/JrzVp5w8QCc"},
            {"title": "Wir bauen eine nachhaltige Infrastruktur für die kommenden Generationen", "url": "https://www.youtube.com/embed/MVme3z8qY68"},
            {"title": "Wünschen Sie technische Unterstützung? Wir kommen zu Ihnen nach Hause.", "url": "https://www.youtube.com/embed/ao8J5PgyeAk"},
            {"title": "Einfach Solarstrom teilen", "url": "https://www.youtube.com/embed/7jPh58YOa6M"},
            {"title": "Wir freuen uns darauf, Sie an der Zuger Messe 2023 zu treffen!", "url": "https://www.youtube.com/embed/Eb1d5eIEVrc"},
            {"title": "Wir freuen uns darauf, Sie an der Zuger Messe 2023 zu treffen!", "url": "https://www.youtube.com/embed/HHeaHW2llNw"},
            {"title": "Wir freuen uns darauf, Sie an der Zuger Messe 2023 zu treffen!", "url": "https://www.youtube.com/embed/iqbU4y6irYQ"},
            {"title": "Wir freuen uns darauf, Sie an der Zuger Messe 2023 zu treffen!", "url": "https://www.youtube.com/embed/P5WA6ZoXx38"},
            {"title": "Riecht es nach verfaulten Eiern?", "url": "https://www.youtube.com/embed/7p7aWeBgFSo"},
            {"title": "Wir denken Energielösungen neu", "url": "https://www.youtube.com/embed/F5GwpJhkFgE"},
            {"title": "Alles aus einer Hand", "url": "https://www.youtube.com/embed/ZlO5KJUInCk"},
            {"title": "Wie schützen wir unser Trinkwasser?", "url": "https://www.youtube.com/embed/m8g4f7QyYbU"},
            {"title": "Wasser sparen im Garten", "url": "https://www.youtube.com/embed/GFpIBYAQMvw"},
            {"title": "Arbeitssicherheit stets im Fokus", "url": "https://www.youtube.com/embed/5JLbZi28xgo"},
            {"title": "Wir sind immer für dich da", "url": "https://www.youtube.com/embed/xFvosuZqaPY"},
            {"title": "Stabiles WLAN dank Plume HomePass", "url": "https://www.youtube.com/embed/p4Ucaqf171w"},
            {"title": "Höchste Qualität und Zuverlässigkeit haben oberste Priorität", "url": "https://www.youtube.com/embed/MvuH2DsLaLs"},
            {"title": "Kundensupport: Wir sind für dich da", "url": "https://www.youtube.com/embed/W2S5uX9CVFk"},
            {"title": "Umweltfreundlich drucken", "url": "https://www.youtube.com/embed/aS0zvj1briU"},
            {"title": "Wie aus Klärschlamm Biogas entsteht", "url": "https://www.youtube.com/embed/T1tDKXwHA0A"},
            {"title": "Leckortung Wasserleitungsbruch: Auf uns ist Verlass", "url": "https://www.youtube.com/embed/dPt9MJeuJbE"},
            {"title": "So wird mit Wasser Bier gebraut", "url": "https://www.youtube.com/embed/dFY9spamRvk"},
            {"title": "Refurbished Modem: So werden Modems recycelt", "url": "https://www.youtube.com/embed/pIr6UK7aGOA"},
            {"title": "Unsere Wärmeverbunde schützen nachhaltig das Klima", "url": "https://www.youtube.com/embed/wu6eyNrHQ-g"},
            {"title": "Wie kann ich nachhaltig heizen?", "url": "https://www.youtube.com/embed/XB8nQOBttH8"},
            {"title": "Gemeinsam mit dir vernetzen wir kompetent, schnell und verlässlich", "url": "https://www.youtube.com/embed/3rq3cKX3ly4"},
            {"title": "Schaffe mit uns einen Mehrwert für unsere Kundinnen und Kunden", "url": "https://www.youtube.com/embed/epxgE5Au7G8"},
            {"title": "Gestalte mit uns die Energieversorgung der Zukunft", "url": "https://www.youtube.com/embed/1VosJVMPzd0"},
            {"title": "Circulago, die klimafreundliche Wärmelösung aus Zug", "url": "https://www.youtube.com/embed/IR3Lm5e6O0U"},
            {"title": "Sendung Energie, Tele 1: Wie berechnet man die Strompreise?", "url": "https://www.youtube.com/embed/Wi44XXBprAE"},
            {"title": "Gaming Spass dank schnellem Internet", "url": "https://www.youtube.com/embed/EQo0E57coX4"},
            {"title": "Lehre als Netzelektriker/in bei WWZ Energie AG", "url": "https://www.youtube.com/embed/vyGkCAwzrAM"},
            {"title": "Lehre als Logistiker/in bei WWZ Energie AG", "url": "https://www.youtube.com/embed/NAhp1mwEfIE"},
            {"title": "Mit viel Zug in die Zukunft", "url": "https://www.youtube.com/embed/GqvMKpM_PWA"},
            {"title": "Ladelösungen für mehrere Parteien – readyhome+", "url": "https://www.youtube.com/embed/IpgCtmK0XKU"},
            {"title": "Smartmeter", "url": "https://www.youtube.com/embed/AhPE_8bg66U"},
            {"title": "Circulago im Gespräch", "url": "https://www.youtube.com/embed/E2JkpdMoLLQ"},
            {"title": "Projekt Circulago - Wärme und Kälte aus dem Zugersee", "url": "https://www.youtube.com/embed/J41aePPR-IM"},
            {"title": "Vorflutleitung Stadt Zug Microtunneling", "url": "https://www.youtube.com/embed/A6aC81Mwa48"}
        ],

        // Auto-reply greetings (no API call needed)
        greetings: {
            keywords: [
                'hi', 'hello', 'hey', 'hallo', 'guten tag', 'guten morgen',
                'guten abend', 'gruss', 'gruezi', 'servus', 'moin', 'hoi',
                'greetings', 'good morning', 'good evening', 'good afternoon'
            ],
            response: 'Hallo! Wie kann ich Dir heute helfen? Du kannst mir Deine Frage direkt stellen oder eine der Optionen unten wählen.',
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
            collapsed: 'wwz_blizz_collapsed',
            sessionStartTime: 'wwz_blizz_sessionStartTime',
            cookieInitTime: 'wwz_blizz_cookieInitTime',
            hasAnswer: 'wwz_blizz_hasAnswer'
        },

        // Server cookie validity (should match server's COOKIE_MAX_AGE)
        // Server sets 24 hours, we use 23 hours as buffer
        cookieMaxAge: 23 * 60 * 60 * 1000, // 23 hours in milliseconds

        // Session timeout configuration
        // Session persists until user manually ends it OR this timeout is reached
        // Set to 0 or null to disable timeout (session persists indefinitely until manual end)
        sessionTimeout: 30 * 60 * 1000, // 30 minutes in milliseconds (configurable)

        // Timing
        typingDelay: 500,
        requestTimeout: 120000, // 120 seconds (2 minutes) timeout for API calls

        // Error handling
        maxRetries: 3,
        retryDelay: 2000,

        // Version
        version: '1.0.0',

        // Shop locations (populated dynamically from API)
        wwzShops: {},

        // Map pins for aggregated map view (populated dynamically from API)
        wwzShopsMapPins: [],

        // Google Maps API Key for aggregated map view
        googleMapsApiKey: 'AIzaSyBTvcdtHGjy75_BPuBM--cLStR36VBndFY'
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
        COLLAPSED: window.WWZBlizz.CONFIG.storageKeys.collapsed,
        SESSION_START_TIME: window.WWZBlizz.CONFIG.storageKeys.sessionStartTime,
        COOKIE_INIT_TIME: window.WWZBlizz.CONFIG.storageKeys.cookieInitTime,
        HAS_ANSWER: window.WWZBlizz.CONFIG.storageKeys.hasAnswer
    };

    console.log('[WWZBlizz] Config loaded');
})();
