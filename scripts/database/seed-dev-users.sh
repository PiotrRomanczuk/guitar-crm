#!/bin/bash

# Script to seed development users
# Run after setup-db.sh and seed-db.sh

set -e

echo "👥 SEEDING DEVELOPMENT USERS"
echo "==========================="

# Check if Supabase is running
if ! curl -s http://localhost:54321/health > /dev/null; then
    echo "❌ Supabase is not running. Please start it first:"
    echo "   ./scripts/setup/setup-db.sh"
    exit 1
fi

echo "✅ Supabase is running"

# Run the TypeScript seeding script
echo "🌱 Creating development users..."
npx ts-node ./scripts/database/seed-dev-users.ts

# Verify users were created by checking profiles table
echo ""
echo "📊 Development Users Summary:"
echo "==========================="
psql "postgresql://postgres:postgres@localhost:54322/postgres" << 'EOL'
SELECT 
    profiles.email,
    CASE 
        WHEN isAdmin THEN 'Admin'
        WHEN isTeacher THEN 'Teacher'
        WHEN isStudent THEN 'Student'
    END as role,
    CONCAT(firstName, ' ', lastName) as name
FROM profiles 
WHERE isDevelopment = true
ORDER BY email;
EOL

echo ""
echo "✅ Development users seeded successfully!"
echo ""
echo "🎯 You can now:"
echo "• Sign in with the development credentials"
echo "• Test different user roles"
echo "• Develop features with real user data"