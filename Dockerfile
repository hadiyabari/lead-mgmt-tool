FROM node:22-bookworm-slim

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/db/package.json ./packages/db/
COPY packages/shared/package.json ./packages/shared/
COPY packages/sources/package.json ./packages/sources/
COPY packages/audit/package.json ./packages/audit/
COPY packages/scoring/package.json ./packages/scoring/
COPY packages/email-gen/package.json ./packages/email-gen/
COPY packages/email-send/package.json ./packages/email-send/
COPY packages/replies/package.json ./packages/replies/

RUN pnpm install --no-frozen-lockfile

COPY . .

RUN pnpm install --no-frozen-lockfile

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN pnpm --filter @leadpilot/db exec prisma generate
RUN pnpm --filter @leadpilot/web build

ENV PORT=3000
ENV HOSTNAME=0.0.0.0
EXPOSE 3000

CMD ["sh", "-c", "pnpm --filter @leadpilot/db exec prisma migrate deploy && pnpm --filter @leadpilot/web start"]
