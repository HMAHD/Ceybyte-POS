# ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
# │                                        CEYBYTE POS                                               │
# │                                                                                                  │
# │                                   Frontend Dockerfile                                           │
# │                                                                                                  │
# │  Description: Docker configuration for CeybytePOS React frontend with Vite.                     │
# │               Multi-stage build for optimized production deployment.                             │
# │                                                                                                  │
# │  Author: Akash Hasendra                                                                          │
# │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
# │  License: MIT License with Sri Lankan Business Terms                                             │
# └──────────────────────────────────────────────────────────────────────────────────────────────────┘

# Build stage
FROM node:18-alpine as builder

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Production stage
FROM nginx:alpine as production

# Copy custom nginx configuration
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy environment configuration script
COPY docker/env-config.sh /docker-entrypoint.d/env-config.sh
RUN chmod +x /docker-entrypoint.d/env-config.sh

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]