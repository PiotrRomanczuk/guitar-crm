-- Migration: Create user_integrations table
-- OAuth tokens for external integrations (Google, etc.)

CREATE TABLE user_integrations (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    expires_at BIGINT,  -- Timestamp in milliseconds from epoch
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    
    PRIMARY KEY (user_id, provider)
);
