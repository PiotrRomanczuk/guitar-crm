#!/bin/bash

# Test API Key Authentication
# Usage: ./scripts/test-api-key.sh YOUR_API_KEY

set -e

API_KEY=${1:-""}
API_URL=${2:-"http://localhost:3000/api/widget/dashboard"}

if [ -z "$API_KEY" ]; then
  echo "❌ Error: API key required"
  echo "Usage: ./scripts/test-api-key.sh YOUR_API_KEY [API_URL]"
  echo ""
  echo "Example:"
  echo "  ./scripts/test-api-key.sh gcrm_abc123xyz456"
  echo "  ./scripts/test-api-key.sh gcrm_abc123xyz456 https://your-app.vercel.app/api/widget/dashboard"
  exit 1
fi

echo "🔑 Testing API Key Authentication"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "API Key: ${API_KEY:0:15}..."
echo "URL: $API_URL"
echo ""

echo "📡 Sending request..."
response=$(curl -s -w "\n%{http_code}" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  "$API_URL")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

echo ""
echo "📥 Response (HTTP $http_code):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$http_code" = "200" ]; then
  echo "✅ SUCCESS"
  echo ""
  echo "$body" | jq '.' 2>/dev/null || echo "$body"
  echo ""
  echo "✅ Widget endpoint working correctly!"
  echo ""
  echo "Next steps:"
  echo "1. Copy your API key"
  echo "2. Open Scriptable app on iPhone"
  echo "3. Create new script with the code from docs/IOS_WIDGET_SETUP.md"
  echo "4. Add widget to home screen with your API key as parameter"
elif [ "$http_code" = "401" ]; then
  echo "❌ AUTHENTICATION FAILED"
  echo ""
  echo "$body" | jq '.' 2>/dev/null || echo "$body"
  echo ""
  echo "Possible issues:"
  echo "- API key is incorrect or malformed"
  echo "- API key has been deleted or disabled"
  echo "- Missing 'Bearer' prefix in Authorization header"
  echo ""
  echo "To generate a new API key:"
  echo "1. Log into Guitar CRM web app"
  echo "2. Go to Settings → API Keys"
  echo "3. Click 'Create New API Key'"
  echo "4. Copy the key immediately (shown only once)"
else
  echo "❌ ERROR (HTTP $http_code)"
  echo ""
  echo "$body" | jq '.' 2>/dev/null || echo "$body"
  echo ""
  echo "Check:"
  echo "- Server is running (npm run dev)"
  echo "- Database is accessible"
  echo "- API endpoint exists at /app/api/widget/dashboard/route.ts"
fi

echo ""
