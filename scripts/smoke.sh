#!/usr/bin/env bash
# LeadPilot smoke checks against a running instance.
# Usage: BASE_URL=https://your.app ./scripts/smoke.sh
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"

echo "== health =="
curl -sf "$BASE_URL/api/health" | head -c 400
echo

echo "== health deep =="
code=$(curl -s -o /tmp/lp-health.json -w "%{http_code}" "$BASE_URL/api/health?deep=1" || true)
echo "HTTP $code"
head -c 400 /tmp/lp-health.json 2>/dev/null || true
echo

echo "== marketing home =="
curl -sf -o /dev/null -w "%{http_code}\n" "$BASE_URL/"

echo "== login page =="
curl -sf -o /dev/null -w "%{http_code}\n" "$BASE_URL/login"

echo "== pricing =="
curl -sf -o /dev/null -w "%{http_code}\n" "$BASE_URL/pricing"

echo "Smoke finished against $BASE_URL"
