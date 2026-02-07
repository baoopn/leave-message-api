FROM node:22-alpine AS builder

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Production stage
FROM node:22-alpine

# Set environment to production
ENV NODE_ENV=production

# Create app directory
WORKDIR /usr/src/app

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && \
	adduser -S nodejs -u 1001

# Copy dependencies from builder
COPY --from=builder /usr/src/app/node_modules ./node_modules

# Bundle app source
COPY --chown=nodejs:nodejs . .

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
	CMD node healthcheck.js

# Command to run the app
CMD [ "node", "index.js" ]
