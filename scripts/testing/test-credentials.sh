#!/bin/bash

# Test Development Credentials Script
# Verifies that all development users can authenticate and have correct roles

echo "🔑 TESTING DEVELOPMENT CREDENTIALS"
echo "================================"

# Check if Supabase is running
if ! curl -s http://localhost:54321/health > /dev/null; then
    echo "❌ Supabase is not running. Please start it first:"
    echo "   ./scripts/setup/setup-db.sh"
    exit 1
fi

echo "✅ Supabase is running"

# Copy test environment if it doesn't exist
if [ ! -f .env.test ]; then
    echo "Creating test environment file..."
    cp .env.test.example .env.test
fi

# Load test environment
export $(cat .env.test | grep -v '^#' | xargs)

# Run credential tests
echo "🧪 Running authentication tests..."
NODE_ENV=test npm test -- --testPathPattern=__tests__/auth/credentials.test.ts --verbose

# Run user seeding tests
echo "🧪 Running user seeding tests..."
NODE_ENV=test npm test -- --testPathPattern=__tests__/database/user-seeding.test.ts --verbose

echo ""
echo "✅ Credential testing complete!"