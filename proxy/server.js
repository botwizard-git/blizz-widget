/**
 * Blizz Widget API Proxy Server
 * Securely forwards requests to EnterpriseBot API while hiding API keys
 *
 * Configuration: Uses environment variables with built-in defaults
 * GitHub secrets override defaults when deployed via CI/CD
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

// Default endpoints (can be overridden by environment variables / GitHub secrets)
const DEFAULTS = {
    PORT: 3050,
    CHAT_ENDPOINT: 'https://wwz-blitzico.enterprisebot.co/blitzef18241476b1474580d2f58390a9cbae',
    FORM_ENDPOINT: 'https://wwz-blitzico.enterprisebot.co/blitz65aadf8a736349dd9ad6fd93ca69684f',
    FEEDBACK_ENDPOINT: 'https://wwz-blitzico.enterprisebot.co/blitz65aadf8a736349dd9ad6fd93ca69684f',
    BOTFLOW_ENDPOINT: 'https://wwz-blitzico.enterprisebot.co/blitz65aadf8a736349dd9ad6fd93ca69684f',
    ALLOWED_ORIGINS: 'https://blizz.botwizard.ch,https://www.wwz.ch'
};

// Use env vars if available (GitHub secrets), otherwise use defaults
const config = {
    PORT: process.env.PORT || DEFAULTS.PORT,
    API_KEY: process.env.API_KEY || '',
    CHAT_ENDPOINT: process.env.CHAT_ENDPOINT || DEFAULTS.CHAT_ENDPOINT,
    FORM_ENDPOINT: process.env.FORM_ENDPOINT || DEFAULTS.FORM_ENDPOINT,
    FEEDBACK_ENDPOINT: process.env.FEEDBACK_ENDPOINT || DEFAULTS.FEEDBACK_ENDPOINT,
    BOTFLOW_ENDPOINT: process.env.BOTFLOW_ENDPOINT || DEFAULTS.BOTFLOW_ENDPOINT,
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || DEFAULTS.ALLOWED_ORIGINS
};

const app = express();

// Parse allowed origins from config
const allowedOrigins = config.ALLOWED_ORIGINS.split(',').map(o => o.trim());

// CORS configuration
const corsOptions = {
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('[CORS] Blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept'],
    credentials: true,
    maxAge: 86400 // Preflight cache for 24 hours
};

app.use(cors(corsOptions));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        endpoints: {
            chat: !!config.CHAT_ENDPOINT,
            contact: !!config.FORM_ENDPOINT,
            feedback: !!config.FEEDBACK_ENDPOINT,
            botflow: !!config.BOTFLOW_ENDPOINT
        }
    });
});

/**
 * Chat endpoint - forwards messages to EnterpriseBot chat API
 * POST /chat
 */
app.post('/chat', async (req, res) => {
    try {
        const { blizzUserMsg, blizzSessionId, blizzBotMessageId, clientUrl, widgetId, agentId } = req.body;

        if (!blizzUserMsg) {
            return res.status(400).json({ error: 'blizzUserMsg is required' });
        }

        console.log('[Chat] Forwarding message:', blizzUserMsg.substring(0, 50) + '...');

        const response = await fetch(config.CHAT_ENDPOINT, {
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
                clientUrl,
                widgetId,
                agentId
            })
        });

        if (!response.ok) {
            console.error('[Chat] API error:', response.status);
            return res.status(response.status).json({ error: 'API request failed' });
        }

        const data = await response.json();
        console.log('[Chat] Response received');
        res.json(data);

    } catch (error) {
        console.error('[Chat] Error:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * Feedback/Rating endpoint - forwards rating submissions
 * POST /feedback
 */
app.post('/feedback', async (req, res) => {
    try {
        const { blizzSessionId, rating, ratingComment, agentId, widgetId, timestamp } = req.body;

        if (rating === undefined) {
            return res.status(400).json({ error: 'rating is required' });
        }

        console.log('[Feedback] Submitting rating:', rating, 'for session:', blizzSessionId);

        // Forward in simpleMessage format
        const response = await fetch(config.FEEDBACK_ENDPOINT, {
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
 * Contact form endpoint - forwards form submissions
 * POST /contact
 */
app.post('/contact', async (req, res) => {
    try {
        const { type, message, formData, widgetId, agentId, formpayload } = req.body;

        // Support both new format (type/message) and legacy format (formpayload)
        let payload;
        if (type === 'simpleMessage' && message) {
            // New simpleMessage format
            payload = { type, message, formData, widgetId, agentId };
            console.log('[Contact] Submitting form (simpleMessage format)');
        } else if (formpayload) {
            // Legacy format
            payload = { formpayload };
            console.log('[Contact] Submitting form for:', formpayload.email || 'unknown');
        } else {
            return res.status(400).json({ error: 'Invalid payload format' });
        }

        const response = await fetch(config.FORM_ENDPOINT, {
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
 * Botflow endpoint - forwards to aida flows API
 * POST /botflow
 */
app.post('/botflow', async (req, res) => {
    try {
        const payload = req.body;

        console.log('[Botflow] Forwarding request');

        const response = await fetch(config.BOTFLOW_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json, text/plain, */*',
                'api-key': config.API_KEY
            },
            body: JSON.stringify(payload)
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
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({ error: 'CORS policy violation' });
    }
    console.error('[Error]', err.message);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(config.PORT, () => {
    console.log(`[Blizz Proxy] Server running on port ${config.PORT}`);
    console.log(`[Blizz Proxy] Allowed origins:`, allowedOrigins);
    console.log(`[Blizz Proxy] Endpoints configured:`);
    console.log(`  - Chat: ${config.CHAT_ENDPOINT ? 'Yes' : 'No'}`);
    console.log(`  - Contact: ${config.FORM_ENDPOINT ? 'Yes' : 'No'}`);
    console.log(`  - Feedback: ${config.FEEDBACK_ENDPOINT ? 'Yes' : 'No'}`);
    console.log(`  - Botflow: ${config.BOTFLOW_ENDPOINT ? 'Yes' : 'No'}`);
});
