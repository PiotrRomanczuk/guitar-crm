-- Fix for track_user_changes function
-- Run this SQL in your Supabase SQL Editor to fix the "record 'old' has no field 'role'" error

CREATE OR REPLACE FUNCTION track_user_changes()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- INSERT: New user created
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO user_history (
      user_id,
      changed_by,
      change_type,
      previous_data,
      new_data
    ) VALUES (
      NEW.id,
      auth.uid(),
      'created',
      NULL,
      to_jsonb(NEW)
    );
    RETURN NEW;
  END IF;

  -- UPDATE: User profile modified
  IF (TG_OP = 'UPDATE') THEN
    -- Determine specific change type
    DECLARE
      v_change_type TEXT := 'updated';
    BEGIN
      -- Check if any role flags changed
      IF (OLD.is_admin IS DISTINCT FROM NEW.is_admin) OR
         (OLD.is_teacher IS DISTINCT FROM NEW.is_teacher) OR
         (OLD.is_student IS DISTINCT FROM NEW.is_student) THEN
        v_change_type := 'role_changed';
      ELSIF (OLD.is_active IS DISTINCT FROM NEW.is_active) THEN
        v_change_type := 'status_changed';
      END IF;

      INSERT INTO user_history (
        user_id,
        changed_by,
        change_type,
        previous_data,
        new_data
      ) VALUES (
        NEW.id,
        auth.uid(),
        v_change_type,
        to_jsonb(OLD),
        to_jsonb(NEW)
      );
    END;
    RETURN NEW;
  END IF;

  -- DELETE: User deleted
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO user_history (
      user_id,
      changed_by,
      change_type,
      previous_data,
      new_data
    ) VALUES (
      OLD.id,
      auth.uid(),
      'deleted',
      to_jsonb(OLD),
      NULL
    );
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$;