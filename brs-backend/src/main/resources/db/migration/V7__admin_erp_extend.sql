-- ============================================================
-- V7__admin_erp_extend.sql
-- Phase 7: Admin ERP — extend schema for admin dashboard,
-- report, and bulk operations.
-- ============================================================

-- ============================================================
-- 1. Lead pipeline extensions
-- ============================================================
ALTER TABLE leads
    ADD COLUMN IF NOT EXISTS score INT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS converted_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS company VARCHAR(255),
    ADD COLUMN IF NOT EXISTS budget_range VARCHAR(50),
    ADD COLUMN IF NOT EXISTS preferred_lawyer_id UUID REFERENCES lawyer_profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_leads_assigned_status ON leads(assigned_to, status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(score DESC);

-- ============================================================
-- 2. Appointment / Booking extensions
-- ============================================================
ALTER TABLE appointments
    ADD COLUMN IF NOT EXISTS reminders_sent JSONB NOT NULL DEFAULT '[]',
    ADD COLUMN IF NOT EXISTS reminders JSONB,
    ADD COLUMN IF NOT EXISTS admin_notes TEXT,
    ADD COLUMN IF NOT EXISTS lead_id UUID REFERENCES leads(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_appointments_lawyer_date
    ON appointments(lawyer_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_appointments_status_date
    ON appointments(status, scheduled_at);

-- ============================================================
-- 3. Lawyer schedule overrides (recurring weekly schedule)
-- Note: lawyer_availability is used for per-day slots; this
-- table is for higher-level weekly patterns + date overrides.
-- ============================================================
CREATE TABLE IF NOT EXISTS lawyer_schedules (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lawyer_id       UUID NOT NULL REFERENCES lawyer_profiles(id) ON DELETE CASCADE,
    day_of_week     INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    is_off          BOOLEAN NOT NULL DEFAULT FALSE,
    slots           JSONB NOT NULL DEFAULT '[]',
    effective_from  DATE,
    effective_to    DATE,
    note            TEXT,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_lawyer_schedules_lawyer
    ON lawyer_schedules(lawyer_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_lawyer_schedules_dow
    ON lawyer_schedules(lawyer_id, day_of_week);

-- Date-specific overrides (vacation, special day)
CREATE TABLE IF NOT EXISTS lawyer_schedule_overrides (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lawyer_id       UUID NOT NULL REFERENCES lawyer_profiles(id) ON DELETE CASCADE,
    override_date   DATE NOT NULL,
    is_off          BOOLEAN NOT NULL DEFAULT TRUE,
    slots           JSONB NOT NULL DEFAULT '[]',
    reason          TEXT,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_lawyer_overrides_lookup
    ON lawyer_schedule_overrides(lawyer_id, override_date);

-- ============================================================
-- 4. Review moderation workflow
-- ============================================================
ALTER TABLE reviews
    ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255),
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES users(id),
    ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();

UPDATE reviews SET status = 'PENDING' WHERE status IS NULL;

-- Migration: existing PUBLISHED reviews keep their state
UPDATE reviews SET status = 'APPROVED' WHERE is_published = TRUE;

CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_lawyer_rating
    ON reviews(lawyer_id, rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- ============================================================
-- 5. Chatbot analytics — sessions already exist; add fields
-- ============================================================
ALTER TABLE chatbot_sessions
    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS message_count INT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS resolved BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS intent_summary JSONB;

CREATE INDEX IF NOT EXISTS idx_chatbot_sessions_started
    ON chatbot_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_chatbot_sessions_unresolved
    ON chatbot_sessions(ended_at) WHERE resolved = FALSE;

-- ============================================================
-- 6. Audit log extensions (entity-level diff already supported)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_audit_logs_action
    ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity
    ON audit_logs(entity_type, entity_id);

-- ============================================================
-- 7. Document library — already has file_path, file_name,
--    file_type, file_size, service_id, is_public, etc.
--    Add category + uploader + relation link.
-- ============================================================
ALTER TABLE documents
    ADD COLUMN IF NOT EXISTS category VARCHAR(50),
    ADD COLUMN IF NOT EXISTS mime_type VARCHAR(100),
    ADD COLUMN IF NOT EXISTS uploaded_by UUID REFERENCES users(id),
    ADD COLUMN IF NOT EXISTS related_entity VARCHAR(50),
    ADD COLUMN IF NOT EXISTS related_id UUID;

CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_uploader ON documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_documents_related
    ON documents(related_entity, related_id) WHERE related_entity IS NOT NULL;

-- ============================================================
-- 8. Report cache (optional, for heavy aggregations)
-- ============================================================
CREATE TABLE IF NOT EXISTS report_cache (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_type     VARCHAR(50) NOT NULL,
    params          JSONB NOT NULL DEFAULT '{}',
    data            JSONB NOT NULL,
    generated_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_report_cache_lookup
    ON report_cache(report_type, generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_report_cache_expires
    ON report_cache(expires_at);

-- ============================================================
-- 9. Landing page analytics (optional, lightweight)
-- ============================================================
CREATE TABLE IF NOT EXISTS landing_pages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug            VARCHAR(255) NOT NULL UNIQUE,
    title_vi        VARCHAR(500),
    title_en        VARCHAR(500),
    is_published    BOOLEAN NOT NULL DEFAULT FALSE,
    content         JSONB NOT NULL DEFAULT '{}',
    visit_count     INT NOT NULL DEFAULT 0,
    conversion_count INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 10. Lead activities (timeline support)
-- ============================================================
CREATE TABLE IF NOT EXISTS lead_activities (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id         UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    user_id         UUID REFERENCES users(id),
    action          VARCHAR(50) NOT NULL,
    note            TEXT,
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_lead_activities_lead
    ON lead_activities(lead_id, created_at DESC);

-- ============================================================
-- 11. Bulk import staging
-- ============================================================
CREATE TABLE IF NOT EXISTS bulk_imports (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type     VARCHAR(50) NOT NULL,
    file_name       VARCHAR(255),
    total_rows      INT NOT NULL DEFAULT 0,
    imported_count  INT NOT NULL DEFAULT 0,
    failed_count    INT NOT NULL DEFAULT 0,
    error_log       JSONB,
    imported_by     UUID REFERENCES users(id),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    finished_at     TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_bulk_imports_user
    ON bulk_imports(imported_by, created_at DESC);

-- ============================================================
-- 12. User activity summary (login, last seen)
-- Already in users.last_login_at. Add sessions_count for active
-- users metric.
-- ============================================================
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS sessions_count INT NOT NULL DEFAULT 0;

-- ============================================================
-- 13. Post revisions (version history)
-- ============================================================
CREATE TABLE IF NOT EXISTS post_revisions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id         UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    revision_number INT NOT NULL,
    snapshot        JSONB NOT NULL,
    edited_by       UUID REFERENCES users(id),
    change_note     TEXT,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(post_id, revision_number)
);
CREATE INDEX IF NOT EXISTS idx_post_revisions_post
    ON post_revisions(post_id, revision_number DESC);

-- ============================================================
-- Done — V7
-- ============================================================
