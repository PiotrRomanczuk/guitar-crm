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

-- Comments
COMMENT ON TABLE user_integrations IS 'OAuth tokens for external service integrations (Google Calendar, etc.)';
COMMENT ON COLUMN user_integrations.user_id IS 'User who authorized this integration';
COMMENT ON COLUMN user_integrations.provider IS 'Integration provider name (e.g., google, spotify)';
COMMENT ON COLUMN user_integrations.access_token IS 'OAuth access token (encrypted at rest)';
COMMENT ON COLUMN user_integrations.refresh_token IS 'OAuth refresh token for obtaining new access tokens';
COMMENT ON COLUMN user_integrations.expires_at IS 'Token expiration timestamp in milliseconds from epoch';
