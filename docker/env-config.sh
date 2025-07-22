#!/bin/sh

# ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
# │                                        CEYBYTE POS                                               │
# │                                                                                                  │
# │                                Environment Configuration Script                                  │
# │                                                                                                  │
# │  Description: Runtime environment configuration for Docker deployment.                           │
# │               Replaces environment variables in built React application.                         │
# │                                                                                                  │
# │  Author: Akash Hasendra                                                                          │
# │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
# │  License: MIT License with Sri Lankan Business Terms                                             │
# └──────────────────────────────────────────────────────────────────────────────────────────────────┘

# Replace environment variables in JavaScript files
find /usr/share/nginx/html -name "*.js" -exec sed -i "s|VITE_API_BASE_URL_PLACEHOLDER|${VITE_API_BASE_URL:-http://localhost:8000}|g" {} \;
find /usr/share/nginx/html -name "*.js" -exec sed -i "s|VITE_APP_NAME_PLACEHOLDER|${VITE_APP_NAME:-CeybytePOS}|g" {} \;
find /usr/share/nginx/html -name "*.js" -exec sed -i "s|VITE_COMPANY_NAME_PLACEHOLDER|${VITE_COMPANY_NAME:-Ceybyte.com}|g" {} \;

echo "Environment configuration completed"