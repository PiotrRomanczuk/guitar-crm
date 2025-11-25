## Development Credentials

These users are seeded automatically via script: `bash scripts/database/seeding/local/seed-all.sh`.
All passwords are intended for local development only.

```
Admin (role: admin + teacher):
- Email: `p.romanczuk@gmail.com`
- Password: `test123_admin`

Teacher (role: teacher):
- Email: `teacher@example.com`
- Password: `test123_teacher`

Student (role: student):
- Email: `student@example.com`
- Password: `test123_student`

Additional Students:
  teststudent1@example.com / test123_student
  teststudent2@example.com / test123_student
  teststudent3@example.com / test123_student
```

### Usage Notes

- Run the full seed: `bash scripts/database/seeding/local/seed-all.sh` before testing login flows.
- Profiles align with `auth.users` ids; roles are stored on `profiles` table (snake_case columns).
- After seeding you can verify roles:
  ```sql
  SELECT p.email, ur.role 
  FROM profiles p 
  JOIN user_roles ur ON p.id = ur.user_id 
  ORDER BY p.email;
  ```

- Do NOT use these credentials in production.
