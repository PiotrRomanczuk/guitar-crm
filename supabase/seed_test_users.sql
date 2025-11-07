-- Seed test users for local development
-- Based on development_credentials.txt
-- Create test users in auth.users
INSERT INTO
  auth.users (
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
  )
VALUES
  -- Admin User
  (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'p.romanczuk@gmail.com',
    crypt('test123_admin', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"firstName":"Piotr","lastName":"Romanczuk"}',
    false,
    'authenticated'
  ),
  -- Test Teacher
  (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'teacher@example.com',
    crypt('test123_teacher', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"firstName":"Test","lastName":"Teacher"}',
    false,
    'authenticated'
  ),
  -- Test Student
  (
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'student@example.com',
    crypt('test123_student', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"firstName":"Test","lastName":"Student"}',
    false,
    'authenticated'
  ),
  -- Test Student 1
  (
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000000',
    'teststudent1@example.com',
    crypt('test123_student', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"firstName":"Student","lastName":"One"}',
    false,
    'authenticated'
  ),
  -- Test Student 2
  (
    '00000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000000',
    'teststudent2@example.com',
    crypt('test123_student', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"firstName":"Student","lastName":"Two"}',
    false,
    'authenticated'
  ),
  -- Test Student 3
  (
    '00000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000000',
    'teststudent3@example.com',
    crypt('test123_student', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"firstName":"Student","lastName":"Three"}',
    false,
    'authenticated'
  ) ON CONFLICT (id) DO NOTHING;
-- Create corresponding profiles
INSERT INTO
  public.profiles (
    user_id,
    email,
    "firstName",
    "lastName",
    "isAdmin",
    "isTeacher",
    "isStudent"
  )
VALUES
  -- Admin User (also a teacher)
  (
    '00000000-0000-0000-0000-000000000001',
    'p.romanczuk@gmail.com',
    'Piotr',
    'Romanczuk',
    true,
    true,
    false
  ),
  -- Test Teacher
  (
    '00000000-0000-0000-0000-000000000002',
    'teacher@example.com',
    'Test',
    'Teacher',
    false,
    true,
    false
  ),
  -- Test Student
  (
    '00000000-0000-0000-0000-000000000003',
    'student@example.com',
    'Test',
    'Student',
    false,
    false,
    true
  ),
  -- Test Student 1
  (
    '00000000-0000-0000-0000-000000000004',
    'teststudent1@example.com',
    'Student',
    'One',
    false,
    false,
    true
  ),
  -- Test Student 2
  (
    '00000000-0000-0000-0000-000000000005',
    'teststudent2@example.com',
    'Student',
    'Two',
    false,
    false,
    true
  ),
  -- Test Student 3
  (
    '00000000-0000-0000-0000-000000000006',
    'teststudent3@example.com',
    'Student',
    'Three',
    false,
    false,
    true
  ) ON CONFLICT (user_id) DO NOTHING;