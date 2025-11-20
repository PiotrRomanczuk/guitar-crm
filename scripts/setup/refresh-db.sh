#!/bin/bash
set -e

# Check if Supabase is running
if npx supabase status > /dev/null 2>&1; then
    echo "✅ Supabase is already running."
else
    echo "🚀 Starting Supabase..."
    npx supabase start
fi

# Optional: Reset database if requested
if [ "$1" == "--reset" ]; then
    echo "🗑️ Resetting Database..."
    # Pipe 'y' to confirm reset
    if echo "y" | npx supabase db reset; then
        echo "✅ Database reset complete"
    else
        echo "❌ Database reset failed"
        exit 1
    fi
fi

echo "🌱 Seeding Test User..."
if npm run seed:test-user; then
    echo "✅ Seeding complete"
else
    echo "❌ Seeding failed"
    exit 1
fi

echo "✨ Environment is ready for testing!"
