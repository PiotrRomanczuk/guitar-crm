-- Migration: Create AI-related tables
-- Supports chat history, usage tracking, and prompt templates

-- =============================================================================
-- ENUMS
-- =============================================================================

-- Context types for AI conversations
CREATE TYPE ai_context_type AS ENUM (
    'general',
    'student',
    'lesson',
    'song',
    'assignment',
    'practice'
);

-- Message roles in AI conversations
CREATE TYPE ai_message_role AS ENUM (
    'system',
    'user',
    'assistant'
);

-- Categories for prompt templates
CREATE TYPE ai_prompt_category AS ENUM (
    'email',
    'lesson_notes',
    'practice_plan',
    'progress_report',
    'feedback',
    'reminder',
    'custom'
);

-- =============================================================================
-- 1. AI CONVERSATIONS
-- Chat sessions between users and AI assistant
-- =============================================================================
CREATE TABLE ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT,
    model_id TEXT NOT NULL,
    context_type ai_context_type NOT NULL DEFAULT 'general',
    context_id UUID,                              -- ID of related entity (student, lesson, etc.)
    is_archived BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX idx_ai_conversations_context ON ai_conversations(context_type, context_id);
CREATE INDEX idx_ai_conversations_created_at ON ai_conversations(created_at DESC);

-- Comments
COMMENT ON TABLE ai_conversations IS 'Chat sessions between users and AI assistant';
COMMENT ON COLUMN ai_conversations.user_id IS 'User who owns this conversation';
COMMENT ON COLUMN ai_conversations.title IS 'Auto-generated or user-defined conversation title';
COMMENT ON COLUMN ai_conversations.model_id IS 'AI model used (e.g., meta-llama/llama-3.3-70b-instruct:free)';
COMMENT ON COLUMN ai_conversations.context_type IS 'Type of entity this conversation relates to';
COMMENT ON COLUMN ai_conversations.context_id IS 'UUID of the related entity (student, lesson, song, etc.)';
COMMENT ON COLUMN ai_conversations.is_archived IS 'Whether the conversation is archived';

-- =============================================================================
-- 2. AI MESSAGES
-- Individual messages within a conversation
-- =============================================================================
CREATE TABLE ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role ai_message_role NOT NULL,
    content TEXT NOT NULL,
    model_id TEXT,                                -- Model used for assistant responses
    tokens_used INTEGER,                          -- Token count for usage tracking
    latency_ms INTEGER,                           -- Response time in milliseconds
    is_helpful BOOLEAN,                           -- Simple thumbs up/down feedback
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_ai_messages_conversation_id ON ai_messages(conversation_id);
CREATE INDEX idx_ai_messages_created_at ON ai_messages(created_at DESC);

-- Comments
COMMENT ON TABLE ai_messages IS 'Individual messages within AI conversations';
COMMENT ON COLUMN ai_messages.conversation_id IS 'Parent conversation';
COMMENT ON COLUMN ai_messages.role IS 'Message role: system, user, or assistant';
COMMENT ON COLUMN ai_messages.content IS 'Message content text';
COMMENT ON COLUMN ai_messages.model_id IS 'AI model that generated this response (for assistant messages)';
COMMENT ON COLUMN ai_messages.tokens_used IS 'Number of tokens consumed by this message';
COMMENT ON COLUMN ai_messages.latency_ms IS 'Response generation time in milliseconds';
COMMENT ON COLUMN ai_messages.is_helpful IS 'User feedback: true=helpful, false=not helpful, null=no feedback';

-- =============================================================================
-- 3. AI USAGE STATS
-- Daily aggregated usage for analytics and rate limiting
-- =============================================================================
CREATE TABLE ai_usage_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    model_id TEXT NOT NULL,
    request_count INTEGER NOT NULL DEFAULT 0,
    total_tokens INTEGER NOT NULL DEFAULT 0,
    total_latency_ms INTEGER NOT NULL DEFAULT 0,
    error_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT ai_usage_stats_unique UNIQUE (user_id, date, model_id)
);

-- Indexes
CREATE INDEX idx_ai_usage_stats_user_date ON ai_usage_stats(user_id, date);
CREATE INDEX idx_ai_usage_stats_date ON ai_usage_stats(date DESC);

-- Comments
COMMENT ON TABLE ai_usage_stats IS 'Daily aggregated AI usage for analytics and rate limiting';
COMMENT ON COLUMN ai_usage_stats.user_id IS 'User whose usage is tracked';
COMMENT ON COLUMN ai_usage_stats.date IS 'Date of usage (one row per user/model/day)';
COMMENT ON COLUMN ai_usage_stats.model_id IS 'AI model identifier';
COMMENT ON COLUMN ai_usage_stats.request_count IS 'Number of requests made';
COMMENT ON COLUMN ai_usage_stats.total_tokens IS 'Total tokens consumed';
COMMENT ON COLUMN ai_usage_stats.total_latency_ms IS 'Cumulative response time';
COMMENT ON COLUMN ai_usage_stats.error_count IS 'Number of failed requests';

-- =============================================================================
-- 4. AI PROMPT TEMPLATES
-- Reusable prompt templates for common AI tasks
-- =============================================================================
CREATE TABLE ai_prompt_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category ai_prompt_category NOT NULL DEFAULT 'custom',
    prompt_template TEXT NOT NULL,                -- Template with {{placeholders}}
    variables JSONB,                              -- Expected variables: ["student_name", "lesson_date"]
    is_system BOOLEAN NOT NULL DEFAULT false,     -- System templates vs user-created
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_ai_prompt_templates_category ON ai_prompt_templates(category);
CREATE INDEX idx_ai_prompt_templates_created_by ON ai_prompt_templates(created_by);
CREATE INDEX idx_ai_prompt_templates_active ON ai_prompt_templates(is_active) WHERE is_active = true;

-- Comments
COMMENT ON TABLE ai_prompt_templates IS 'Reusable prompt templates for common AI tasks';
COMMENT ON COLUMN ai_prompt_templates.name IS 'Template name shown in UI';
COMMENT ON COLUMN ai_prompt_templates.description IS 'Description of what this template does';
COMMENT ON COLUMN ai_prompt_templates.category IS 'Template category for organization';
COMMENT ON COLUMN ai_prompt_templates.prompt_template IS 'The prompt text with {{placeholder}} variables';
COMMENT ON COLUMN ai_prompt_templates.variables IS 'JSON array of expected variable names';
COMMENT ON COLUMN ai_prompt_templates.is_system IS 'System-provided template (not deletable by users)';
COMMENT ON COLUMN ai_prompt_templates.is_active IS 'Whether template is available for use';
COMMENT ON COLUMN ai_prompt_templates.created_by IS 'User who created this template (null for system templates)';

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Auto-update updated_at on ai_conversations
CREATE TRIGGER trigger_update_updated_at
    BEFORE UPDATE ON ai_conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at on ai_usage_stats
CREATE TRIGGER trigger_update_updated_at
    BEFORE UPDATE ON ai_usage_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at on ai_prompt_templates
CREATE TRIGGER trigger_update_updated_at
    BEFORE UPDATE ON ai_prompt_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
