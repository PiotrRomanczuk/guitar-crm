#!/bin/bash

# Run Cypress E2E tests against the local dev server
# Usage:
#   ./scripts/e2e.sh         # headless run
#   ./scripts/e2e.sh open    # open Cypress GUI

set -euo pipefail

MODE=${1:-run}

if ! command -v npx >/dev/null 2>&1; then
  echo "npx is required (npm >= 5.2)." >&2
  exit 1
fi

URL=${CYPRESS_BASE_URL:-http://localhost:3000}

if [ "$MODE" = "open" ]; then
  npx start-server-and-test "npm run dev" "$URL" "npx cypress open"
else
  npx start-server-and-test "npm run dev" "$URL" "npx cypress run"
fi
