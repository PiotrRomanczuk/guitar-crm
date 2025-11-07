#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color
BLUE='\033[0;34m'
YELLOW='\033[1;33m'

# Current timestamp for created_at fields
TIMESTAMP=$(date -u +"%Y-%m-%d %H:%M:%S")

# Database connection details
DB_HOST="127.0.0.1"
DB_PORT="54322"
DB_USER="postgres"
DB_PASSWORD="postgres"
DB_NAME="postgres"

# Function to check if Supabase is running
check_supabase() {
    if ! pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER > /dev/null 2>&1; then
        echo -e "${RED}❌ Database is not running. Please start Supabase with 'supabase start'${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Database is running${NC}"
}

# Function to create users and store their IDs
create_users() {
    echo -e "\n${BLUE}👥 Creating test users...${NC}"
    
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME << EOF
    DO \$\$
    DECLARE
        admin_id uuid;
        teacher_id uuid;
        student_id uuid;
    BEGIN
        -- Create admin user
        INSERT INTO auth.users (
            instance_id, id, aud, role, email,
            encrypted_password, email_confirmed_at,
            created_at, updated_at
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'p.romanczuk@gmail.com',
            crypt('test123_admin', gen_salt('bf')),
            now(), now(), now()
        ) RETURNING id INTO admin_id;

        -- Create admin profile
        INSERT INTO public.profiles (
            user_id, email, firstname, lastname,
            isadmin, isteacher, isstudent, is_active
        ) VALUES (
            admin_id,
            'p.romanczuk@gmail.com',
            'Admin',
            'User',
            true, true, false, true
        );

        -- Create teacher user
        INSERT INTO auth.users (
            instance_id, id, aud, role, email,
            encrypted_password, email_confirmed_at,
            created_at, updated_at
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'teacher@example.com',
            crypt('test123_teacher', gen_salt('bf')),
            now(), now(), now()
        ) RETURNING id INTO teacher_id;

        -- Create teacher profile
        INSERT INTO public.profiles (
            user_id, email, firstname, lastname,
            isadmin, isteacher, isstudent, is_active
        ) VALUES (
            teacher_id,
            'teacher@example.com',
            'Teacher',
            'User',
            false, true, false, true
        );

        -- Create student user
        INSERT INTO auth.users (
            instance_id, id, aud, role, email,
            encrypted_password, email_confirmed_at,
            created_at, updated_at
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'student@example.com',
            crypt('test123_student', gen_salt('bf')),
            now(), now(), now()
        ) RETURNING id INTO student_id;

        -- Create student profile
        INSERT INTO public.profiles (
            user_id, email, firstname, lastname,
            isadmin, isteacher, isstudent, is_active
        ) VALUES (
            student_id,
            'student@example.com',
            'Student',
            'User',
            false, false, true, true
        );

        -- Store IDs for later use
        CREATE TEMPORARY TABLE user_ids (
            admin_id uuid,
            teacher_id uuid,
            student_id uuid
        );
        
        INSERT INTO user_ids VALUES (admin_id, teacher_id, student_id);
    END \$\$;
EOF

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Users created successfully${NC}"
    else
        echo -e "${RED}❌ Failed to create users${NC}"
        exit 1
    fi
}

# Function to seed songs
seed_songs() {
    echo -e "\n${BLUE}🎸 Seeding songs...${NC}"
    
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME << EOF
    INSERT INTO public.songs (title, author, level, key, ultimate_guitar_link, created_at, updated_at) VALUES
    ('Wonderwall', 'Oasis', 'beginner', 'Em', 'https://tabs.ultimate-guitar.com/tab/oasis/wonderwall-chords-27596', '$TIMESTAMP', '$TIMESTAMP'),
    ('Nothing Else Matters', 'Metallica', 'intermediate', 'Em', 'https://tabs.ultimate-guitar.com/tab/metallica/nothing-else-matters-tabs-32', '$TIMESTAMP', '$TIMESTAMP'),
    ('Classical Gas', 'Mason Williams', 'advanced', 'Em', 'https://tabs.ultimate-guitar.com/tab/mason-williams/classical-gas-tabs-52221', '$TIMESTAMP', '$TIMESTAMP'),
    ('Sweet Home Alabama', 'Lynyrd Skynyrd', 'beginner', 'D', 'https://tabs.ultimate-guitar.com/tab/lynyrd-skynyrd/sweet-home-alabama-chords-41512', '$TIMESTAMP', '$TIMESTAMP'),
    ('Stairway to Heaven', 'Led Zeppelin', 'intermediate', 'Am', 'https://tabs.ultimate-guitar.com/tab/led-zeppelin/stairway-to-heaven-tabs-9488', '$TIMESTAMP', '$TIMESTAMP');
EOF

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Songs seeded successfully${NC}"
    else
        echo -e "${RED}❌ Failed to seed songs${NC}"
        exit 1
    fi
}

# Function to seed lessons
seed_lessons() {
    echo -e "\n${BLUE}📚 Seeding lessons...${NC}"
    
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME << EOF
    INSERT INTO public.lessons (
        student_id,
        teacher_id,
        date,
        status,
        created_at,
        updated_at
    )
    SELECT 
        student_id,
        teacher_id,
        generate_series(
            '$TIMESTAMP'::timestamp - interval '14 days',
            '$TIMESTAMP'::timestamp + interval '14 days',
            interval '7 days'
        ),
        CASE 
            WHEN generate_series < '$TIMESTAMP'::timestamp THEN 'completed'::lesson_status
            ELSE 'scheduled'::lesson_status
        END,
        '$TIMESTAMP',
        '$TIMESTAMP'
    FROM user_ids;
EOF

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Lessons seeded successfully${NC}"
    else
        echo -e "${RED}❌ Failed to seed lessons${NC}"
        exit 1
    fi
}

# Function to seed lesson songs
seed_lesson_songs() {
    echo -e "\n${BLUE}🎼 Seeding lesson songs...${NC}"
    
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME << EOF
    INSERT INTO public.lesson_songs (
        lesson_id,
        song_id,
        student_id,
        song_status,
        created_at,
        updated_at
    )
    SELECT 
        l.id,
        s.id,
        l.student_id,
        (ARRAY['to_learn', 'started', 'remembered', 'with_author', 'mastered'])[floor(random() * 5 + 1)]::song_status,
        '$TIMESTAMP',
        '$TIMESTAMP'
    FROM public.lessons l
    CROSS JOIN public.songs s
    WHERE random() < 0.7;
EOF

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Lesson songs seeded successfully${NC}"
    else
        echo -e "${RED}❌ Failed to seed lesson songs${NC}"
        exit 1
    fi
}

# Function to seed assignments
seed_assignments() {
    echo -e "\n${BLUE}📝 Seeding assignments...${NC}"
    
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME << EOF
    INSERT INTO public.assignments (
        lesson_id,
        student_id,
        teacher_id,
        title,
        description,
        due_date,
        status,
        feedback,
        song_id,
        practice_minutes,
        created_at,
        updated_at
    )
    SELECT 
        l.id,
        l.student_id,
        l.teacher_id,
        CASE (random() * 3)::int
            WHEN 0 THEN 'Practice Chord Transitions'
            WHEN 1 THEN 'Work on Strumming Pattern'
            ELSE 'Master the Solo Section'
        END,
        CASE (random() * 3)::int
            WHEN 0 THEN 'Focus on smooth transitions between chords. Use a metronome.'
            WHEN 1 THEN 'Practice the main strumming pattern slowly, then increase speed.'
            ELSE 'Break down the solo into small sections. Practice each part slowly.'
        END,
        l.date + interval '7 days',
        (ARRAY['not_started', 'in_progress', 'completed', 'overdue'])[floor(random() * 4 + 1)]::assignment_status,
        CASE WHEN random() < 0.7 THEN 'Good progress! Keep practicing regularly.'
             ELSE NULL
        END,
        s.id,
        (random() * 60 + 15)::int,
        '$TIMESTAMP',
        '$TIMESTAMP'
    FROM public.lessons l
    CROSS JOIN public.songs s
    WHERE random() < 0.5;
EOF

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Assignments seeded successfully${NC}"
    else
        echo -e "${RED}❌ Failed to seed assignments${NC}"
        exit 1
    fi
}

# Function to verify data
verify_seeding() {
    echo -e "\n${BLUE}🔍 Verifying seeded data...${NC}"
    
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME << EOF
    SELECT 'Users' as type, count(*) as count FROM auth.users
    UNION ALL
    SELECT 'Profiles', count(*) FROM public.profiles
    UNION ALL
    SELECT 'Songs', count(*) FROM public.songs
    UNION ALL
    SELECT 'Lessons', count(*) FROM public.lessons
    UNION ALL
    SELECT 'Lesson Songs', count(*) FROM public.lesson_songs
    UNION ALL
    SELECT 'Assignments', count(*) FROM public.assignments;
EOF
}

# Main execution
echo -e "\n${BLUE}🔍 Checking prerequisites...${NC}"
check_supabase

echo -e "\n${BLUE}🗄️ Setting up database...${NC}"
create_users
seed_songs
seed_lessons
seed_lesson_songs
seed_assignments
verify_seeding

echo -e "\n${GREEN}✅ Development environment setup complete!${NC}"
echo -e "\n${BLUE}Test credentials:${NC}"
echo "Admin user:     p.romanczuk@gmail.com / test123_admin"
echo "Teacher user:   teacher@example.com / test123_teacher"
echo "Student user:   student@example.com / test123_student"
echo -e "\n${BLUE}You can now start the development server with:${NC}"
echo "npm run dev"