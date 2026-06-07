#!/usr/bin/env bash
# Post-migration setup: Auth redirects + Edge Function deploy
set -euo pipefail
cd "$(dirname "$0")/.."

PROJECT_REF="${SUPABASE_PROJECT_REF:-rvnzjiskqliexysicfmh}"
API="https://api.supabase.com/v1/projects/${PROJECT_REF}"
CLI="bin/supabase"

SITE_URL="${SO1O_SITE_URL:-https://solofreelancer.com}"

if [[ -z "${SUPABASE_ACCESS_TOKEN:-}" ]]; then
  echo "⚠  ตั้ง SUPABASE_ACCESS_TOKEN ก่อน"
  echo "   export SUPABASE_ACCESS_TOKEN=<token>"
  exit 1
fi

echo "→ Auth config (${PROJECT_REF})..."
payload="$(python3 -c "
import json, os
print(json.dumps({
  'site_url': os.environ['SITE_URL'],
  'additional_redirect_urls': [
    'http://localhost:5173/**',
    'http://localhost:8080/**',
    'http://127.0.0.1:5173/**',
    'http://127.0.0.1:8080/**',
    'https://solofreelancer.com/**',
    'https://so1o-freelancer-managment.lovable.app/**',
  ],
}))
" SITE_URL="$SITE_URL")"

http_code="$(curl -s -o /tmp/supabase-auth-patch.json -w "%{http_code}" \
  -X PATCH "${API}/config/auth" \
  -H "Authorization: Bearer ${SUPABASE_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "$payload")"

if [[ "$http_code" == "200" ]]; then
  echo "✓ Auth: site_url=${SITE_URL} + 6 redirect URLs"
else
  echo "⚠  Auth PATCH failed (${http_code}) — ตั้งเองที่ Dashboard → Auth → URL Configuration"
  head -c 300 /tmp/supabase-auth-patch.json
  echo ""
fi

if [[ ! -x "$CLI" ]]; then
  echo "→ Installing Supabase CLI..."
  ./scripts/install-supabase-cli.sh
fi

echo "→ Linking project..."
"$CLI" link --project-ref "$PROJECT_REF" 2>/dev/null || true

FUNCTIONS=(ai-design-chat planner-ai-assist ai-price-suggest color-mentor)
if [[ -z "${GEMINI_API_KEY:-}" ]]; then
  echo ""
  echo "⚠  ข้าม deploy Edge Functions — ตั้ง GEMINI_API_KEY ก่อน:"
  echo "   Dashboard → Edge Functions → Secrets"
  echo "   หรือ: export GEMINI_API_KEY=... && ./scripts/supabase-setup-project.sh"
  exit 0
fi

echo "→ Setting GEMINI_API_KEY secret..."
"$CLI" secrets set GEMINI_API_KEY="$GEMINI_API_KEY" --project-ref "$PROJECT_REF"

for fn in "${FUNCTIONS[@]}"; do
  echo "→ Deploy ${fn}..."
  "$CLI" functions deploy "$fn" --project-ref "$PROJECT_REF"
done

echo "✓ Setup complete"
