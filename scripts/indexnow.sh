#!/usr/bin/env bash
# Tell IndexNow search engines (Bing, Yandex, Seznam, Naver…) which URLs
# changed, so they recrawl in minutes instead of days. Google does not use
# IndexNow — keep using the sitemap and "Request indexing" in Search Console.
#
# Run it from the repo root after a production deploy:
#   scripts/indexnow.sh                      # every URL in sitemap.xml
#   scripts/indexnow.sh https://homeorganizersli.com/closet-organizing-long-island.html
#
# The key is the <32 hex chars>.txt file at the site root; it must already be
# live, because the engines verify it before accepting the submission.
set -euo pipefail

HOST="homeorganizersli.com"
cd "$(dirname "$0")/.."

KEY_FILE=$(ls | grep -E '^[0-9a-f]{32}\.txt$' | head -n 1)
if [ -z "$KEY_FILE" ]; then
  echo "No IndexNow key file (<32 hex>.txt) found at the repo root." >&2
  exit 1
fi
KEY="${KEY_FILE%.txt}"

if [ "$#" -gt 0 ]; then
  URLS=("$@")
else
  URLS=()
  while IFS= read -r url; do URLS+=("$url"); done < <(grep -o '<loc>[^<]*</loc>' sitemap.xml | sed 's#</\{0,1\}loc>##g')
fi

JSON=$(python3 -c '
import json, sys
host, key, urls = sys.argv[1], sys.argv[2], sys.argv[3:]
print(json.dumps({"host": host, "key": key, "keyLocation": f"https://{host}/{key}.txt", "urlList": urls}))
' "$HOST" "$KEY" "${URLS[@]}")

echo "Submitting ${#URLS[@]} URL(s) to IndexNow…"
STATUS=$(curl -s -o /dev/stderr -w '%{http_code}' -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json; charset=utf-8" --data "$JSON")
echo
case "$STATUS" in
  200|202) echo "Accepted (HTTP $STATUS)." ;;
  *) echo "IndexNow answered HTTP $STATUS — see https://www.indexnow.org/documentation#response" >&2; exit 1 ;;
esac
