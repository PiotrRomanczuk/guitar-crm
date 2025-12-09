#!/bin/bash
# Script: Seed local PostgreSQL database with test data
# This should be run after `docker run` creates the PostgreSQL container
# Usage: ./scripts/seed-local-db.sh

set -e

DB_HOST=${DB_HOST:-127.0.0.1}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-guitar_crm}
DB_USER=${DB_USER:-postgres}
DB_PASSWORD=${DB_PASSWORD:-postgres}

echo "🌱 Seeding database at ${DB_HOST}:${DB_PORT}/${DB_NAME}..."

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
for i in {1..30}; do
  if PGPASSWORD="$DB_PASSWORD" /usr/bin/psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1" >/dev/null 2>&1; then
    echo "✅ Database is ready"
    break
  fi
  echo "  Attempt $i/30... waiting..."
  sleep 1
done

# Run migrations
echo "📋 Running migrations..."
for file in supabase/migrations/*.sql; do 
  echo "  - $(basename $file)..."
  PGPASSWORD="$DB_PASSWORD" /usr/bin/psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$file" >/dev/null 2>&1
done
echo "✅ All migrations completed"

# Enable pgcrypto extension
echo "🔐 Enabling pgcrypto extension..."
PGPASSWORD="$DB_PASSWORD" /usr/bin/psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;" >/dev/null 2>&1

# Load seed data
echo "🌱 Loading seed data..."
PGPASSWORD="$DB_PASSWORD" /usr/bin/psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" < supabase/seed.sql >/dev/null 2>&1

# Insert auth users
echo "👤 Creating test auth users..."
PGPASSWORD="$DB_PASSWORD" /usr/bin/psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" <<'SQL' >/dev/null 2>&1
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
SELECT 
  p.id,
  p.email,
  crypt('test123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
FROM profiles p
ON CONFLICT DO NOTHING;
SQL

echo ""
echo "✅ Database seeding complete!"
echo ""
echo "📊 Database Summary:"
PGPASSWORD="$DB_PASSWORD" /usr/bin/psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" <<'SQL'
SELECT 'Auth Users' as table_name, COUNT(*) as count FROM auth.users
UNION ALL
SELECT 'Profiles', COUNT(*) FROM profiles
UNION ALL
SELECT 'Songs', COUNT(*) FROM songs
UNION ALL
SELECT 'Lessons', COUNT(*) FROM lessons;
SQL

echo ""
echo "🔑 Test Credentials:"
echo "   Email: p.romanczuk@gmail.com (Admin + Teacher)"
echo "   Email: teacher@example.com (Teacher)"
echo "   Email: student@example.com (Student)"
echo "   Password: test123 (all users)"
echo ""
