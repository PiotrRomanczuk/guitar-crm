-- Migration: RLS policies for AI tables
-- Users can only access their own AI data

-- =============================================================================
-- AI CONVERSATIONS
-- =============================================================================

-- Users can view their own conversations
CREATE POLICY select_own_conversations ON ai_conversations
    FOR SELECT USING (user_id = auth.uid());

-- Users can create their own conversations
CREATE POLICY insert_own_conversations ON ai_conversations
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own conversations
CREATE POLICY update_own_conversations ON ai_conversations
    FOR UPDATE USING (user_id = auth.uid());

-- Users can delete their own conversations
CREATE POLICY delete_own_conversations ON ai_conversations
    FOR DELETE USING (user_id = auth.uid());

-- =============================================================================
-- AI MESSAGES
-- =============================================================================

-- Users can view messages in their own conversations
CREATE POLICY select_own_messages ON ai_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM ai_conversations
            WHERE ai_conversations.id = ai_messages.conversation_id
            AND ai_conversations.user_id = auth.uid()
        )
    );

-- Users can insert messages in their own conversations
CREATE POLICY insert_own_messages ON ai_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM ai_conversations
            WHERE ai_conversations.id = ai_messages.conversation_id
            AND ai_conversations.user_id = auth.uid()
        )
    );

-- Users can update messages in their own conversations (for feedback)
CREATE POLICY update_own_messages ON ai_messages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM ai_conversations
            WHERE ai_conversations.id = ai_messages.conversation_id
            AND ai_conversations.user_id = auth.uid()
        )
    );

-- =============================================================================
-- AI USAGE STATS
-- =============================================================================

-- Users can view their own usage stats
CREATE POLICY select_own_usage ON ai_usage_stats
    FOR SELECT USING (user_id = auth.uid());

-- Admins can view all usage stats
CREATE POLICY admin_select_all_usage ON ai_usage_stats
    FOR SELECT USING (is_admin());

-- Users can insert/update their own usage stats
CREATE POLICY upsert_own_usage ON ai_usage_stats
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY update_own_usage ON ai_usage_stats
    FOR UPDATE USING (user_id = auth.uid());

-- =============================================================================
-- AI PROMPT TEMPLATES
-- =============================================================================

-- Everyone can view system templates and their own templates
CREATE POLICY select_templates ON ai_prompt_templates
    FOR SELECT USING (
        is_system = true 
        OR created_by = auth.uid()
        OR is_admin()
    );

-- Users can create their own templates
CREATE POLICY insert_own_templates ON ai_prompt_templates
    FOR INSERT WITH CHECK (
        created_by = auth.uid()
        AND is_system = false
    );

-- Users can update their own templates, admins can update all
CREATE POLICY update_templates ON ai_prompt_templates
    FOR UPDATE USING (
        (created_by = auth.uid() AND is_system = false)
        OR is_admin()
    );

-- Users can delete their own templates, admins can delete all
CREATE POLICY delete_templates ON ai_prompt_templates
    FOR DELETE USING (
        (created_by = auth.uid() AND is_system = false)
        OR is_admin()
    );
