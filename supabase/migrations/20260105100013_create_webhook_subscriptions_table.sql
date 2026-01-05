-- Migration: Create webhook_subscriptions table
-- Google Calendar webhook subscriptions

CREATE TABLE webhook_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    channel_id TEXT NOT NULL UNIQUE,
    resource_id TEXT NOT NULL,
    expiration BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Comments
COMMENT ON TABLE webhook_subscriptions IS 'External webhook subscriptions for push notifications (Google Calendar sync)';
COMMENT ON COLUMN webhook_subscriptions.id IS 'Unique subscription identifier';
COMMENT ON COLUMN webhook_subscriptions.user_id IS 'User who owns this webhook subscription';
COMMENT ON COLUMN webhook_subscriptions.provider IS 'Provider name (e.g., google)';
COMMENT ON COLUMN webhook_subscriptions.channel_id IS 'Unique channel ID for receiving webhook callbacks';
COMMENT ON COLUMN webhook_subscriptions.resource_id IS 'External resource ID being watched';
COMMENT ON COLUMN webhook_subscriptions.expiration IS 'Subscription expiration timestamp in milliseconds';
