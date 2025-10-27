-- User Activity Logging Table
-- Created: 2025-10-27
-- Purpose: Track all user interactions including clicks, page visits, and form submissions

CREATE TABLE IF NOT EXISTS public.user_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('page_view', 'button_click', 'link_click', 'form_submit', 'form_change', 'navigation', 'scroll', 'custom_event')),
  event_name TEXT NOT NULL,
  event_description TEXT,
  page_url TEXT NOT NULL,
  element_id TEXT,
  element_class TEXT,
  element_text TEXT,
  additional_data JSONB DEFAULT '{}',
  user_agent TEXT,
  ip_address TEXT,
  referer TEXT,
  session_id TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON public.user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_activity_type ON public.user_activity_logs(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_timestamp ON public.user_activity_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_timestamp ON public.user_activity_logs(user_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_page_url ON public.user_activity_logs(page_url);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_event_name ON public.user_activity_logs(event_name);

-- Enable RLS
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own activity logs
DROP POLICY IF EXISTS "Users can view their own activity logs" ON public.user_activity_logs;
CREATE POLICY "Users can view their own activity logs" ON public.user_activity_logs
  FOR SELECT USING (auth.uid() = user_id);

-- System can insert activity logs (service role)
DROP POLICY IF EXISTS "System can insert activity logs" ON public.user_activity_logs;
CREATE POLICY "System can insert activity logs" ON public.user_activity_logs
  FOR INSERT WITH CHECK (true);

-- Admins can view all activity logs
DROP POLICY IF EXISTS "Admins can view all activity logs" ON public.user_activity_logs;
CREATE POLICY "Admins can view all activity logs" ON public.user_activity_logs
  FOR SELECT USING (
    auth.uid() IN (
      SELECT p.user_id 
      FROM public.profiles p 
      WHERE p."isAdmin" = true
    )
  );

-- Admins can delete old logs for data cleanup
DROP POLICY IF EXISTS "Admins can delete old activity logs" ON public.user_activity_logs;
CREATE POLICY "Admins can delete old activity logs" ON public.user_activity_logs
  FOR DELETE USING (
    auth.uid() IN (
      SELECT p.user_id 
      FROM public.profiles p 
      WHERE p."isAdmin" = true
    )
  );
