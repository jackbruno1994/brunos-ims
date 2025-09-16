# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm ci --only=production && \
    cd backend && npm ci --only=production

# Copy source code
COPY backend/ ./backend/

# Generate Prisma client and build
WORKDIR /app/backend
RUN npx prisma generate && npm run build

# Production stage
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S bruno -u 1001

WORKDIR /app

# Copy built application
COPY --from=builder --chown=bruno:nodejs /app/backend/dist ./dist
COPY --from=builder --chown=bruno:nodejs /app/backend/package*.json ./
COPY --from=builder --chown=bruno:nodejs /app/backend/node_modules ./node_modules
COPY --from=builder --chown=bruno:nodejs /app/backend/prisma ./prisma

# Switch to non-root user
USER bruno

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/api/health/live', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

EXPOSE 3001

# Start application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]