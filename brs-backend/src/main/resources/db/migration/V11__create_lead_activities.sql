-- V11__create_lead_activities.sql
-- Create the lead_activities table that powers the lead timeline view.
-- The metadata column is jsonb (not varchar) so we can store arbitrary
-- activity payloads (status changes, assignment notes, etc.) without
-- losing structure. Hibernate writes through JsonbConverter which
-- serialises the Java map before binding.

CREATE TABLE IF NOT EXISTS lead_activities (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id     UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
    action      VARCHAR(64) NOT NULL,
    note        TEXT,
    metadata    JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Hot read path: latest 200 entries for a single lead.
CREATE INDEX IF NOT EXISTS idx_lead_activities_lead_created
    ON lead_activities (lead_id, created_at DESC);

-- Audit/lookup: all actions by a given user, newest first.
CREATE INDEX IF NOT EXISTS idx_lead_activities_user_created
    ON lead_activities (user_id, created_at DESC)
    WHERE user_id IS NOT NULL;