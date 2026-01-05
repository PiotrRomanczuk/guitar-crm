-- Migration: Create api_keys table
-- API keys for bearer token authentication

CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    key_hash TEXT NOT NULL UNIQUE,
    last_used_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);

-- Comments
COMMENT ON TABLE api_keys IS 'Bearer token API keys for external API authentication';
COMMENT ON COLUMN api_keys.id IS 'Unique API key record identifier';
COMMENT ON COLUMN api_keys.user_id IS 'User who owns this API key';
COMMENT ON COLUMN api_keys.name IS 'Human-friendly name for identifying this key';
COMMENT ON COLUMN api_keys.key_hash IS 'SHA-256 hash of the API key (actual key is never stored)';
COMMENT ON COLUMN api_keys.last_used_at IS 'Last time this key was used for authentication';
COMMENT ON COLUMN api_keys.is_active IS 'Whether this key is active - false disables authentication';
