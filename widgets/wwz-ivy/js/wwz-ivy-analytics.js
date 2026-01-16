/**
 * WWZ Ivy Chatbot - Analytics (Mixpanel)
 * Fail-safe analytics wrapper - errors should never affect widget functionality
 */
(function() {
    'use strict';

    window.WWZIvy = window.WWZIvy || {};

    var Storage = window.WWZIvy.Storage;

    // Mixpanel configuration
    var MIXPANEL_TOKEN = '7d8aa98dbd591a75b705d74b57cb23fd';
    var MIXPANEL_CONFIG = {
        autocapture: false,  // Disable auto-tracking of page events (scrolls, clicks, etc.)
        record_sessions_percent: 100,
        api_host: 'https://api-eu.mixpanel.com'
    };

    // Track initialization state
    var isInitialized = false;
    var initializationPromise = null;

    /**
     * Safe wrapper for all analytics calls
     * Ensures errors never propagate to main widget
     */
    function safeCall(fn) {
        return function() {
            try {
                return fn.apply(this, arguments);
            } catch (error) {
                console.warn('[WWZIvy Analytics] Error:', error.message);
                return undefined;
            }
        };
    }

    /**
     * Get common properties included with every event
     */
    function getCommonProperties() {
        try {
            return {
                sessionId: Storage.getSessionId(),
                userId: Storage.getUserId(),
                widgetVersion: window.WWZIvy.Config ? window.WWZIvy.Config.version : 'unknown',
                pageUrl: window.location.href,
                pageTitle: document.title,
                timestamp: new Date().toISOString()
            };
        } catch (e) {
            return {};
        }
    }

    window.WWZIvy.Analytics = {
        /**
         * Dynamically load Mixpanel SDK
         */
        loadSDK: function() {
            return new Promise(function(resolve, reject) {
                try {
                    // Check if already loaded
                    if (window.mixpanel && typeof window.mixpanel.init === 'function' && window.mixpanel.__loaded) {
                        resolve(window.mixpanel);
                        return;
                    }

                    // Mixpanel snippet (from official docs, adapted for dynamic loading)
                    (function(f, b) {
                        if (!b.__SV) {
                            var e, g, i, h;
                            window.mixpanel = b;
                            b._i = [];
                            b.init = function(e, f, c) {
                                function g(a, d) {
                                    var b = d.split(".");
                                    2 == b.length && ((a = a[b[0]]), (d = b[1]));
                                    a[d] = function() {
                                        a.push([d].concat(Array.prototype.slice.call(arguments, 0)));
                                    };
                                }
                                var a = b;
                                "undefined" !== typeof c ? (a = b[c] = []) : (c = "mixpanel");
                                a.people = a.people || [];
                                a.toString = function(a) {
                                    var d = "mixpanel";
                                    "mixpanel" !== c && (d += "." + c);
                                    a || (d += " (stub)");
                                    return d;
                                };
                                a.people.toString = function() {
                                    return a.toString(1) + ".people (stub)";
                                };
                                i = "disable time_event track track_pageview track_links track_forms track_with_groups add_group set_group remove_group register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking start_batch_senders start_session_recording stop_session_recording people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user people.remove".split(" ");
                                for (h = 0; h < i.length; h++) g(a, i[h]);
                                var n = "set set_once union unset remove delete".split(" ");
                                a.get_group = function() {
                                    function d(p) {
                                        c[p] = function() {
                                            a.push([g, [p].concat(Array.prototype.slice.call(arguments, 0))]);
                                        };
                                    }
                                    for (var c = {}, g = ["get_group"].concat(Array.prototype.slice.call(arguments, 0)), m = 0; m < n.length; m++) d(n[m]);
                                    return c;
                                };
                                b._i.push([e, f, c]);
                            };
                            b.__SV = 1.2;
                            e = f.createElement("script");
                            e.type = "text/javascript";
                            e.async = true;
                            e.src = "https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";
                            e.onload = function() {
                                window.mixpanel.__loaded = true;
                                resolve(window.mixpanel);
                            };
                            e.onerror = function() {
                                reject(new Error('Failed to load Mixpanel SDK'));
                            };
                            g = f.getElementsByTagName("script")[0];
                            g.parentNode.insertBefore(e, g);
                        } else {
                            resolve(window.mixpanel);
                        }
                    })(document, window.mixpanel || []);

                    // Set timeout for slow networks
                    setTimeout(function() {
                        if (!window.mixpanel || !window.mixpanel.__loaded) {
                            reject(new Error('Mixpanel SDK load timeout'));
                        }
                    }, 10000);

                } catch (error) {
                    reject(error);
                }
            });
        },

        /**
         * Initialize Mixpanel
         */
        init: safeCall(function() {
            var self = this;

            if (initializationPromise) {
                return initializationPromise;
            }

            initializationPromise = this.loadSDK()
                .then(function() {
                    window.mixpanel.init(MIXPANEL_TOKEN, MIXPANEL_CONFIG);

                    // Identify user by sessionId
                    var sessionId = Storage.getSessionId();
                    var userId = Storage.getUserId();

                    window.mixpanel.identify(sessionId);
                    window.mixpanel.people.set({
                        $name: sessionId,
                        userId: userId,
                        firstSeen: new Date().toISOString()
                    });

                    isInitialized = true;
                    console.log('[WWZIvy Analytics] Initialized successfully');

                    // Track session start/resume
                    self.trackSessionStart();

                    return true;
                })
                .catch(function(error) {
                    console.warn('[WWZIvy Analytics] Initialization failed:', error.message);
                    isInitialized = false;
                    return false;
                });

            return initializationPromise;
        }),

        /**
         * Check if analytics is ready
         */
        isReady: function() {
            return isInitialized && window.mixpanel;
        },

        /**
         * Core track method with fail-safe wrapper
         */
        track: safeCall(function(eventName, properties) {
            if (!this.isReady()) {
                return;
            }

            var eventProperties = Object.assign({}, getCommonProperties(), properties || {});
            window.mixpanel.track(eventName, eventProperties);
        }),

        // ============================================
        // Session Events
        // ============================================

        trackSessionStart: safeCall(function() {
            var isNewSession = !localStorage.getItem('wwz_ivy_session_tracked');
            this.track(isNewSession ? 'Session Started' : 'Session Resumed', {
                isNewSession: isNewSession
            });
            localStorage.setItem('wwz_ivy_session_tracked', 'true');
        }),

        trackNewSession: safeCall(function(newSessionId) {
            localStorage.removeItem('wwz_ivy_session_tracked');

            // Re-identify with new session
            if (this.isReady()) {
                window.mixpanel.identify(newSessionId);
                window.mixpanel.people.set({
                    $name: newSessionId,
                    lastSessionStart: new Date().toISOString()
                });
            }

            this.track('New Session Started', {
                newSessionId: newSessionId
            });
        }),

        // ============================================
        // Widget Interaction Events
        // ============================================

        trackWidgetOpen: safeCall(function(context) {
            context = context || {};
            this.track('Widget Opened', {
                source: context.source || 'launcher_click',
                termsAccepted: context.termsAccepted || false,
                hasExistingMessages: context.hasExistingMessages || false
            });
        }),

        trackWidgetClose: safeCall(function(context) {
            context = context || {};
            this.track('Widget Closed', {
                messageCount: context.messageCount || 0
            });
        }),

        trackWidgetMinimize: safeCall(function() {
            this.track('Widget Minimized');
        }),

        // ============================================
        // Terms Events
        // ============================================

        trackTermsAccepted: safeCall(function() {
            this.track('Terms Accepted');
        }),

        trackTermsDeclined: safeCall(function() {
            this.track('Terms Declined');
        }),

        // ============================================
        // Message Events
        // ============================================

        trackMessageSent: safeCall(function(context) {
            context = context || {};
            this.track('Message Sent', {
                messageLength: context.messageLength || 0,
                wasSuggestion: context.wasSuggestion || false
            });
        }),

        trackMessageReceived: safeCall(function(context) {
            context = context || {};
            this.track('Message Received', {
                hasReferences: context.hasReferences || false,
                hasSuggestions: context.hasSuggestions || false,
                isContactForm: context.isContactForm || false,
                responseTimeMs: context.responseTimeMs || 0
            });
        }),

        // ============================================
        // Suggestion Events
        // ============================================

        trackSuggestionClicked: safeCall(function(suggestion) {
            this.track('Suggestion Clicked', {
                suggestion: suggestion
            });
        }),

        // ============================================
        // Error Events
        // ============================================

        trackAPIError: safeCall(function(context) {
            context = context || {};
            this.track('API Error', {
                endpoint: context.endpoint || 'unknown',
                statusCode: context.statusCode || null,
                errorMessage: context.errorMessage || '',
                isTimeout: context.isTimeout || false
            });
        }),

        // ============================================
        // Feedback Events
        // ============================================

        trackFeedbackRatingSelected: safeCall(function(rating) {
            this.track('Feedback Rating Selected', {
                rating: rating
            });
        }),

        trackFeedbackSubmitted: safeCall(function(context) {
            context = context || {};
            this.track('Feedback Submitted', {
                rating: context.rating || 0,
                hasOptions: (context.options && context.options.length > 0) || false,
                optionCount: context.options ? context.options.length : 0,
                hasAdditionalFeedback: !!context.additionalFeedback
            });
        }),

        trackFeedbackSkipped: safeCall(function() {
            this.track('Feedback Skipped');
        }),

        // ============================================
        // Voice Events
        // ============================================

        trackVoiceInputStarted: safeCall(function() {
            this.track('Voice Input Started');
        }),

        trackVoiceInputCompleted: safeCall(function(context) {
            context = context || {};
            this.track('Voice Input Completed', {
                success: context.success || false,
                transcriptLength: context.transcriptLength || 0
            });
        }),

        // ============================================
        // Contact Form Events
        // ============================================

        trackContactFormSubmitted: safeCall(function(context) {
            context = context || {};
            this.track('Contact Form Submitted', {
                success: context.success || false
            });
        })
    };
})();
