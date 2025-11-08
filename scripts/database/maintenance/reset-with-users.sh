#!/bin/bash
# Complete database reset with user creation and role assignment
# Usage: bash scripts/database/reset-with-users.sh

set -e  # Exit on any error

# Create logs directory if it doesn't exist
mkdir -p scripts/history/database

# Generate timestamp and log file name
TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
LOG_FILE="scripts/history/database/reset-with-users_${TIMESTAMP}.log"

echo "🔄 Starting complete database reset..." | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"

# Step 1: Reset database
echo "" | tee -a "$LOG_FILE"
echo "1️⃣  Resetting Supabase database..." | tee -a "$LOG_FILE"
npx supabase db reset --local 2>&1 | tee -a "$LOG_FILE"
echo "✅ Database reset complete" | tee -a "$LOG_FILE"

# Step 2: Create development users via Auth API
echo "" | tee -a "$LOG_FILE"
echo "2️⃣  Creating development users via Auth API..." | tee -a "$LOG_FILE"
USER_OUTPUT=$(node scripts/database/seed-dev-users-via-api.js 2>&1)
echo "$USER_OUTPUT" | tee -a "$LOG_FILE"

# Extract user IDs from output
ADMIN_ID=$(echo "$USER_OUTPUT" | grep "p.romanczuk@gmail.com:" | awk '{print $2}')
TEACHER_ID=$(echo "$USER_OUTPUT" | grep "teacher@example.com:" | awk '{print $2}')
STUDENT_ID=$(echo "$USER_OUTPUT" | grep "student@example.com:" | awk '{print $2}')

echo "" | tee -a "$LOG_FILE"
echo "📋 Extracted User IDs:" | tee -a "$LOG_FILE"
echo "  Admin: $ADMIN_ID" | tee -a "$LOG_FILE"
echo "  Teacher: $TEACHER_ID" | tee -a "$LOG_FILE"
echo "  Student: $STUDENT_ID" | tee -a "$LOG_FILE"
echo "✅ Users created" | tee -a "$LOG_FILE"

# Step 3: Wait a moment for users to be fully created
echo "" | tee -a "$LOG_FILE"
echo "⏳ Waiting for user creation to complete..." | tee -a "$LOG_FILE"
sleep 2

# Step 4: Set role flags for all users
echo "" | tee -a "$LOG_FILE"
echo "3️⃣  Setting role flags for users..." | tee -a "$LOG_FILE"
psql postgresql://postgres:postgres@localhost:54322/postgres <<EOF 2>&1 | tee -a "$LOG_FILE"
-- Display profiles created by trigger
SELECT id, email, full_name FROM profiles ORDER BY email;

-- Set admin + teacher role for p.romanczuk@gmail.com using ID
UPDATE profiles 
SET is_admin = true, is_teacher = true 
WHERE id = '$ADMIN_ID'::uuid;

-- Set teacher role for teacher@example.com using ID
UPDATE profiles 
SET is_teacher = true 
WHERE id = '$TEACHER_ID'::uuid;

-- Set student role for student@example.com using ID
UPDATE profiles 
SET is_student = true 
WHERE id = '$STUDENT_ID'::uuid;

-- Set student role for test students by email
UPDATE profiles 
SET is_student = true 
WHERE email IN (
  'teststudent1@example.com', 
  'teststudent2@example.com', 
  'teststudent3@example.com'
);

-- Display updated roles
SELECT id, email, is_admin, is_teacher, is_student 
FROM profiles 
ORDER BY email;
EOF
echo "✅ Role flags updated" | tee -a "$LOG_FILE"

# Step 5: Seed lessons now that users exist
echo "" | tee -a "$LOG_FILE"
echo "4️⃣  Seeding lessons dynamically with current user IDs..." | tee -a "$LOG_FILE"
psql postgresql://postgres:postgres@localhost:54322/postgres <<EOF 2>&1 | tee -a "$LOG_FILE"
-- Get current user IDs
DO \$\$
DECLARE
    teacher_id uuid;
    student1_id uuid;
    student2_id uuid;
    student3_id uuid;
BEGIN
    -- Get user IDs
    SELECT id INTO teacher_id FROM profiles WHERE email = 'teacher@example.com';
    SELECT id INTO student1_id FROM profiles WHERE email = 'teststudent1@example.com';
    SELECT id INTO student2_id FROM profiles WHERE email = 'teststudent2@example.com';
    SELECT id INTO student3_id FROM profiles WHERE email = 'teststudent3@example.com';
    
    -- Clean existing data
    DELETE FROM lesson_songs;
    DELETE FROM lessons;
    
    -- Insert lessons for student 1
    INSERT INTO lessons (student_id, teacher_id, lesson_teacher_number, scheduled_at, status, notes)
    VALUES 
        (student1_id, teacher_id, 1, NOW() - INTERVAL '14 days', 'COMPLETED', 'Covered basic chords and strumming patterns'),
        (student1_id, teacher_id, 2, NOW() - INTERVAL '7 days', 'COMPLETED', 'Practiced chord transitions and fingerpicking'),
        (student1_id, teacher_id, 3, NOW() + INTERVAL '2 days', 'SCHEDULED', NULL);
    
    -- Insert lessons for student 2
    INSERT INTO lessons (student_id, teacher_id, lesson_teacher_number, scheduled_at, status, notes)
    VALUES 
        (student2_id, teacher_id, 1, NOW() - INTERVAL '14 days', 'COMPLETED', 'Covered basic chords and strumming patterns'),
        (student2_id, teacher_id, 2, NOW() - INTERVAL '7 days', 'COMPLETED', 'Practiced chord transitions and fingerpicking'),
        (student2_id, teacher_id, 3, NOW() + INTERVAL '2 days', 'SCHEDULED', NULL);
    
    -- Insert lessons for student 3
    INSERT INTO lessons (student_id, teacher_id, lesson_teacher_number, scheduled_at, status, notes)
    VALUES 
        (student3_id, teacher_id, 1, NOW() - INTERVAL '14 days', 'COMPLETED', 'Covered basic chords and strumming patterns'),
        (student3_id, teacher_id, 2, NOW() - INTERVAL '7 days', 'COMPLETED', 'Practiced chord transitions and fingerpicking'),
        (student3_id, teacher_id, 3, NOW() + INTERVAL '2 days', 'SCHEDULED', NULL);
    
    RAISE NOTICE 'Seeded % lessons', (SELECT COUNT(*) FROM lessons);
END \$\$;
EOF
echo "✅ Lessons seeded dynamically" | tee -a "$LOG_FILE"

# Step 6: Test login
echo "" | tee -a "$LOG_FILE"
echo "5️⃣  Testing login credentials..." | tee -a "$LOG_FILE"
node test-login.js 2>&1 | tee -a "$LOG_FILE"
echo "✅ Login test complete" | tee -a "$LOG_FILE"

# Step 7: Test admin data access
echo "" | tee -a "$LOG_FILE"
echo "6️⃣  Testing admin data access..." | tee -a "$LOG_FILE"
node test-admin-access.js 2>&1 | tee -a "$LOG_FILE"

echo "" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"
echo "🎉 Database reset and setup complete!" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
echo "You can now login with:" | tee -a "$LOG_FILE"
echo "  Email: p.romanczuk@gmail.com" | tee -a "$LOG_FILE"
echo "  Password: test123_admin" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
echo "📝 Full log saved to: $LOG_FILE" | tee -a "$LOG_FILE"
