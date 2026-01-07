-- Update test user passwords with proper bcrypt hashes
-- These hashes correspond to the passwords in cypress.env.json

-- For bcrypt hash generation, we'll use the crypt extension
-- Password: test123_admin
UPDATE auth.users 
SET encrypted_password = crypt('test123_admin', gen_salt('bf'))
WHERE email = 'p.romanczuk@gmail.com';

-- Password: test123_teacher  
UPDATE auth.users
SET encrypted_password = crypt('test123_teacher', gen_salt('bf'))
WHERE email = 'teacher@example.com';

-- Password: test123_student
UPDATE auth.users
SET encrypted_password = crypt('test123_student', gen_salt('bf'))
WHERE email IN ('student1@example.com', 'student2@example.com');

-- Verify updates
SELECT email, encrypted_password IS NOT NULL as has_password 
FROM auth.users 
ORDER BY email;
