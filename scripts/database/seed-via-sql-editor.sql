-- Emergency Database Seeding via SQL Editor
-- Run this directly in Supabase Dashboard → SQL Editor
-- This bypasses all connection issues
-- First, let's clear any existing test data (optional, comment out if not needed)
-- DELETE FROM public.lesson_songs;
-- DELETE FROM public.lessons;
-- DELETE FROM public.songs;
-- DELETE FROM public.profiles WHERE email LIKE '%test%';
-- Insert Profiles
-- NOTE: Adjust column names if your schema uses snake_case (first_name vs firstName)
INSERT INTO
  public.profiles (
    user_id,
    username,
    email,
    "firstName",
    "lastName",
    bio,
    "isAdmin",
    "isTeacher",
    "isStudent",
    "isActive",
    "isTest",
    created_at,
    updated_at
  )
VALUES
  (
    'a891790b-eb55-4cf3-8632-46bdf4e527ee',
    'jaroslaw.wojtkowski',
    'jaroslaw.wojtkowski@gmail.com',
    'Jaroslaw',
    'Wojtkowski',
    NULL,
    false,
    false,
    true,
    true,
    false,
    '2025-03-12T10:09:03.444897+00:00',
    '2025-03-12T10:09:03.444897+00:00'
  ),
  (
    '3be23c96-46b9-4d79-bad9-4000f7e3d685',
    'azmudzka24',
    'azmudzka24@gmail.com',
    'Azmudzka24',
    'User',
    NULL,
    false,
    false,
    true,
    true,
    false,
    '2025-03-12T11:24:42.724158+00:00',
    '2025-03-12T11:24:42.724158+00:00'
  ),
  (
    'a9d6a687-7dc3-4452-8e27-db3b104d00b3',
    'mateuszfiuczek263',
    'mateuszfiuczek263@gmail.com',
    'Mateuszfiuczek263',
    'User',
    NULL,
    false,
    false,
    true,
    true,
    false,
    '2025-03-12T13:05:46.029105+00:00',
    '2025-03-12T13:05:46.029105+00:00'
  ),
  (
    '41d15ec1-c424-46e0-8491-3861ec2d4c0b',
    'test',
    'test@test.com',
    'Test',
    'User',
    NULL,
    false,
    false,
    true,
    true,
    true,
    '2025-03-13T11:01:50.11583+00:00',
    '2025-03-13T11:01:50.11583+00:00'
  ),
  (
    '4d7947d8-6f63-445e-9709-a0c92cc09c08',
    NULL,
    'ola190708@gmail.com',
    'Ola190708',
    'User',
    NULL,
    false,
    false,
    true,
    true,
    false,
    '2025-03-13T15:04:50.898666+00:00',
    '2025-03-13T15:04:50.898666+00:00'
  );
-- Add more profiles as needed...
  -- (Due to size limits, only showing first 5. You would need to add remaining 23 profiles)
  -- ✅ RECOMMENDED APPROACH: Instead of manually copying SQL, run this Python script locally to generate the full SQL:
  /*
  # Python script to generate SQL from JSON backups:
  import json
  
  def json_to_sql(json_file, table_name, columns):
      """Convert JSON backup to SQL INSERT statements"""
      with open(json_file, 'r') as f:
          data = json.load(f)
      
      # Build INSERT statement
      col_list = ', '.join([f'"{col}"' if col != col.lower() else col for col in columns])
      print(f"-- Inserting {len(data)} rows into {table_name}")
      print(f"INSERT INTO public.{table_name} ({col_list})")
      print("VALUES")
      
      for i, row in enumerate(data):
          values = []
          for col in columns:
              val = row.get(col)
              if val is None:
                  values.append('NULL')
              elif isinstance(val, bool):
                  values.append(str(val).upper())
              elif isinstance(val, (int, float)):
                  values.append(str(val))
              else:
                  # Escape single quotes in strings
                  escaped = str(val).replace("'", "''")
                  values.append(f"'{escaped}'")
          
          value_str = ', '.join(values)
          comma = ',' if i < len(data) - 1 else ';'
          print(f"({value_str}){comma}")
      print()
  
  # Generate SQL for all tables
  columns_map = {
      'profiles': ['user_id', 'username', 'email', 'firstName', 'lastName', 'bio', 'isAdmin', 'isTeacher', 'isStudent', 'isActive', 'isTest', 'created_at', 'updated_at'],
      'songs': ['title', 'author', 'level', 'key', 'chords', 'audio_files', 'ultimate_guitar_link', 'short_title', 'created_at', 'updated_at'],
      'lessons': ['student_id', 'teacher_id', 'creator_user_id', 'date', 'time', 'start_time', 'status', 'lesson_number', 'lesson_teacher_number', 'title', 'notes', 'created_at', 'updated_at'],
      'lesson_songs': ['lesson_id', 'song_id', 'student_id', 'song_status', 'created_at', 'updated_at']
  }
  
  for table, columns in columns_map.items():
      json_to_sql(f'supabase/backups/2025-10-26/{table}.json', table, columns)
      
  # Run with: python3 generate_seed_sql.py > seed_data.sql
  */
  -- Then run the generated seed_data.sql in Supabase Dashboard SQL Editor