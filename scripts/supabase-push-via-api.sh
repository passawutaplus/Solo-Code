#!/usr/bin/env bash
# Push migrations via Supabase Management API (no DB password needed)
set -euo pipefail
cd "$(dirname "$0")/.."

PROJECT_REF="${SUPABASE_PROJECT_REF:-rvnzjiskqliexysicfmh}"
API="https://api.supabase.com/v1/projects/${PROJECT_REF}"

if [[ -z "${SUPABASE_ACCESS_TOKEN:-}" ]]; then
  echo "⚠  ตั้ง SUPABASE_ACCESS_TOKEN ก่อน"
  exit 1
fi

apply_migration() {
  local file="$1"
  local name
  name="$(basename "$file" .sql)"
  echo "→ $name"

  local payload
  payload="$(python3 -c "
import json, pathlib, sys
sql = pathlib.Path(sys.argv[1]).read_text()
print(json.dumps({'query': sql, 'name': sys.argv[2]}))
" "$file" "$name")"

  local http_code body
  body="$(mktemp)"
  http_code="$(curl -s -o "$body" -w "%{http_code}" \
    -X POST "${API}/database/migrations" \
    -H "Authorization: Bearer ${SUPABASE_ACCESS_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "$payload")"

  if [[ "$http_code" != "200" && "$http_code" != "201" ]]; then
    echo "✗ Failed ($http_code): $name"
    head -c 500 "$body"
    echo ""
    rm -f "$body"
    exit 1
  fi
  rm -f "$body"
}

echo "→ Fetching applied migrations..."
applied="$(curl -s -X POST "${API}/database/query" \
  -H "Authorization: Bearer ${SUPABASE_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"query":"SELECT name FROM supabase_migrations.schema_migrations;"}' \
  | python3 -c "import json,sys; print('\n'.join(r['name'] for r in json.load(sys.stdin)))")"

echo "→ Pushing migrations to ${PROJECT_REF}..."
count=0
skipped=0
for f in supabase/migrations/*.sql; do
  name="$(basename "$f" .sql)"
  if echo "$applied" | grep -qxF "$name"; then
    skipped=$((skipped + 1))
    continue
  fi
  apply_migration "$f"
  count=$((count + 1))
done
echo "✓ Applied ${count} migrations (${skipped} already present)"

echo "→ Regenerating types..."
if [[ -x bin/supabase ]]; then
  bin/supabase gen types typescript --linked > src/integrations/supabase/types.ts 2>/dev/null || \
    echo "  (skip types — run after link if needed)"
fi
echo "✓ Done"
