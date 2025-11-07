#!/bin/bash

# Convenience wrapper to open Cypress with server running
set -euo pipefail

URL=${CYPRESS_BASE_URL:-http://localhost:3000}

npx start-server-and-test "npm run dev" "$URL" "npx cypress open"
