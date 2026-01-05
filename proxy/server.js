/**
 * Blizz Widget API Proxy Server
 * Securely forwards requests to EnterpriseBot API while hiding API keys
 *
 * Configuration: Uses environment variables with built-in defaults
 * GitHub secrets override defaults when deployed via CI/CD
 *
 * Routes:
 *   /:widgetId/chat     - Per-widget chat endpoint
 *   /:widgetId/feedback - Per-widget feedback endpoint
 *   /:widgetId/contact  - Per-widget contact form endpoint
 *   /:widgetId/botflow  - Per-widget botflow endpoint
 *   /chat, /feedback, /contact, /botflow - Legacy endpoints (backward compatible)
 */

require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
// Note: CORS is handled by nginx, not Express

// Global config
const config = {
    PORT: process.env.PORT || 3050,
    API_KEY: process.env.API_KEY || '',
    REQUEST_TIMEOUT: 120000 // 2 minutes in milliseconds
};

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

// Per-widget endpoint configurations
// Each widget can have its own backend endpoints (overridable via env vars)
const WIDGETS = {
    'wwz-blizz': {
        CHAT_ENDPOINT: process.env.WWZ_BLIZZ_CHAT_ENDPOINT ||
            'https://wwz-blitzico.enterprisebot.co/blitzdcbd6ccec92246ca8120ea00deabe70d',
        FORM_ENDPOINT: process.env.WWZ_BLIZZ_FORM_ENDPOINT ||
            'https://wwz-blitzico.enterprisebot.co/blitze1ffae2f9a274b39b5f39e0f34dcadd2',
        FEEDBACK_ENDPOINT: process.env.WWZ_BLIZZ_FEEDBACK_ENDPOINT ||
            'https://wwz-blitzico.enterprisebot.co/blitz65aadf8a736349dd9ad6fd93ca69684f',
        BOTFLOW_ENDPOINT: process.env.WWZ_BLIZZ_BOTFLOW_ENDPOINT ||
            'https://wwz-blitzico.enterprisebot.co/blitz65aadf8a736349dd9ad6fd93ca69684f'
    },
    'wwz-ivy': {
        CHAT_ENDPOINT: process.env.WWZ_IVY_CHAT_ENDPOINT ||
            'https://wwz-blitzico.enterprisebot.co/blitz03429bf6c88d45dbbf47e3892e5c8e89',
        FORM_ENDPOINT: process.env.WWZ_IVY_FORM_ENDPOINT ||
            'https://wwz-blitzico.enterprisebot.co/blitze1ffae2f9a274b39b5f39e0f34dcadd2',
        FEEDBACK_ENDPOINT: process.env.WWZ_IVY_FEEDBACK_ENDPOINT ||
            'https://wwz-blitzico.enterprisebot.co/blitz65aadf8a736349dd9ad6fd93ca69684f',
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
            botflow: true
        }
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
app.post('/:widgetId/chat', async (req, res) => {
    try {
        const { widgetId } = req.params;
        const widgetConfig = getWidgetConfig(widgetId);

        if (!widgetConfig) {
            return res.status(404).json({ error: `Unknown widget: ${widgetId}` });
        }

        const { blizzUserMsg, blizzSessionId, blizzBotMessageId, clientUrl, agentId } = req.body;

        if (!blizzUserMsg) {
            return res.status(400).json({ error: 'blizzUserMsg is required' });
        }

        console.log(`[${widgetId}/Chat] Forwarding message:`, blizzUserMsg.substring(0, 50) + '...');

        const response = await fetchWithTimeout(widgetConfig.CHAT_ENDPOINT, {
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
app.post('/:widgetId/feedback', async (req, res) => {
    try {
        const { widgetId } = req.params;
        const widgetConfig = getWidgetConfig(widgetId);

        if (!widgetConfig) {
            return res.status(404).json({ error: `Unknown widget: ${widgetId}` });
        }

        const { blizzSessionId, rating, ratingComment, agentId, timestamp } = req.body;

        if (rating === undefined) {
            return res.status(400).json({ error: 'rating is required' });
        }

        console.log(`[${widgetId}/Feedback] Submitting rating:`, rating);

        const response = await fetchWithTimeout(widgetConfig.FEEDBACK_ENDPOINT, {
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
app.post('/:widgetId/contact', async (req, res) => {
    try {
        const { widgetId } = req.params;
        const widgetConfig = getWidgetConfig(widgetId);

        if (!widgetConfig) {
            return res.status(404).json({ error: `Unknown widget: ${widgetId}` });
        }

        const { type, message, formData, agentId, formpayload } = req.body;

        let payload;
        if (type === 'simpleMessage' && message) {
            payload = { type, message, formData, widgetId, agentId };
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
app.post('/:widgetId/botflow', async (req, res) => {
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

// =============================================================================
// LEGACY ROUTES: /chat, /feedback, /contact, /botflow (backward compatibility)
// =============================================================================

/**
 * Legacy Chat endpoint
 * POST /chat
 */
app.post('/chat', async (req, res) => {
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
app.post('/feedback', async (req, res) => {
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
app.post('/contact', async (req, res) => {
    try {
        const { type, message, formData, widgetId, agentId, formpayload } = req.body;

        let payload;
        if (type === 'simpleMessage' && message) {
            payload = { type, message, formData, widgetId, agentId };
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
app.post('/botflow', async (req, res) => {
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
