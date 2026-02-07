FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

FROM base AS prod-deps
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base
ENV NODE_ENV=production

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && \
	adduser -S nodejs -u 1001

# Copy dependencies
COPY --from=prod-deps /app/node_modules /app/node_modules

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
