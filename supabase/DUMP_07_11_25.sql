SET
  statement_timeout = 0;
SET
  lock_timeout = 0;
SET
  idle_in_transaction_session_timeout = 0;
SET
  client_encoding = 'UTF8';
SET
  standard_conforming_strings = on;
SELECT
  pg_catalog.set_config('search_path', '', false);
SET
  check_function_bodies = false;
SET
  xmloption = content;
SET
  client_min_messages = warning;
SET
  row_security = off;
CREATE SCHEMA IF NOT EXISTS "public";
ALTER SCHEMA "public" OWNER TO "postgres";
CREATE TYPE "public"."difficulty_level" AS ENUM (
    'beginner',
    'intermediate',
    'advanced'
  );
ALTER TYPE "public"."difficulty_level" OWNER TO "postgres";
CREATE TYPE "public"."learning_status" AS ENUM (
    'to_learn',
    'started',
    'remembered',
    'with_author',
    'mastered'
  );
ALTER TYPE "public"."learning_status" OWNER TO "postgres";
CREATE TYPE "public"."lesson_status" AS ENUM (
    'SCHEDULED',
    'COMPLETED',
    'CANCELLED',
    'RESCHEDULED'
  );
ALTER TYPE "public"."lesson_status" OWNER TO "postgres";
CREATE TYPE "public"."music_key" AS ENUM (
    'C',
    'C#',
    'Db',
    'D',
    'D#',
    'Eb',
    'E',
    'F',
    'F#',
    'Gb',
    'G',
    'G#',
    'Ab',
    'A',
    'A#',
    'Bb',
    'B',
    'Cm',
    'C#m',
    'Dm',
    'D#m',
    'Ebm',
    'Em',
    'Fm',
    'F#m',
    'Gm',
    'G#m',
    'Am',
    'A#m',
    'Bbm',
    'Bm'
  );
ALTER TYPE "public"."music_key" OWNER TO "postgres";
CREATE TYPE "public"."task_priority" AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'URGENT'
  );
ALTER TYPE "public"."task_priority" OWNER TO "postgres";
CREATE TYPE "public"."task_status" AS ENUM (
    'OPEN',
    'IN_PROGRESS',
    'PENDING_REVIEW',
    'COMPLETED',
    'CANCELLED',
    'BLOCKED'
  );
ALTER TYPE "public"."task_status" OWNER TO "postgres";
CREATE
  OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger" LANGUAGE "plpgsql" SECURITY DEFINER AS $ $ begin
insert into
  public.profiles (id, email)
values
  (new.id, new.email) on conflict (id) do nothing;
return new;
end;
$ $;
ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";
CREATE
OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger" LANGUAGE "plpgsql" AS $ $ BEGIN NEW.updated_at = now();
RETURN NEW;
END;
$ $;
ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";
SET
  default_tablespace = '';
SET
  default_table_access_method = "heap";
CREATE TABLE IF NOT EXISTS "public"."lesson_songs" (
    "lesson_id" "uuid" NOT NULL,
    "song_id" "uuid" NOT NULL,
    "song_status" "public"."learning_status" DEFAULT 'to_learn' :: "public"."learning_status" NOT NULL,
    "teacher_id" "uuid",
    "student_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone
  );
ALTER TABLE
  "public"."lesson_songs" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."lessons" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "student_id" "uuid" NOT NULL,
    "teacher_id" "uuid" NOT NULL,
    "creator_user_id" "uuid" NOT NULL,
    "title" "text",
    "notes" "text",
    "date" "date" NOT NULL,
    "start_time" time without time zone,
    "status" "public"."lesson_status" DEFAULT 'SCHEDULED' :: "public"."lesson_status" NOT NULL,
    "lesson_number" integer,
    "lesson_teacher_number" integer,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone
  );
ALTER TABLE
  "public"."lessons" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "user_id" "uuid" NOT NULL,
    "username" "text" NOT NULL,
    "email" "text" NOT NULL,
    "firstname" "text",
    "lastname" "text",
    "isadmin" boolean DEFAULT false NOT NULL,
    "isteacher" boolean DEFAULT false NOT NULL,
    "isstudent" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone
  );
ALTER TABLE
  "public"."profiles" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."songs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "author" "text" NOT NULL,
    "level" "public"."difficulty_level" NOT NULL,
    "key" "public"."music_key" NOT NULL,
    "chords" "text",
    "audio_files" "text" [],
    "ultimate_guitar_link" "text" NOT NULL,
    "short_title" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone
  );
ALTER TABLE
  "public"."songs" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."task_management" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "assigned_to" "uuid",
    "created_by" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "priority" "public"."task_priority" DEFAULT 'MEDIUM' :: "public"."task_priority" NOT NULL,
    "status" "public"."task_status" DEFAULT 'OPEN' :: "public"."task_status" NOT NULL,
    "due_date" "date",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "completed_at" timestamp with time zone
  );
ALTER TABLE
  "public"."task_management" OWNER TO "postgres";
ALTER TABLE
  ONLY "public"."lesson_songs"
ADD
  CONSTRAINT "lesson_songs_pkey" PRIMARY KEY ("lesson_id", "song_id");
ALTER TABLE
  ONLY "public"."lessons"
ADD
  CONSTRAINT "lessons_pkey" PRIMARY KEY ("id");
ALTER TABLE
  ONLY "public"."profiles"
ADD
  CONSTRAINT "profiles_email_key" UNIQUE ("email");
ALTER TABLE
  ONLY "public"."profiles"
ADD
  CONSTRAINT "profiles_pkey" PRIMARY KEY ("user_id");
ALTER TABLE
  ONLY "public"."profiles"
ADD
  CONSTRAINT "profiles_username_key" UNIQUE ("username");
ALTER TABLE
  ONLY "public"."songs"
ADD
  CONSTRAINT "songs_pkey" PRIMARY KEY ("id");
ALTER TABLE
  ONLY "public"."task_management"
ADD
  CONSTRAINT "task_management_pkey" PRIMARY KEY ("id");
CREATE INDEX "idx_lesson_songs_lesson_id" ON "public"."lesson_songs" USING "btree" ("lesson_id");
CREATE INDEX "idx_lesson_songs_song_id" ON "public"."lesson_songs" USING "btree" ("song_id");
CREATE INDEX "idx_lesson_songs_status" ON "public"."lesson_songs" USING "btree" ("song_status");
CREATE INDEX "idx_lesson_songs_student_id" ON "public"."lesson_songs" USING "btree" ("student_id")
WHERE
  ("student_id" IS NOT NULL);
CREATE INDEX "idx_lesson_songs_teacher_id" ON "public"."lesson_songs" USING "btree" ("teacher_id")
WHERE
  ("teacher_id" IS NOT NULL);
CREATE INDEX "idx_lessons_creator_user_id" ON "public"."lessons" USING "btree" ("creator_user_id");
CREATE INDEX "idx_lessons_date" ON "public"."lessons" USING "btree" ("date");
CREATE INDEX "idx_lessons_status" ON "public"."lessons" USING "btree" ("status");
CREATE INDEX "idx_lessons_student_id" ON "public"."lessons" USING "btree" ("student_id");
CREATE INDEX "idx_lessons_teacher_id" ON "public"."lessons" USING "btree" ("teacher_id");
CREATE INDEX "idx_lessons_teacher_student" ON "public"."lessons" USING "btree" ("teacher_id", "student_id", "date" DESC);
CREATE INDEX "idx_profiles_email" ON "public"."profiles" USING "btree" ("email");
CREATE INDEX "idx_profiles_isstudent" ON "public"."profiles" USING "btree" ("isstudent");
CREATE INDEX "idx_profiles_isteacher" ON "public"."profiles" USING "btree" ("isteacher");
CREATE INDEX "idx_profiles_username" ON "public"."profiles" USING "btree" ("username");
CREATE INDEX "idx_songs_title" ON "public"."songs" USING "btree" ("title");
CREATE INDEX "idx_task_management_assigned_to" ON "public"."task_management" USING "btree" ("assigned_to");
CREATE INDEX "idx_task_management_created_by" ON "public"."task_management" USING "btree" ("created_by");
CREATE INDEX "idx_task_management_due_date" ON "public"."task_management" USING "btree" ("due_date")
WHERE
  ("due_date" IS NOT NULL);
CREATE INDEX "idx_task_management_priority" ON "public"."task_management" USING "btree" ("priority");
CREATE INDEX "idx_task_management_status" ON "public"."task_management" USING "btree" ("status");
CREATE
  OR REPLACE TRIGGER "set_updated_at" BEFORE
UPDATE
  ON "public"."lesson_songs" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();
CREATE
  OR REPLACE TRIGGER "set_updated_at" BEFORE
UPDATE
  ON "public"."lessons" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();
CREATE
  OR REPLACE TRIGGER "set_updated_at" BEFORE
UPDATE
  ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();
CREATE
  OR REPLACE TRIGGER "set_updated_at" BEFORE
UPDATE
  ON "public"."songs" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();
CREATE
  OR REPLACE TRIGGER "set_updated_at" BEFORE
UPDATE
  ON "public"."task_management" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();
ALTER TABLE
  ONLY "public"."lesson_songs"
ADD
  CONSTRAINT "lesson_songs_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE CASCADE;
ALTER TABLE
  ONLY "public"."lesson_songs"
ADD
  CONSTRAINT "lesson_songs_song_id_fkey" FOREIGN KEY ("song_id") REFERENCES "public"."songs"("id") ON DELETE CASCADE;
ALTER TABLE
  ONLY "public"."lesson_songs"
ADD
  CONSTRAINT "lesson_songs_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."profiles"("user_id") ON DELETE
SET
  NULL;
ALTER TABLE
  ONLY "public"."lesson_songs"
ADD
  CONSTRAINT "lesson_songs_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."profiles"("user_id") ON DELETE
SET
  NULL;
ALTER TABLE
  ONLY "public"."lessons"
ADD
  CONSTRAINT "lessons_creator_user_id_fkey" FOREIGN KEY ("creator_user_id") REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE;
ALTER TABLE
  ONLY "public"."lessons"
ADD
  CONSTRAINT "lessons_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE;
ALTER TABLE
  ONLY "public"."lessons"
ADD
  CONSTRAINT "lessons_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE;
ALTER TABLE
  ONLY "public"."profiles"
ADD
  CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;
ALTER TABLE
  ONLY "public"."task_management"
ADD
  CONSTRAINT "task_management_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "public"."profiles"("user_id") ON DELETE
SET
  NULL;
ALTER TABLE
  ONLY "public"."task_management"
ADD
  CONSTRAINT "task_management_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE;
CREATE POLICY "Admins can delete any lesson" ON "public"."lessons" FOR DELETE USING (
    (
      EXISTS (
        SELECT
          1
        FROM
          "public"."profiles" "p"
        WHERE
          (
            ("p"."user_id" = "auth"."uid"())
            AND ("p"."isadmin" = true)
          )
      )
    )
  );
CREATE POLICY "Admins can delete any profile" ON "public"."profiles" FOR DELETE USING (
    (
      EXISTS (
        SELECT
          1
        FROM
          "public"."profiles" "p"
        WHERE
          (
            ("p"."user_id" = "auth"."uid"())
            AND ("p"."isadmin" = true)
          )
      )
    )
  );
CREATE POLICY "Admins can delete songs" ON "public"."songs" FOR DELETE USING (
    (
      EXISTS (
        SELECT
          1
        FROM
          "public"."profiles" "p"
        WHERE
          (
            ("p"."user_id" = "auth"."uid"())
            AND ("p"."isadmin" = true)
          )
      )
    )
  );
CREATE POLICY "Admins can delete tasks" ON "public"."task_management" FOR DELETE USING (
    (
      EXISTS (
        SELECT
          1
        FROM
          "public"."profiles" "p"
        WHERE
          (
            ("p"."user_id" = "auth"."uid"())
            AND ("p"."isadmin" = true)
          )
      )
    )
  );
CREATE POLICY "Admins can insert tasks" ON "public"."task_management" FOR
INSERT
  WITH CHECK (
    (
      EXISTS (
        SELECT
          1
        FROM
          "public"."profiles" "p"
        WHERE
          (
            ("p"."user_id" = "auth"."uid"())
            AND ("p"."isadmin" = true)
          )
      )
    )
  );
CREATE POLICY "Admins can update any lesson" ON "public"."lessons" FOR
UPDATE
  USING (
    (
      EXISTS (
        SELECT
          1
        FROM
          "public"."profiles" "p"
        WHERE
          (
            ("p"."user_id" = "auth"."uid"())
            AND ("p"."isadmin" = true)
          )
      )
    )
  );
CREATE POLICY "Admins can update any profile" ON "public"."profiles" FOR
UPDATE
  USING (
    (
      EXISTS (
        SELECT
          1
        FROM
          "public"."profiles" "p"
        WHERE
          (
            ("p"."user_id" = "auth"."uid"())
            AND ("p"."isadmin" = true)
          )
      )
    )
  );
CREATE POLICY "Admins can update tasks" ON "public"."task_management" FOR
UPDATE
  USING (
    (
      EXISTS (
        SELECT
          1
        FROM
          "public"."profiles" "p"
        WHERE
          (
            ("p"."user_id" = "auth"."uid"())
            AND ("p"."isadmin" = true)
          )
      )
    )
  );
CREATE POLICY "Admins can view all lessons" ON "public"."lessons" FOR
SELECT
  USING (
    (
      EXISTS (
        SELECT
          1
        FROM
          "public"."profiles" "p"
        WHERE
          (
            ("p"."user_id" = "auth"."uid"())
            AND ("p"."isadmin" = true)
          )
      )
    )
  );
CREATE POLICY "Admins can view all profiles" ON "public"."profiles" FOR
SELECT
  USING (
    (
      EXISTS (
        SELECT
          1
        FROM
          "public"."profiles" "p"
        WHERE
          (
            ("p"."user_id" = "auth"."uid"())
            AND ("p"."isadmin" = true)
          )
      )
    )
  );
CREATE POLICY "Admins can view all tasks" ON "public"."task_management" FOR
SELECT
  USING (
    (
      EXISTS (
        SELECT
          1
        FROM
          "public"."profiles" "p"
        WHERE
          (
            ("p"."user_id" = "auth"."uid"())
            AND ("p"."isadmin" = true)
          )
      )
    )
  );
CREATE POLICY "Students can update own lesson_songs" ON "public"."lesson_songs" FOR
UPDATE
  USING (
    (
      EXISTS (
        SELECT
          1
        FROM
          "public"."lessons" "l"
        WHERE
          (
            ("l"."id" = "lesson_songs"."lesson_id")
            AND ("l"."student_id" = "auth"."uid"())
          )
      )
    )
  );
CREATE POLICY "Students can view assigned songs" ON "public"."songs" FOR
SELECT
  USING (
    (
      EXISTS (
        SELECT
          1
        FROM
          (
            "public"."lesson_songs" "ls"
            JOIN "public"."lessons" "l" ON (("l"."id" = "ls"."lesson_id"))
          )
        WHERE
          (
            ("ls"."song_id" = "songs"."id")
            AND ("l"."student_id" = "auth"."uid"())
          )
      )
    )
  );
CREATE POLICY "Students can view own lessons" ON "public"."lessons" FOR
SELECT
  USING (("student_id" = "auth"."uid"()));
CREATE POLICY "Teachers and admins can delete lesson_songs" ON "public"."lesson_songs" FOR DELETE USING (
    (
      (
        EXISTS (
          SELECT
            1
          FROM
            "public"."lessons" "l"
          WHERE
            (
              ("l"."id" = "lesson_songs"."lesson_id")
              AND ("l"."teacher_id" = "auth"."uid"())
            )
        )
      )
      OR (
        EXISTS (
          SELECT
            1
          FROM
            "public"."profiles" "p"
          WHERE
            (
              ("p"."user_id" = "auth"."uid"())
              AND ("p"."isadmin" = true)
            )
        )
      )
    )
  );
CREATE POLICY "Teachers and admins can insert lesson_songs" ON "public"."lesson_songs" FOR
INSERT
  WITH CHECK (
    (
      EXISTS (
        SELECT
          1
        FROM
          "public"."profiles" "p"
        WHERE
          (
            ("p"."user_id" = "auth"."uid"())
            AND (
              ("p"."isadmin" = true)
              OR ("p"."isteacher" = true)
            )
          )
      )
    )
  );
CREATE POLICY "Teachers and admins can insert lessons" ON "public"."lessons" FOR
INSERT
  WITH CHECK (
    (
      EXISTS (
        SELECT
          1
        FROM
          "public"."profiles" "p"
        WHERE
          (
            ("p"."user_id" = "auth"."uid"())
            AND (
              ("p"."isadmin" = true)
              OR ("p"."isteacher" = true)
            )
          )
      )
    )
  );
CREATE POLICY "Teachers and admins can insert songs" ON "public"."songs" FOR
INSERT
  WITH CHECK (
    (
      EXISTS (
        SELECT
          1
        FROM
          "public"."profiles" "p"
        WHERE
          (
            ("p"."user_id" = "auth"."uid"())
            AND (
              ("p"."isadmin" = true)
              OR ("p"."isteacher" = true)
            )
          )
      )
    )
  );
CREATE POLICY "Teachers and admins can update lesson_songs" ON "public"."lesson_songs" FOR
UPDATE
  USING (
    (
      (
        EXISTS (
          SELECT
            1
          FROM
            "public"."lessons" "l"
          WHERE
            (
              ("l"."id" = "lesson_songs"."lesson_id")
              AND ("l"."teacher_id" = "auth"."uid"())
            )
        )
      )
      OR (
        EXISTS (
          SELECT
            1
          FROM
            "public"."profiles" "p"
          WHERE
            (
              ("p"."user_id" = "auth"."uid"())
              AND ("p"."isadmin" = true)
            )
        )
      )
    )
  );
CREATE POLICY "Teachers and admins can update songs" ON "public"."songs" FOR
UPDATE
  USING (
    (
      EXISTS (
        SELECT
          1
        FROM
          "public"."profiles" "p"
        WHERE
          (
            ("p"."user_id" = "auth"."uid"())
            AND (
              ("p"."isadmin" = true)
              OR ("p"."isteacher" = true)
            )
          )
      )
    )
  );
CREATE POLICY "Teachers and admins can view all songs" ON "public"."songs" FOR
SELECT
  USING (
    (
      EXISTS (
        SELECT
          1
        FROM
          "public"."profiles" "p"
        WHERE
          (
            ("p"."user_id" = "auth"."uid"())
            AND (
              ("p"."isadmin" = true)
              OR ("p"."isteacher" = true)
            )
          )
      )
    )
  );
CREATE POLICY "Teachers can delete own lessons" ON "public"."lessons" FOR DELETE USING (("teacher_id" = "auth"."uid"()));
CREATE POLICY "Teachers can update own lessons" ON "public"."lessons" FOR
UPDATE
  USING (("teacher_id" = "auth"."uid"()));
CREATE POLICY "Teachers can view own lessons" ON "public"."lessons" FOR
SELECT
  USING (("teacher_id" = "auth"."uid"()));
CREATE POLICY "Teachers can view student profiles" ON "public"."profiles" FOR
SELECT
  USING (
    (
      EXISTS (
        SELECT
          1
        FROM
          "public"."lessons" "l"
        WHERE
          (
            ("l"."teacher_id" = "auth"."uid"())
            AND ("l"."student_id" = "profiles"."user_id")
          )
      )
    )
  );
CREATE POLICY "Users can update own profile" ON "public"."profiles" FOR
UPDATE
  USING (("user_id" = "auth"."uid"()));
CREATE POLICY "Users can view lesson_songs for their lessons" ON "public"."lesson_songs" FOR
SELECT
  USING (
    (
      (
        EXISTS (
          SELECT
            1
          FROM
            "public"."lessons" "l"
          WHERE
            (
              ("l"."id" = "lesson_songs"."lesson_id")
              AND (
                ("l"."student_id" = "auth"."uid"())
                OR ("l"."teacher_id" = "auth"."uid"())
              )
            )
        )
      )
      OR (
        EXISTS (
          SELECT
            1
          FROM
            "public"."profiles" "p"
          WHERE
            (
              ("p"."user_id" = "auth"."uid"())
              AND ("p"."isadmin" = true)
            )
        )
      )
    )
  );
CREATE POLICY "Users can view own profile" ON "public"."profiles" FOR
SELECT
  USING (("user_id" = "auth"."uid"()));
ALTER TABLE
  "public"."lesson_songs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE
  "public"."lessons" ENABLE ROW LEVEL SECURITY;
ALTER TABLE
  "public"."profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE
  "public"."songs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE
  "public"."task_management" ENABLE ROW LEVEL SECURITY;
REVOKE USAGE ON SCHEMA "public"
FROM
  PUBLIC;