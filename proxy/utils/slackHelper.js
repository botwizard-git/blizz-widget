/**
 * Slack notification utility for sending alerts via webhook.
 */

const WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL || '';

/**
 * Send an error alert to Slack
 * @param {string} title - Error title/header
 * @param {string} error - Error message/details
 * @param {Object} options - Additional options
 * @param {string} options.sessionId - Session identifier
 * @param {string} options.origin - Request origin
 * @param {string} options.endpoint - API endpoint
 * @param {string} options.userMessage - User's message (if applicable)
 * @param {Object} options.additionalContext - Any extra context
 * @returns {Promise<boolean>} - True if notification sent successfully
 */
async function sendErrorAlert(title, error, options = {}) {
    if (!WEBHOOK_URL) {
        console.warn('[Slack] SLACK_WEBHOOK_URL not configured, skipping alert');
        return false;
    }

    try {
        const timestamp = new Date().toISOString();
        const { sessionId, origin, endpoint, userMessage, additionalContext } = options;

        // Build context fields
        const fields = [];
        if (sessionId) {
            fields.push(`*SessionId:* \`${sessionId}\``);
        }
        if (origin) {
            fields.push(`*Origin:* ${origin}`);
        }
        if (endpoint) {
            fields.push(`*Endpoint:* \`${endpoint}\``);
        }
        if (userMessage) {
            // Truncate long messages
            const truncated = userMessage.length > 100
                ? userMessage.substring(0, 100) + '...'
                : userMessage;
            fields.push(`*User Message:* ${truncated}`);
        }
        fields.push(`*Timestamp:* ${timestamp}`);

        if (additionalContext) {
            for (const [key, value] of Object.entries(additionalContext)) {
                fields.push(`*${key}:* ${value}`);
            }
        }

        // Truncate error if too long
        const errorText = typeof error === 'string'
            ? (error.length > 1500 ? error.substring(0, 1500) + '...' : error)
            : JSON.stringify(error, null, 2).substring(0, 1500);

        // Slack message with attachment for color coding
        const payload = {
            attachments: [
                {
                    color: '#dc3545', // Red color for errors
                    blocks: [
                        {
                            type: 'header',
                            text: {
                                type: 'plain_text',
                                text: `⚠️ ${title}`,
                                emoji: true
                            }
                        },
                        {
                            type: 'section',
                            text: {
                                type: 'mrkdwn',
                                text: `*Error Details:*\n\`\`\`${errorText}\`\`\``
                            }
                        },
                        {
                            type: 'divider'
                        },
                        {
                            type: 'section',
                            text: {
                                type: 'mrkdwn',
                                text: fields.join('\n')
                            }
                        }
                    ]
                }
            ]
        };

        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            console.log(`[Slack] Notification sent successfully: ${title}`);
            return true;
        } else {
            const responseText = await response.text();
            console.error(`[Slack] Notification failed with status ${response.status}: ${responseText}`);
            return false;
        }

    } catch (e) {
        console.error(`[Slack] Failed to send notification: ${e.message}`);
        return false;
    }
}

/**
 * Send a general notification to Slack
 * @param {string} message - Message content (supports Slack mrkdwn)
 * @param {string} title - Optional title/header
 * @param {string} color - Sidebar color (hex code)
 * @returns {Promise<boolean>} - True if notification sent successfully
 */
async function sendNotification(message, title = null, color = '#0066cc') {
    if (!WEBHOOK_URL) {
        console.warn('[Slack] SLACK_WEBHOOK_URL not configured, skipping notification');
        return false;
    }

    try {
        const blocks = [];

        if (title) {
            blocks.push({
                type: 'header',
                text: {
                    type: 'plain_text',
                    text: title,
                    emoji: true
                }
            });
        }

        blocks.push({
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: message
            }
        });

        const payload = {
            attachments: [
                {
                    color: color,
                    blocks: blocks
                }
            ]
        };

        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            console.log('[Slack] Notification sent successfully');
            return true;
        } else {
            const responseText = await response.text();
            console.error(`[Slack] Notification failed with status ${response.status}: ${responseText}`);
            return false;
        }

    } catch (e) {
        console.error(`[Slack] Failed to send notification: ${e.message}`);
        return false;
    }
}

module.exports = {
    sendErrorAlert,
    sendNotification
};
