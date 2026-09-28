# LeadPilot production image (Railway-friendly monorepo)
FROM node:22-bookworm-slim

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy workspace manifests first for better layer caching
COPY package.json pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/db/package.json ./packages/db/
COPY packages/shared/package.json ./packages/shared/
COPY packages/sources/package.json ./packages/sources/
COPY packages/audit/package.json ./packages/audit/
COPY packages/scoring/package.json ./packages/scoring/

# Full install (prisma is a production dependency of @leadpilot/db)
RUN pnpm install --no-frozen-lockfile

COPY . .

# Re-link after full source copy
RUN pnpm install --no-frozen-lockfile

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Generate client only (no DB required)
RUN pnpm --filter @leadpilot/db exec prisma generate

# Build Next app
RUN pnpm --filter @leadpilot/web build

ENV PORT=3000
ENV HOSTNAME=0.0.0.0
EXPOSE 3000

# Migrate when the container starts (DB is reachable on Railway private network)
CMD ["sh", "-c", "pnpm --filter @leadpilot/db exec prisma migrate deploy && pnpm --filter @leadpilot/web start"]
