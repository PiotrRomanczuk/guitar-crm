#!/bin/bash

# Run Lighthouse against a production build locally
# Usage: ./scripts/lighthouse-prod-audit.sh

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}🏗️  Building application for production...${NC}"
NODE_OPTIONS="--max-old-space-size=4096" npm run build

echo -e "${YELLOW}🚀 Starting production server...${NC}"
npm run start &
SERVER_PID=$!

# Wait for server to be ready
echo "⏳ Waiting for server to be ready..."
URL="http://localhost:3000"
for i in {1..30}; do
    if curl -s --head "$URL" > /dev/null; then
        echo -e "${GREEN}✅ Server is ready at $URL${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ Server not ready after 30 seconds${NC}"
        kill $SERVER_PID
        exit 1
    fi
    sleep 1
done

echo -e "${YELLOW}🔍 Running Lighthouse audit...${NC}"
# Use the existing CI script but point to localhost:3000
./scripts/ci/lighthouse-ci.sh "$URL"

# Cleanup
echo -e "${YELLOW}🧹 Stopping server...${NC}"
kill $SERVER_PID
echo -e "${GREEN}✅ Done!${NC}"
