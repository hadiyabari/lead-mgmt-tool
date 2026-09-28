#!/bin/sh
set -e

echo "[leadpilot] Running prisma migrate deploy..."
cd /app/packages/db
if [ -x ../../node_modules/.bin/prisma ]; then
  ../../node_modules/.bin/prisma migrate deploy
elif command -v prisma >/dev/null 2>&1; then
  prisma migrate deploy
else
  npx --yes prisma@6 migrate deploy
fi

echo "[leadpilot] Starting Next.js..."
cd /app
# standalone server entry (path after copy of .next/standalone)
if [ -f apps/web/server.js ]; then
  exec node apps/web/server.js
elif [ -f server.js ]; then
  exec node server.js
else
  echo "Could not find Next standalone server.js" >&2
  ls -la /app /app/apps/web 2>/dev/null || true
  exit 1
fi
