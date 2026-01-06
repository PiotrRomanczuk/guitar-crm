-- Migration: Create triggers for automatic history tracking

-- ============================================
-- Assignment History Trigger Function
-- ============================================
CREATE OR REPLACE FUNCTION track_assignment_changes()
RETURNS TRIGGER AS $$
DECLARE
    change_type_value TEXT;
    previous_data_value JSONB;
    new_data_value JSONB;
BEGIN
    -- Determine change type
    IF TG_OP = 'INSERT' THEN
        change_type_value := 'created';
        previous_data_value := NULL;
        new_data_value := to_jsonb(NEW);
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status != NEW.status THEN
            change_type_value := 'status_changed';
        ELSE
            change_type_value := 'updated';
        END IF;
        previous_data_value := to_jsonb(OLD);
        new_data_value := to_jsonb(NEW);
    ELSIF TG_OP = 'DELETE' THEN
        change_type_value := 'deleted';
        previous_data_value := to_jsonb(OLD);
        new_data_value := to_jsonb(OLD);
        
        -- Insert history record for deletion
        INSERT INTO assignment_history (
            assignment_id,
            changed_by,
            change_type,
            previous_data,
            new_data,
            changed_at
        ) VALUES (
            OLD.id,
            COALESCE(auth.uid(), OLD.teacher_id),
            change_type_value,
            previous_data_value,
            new_data_value,
            now()
        );
        
        RETURN OLD;
    END IF;

    -- Insert history record
    INSERT INTO assignment_history (
        assignment_id,
        changed_by,
        change_type,
        previous_data,
        new_data,
        changed_at
    ) VALUES (
        NEW.id,
        COALESCE(auth.uid(), NEW.teacher_id),
        change_type_value,
        previous_data_value,
        new_data_value,
        now()
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for assignments
DROP TRIGGER IF EXISTS trigger_track_assignment_changes ON assignments;
CREATE TRIGGER trigger_track_assignment_changes
    AFTER INSERT OR UPDATE OR DELETE ON assignments
    FOR EACH ROW
    EXECUTE FUNCTION track_assignment_changes();

-- ============================================
-- Lesson History Trigger Function
-- ============================================
CREATE OR REPLACE FUNCTION track_lesson_changes()
RETURNS TRIGGER AS $$
DECLARE
    change_type_value TEXT;
    previous_data_value JSONB;
    new_data_value JSONB;
BEGIN
    -- Determine change type
    IF TG_OP = 'INSERT' THEN
        change_type_value := 'created';
        previous_data_value := NULL;
        new_data_value := to_jsonb(NEW);
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status != NEW.status THEN
            IF NEW.status = 'cancelled' THEN
                change_type_value := 'cancelled';
            ELSIF NEW.status = 'completed' THEN
                change_type_value := 'completed';
            ELSE
                change_type_value := 'status_changed';
            END IF;
        ELSIF OLD.scheduled_at != NEW.scheduled_at THEN
            change_type_value := 'rescheduled';
        ELSE
            change_type_value := 'updated';
        END IF;
        previous_data_value := to_jsonb(OLD);
        new_data_value := to_jsonb(NEW);
    ELSIF TG_OP = 'DELETE' THEN
        change_type_value := 'deleted';
        previous_data_value := to_jsonb(OLD);
        new_data_value := to_jsonb(OLD);
        
        -- Insert history record for deletion
        INSERT INTO lesson_history (
            lesson_id,
            changed_by,
            change_type,
            previous_data,
            new_data,
            changed_at
        ) VALUES (
            OLD.id,
            COALESCE(auth.uid(), OLD.teacher_id),
            change_type_value,
            previous_data_value,
            new_data_value,
            now()
        );
        
        RETURN OLD;
    END IF;

    -- Insert history record
    INSERT INTO lesson_history (
        lesson_id,
        changed_by,
        change_type,
        previous_data,
        new_data,
        changed_at
    ) VALUES (
        NEW.id,
        COALESCE(auth.uid(), NEW.teacher_id),
        change_type_value,
        previous_data_value,
        new_data_value,
        now()
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for lessons
DROP TRIGGER IF EXISTS trigger_track_lesson_changes ON lessons;
CREATE TRIGGER trigger_track_lesson_changes
    AFTER INSERT OR UPDATE OR DELETE ON lessons
    FOR EACH ROW
    EXECUTE FUNCTION track_lesson_changes();

-- ============================================
-- Song Status History Trigger Function
-- (Update existing to use lesson_songs table)
-- ============================================
CREATE OR REPLACE FUNCTION track_song_status_changes()
RETURNS TRIGGER AS $$
DECLARE
    student_id_value UUID;
BEGIN
    -- Get student_id from the lesson
    SELECT l.student_id INTO student_id_value
    FROM lessons l
    WHERE l.id = NEW.lesson_id;

    -- Only track if status changed
    IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
        INSERT INTO song_status_history (
            student_id,
            song_id,
            previous_status,
            new_status,
            changed_at
        ) VALUES (
            student_id_value,
            NEW.song_id,
            OLD.status,
            NEW.status,
            now()
        );
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO song_status_history (
            student_id,
            song_id,
            previous_status,
            new_status,
            changed_at
        ) VALUES (
            student_id_value,
            NEW.song_id,
            NULL,
            NEW.status,
            now()
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for lesson_songs status changes
DROP TRIGGER IF EXISTS trigger_track_song_status_changes ON lesson_songs;
CREATE TRIGGER trigger_track_song_status_changes
    AFTER INSERT OR UPDATE OF status ON lesson_songs
    FOR EACH ROW
    EXECUTE FUNCTION track_song_status_changes();

COMMENT ON FUNCTION track_assignment_changes() IS 'Automatically tracks all assignment changes to assignment_history table';
COMMENT ON FUNCTION track_lesson_changes() IS 'Automatically tracks all lesson changes to lesson_history table';
COMMENT ON FUNCTION track_song_status_changes() IS 'Automatically tracks song status changes to song_status_history table';
