#!/bin/bash

# Setup Test Environment for E2E Tests
# Ensures test users exist with proper roles and credentials

set -e

echo "🔧 Setting up test environment..."

# Database connection details
DB_HOST="127.0.0.1"
DB_PORT="54322"
DB_USER="postgres"
DB_PASSWORD="postgres"
DB_NAME="postgres"

# Check if Supabase is running
if ! lsof -i :54321 > /dev/null 2>&1; then
    echo "❌ Supabase is not running. Please start it with: npm run setup:db"
    exit 1
fi

echo "✅ Supabase is running"

# Function to run SQL
run_sql() {
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "$1" 2>&1
}

echo "📝 Checking test users..."

# Check if admin user exists
ADMIN_EXISTS=$(run_sql "SELECT COUNT(*) FROM auth.users WHERE email = 'p.romanczuk@gmail.com';" | grep -o '[0-9]' | head -1)

if [ "$ADMIN_EXISTS" = "0" ]; then
    echo "Creating admin user..."
    run_sql "
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        role
    ) VALUES (
        'f7f3bc3f-72e4-4704-8d6d-0646ab4f0427',
        '00000000-0000-0000-0000-000000000000',
        'p.romanczuk@gmail.com',
        crypt('test123_admin', gen_salt('bf')),
        now(),
        now(),
        now(),
        '{\"provider\":\"email\",\"providers\":[\"email\"]}',
        '{\"firstName\":\"Piotr\",\"lastName\":\"Romanczuk\"}',
        false,
        'authenticated'
    ) ON CONFLICT (email) DO NOTHING;
    "
fi

# Check if teacher user exists
TEACHER_EXISTS=$(run_sql "SELECT COUNT(*) FROM auth.users WHERE email = 'teacher@example.com';" | grep -o '[0-9]' | head -1)

if [ "$TEACHER_EXISTS" = "0" ]; then
    echo "Creating teacher user..."
    run_sql "
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        role
    ) VALUES (
        'cb755725-11e8-4428-9a16-5e479ed4f90d',
        '00000000-0000-0000-0000-000000000000',
        'teacher@example.com',
        crypt('test123_teacher', gen_salt('bf')),
        now(),
        now(),
        now(),
        '{\"provider\":\"email\",\"providers\":[\"email\"]}',
        '{\"firstName\":\"Test\",\"lastName\":\"Teacher\"}',
        false,
        'authenticated'
    ) ON CONFLICT (email) DO NOTHING;
    "
fi

# Check if student user exists
STUDENT_EXISTS=$(run_sql "SELECT COUNT(*) FROM auth.users WHERE email = 'student@example.com';" | grep -o '[0-9]' | head -1)

if [ "$STUDENT_EXISTS" = "0" ]; then
    echo "Creating student user..."
    run_sql "
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        role
    ) VALUES (
        'fda1b453-5874-42a6-8675-42f2c58b692d',
        '00000000-0000-0000-0000-000000000000',
        'student@example.com',
        crypt('test123_student', gen_salt('bf')),
        now(),
        now(),
        now(),
        '{\"provider\":\"email\",\"providers\":[\"email\"]}',
        '{\"firstName\":\"Test\",\"lastName\":\"Student\"}',
        false,
        'authenticated'
    ) ON CONFLICT (email) DO NOTHING;
    "
fi

echo "✅ All test users exist"

# Ensure profiles exist with correct roles
echo "📝 Setting up user profiles with roles..."

run_sql "
INSERT INTO public.profiles (user_id, email, firstname, lastname, isadmin, isteacher, isstudent)
VALUES 
    ('f7f3bc3f-72e4-4704-8d6d-0646ab4f0427', 'p.romanczuk@gmail.com', 'Piotr', 'Romanczuk', true, true, false),
    ('cb755725-11e8-4428-9a16-5e479ed4f90d', 'teacher@example.com', 'Test', 'Teacher', false, true, false),
    ('fda1b453-5874-42a6-8675-42f2c58b692d', 'student@example.com', 'Test', 'Student', false, false, true)
ON CONFLICT (user_id) DO UPDATE SET
    isadmin = EXCLUDED.isadmin,
    isteacher = EXCLUDED.isteacher,
    isstudent = EXCLUDED.isstudent;
" || echo "⚠️  Some profiles may already exist"

echo "✅ User profiles configured"

# Verify setup
echo ""
echo "📊 Test Environment Status:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

run_sql "
SELECT 
    p.email,
    CASE WHEN p.isadmin THEN '✓' ELSE '✗' END as Admin,
    CASE WHEN p.isteacher THEN '✓' ELSE '✗' END as Teacher,
    CASE WHEN p.isstudent THEN '✓' ELSE '✗' END as Student
FROM public.profiles p
WHERE p.email IN ('p.romanczuk@gmail.com', 'teacher@example.com', 'student@example.com')
ORDER BY p.email;
"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Test environment is ready!"
echo ""
echo "📝 Test Credentials:"
echo "   Admin:   p.romanczuk@gmail.com / test123_admin"
echo "   Teacher: teacher@example.com / test123_teacher"
echo "   Student: student@example.com / test123_student"
echo ""
echo "🚀 You can now run E2E tests:"
echo "   npx cypress run --spec 'cypress/e2e/lessons/**/*.cy.ts'"
echo "   OR"
echo "   npx cypress open"
