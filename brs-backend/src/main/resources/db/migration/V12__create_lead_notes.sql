-- V12__create_lead_notes.sql
-- Promote the legacy leads.notes TEXT blob to a first-class table.
-- Each note is one row: foreign-key to the lead, optional creator, free-form
-- content, and a UTC timestamp set at build time.
--
-- Fully idempotent: safe to re-run even if the table already exists.
--
-- Backfill: existing leads keep their current `leads.notes` blob untouched
-- so legacy reads keep working until V13 drops the column.

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'lead_notes'
    ) THEN
        CREATE TABLE lead_notes (
            id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            lead_id     UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
            created_by  UUID REFERENCES users(id) ON DELETE SET NULL,
            content     TEXT NOT NULL,
            created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
    END IF;
END $$;

-- Hot read path: latest notes for a single lead.
CREATE INDEX IF NOT EXISTS idx_lead_notes_lead_created
    ON lead_notes (lead_id, created_at DESC);

-- Audit lookup: all notes written by a user, newest first.
-- Only create if the column exists (handles partial V12 runs).
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name   = 'lead_notes'
          AND column_name  = 'created_by'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_lead_notes_user_created
            ON lead_notes (created_by, created_at DESC)
            WHERE created_by IS NOT NULL;
    END IF;
END $$;