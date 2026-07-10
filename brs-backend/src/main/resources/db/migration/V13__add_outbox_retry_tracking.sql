-- V13__add_outbox_retry_tracking.sql
-- Add retry tracking columns to outbox_events so the OutboxProcessor can
-- give up on poison events after a few attempts instead of churning the
-- queue forever and burning CPU/RAM.

ALTER TABLE outbox_events
    ADD COLUMN IF NOT EXISTS retry_count INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS last_error  VARCHAR(1000);