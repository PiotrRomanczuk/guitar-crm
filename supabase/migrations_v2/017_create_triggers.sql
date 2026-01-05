-- Migration: Create all triggers
-- Consolidated trigger definitions

-- Trigger: Auto-update updated_at on profiles
CREATE TRIGGER trigger_update_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Sync profile role flags to user_roles table
CREATE TRIGGER trigger_sync_profile_roles
    AFTER INSERT OR UPDATE OF is_admin, is_teacher, is_student ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION sync_profile_roles();

-- Trigger: Auto-update updated_at on songs
CREATE TRIGGER trigger_update_updated_at
    BEFORE UPDATE ON songs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Auto-update updated_at on lessons
CREATE TRIGGER trigger_update_updated_at
    BEFORE UPDATE ON lessons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Auto-set lesson_teacher_number on lessons insert
CREATE TRIGGER trigger_set_lesson_numbers
    BEFORE INSERT ON lessons
    FOR EACH ROW
    EXECUTE FUNCTION set_lesson_numbers();

-- Trigger: Auto-update updated_at on lesson_songs
CREATE TRIGGER trigger_update_updated_at
    BEFORE UPDATE ON lesson_songs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Auto-update updated_at on assignments
CREATE TRIGGER trigger_update_updated_at
    BEFORE UPDATE ON assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Auto-update updated_at on assignment_templates
CREATE TRIGGER update_assignment_templates_updated_at
    BEFORE UPDATE ON assignment_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Auto-update updated_at on user_integrations
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON user_integrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Auto-update updated_at on webhook_subscriptions
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON webhook_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
