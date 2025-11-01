#!/usr/bin/env python3
"""
Generate SQL INSERT statements from JSON backups
Run with: python3 scripts/generate-seed-sql.py > seed_data.sql
Then run seed_data.sql in Supabase Dashboard → SQL Editor
"""

import json
import sys
from pathlib import Path

# Column mappings (excluding id - let DB auto-generate)
# Using lowercase to match PostgreSQL's default case-folding behavior
COLUMNS_MAP = {
    'profiles': ['user_id', 'username', 'email', 'firstname', 'lastname', 'bio', 'isadmin', 'isteacher', 'isstudent', 'isactive', 'istest', 'created_at', 'updated_at'],
    'songs': ['title', 'author', 'level', 'key', 'chords', 'audio_files', 'ultimate_guitar_link', 'short_title', 'created_at', 'updated_at'],
    'lessons': ['student_id', 'teacher_id', 'date', 'status', 'created_at', 'updated_at'],
    'lesson_songs': ['lesson_id', 'song_id', 'student_id', 'learning_status', 'created_at', 'updated_at'],
    'task_management': ['user_id', 'title', 'description', 'status', 'priority', 'due_date', 'created_by_user_id', 'assigned_to_user_id', 'created_at', 'updated_at']
}

# Map backup's camelCase column names to lowercase for DB queries
BACKUP_TO_DB_MAP = {
    'firstname': 'firstName',
    'lastname': 'lastName',
    'isadmin': 'isAdmin',
    'isteacher': 'isTeacher',
    'isstudent': 'isStudent',
    'isactive': 'isActive',
    'istest': 'isTest',
    # Special mapping for lesson_songs table
    'learning_status': 'song_status',
}


def format_value(val):
    """Format Python value for SQL"""
    if val is None or val == '':
        return 'NULL'
    elif isinstance(val, bool):
        return str(val).upper()
    elif isinstance(val, (int, float)):
        return str(val)
    elif isinstance(val, dict) or isinstance(val, list):
        # JSONB columns - only if not empty
        if not val:  # Empty dict or list
            return 'NULL'
        json_str = json.dumps(val).replace("'", "''")
        return f"'{json_str}'"
    else:
        # String values - escape single quotes
        escaped = str(val).replace("'", "''")
        return f"'{escaped}'"


SONG_LEVELS = {"beginner", "intermediate", "advanced"}
SONG_KEYS = {"C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B",
             "Cm", "C#m", "Dm", "D#m", "Em", "Fm", "F#m", "Gm", "G#m", "Am", "A#m", "Bm"}
LESSON_STATUSES = {"scheduled", "completed", "cancelled", "rescheduled"}
LEARNING_STATUSES = {"to_learn", "started",
                     "remembered", "with_author", "mastered"}


def build_table_sql(json_file: Path, table_name: str, columns: list[str]) -> str:
    """Build INSERT SQL for a single table and return as string, with schema mapping and validation."""
    if not json_file.exists():
        return f"-- ⚠️  File not found: {json_file}\n"

    with open(json_file, 'r') as f:
        data = json.load(f)

    if not data:
        return f"-- ⚠️  {table_name}: No data to import\n"

    # Build column list - DON'T quote columns, let PostgreSQL handle case-folding to lowercase
    col_list = ', '.join(columns)

    out = []
    out.append("\n-- ============================================")
    out.append(f"-- Inserting {len(data)} rows into {table_name}")
    out.append("-- ============================================")
    out.append(f"INSERT INTO public.{table_name} ({col_list})")
    out.append("VALUES")

    valid_rows = 0
    for i, row in enumerate(data):
        values = []
        skip_row = False
        for col in columns:
            # Map lowercase DB column to camelCase backup column
            if table_name == 'lesson_songs' and col == 'learning_status':
                backup_col = 'song_status'
            else:
                backup_col = BACKUP_TO_DB_MAP.get(col, col)
            val = row.get(backup_col)

            # --- Table-specific fixes and validation ---
            if table_name == 'profiles':
                # Map camelCase to snake_case, fill missing fields
                if col == 'firstname':
                    val = row.get('firstName') or row.get('firstname')
                elif col == 'lastname':
                    val = row.get('lastName') or row.get('lastname')
                elif col == 'isadmin':
                    val = row.get('isAdmin', row.get('isadmin', False))
                elif col == 'isteacher':
                    val = row.get('isTeacher', row.get('isteacher', False))
                elif col == 'isstudent':
                    val = row.get('isStudent', row.get('isstudent', True))
                elif col == 'isactive':
                    val = row.get('isActive', row.get('isactive', True))
                elif col == 'istest':
                    val = row.get('isTest', row.get('istest', False))

            elif table_name == 'songs':
                # Validate required fields and enums
                if col == 'title':
                    val = row.get('title')
                    if not val:
                        skip_row = True
                        break
                elif col == 'author':
                    val = row.get('author') or 'Unknown'
                elif col == 'level':
                    v = row.get('level')
                    val = v if v in SONG_LEVELS else 'beginner'
                elif col == 'key':
                    v = row.get('key')
                    val = v if v in SONG_KEYS else 'C'
                elif col == 'ultimate_guitar_link':
                    val = row.get(
                        'ultimate_guitar_link') or 'https://example.com/'

            elif table_name == 'lessons':
                # Map status to lowercase and validate
                if col == 'status':
                    v = row.get('status', 'scheduled')
                    val = v.lower() if isinstance(v, str) else 'scheduled'
                    if val not in LESSON_STATUSES:
                        val = 'scheduled'

            elif table_name == 'lesson_songs':
                # Map song_status to learning_status and validate
                if col == 'song_status' or col == 'learning_status':
                    v = row.get('song_status', 'to_learn')
                    val = v.lower() if isinstance(v, str) else 'to_learn'
                    if val not in LEARNING_STATUSES:
                        val = 'to_learn'
                elif col == 'student_id':
                    val = row.get('student_id')
                    if not val:
                        val = 'NULL'

            # --- End table-specific fixes ---
            values.append(format_value(val))
        if skip_row:
            continue
        value_str = ', '.join(values)
        comma = ',' if valid_rows < len(data) - 1 else ';'
        out.append(f"({value_str}){comma}")
        valid_rows += 1

    out.append(f"\n-- ✅ {table_name} import complete")
    out.append("")
    return "\n".join(out)


def main():
    backup_dir = Path('supabase/backups/2025-10-26')

    if not backup_dir.exists():
        print(f"❌ Backup directory not found: {backup_dir}", file=sys.stderr)
        sys.exit(1)

    print("-- ============================================")
    print("-- Guitar CRM Database Seed Data")
    print("-- Generated from JSON backups")
    print("-- Run in Supabase Dashboard → SQL Editor")
    print("-- ============================================")
    print()
    print("-- Start transaction")
    print("BEGIN;")
    print()
    print("-- Temporarily disable foreign key constraint on profiles")
    print("ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;")
    print()

    # Import in foreign key order
    tables = ['profiles', 'songs', 'lessons',
              'lesson_songs', 'task_management']

    for table in tables:
        json_file = backup_dir / f'{table}.json'
        columns = COLUMNS_MAP.get(table, [])
        if columns:
            table_sql = build_table_sql(json_file, table, columns)
            # Print to combined stdout
            print(table_sql)
            # Also write per-table SQL files
            seed_dir = Path('supabase/seed_sql')
            seed_dir.mkdir(parents=True, exist_ok=True)
            per_file = seed_dir / f'seed_{table}.sql'
            pre = []
            post = []
            if table == 'profiles':
                pre.append(
                    "-- Temporarily disable foreign key constraint on profiles")
                pre.append(
                    "ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;")
                post.append("-- Re-add foreign key constraint on profiles")
                post.append("ALTER TABLE public.profiles")
                post.append("  ADD CONSTRAINT profiles_user_id_fkey")
                post.append("  FOREIGN KEY (user_id)")
                post.append("  REFERENCES auth.users(id)")
                post.append("  ON DELETE CASCADE;")
            with per_file.open('w') as f:
                f.write("-- Seed for table: %s\n" % table)
                f.write("BEGIN;\n\n")
                if pre:
                    f.write("\n".join(pre) + "\n\n")
                f.write(table_sql + "\n")
                if post:
                    f.write("\n".join(post) + "\n")
                f.write("\nCOMMIT;\n")

    print("-- Re-add foreign key constraint on profiles")
    print("ALTER TABLE public.profiles")
    print("  ADD CONSTRAINT profiles_user_id_fkey")
    print("  FOREIGN KEY (user_id)")
    print("  REFERENCES auth.users(id)")
    print("  ON DELETE CASCADE;")
    print()
    print("-- Commit transaction")
    print("COMMIT;")
    print()
    print("-- ✅ All data imported successfully!")
    print("-- Verify in Supabase Dashboard → Table Editor")


if __name__ == '__main__':
    main()
