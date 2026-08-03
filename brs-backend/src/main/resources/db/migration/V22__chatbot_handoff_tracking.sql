-- ============================================================
-- V22: Chatbot session handoff tracking
-- Adds columns to record who triggered the handoff and to whom
-- the session was assigned (so multiple agents don't pick up
-- the same session simultaneously).
-- ============================================================

ALTER TABLE chatbot_sessions
    ADD COLUMN IF NOT EXISTS handoff_to    VARCHAR(120),
    ADD COLUMN IF NOT EXISTS handoff_at    TIMESTAMP,
    ADD COLUMN IF NOT EXISTS handoff_by    UUID REFERENCES users(id) ON DELETE SET NULL;

-- Track which staff account authored each ADMIN/AGENT message.
ALTER TABLE chatbot_messages
    ADD COLUMN IF NOT EXISTS actor_id UUID REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_chatbot_sessions_handoff
    ON chatbot_sessions(handoff_to) WHERE escalated = TRUE;
