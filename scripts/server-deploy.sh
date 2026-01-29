#!/bin/bash

# WWZ Widgets - UAT (v2) Server Deployment Script
# This script is executed on the UAT server after git pull

set -e

echo "=========================================="
echo "WWZ Widgets (v2) - UAT Deployment Script"
echo "=========================================="
echo "Timestamp: $(date)"
echo ""

# Test nginx configuration
echo "Testing nginx configuration..."
nginx -t

if [ $? -eq 0 ]; then
    echo "Nginx configuration is valid"

    # Reload nginx to apply any config changes
    echo "Reloading nginx..."
    systemctl reload nginx

    # Restart PM2 process to apply Node.js code changes
    echo "Restarting blizz-proxy PM2 process..."
    pm2 restart blizz-proxy

    echo ""
    echo "=========================================="
    echo "Deployment successful!"
    echo "=========================================="
    echo ""
    echo "Widgets are now available at:"
    echo "  - https://blizz.botwizard.ch/wwz-blizz/wwz-blizz.js"
    echo "  - https://blizz.botwizard.ch/wwz-blizz-v2/wwz-blizz.js"
    echo "  - https://blizz.botwizard.ch/wwz-ivy/wwz-ivy.js"
    echo ""
else
    echo "ERROR: Nginx configuration test failed!!"
    exit 1
fi
