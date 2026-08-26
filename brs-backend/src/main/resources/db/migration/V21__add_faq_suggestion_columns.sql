-- V21__add_faq_suggestion_columns.sql
-- Add chatbot-suggestion configuration to FAQs:
--  - suggested_for: CSV of intents (e.g. "BOOKING,SERVICE_INQUIRY,FAQ")
--    used as a fallback when pg_trgm match is empty.
--  - suggestion_enabled: kill-switch for the chatbot to surface this FAQ.

ALTER TABLE faqs
    ADD COLUMN suggested_for VARCHAR(500),
    ADD COLUMN suggestion_enabled BOOLEAN NOT NULL DEFAULT TRUE;

-- Backfill: existing FAQs are eligible for the FAQ intent by default.
UPDATE faqs
SET suggested_for = 'FAQ'
WHERE suggested_for IS NULL;

CREATE INDEX idx_faqs_suggestion_enabled
    ON faqs (suggestion_enabled)
    WHERE suggestion_enabled = TRUE AND deleted_at IS NULL;

CREATE INDEX idx_faqs_published_order
    ON faqs (is_published, display_order)
    WHERE deleted_at IS NULL;

-- Trigram search over the locale_keys.question column for FAQs.
-- Requires pg_trgm (idempotent). unaccent normalizes Vietnamese diacritics.
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

CREATE OR REPLACE FUNCTION faq_search_text(value TEXT) RETURNS TEXT AS $$
    SELECT public.unaccent(value);
$$ LANGUAGE SQL IMMUTABLE PARALLEL SAFE;

CREATE INDEX IF NOT EXISTS idx_locale_keys_faq_question_trgm
    ON locale_keys USING gin (faq_search_text(COALESCE(title, '')) gin_trgm_ops)
    WHERE entity_type = 'faq';