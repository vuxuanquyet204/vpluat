-- ============================================================
-- V26: Newsletter campaigns + templates persistence
-- Replaces the in-memory campaign store with durable tables
-- so the admin CRUD/send endpoints have a single source of truth.
-- ============================================================

-- Newsletter templates: reusable subject/body HTML envelopes used
-- when composing campaigns. Default templates power the empty-state.
CREATE TABLE IF NOT EXISTS newsletter_templates (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(120)  NOT NULL,
    subject         VARCHAR(255)  NOT NULL,
    body            TEXT          NOT NULL,
    description     VARCHAR(500),
    is_default      BOOLEAN       NOT NULL DEFAULT FALSE,
    created_by      UUID          REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP     NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_newsletter_templates_name_active
    ON newsletter_templates (LOWER(name))
    WHERE deleted_at IS NULL;

-- At most one default template at any time.
CREATE UNIQUE INDEX IF NOT EXISTS uq_newsletter_templates_default
    ON newsletter_templates (is_default)
    WHERE is_default = TRUE AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_newsletter_templates_updated
    ON newsletter_templates (updated_at DESC)
    WHERE deleted_at IS NULL;

-- Newsletter campaigns: the operational email-send unit.
-- `segment` captures the targeting bucket (all, fdi, realestate, custom).
-- `status` lifecycle: DRAFT -> SCHEDULED -> SENDING -> SENT (or FAILED).
-- `recipient_count` and the rate columns are populated at send time.
CREATE TABLE IF NOT EXISTS newsletter_campaigns (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(120)  NOT NULL,
    subject             VARCHAR(255)  NOT NULL,
    body                TEXT          NOT NULL,
    template_id         UUID          REFERENCES newsletter_templates(id) ON DELETE SET NULL,
    segment             VARCHAR(40)   NOT NULL DEFAULT 'ALL',
    custom_emails       TEXT,
    status              VARCHAR(20)   NOT NULL DEFAULT 'DRAFT',
    scheduled_at        TIMESTAMP,
    sent_at             TIMESTAMP,
    recipient_count     INTEGER        NOT NULL DEFAULT 0,
    open_rate           NUMERIC(5, 4)  NOT NULL DEFAULT 0,
    click_rate          NUMERIC(5, 4)  NOT NULL DEFAULT 0,
    bounce_rate         NUMERIC(5, 4)  NOT NULL DEFAULT 0,
    unsub_rate          NUMERIC(5, 4)  NOT NULL DEFAULT 0,
    failure_reason      VARCHAR(1000),
    created_by          UUID          REFERENCES users(id) ON DELETE SET NULL,
    updated_by          UUID          REFERENCES users(id) ON DELETE SET NULL,
    created_at          TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP     NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMP,
    CONSTRAINT chk_newsletter_campaigns_segment
        CHECK (segment IN ('ALL', 'FDI', 'REALESTATE', 'CUSTOM')),
    CONSTRAINT chk_newsletter_campaigns_status
        CHECK (status IN ('DRAFT', 'SCHEDULED', 'SENDING', 'SENT', 'FAILED'))
);

CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_status
    ON newsletter_campaigns (status, updated_at DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_scheduled
    ON newsletter_campaigns (scheduled_at)
    WHERE status = 'SCHEDULED' AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_updated
    ON newsletter_campaigns (updated_at DESC)
    WHERE deleted_at IS NULL;
