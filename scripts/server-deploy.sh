#!/bin/bash

# WWZ Widgets - Server Deployment Script
# This script is executed on the production server after git pull

set -e

echo "=========================================="
echo "WWZ Widgets - Deployment Script"
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

    echo ""
    echo "=========================================="
    echo "Deployment successful!"
    echo "=========================================="
    echo ""
    echo "Widgets are now available at:"
    echo "  - https://blizz.botwizard.ch/wwz-blizz/wwz-blizz.js"
    echo "  - https://blizz.botwizard.ch/wwz-ivy/wwz-ivy.js"
    echo ""
else
    echo "ERROR: Nginx configuration test failed!"
    exit 1
fi
