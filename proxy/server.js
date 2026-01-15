/**
 * Blizz Widget API Proxy Server
 * Securely forwards requests to EnterpriseBot API while hiding API keys
 *
 * Configuration: Uses environment variables with built-in defaults
 * GitHub secrets override defaults when deployed via CI/CD
 *
 * Routes:
 *   /:widgetId/chat       - Per-widget chat endpoint
 *   /:widgetId/feedback   - Per-widget feedback endpoint
 *   /:widgetId/contact    - Per-widget contact form endpoint
 *   /:widgetId/botflow    - Per-widget botflow endpoint
 *   /:widgetId/log_errors - Per-widget client error logging endpoint
 *   /chat, /feedback, /contact, /botflow, /log_errors - Legacy endpoints (backward compatible)
 */

require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
// Note: CORS is handled by nginx, not Express

// Global config
const config = {
    PORT: process.env.PORT || 3050,
    API_KEY: process.env.API_KEY || '',
    REQUEST_TIMEOUT: 120000, // 2 minutes in milliseconds
    COOKIE_SECRET: process.env.COOKIE_SECRET || crypto.randomBytes(32).toString('hex'),
    COOKIE_NAME: 'blizz_session',
    COOKIE_MAX_AGE: 24 * 60 * 60 // 24 hours in seconds
};

// Log warning if using auto-generated secret (won't persist across restarts)
if (!process.env.COOKIE_SECRET) {
    console.warn('[Blizz Proxy] WARNING: No COOKIE_SECRET set, using random secret (sessions will not persist across restarts)');
}

/**
 * Fetch with timeout wrapper
 */
async function fetchWithTimeout(url, options = {}) {
    return Promise.race([
        fetch(url, options),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), config.REQUEST_TIMEOUT)
        )
    ]);
}

// =============================================================================
// SESSION TOKEN GENERATION & VALIDATION
// =============================================================================

/**
 * Generate a signed session token
 * Format: {sessionId}:{timestamp}:{originHash}.{signature}
 */
function generateSessionToken(origin) {
    const sessionId = crypto.randomUUID();
    const timestamp = Math.floor(Date.now() / 1000);
    const originHash = crypto
        .createHash('sha256')
        .update(origin || 'unknown')
        .digest('hex')
        .substring(0, 8);

    const tokenData = `${sessionId}:${timestamp}:${originHash}`;
    const signature = crypto
        .createHmac('sha256', config.COOKIE_SECRET)
        .update(tokenData)
        .digest('hex')
        .substring(0, 16);

    return `${tokenData}.${signature}`;
}

/**
 * Validate a signed session token
 */
function validateSessionToken(signedToken, origin) {
    if (!signedToken) return null;

    const dotIndex = signedToken.lastIndexOf('.');
    if (dotIndex === -1) return null;

    const tokenData = signedToken.substring(0, dotIndex);
    const signature = signedToken.substring(dotIndex + 1);

    // Verify signature
    const expectedSignature = crypto
        .createHmac('sha256', config.COOKIE_SECRET)
        .update(tokenData)
        .digest('hex')
        .substring(0, 16);

    if (signature !== expectedSignature) {
        console.log('[Auth] Invalid token signature');
        return null;
    }

    // Parse token components
    const parts = tokenData.split(':');
    if (parts.length !== 3) return null;

    const [sessionId, timestamp, originHash] = parts;
    const tokenAge = Math.floor(Date.now() / 1000) - parseInt(timestamp, 10);

    // Check expiration
    if (tokenAge > config.COOKIE_MAX_AGE) {
        console.log('[Auth] Token expired');
        return null;
    }

    // Verify origin binding
    const expectedOriginHash = crypto
        .createHash('sha256')
        .update(origin || 'unknown')
        .digest('hex')
        .substring(0, 8);

    if (originHash !== expectedOriginHash) {
        console.log('[Auth] Origin mismatch');
        return null;
    }

    return { sessionId, timestamp: parseInt(timestamp, 10), originHash };
}

/**
 * Parse cookies from request header
 */
function parseCookies(cookieHeader) {
    const cookies = {};
    if (!cookieHeader) return cookies;

    cookieHeader.split(';').forEach(cookie => {
        const parts = cookie.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join('=').trim();
            cookies[key] = value;
        }
    });
    return cookies;
}

/**
 * Middleware to validate session cookie on protected routes
 */
function requireValidSession(req, res, next) {
    const cookies = parseCookies(req.headers.cookie);
    const sessionToken = cookies[config.COOKIE_NAME];
    const origin = req.headers.origin || req.headers.referer;

    const tokenData = validateSessionToken(sessionToken, origin);

    if (!tokenData) {
        console.log('[Auth] Request blocked - invalid or missing session cookie');
        return res.status(403).json({
            error: 'Invalid session',
            code: 'SESSION_REQUIRED',
            message: 'Please reload the widget to continue'
        });
    }

    req.sessionData = tokenData;
    next();
}

// Per-widget endpoint configurations
// Each widget can have its own backend endpoints (overridable via env vars)
const WIDGETS = {
    'wwz-blizz': {
        CHAT_ENDPOINT: process.env.WWZ_BLIZZ_CHAT_ENDPOINT ||
            'https://wwz-blitzico.enterprisebot.co/blitzdcbd6ccec92246ca8120ea00deabe70d',
        CHAT_ENDPOINT_INTERNAL: process.env.WWZ_BLIZZ_CHAT_ENDPOINT_INTERNAL ||
            'https://wwz-blitzico.enterprisebot.co/blitz155eadfb15e34cd59ad4bb9d7ade6269',
        FORM_ENDPOINT: process.env.WWZ_BLIZZ_FORM_ENDPOINT ||
            'https://wwz-blitzico.enterprisebot.co/blitze1ffae2f9a274b39b5f39e0f34dcadd2',
        FEEDBACK_ENDPOINT: process.env.WWZ_BLIZZ_FEEDBACK_ENDPOINT ||
            'https://wwz-blitzico.enterprisebot.co/blitz6870eedead344ed0b8cc6d0e8f0049a0',
        FEEDBACK_ENDPOINT_INTERNAL: process.env.WWZ_BLIZZ_FEEDBACK_ENDPOINT_INTERNAL ||
            'https://wwz-blitzico.enterprisebot.co/blitz267fe73aa1504f04829e90195b206def',
        BOTFLOW_ENDPOINT: process.env.WWZ_BLIZZ_BOTFLOW_ENDPOINT ||
            'https://wwz-blitzico.enterprisebot.co/blitz65aadf8a736349dd9ad6fd93ca69684f'
    },
    'wwz-ivy': {
        CHAT_ENDPOINT: process.env.WWZ_IVY_CHAT_ENDPOINT ||
            'https://wwz-blitzico.enterprisebot.co/blitz03429bf6c88d45dbbf47e3892e5c8e89',
        CHAT_ENDPOINT_INTERNAL: process.env.WWZ_IVY_CHAT_ENDPOINT_INTERNAL ||
            'https://wwz-blitzico.enterprisebot.co/blitz155eadfb15e34cd59ad4bb9d7ade6269',
        FORM_ENDPOINT: process.env.WWZ_IVY_FORM_ENDPOINT ||
            'https://wwz-blitzico.enterprisebot.co/blitze1ffae2f9a274b39b5f39e0f34dcadd2',
        FEEDBACK_ENDPOINT: process.env.WWZ_IVY_FEEDBACK_ENDPOINT ||
            'https://wwz-blitzico.enterprisebot.co/blitz19886b2a77cb47b3b31fa818b105cf4c',
        FEEDBACK_ENDPOINT_INTERNAL: process.env.WWZ_IVY_FEEDBACK_ENDPOINT_INTERNAL ||
            'https://wwz-blitzico.enterprisebot.co/blitz267fe73aa1504f04829e90195b206def',
        BOTFLOW_ENDPOINT: process.env.WWZ_IVY_BOTFLOW_ENDPOINT ||
            'https://wwz-blitzico.enterprisebot.co/blitz65aadf8a736349dd9ad6fd93ca69684f'
    }
};

// Default endpoints for legacy routes (backward compatibility)
const DEFAULTS = {
    CHAT_ENDPOINT: process.env.CHAT_ENDPOINT ||
        'https://wwz-blitzico.enterprisebot.co/blitzef18241476b1474580d2f58390a9cbae',
    FORM_ENDPOINT: process.env.FORM_ENDPOINT ||
        'https://wwz-blitzico.enterprisebot.co/blitz65aadf8a736349dd9ad6fd93ca69684f',
    FEEDBACK_ENDPOINT: process.env.FEEDBACK_ENDPOINT ||
        'https://wwz-blitzico.enterprisebot.co/blitz65aadf8a736349dd9ad6fd93ca69684f',
    BOTFLOW_ENDPOINT: process.env.BOTFLOW_ENDPOINT ||
        'https://wwz-blitzico.enterprisebot.co/blitz65aadf8a736349dd9ad6fd93ca69684f'
};

const app = express();

// CORS is handled entirely by nginx - no Express CORS middleware needed
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        widgets: Object.keys(WIDGETS),
        endpoints: {
            chat: true,
            contact: true,
            feedback: true,
            botflow: true,
            init: true,
            shops: true
        }
    });
});

// =============================================================================
// SHOPS ENDPOINTS (PUBLIC - no session required)
// =============================================================================

const SHOPS_FILE = path.join(__dirname, 'data', 'wwz-shops.json');

/**
 * Get all shop locations
 * GET /shops
 */
app.get('/shops', (req, res) => {
    try {
        const shopsData = JSON.parse(fs.readFileSync(SHOPS_FILE, 'utf8'));
        console.log('[Shops] Returning', shopsData.shops.length, 'shops');
        res.json(shopsData);
    } catch (error) {
        console.error('[Shops] Error reading shops file:', error.message);
        res.status(500).json({ error: 'Failed to load shops data' });
    }
});

/**
 * Add or update a shop location
 * POST /shops
 * Header: x-api-key: wwz-shops-admin-2026
 * Body: { shop: { id, name, shortName, address, contact, hours, services, googleMapsQuery } }
 */
const SHOPS_API_KEY = 'wwz-shops-admin-2026';

app.post('/shops', (req, res) => {
    try {
        // Check API key
        const apiKey = req.headers['x-api-key'];
        if (apiKey !== SHOPS_API_KEY) {
            console.log('[Shops] Unauthorized POST attempt');
            return res.status(401).json({ error: 'Invalid API key' });
        }

        const { shop } = req.body;

        if (!shop || !shop.id) {
            return res.status(400).json({ error: 'Shop data with id is required' });
        }

        // Always normalize shop ID to lowercase
        shop.id = shop.id.toLowerCase();

        // Read existing data
        let shopsData;
        try {
            shopsData = JSON.parse(fs.readFileSync(SHOPS_FILE, 'utf8'));
        } catch (e) {
            shopsData = { shops: [], metadata: { lastUpdated: null, version: '1.0' } };
        }

        // Find existing shop by id
        const existingIndex = shopsData.shops.findIndex(s => s.id === shop.id);

        if (existingIndex >= 0) {
            // Update existing shop
            shopsData.shops[existingIndex] = { ...shopsData.shops[existingIndex], ...shop };
            console.log('[Shops] Updated shop:', shop.id);
        } else {
            // Add new shop
            shopsData.shops.push(shop);
            console.log('[Shops] Added new shop:', shop.id);
        }

        // Update metadata
        shopsData.metadata.lastUpdated = new Date().toISOString();

        // Write back to file
        fs.writeFileSync(SHOPS_FILE, JSON.stringify(shopsData, null, 2), 'utf8');

        res.json({
            success: true,
            message: existingIndex >= 0 ? 'Shop updated' : 'Shop added',
            shop: shopsData.shops.find(s => s.id === shop.id)
        });

    } catch (error) {
        console.error('[Shops] Error saving shop:', error.message);
        res.status(500).json({ error: 'Failed to save shop data' });
    }
});

/**
 * Session initialization endpoint - sets the session cookie
 * GET /init or GET /:widgetId/init
 */
app.get(['/init', '/:widgetId/init'], (req, res) => {
    const origin = req.headers.origin;

    if (!origin) {
        console.log('[Init] Blocked - no origin header');
        return res.status(403).json({ error: 'Origin header required' });
    }

    const signedToken = generateSessionToken(origin);

    // Set the cookie with cross-origin compatible options
    const cookieValue = `${config.COOKIE_NAME}=${signedToken}; HttpOnly; Secure; SameSite=None; Max-Age=${config.COOKIE_MAX_AGE}; Path=/`;
    res.setHeader('Set-Cookie', cookieValue);

    // Prevent caching of init response so UI changes reflect immediately
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    console.log('[Init] Session created for origin:', origin);

    res.json({
        status: 'ok',
        message: 'Session initialized',
        timestamp: Date.now()
    });
});

/**
 * Get widget configuration or return null if not found
 */
function getWidgetConfig(widgetId) {
    return WIDGETS[widgetId] || null;
}

// =============================================================================
// PER-WIDGET ROUTES: /:widgetId/chat, /:widgetId/feedback, etc.
// =============================================================================

/**
 * Per-widget Chat endpoint
 * POST /:widgetId/chat
 */
app.post('/:widgetId/chat', requireValidSession, async (req, res) => {
    try {
        const { widgetId } = req.params;
        const widgetConfig = getWidgetConfig(widgetId);

        if (!widgetConfig) {
            return res.status(404).json({ error: `Unknown widget: ${widgetId}` });
        }

        const { blizzUserMsg, blizzSessionId, blizzBotMessageId, clientUrl, agentId, isInternal } = req.body;

        if (!blizzUserMsg) {
            return res.status(400).json({ error: 'blizzUserMsg is required' });
        }

        // Choose endpoint based on isInternal flag
        const endpoint = isInternal ? widgetConfig.CHAT_ENDPOINT_INTERNAL : widgetConfig.CHAT_ENDPOINT;
        const endpointType = isInternal ? 'INTERNAL' : 'EXTERNAL';

        console.log(`[${widgetId}/Chat ${endpointType}] Forwarding message:`, blizzUserMsg.substring(0, 50) + '...');

        const response = await fetchWithTimeout(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json, text/plain, */*',
                'api-key': config.API_KEY
            },
            body: JSON.stringify({
                blizzUserMsg,
                blizzSessionId,
                blizzBotMessageId,
                clientUrl
            })
        });

        // EnterpriseBot returns 404 with valid fallback message when it doesn't understand
        // Try to parse response body even on non-OK status
        const data = await response.json().catch(() => null);

        if (!response.ok) {
            console.error(`[${widgetId}/Chat] API status:`, response.status);
            // If we got a valid response body with message, return it anyway
            if (data && (data.message || data.simpleMessage)) {
                console.log(`[${widgetId}/Chat] Returning fallback response`);
                return res.json(data);
            }
            return res.status(response.status).json({ error: 'API request failed' });
        }

        console.log(`[${widgetId}/Chat] Response received`);
        res.json(data);

    } catch (error) {
        console.error(`[Chat] Error:`, error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * Per-widget Feedback endpoint
 * POST /:widgetId/feedback
 */
app.post('/:widgetId/feedback', requireValidSession, async (req, res) => {
    try {
        const { widgetId } = req.params;
        const widgetConfig = getWidgetConfig(widgetId);

        if (!widgetConfig) {
            return res.status(404).json({ error: `Unknown widget: ${widgetId}` });
        }

        const { blizzSessionId, rating, ratingComment, agentId, timestamp, sessionId, additionalFeedback, options, isInternal } = req.body;

        if (rating === undefined) {
            return res.status(400).json({ error: 'rating is required' });
        }

        console.log(`[${widgetId}/Feedback] Submitting rating:`, rating);
        const endpoint = isInternal ? widgetConfig.FEEDBACK_ENDPOINT_INTERNAL : widgetConfig.FEEDBACK_ENDPOINT;

        const response = await fetchWithTimeout(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json, text/plain, */*',
                'api-key': config.API_KEY
            },
            body: JSON.stringify({
                type: 'simpleMessage',
                message: JSON.stringify({
                    rating,
                    ratingComment,
                    options,
                    agentId,
                    widgetId,
                    blizzSessionId,
                    timestamp,
                    additionalFeedback,
                    options,
                    sessionId
                })
            })
        });

        if (!response.ok) {
            console.error(`[${widgetId}/Feedback] API error:`, response.status);
            return res.status(response.status).json({ error: 'Feedback submission failed' });
        }

        const data = await response.json();
        console.log(`[${widgetId}/Feedback] Rating submitted successfully`);
        res.json(data);

    } catch (error) {
        console.error(`[Feedback] Error:`, error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * Per-widget Contact form endpoint
 * POST /:widgetId/contact
 */
app.post('/:widgetId/contact', requireValidSession, async (req, res) => {
    try {
        const { widgetId } = req.params;
        const widgetConfig = getWidgetConfig(widgetId);

        if (!widgetConfig) {
            return res.status(404).json({ error: `Unknown widget: ${widgetId}` });
        }

        const { type, message, formData, agentId, formpayload, sessionId, timestamp } = req.body;

        let payload;
        if (type === 'simpleMessage' && message) {
            payload = { type, message, formData, widgetId, agentId, sessionId, timestamp };
            console.log(`[${widgetId}/Contact] Submitting form (simpleMessage format)`);
        } else if (formpayload) {
            payload = { formpayload };
            console.log(`[${widgetId}/Contact] Submitting form (legacy format)`);
        } else {
            return res.status(400).json({ error: 'Invalid payload format' });
        }

        const response = await fetchWithTimeout(widgetConfig.FORM_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json, text/plain, */*',
                'api-key': config.API_KEY
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            console.error(`[${widgetId}/Contact] API error:`, response.status);
            return res.status(response.status).json({ error: 'Form submission failed' });
        }

        const data = await response.json();
        console.log(`[${widgetId}/Contact] Form submitted successfully`);
        res.json(data);

    } catch (error) {
        console.error(`[Contact] Error:`, error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * Per-widget Botflow endpoint
 * POST /:widgetId/botflow
 */
app.post('/:widgetId/botflow', requireValidSession, async (req, res) => {
    try {
        const { widgetId } = req.params;
        const widgetConfig = getWidgetConfig(widgetId);

        if (!widgetConfig) {
            return res.status(404).json({ error: `Unknown widget: ${widgetId}` });
        }

        console.log(`[${widgetId}/Botflow] Forwarding request`);

        const response = await fetchWithTimeout(widgetConfig.BOTFLOW_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json, text/plain, */*',
                'api-key': config.API_KEY
            },
            body: JSON.stringify(req.body)
        });

        if (!response.ok) {
            console.error(`[${widgetId}/Botflow] API error:`, response.status);
            return res.status(response.status).json({ error: 'Botflow request failed' });
        }

        const data = await response.json();
        console.log(`[${widgetId}/Botflow] Response received`);
        res.json(data);

    } catch (error) {
        console.error(`[Botflow] Error:`, error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * Per-widget Error logging endpoint
 * POST /:widgetId/log_errors
 */
app.post('/:widgetId/log_errors', requireValidSession, (req, res) => {
    const { widgetId } = req.params;
    const { error, stack, context, timestamp, sessionId, userAgent } = req.body;

    if (!error) {
        return res.status(400).json({ error: 'error field is required' });
    }

    console.error(`[${widgetId}/ClientError]`, {
        error,
        stack: stack || 'N/A',
        context: context || {},
        timestamp: timestamp || new Date().toISOString(),
        sessionId: sessionId || 'unknown',
        userAgent: userAgent || req.headers['user-agent']
    });

    res.json({ success: true, message: 'Error logged' });
});

// =============================================================================
// LEGACY ROUTES: /chat, /feedback, /contact, /botflow (backward compatibility)
// =============================================================================

/**
 * Legacy Chat endpoint
 * POST /chat
 */
app.post('/chat', requireValidSession, async (req, res) => {
    try {
        const { blizzUserMsg, blizzSessionId, blizzBotMessageId, clientUrl, widgetId, agentId } = req.body;

        if (!blizzUserMsg) {
            return res.status(400).json({ error: 'blizzUserMsg is required' });
        }

        console.log('[Chat] Forwarding message:', blizzUserMsg.substring(0, 50) + '...');

        const response = await fetchWithTimeout(DEFAULTS.CHAT_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json, text/plain, */*',
                'api-key': config.API_KEY
            },
            body: JSON.stringify({
                blizzUserMsg,
                blizzSessionId,
                blizzBotMessageId,
                clientUrl
            })
        });

        // EnterpriseBot returns 404 with valid fallback message when it doesn't understand
        // Try to parse response body even on non-OK status
        const data = await response.json().catch(() => null);

        if (!response.ok) {
            console.error('[Chat] API status:', response.status);
            // If we got a valid response body with message, return it anyway
            if (data && (data.message || data.simpleMessage)) {
                console.log('[Chat] Returning fallback response');
                return res.json(data);
            }
            return res.status(response.status).json({ error: 'API request failed' });
        }

        console.log('[Chat] Response received');
        res.json(data);

    } catch (error) {
        console.error('[Chat] Error:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * Legacy Feedback endpoint
 * POST /feedback
 */
app.post('/feedback', requireValidSession, async (req, res) => {
    try {
        const { blizzSessionId, rating, ratingComment, agentId, widgetId, timestamp } = req.body;

        if (rating === undefined) {
            return res.status(400).json({ error: 'rating is required' });
        }

        console.log('[Feedback] Submitting rating:', rating);

        const response = await fetchWithTimeout(DEFAULTS.FEEDBACK_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json, text/plain, */*',
                'api-key': config.API_KEY
            },
            body: JSON.stringify({
                type: 'simpleMessage',
                message: JSON.stringify({
                    rating,
                    ratingComment,
                    agentId,
                    widgetId,
                    blizzSessionId,
                    timestamp
                })
            })
        });

        if (!response.ok) {
            console.error('[Feedback] API error:', response.status);
            return res.status(response.status).json({ error: 'Feedback submission failed' });
        }

        const data = await response.json();
        console.log('[Feedback] Rating submitted successfully');
        res.json(data);

    } catch (error) {
        console.error('[Feedback] Error:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * Legacy Contact form endpoint
 * POST /contact
 */
app.post('/contact', requireValidSession, async (req, res) => {
    try {
        const { type, message, formData, widgetId, agentId, formpayload, sessionId, timestamp } = req.body;

        let payload;
        if (type === 'simpleMessage' && message) {
            payload = { type, message, formData, widgetId, agentId, sessionId, timestamp };
            console.log('[Contact] Submitting form (simpleMessage format)');
        } else if (formpayload) {
            payload = { formpayload };
            console.log('[Contact] Submitting form (legacy format)');
        } else {
            return res.status(400).json({ error: 'Invalid payload format' });
        }

        const response = await fetchWithTimeout(DEFAULTS.FORM_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json, text/plain, */*',
                'api-key': config.API_KEY
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            console.error('[Contact] API error:', response.status);
            return res.status(response.status).json({ error: 'Form submission failed' });
        }

        const data = await response.json();
        console.log('[Contact] Form submitted successfully');
        res.json(data);

    } catch (error) {
        console.error('[Contact] Error:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * Legacy Botflow endpoint
 * POST /botflow
 */
app.post('/botflow', requireValidSession, async (req, res) => {
    try {
        console.log('[Botflow] Forwarding request');

        const response = await fetchWithTimeout(DEFAULTS.BOTFLOW_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json, text/plain, */*',
                'api-key': config.API_KEY
            },
            body: JSON.stringify(req.body)
        });

        if (!response.ok) {
            console.error('[Botflow] API error:', response.status);
            return res.status(response.status).json({ error: 'Botflow request failed' });
        }

        const data = await response.json();
        console.log('[Botflow] Response received');
        res.json(data);

    } catch (error) {
        console.error('[Botflow] Error:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * Legacy Error logging endpoint
 * POST /log_errors
 */
app.post('/log_errors', requireValidSession, (req, res) => {
    const { error, stack, context, widgetId, timestamp, sessionId, userAgent } = req.body;

    if (!error) {
        return res.status(400).json({ error: 'error field is required' });
    }

    console.error('[ClientError]', {
        error,
        stack: stack || 'N/A',
        context: context || {},
        widgetId: widgetId || 'unknown',
        timestamp: timestamp || new Date().toISOString(),
        sessionId: sessionId || 'unknown',
        userAgent: userAgent || req.headers['user-agent']
    });

    res.json({ success: true, message: 'Error logged' });
});

// =============================================================================
// FILE DOWNLOAD PROXY (bypasses CORS for external file downloads)
// =============================================================================

/**
 * Allowed domains for file downloads (security whitelist)
 */
const ALLOWED_DOWNLOAD_DOMAINS = [
    'www.wwz.ch',
    'wwz.ch'
];

/**
 * Download proxy endpoint
 * GET /download-proxy?url=<encoded-url>
 */
app.get('/download-proxy', requireValidSession, async (req, res) => {
    try {
        const { url } = req.query;

        if (!url) {
            return res.status(400).json({ error: 'URL parameter is required' });
        }

        // Parse and validate URL
        let parsedUrl;
        try {
            parsedUrl = new URL(url);
        } catch (e) {
            return res.status(400).json({ error: 'Invalid URL format' });
        }

        // Security: Only allow whitelisted domains
        const domain = parsedUrl.hostname.toLowerCase();
        if (!ALLOWED_DOWNLOAD_DOMAINS.includes(domain)) {
            console.log('[Download Proxy] Blocked domain:', domain);
            return res.status(403).json({ error: 'Domain not allowed for download proxy' });
        }

        console.log('[Download Proxy] Fetching:', url);

        const response = await fetchWithTimeout(url, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; BlizzWidget/1.0)'
            }
        });

        if (!response.ok) {
            console.error('[Download Proxy] Fetch failed:', response.status);
            return res.status(response.status).json({ error: 'Failed to fetch file' });
        }

        // Get content type and filename
        const contentType = response.headers.get('content-type') || 'application/octet-stream';
        const contentDisposition = response.headers.get('content-disposition');

        // Extract filename from URL if not in content-disposition
        let filename = parsedUrl.pathname.split('/').pop() || 'download';
        if (contentDisposition) {
            const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            if (match && match[1]) {
                filename = match[1].replace(/['"]/g, '');
            }
        }

        // Set response headers for download
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        // Forward content-length if available
        const contentLength = response.headers.get('content-length');
        if (contentLength) {
            res.setHeader('Content-Length', contentLength);
        }

        // Stream the response body
        const buffer = await response.buffer();
        console.log('[Download Proxy] Sending file:', filename, '(' + buffer.length + ' bytes)');
        res.send(buffer);

    } catch (error) {
        console.error('[Download Proxy] Error:', error.message);
        res.status(500).json({ error: 'Download proxy error' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('[Error]', err.message);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(config.PORT, () => {
    console.log(`[Blizz Proxy] Server running on port ${config.PORT}`);
    console.log(`[Blizz Proxy] Registered widgets:`, Object.keys(WIDGETS).join(', '));
    console.log(`[Blizz Proxy] Routes available:`);
    console.log(`  - Per-widget: /:widgetId/chat, /:widgetId/feedback, /:widgetId/contact, /:widgetId/botflow`);
    console.log(`  - Legacy: /chat, /feedback, /contact, /botflow`);
});
