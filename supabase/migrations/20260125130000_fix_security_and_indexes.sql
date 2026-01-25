-- Security: Enable RLS on AI tables
ALTER TABLE IF EXISTS public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ai_prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ai_usage_stats ENABLE ROW LEVEL SECURITY;

-- Security: Set Views to SECURITY INVOKER
ALTER VIEW public.song_usage_stats SET (security_invoker = true);
ALTER VIEW public.lesson_counts_per_student SET (security_invoker = true);
ALTER VIEW public.lesson_counts_per_teacher SET (security_invoker = true);
ALTER VIEW public.user_overview SET (security_invoker = true);

-- Performance: Add missing indexes
CREATE INDEX IF NOT EXISTS idx_assignment_templates_teacher_id ON public.assignment_templates(teacher_id);
CREATE INDEX IF NOT EXISTS idx_assignments_lesson_id ON public.assignments(lesson_id);
CREATE INDEX IF NOT EXISTS idx_webhook_subscriptions_user_id ON public.webhook_subscriptions(user_id);
