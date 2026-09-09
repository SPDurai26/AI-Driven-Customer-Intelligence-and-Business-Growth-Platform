# =============================================================================
# Stage 1 � deps: install ALL dependencies (including devDeps for the build)
# =============================================================================
FROM node:20-alpine AS deps

# Install libc compatibility for native modules (e.g. Prisma)
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy only the lockfile and package manifest first (better layer caching)
COPY package.json package-lock.json* ./

RUN npm ci

# =============================================================================
# Stage 2 — builder: compile the Next.js application
# =============================================================================
FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat

WORKDIR /app

# Bring in node_modules from the deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy the full source
COPY . .

# Build-time env vars required by Next.js during `next build`
# These are NOT secret - they bake into the static bundle.
ARG NEXTAUTH_URL=http://localhost:3000
ENV NEXTAUTH_URL=${NEXTAUTH_URL}
ENV BUILD_STANDALONE=true

# Disable Next.js telemetry inside CI / Docker
ENV NEXT_TELEMETRY_DISABLED=1

# Generate Prisma client before building (safe no-op if no schema)
RUN npx prisma generate 2>/dev/null || true

RUN npm run build

# =============================================================================
# Stage 3 — runner: lean production image
# =============================================================================
FROM node:20-alpine AS runner

RUN apk add --no-cache libc6-compat

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Copy only what Next.js needs to serve the production build
COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma schema if present (needed at runtime)
COPY --from=builder --chown=nextjs:nodejs /app/pris[m]a ./prisma

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# server.js is created by next build from the standalone output
CMD ["node", "server.js"]
