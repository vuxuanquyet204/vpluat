-- ============================================================
-- V1__init_schema.sql
-- BRS v2.0 - Initial Database Schema
-- ============================================================

-- ============================================================
-- USERS & AUTHENTICATION
-- [IMPROVED v2] Thêm account lockout để chống brute-force login
-- ============================================================
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(50) NOT NULL DEFAULT 'USER',
    full_name       VARCHAR(255) NOT NULL,
    phone           VARCHAR(20),
    avatar_url      VARCHAR(500),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    -- [IMPROVED v2] Account lockout fields
    locked_until    TIMESTAMP,
    failed_attempts INT NOT NULL DEFAULT 0,
    last_login_at   TIMESTAMP,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMP
);
CREATE INDEX idx_users_locked ON users(locked_until) WHERE locked_until IS NOT NULL;
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

CREATE TABLE lawyer_profiles (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID REFERENCES users(id) ON DELETE SET NULL,
    slug                VARCHAR(255) NOT NULL UNIQUE,
    name_vi             VARCHAR(255) NOT NULL,
    name_en             VARCHAR(255),
    bio_vi              TEXT,
    bio_en              TEXT,
    position_vi         VARCHAR(255),
    position_en         VARCHAR(255),
    experience_years    INT DEFAULT 0,
    bar_number          VARCHAR(100),
    languages           VARCHAR(100)[] DEFAULT ARRAY['vi'],
    avatar_url          VARCHAR(500),
    is_featured         BOOLEAN DEFAULT FALSE,
    working_hours       JSONB DEFAULT '{}',
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_lawyer_profiles_slug ON lawyer_profiles(slug);

CREATE TABLE service_lawyers (
    service_id  UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    lawyer_id   UUID NOT NULL REFERENCES lawyer_profiles(id) ON DELETE CASCADE,
    is_primary  BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (service_id, lawyer_id)
);

CREATE TABLE lawyer_availability (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lawyer_id       UUID NOT NULL REFERENCES lawyer_profiles(id) ON DELETE CASCADE,
    day_of_week     INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time      TIME NOT NULL,
    end_time        TIME NOT NULL,
    slot_duration   INT NOT NULL DEFAULT 60,
    is_active       BOOLEAN DEFAULT TRUE
);

CREATE TABLE user_sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token   VARCHAR(500) NOT NULL,
    user_agent      VARCHAR(500),
    ip_address      VARCHAR(45),
    expires_at      TIMESTAMP NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE audit_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
    action      VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id   UUID,
    old_data    JSONB,
    new_data    JSONB,
    ip_address  VARCHAR(45),
    user_agent  VARCHAR(500),
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================================
-- I18N STRATEGY: Translation Tables
-- ============================================================
CREATE TABLE locale_keys (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL,
    entity_id   UUID NOT NULL,
    locale      VARCHAR(10) NOT NULL DEFAULT 'vi',
    title       VARCHAR(500),
    excerpt     TEXT,
    content     TEXT,
    meta_title  VARCHAR(255),
    meta_desc   VARCHAR(500),
    UNIQUE (entity_type, entity_id, locale)
);

-- ============================================================
-- PUBLIC CONTENT
-- ============================================================
CREATE TABLE services (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug            VARCHAR(255) NOT NULL UNIQUE,
    icon            VARCHAR(100),
    is_featured     BOOLEAN DEFAULT FALSE,
    display_order   INT DEFAULT 0,
    parent_id       UUID REFERENCES services(id) ON DELETE SET NULL,
    is_active       BOOLEAN DEFAULT TRUE,
    version         BIGINT NOT NULL DEFAULT 0,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMP,
    created_by      UUID REFERENCES users(id),
    updated_by      UUID REFERENCES users(id)
);
CREATE INDEX idx_services_slug ON services(slug);
CREATE INDEX idx_services_deleted ON services(deleted_at) WHERE deleted_at IS NULL;

CREATE TABLE faqs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id      UUID REFERENCES services(id),
    display_order   INT DEFAULT 0,
    is_published    BOOLEAN DEFAULT TRUE,
    version         BIGINT NOT NULL DEFAULT 0,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMP,
    created_by      UUID REFERENCES users(id),
    updated_by      UUID REFERENCES users(id)
);
CREATE INDEX idx_faqs_service ON faqs(service_id) WHERE is_published = TRUE;

CREATE TABLE documents (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_path       VARCHAR(1000) NOT NULL,
    file_name       VARCHAR(255) NOT NULL,
    file_type       VARCHAR(100),
    file_size       BIGINT,
    service_id      UUID REFERENCES services(id) ON DELETE SET NULL,
    download_count  INT DEFAULT 0,
    is_public       BOOLEAN DEFAULT FALSE,
    lead_gate       BOOLEAN DEFAULT TRUE,
    version         BIGINT NOT NULL DEFAULT 0,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMP,
    created_by      UUID REFERENCES users(id),
    updated_by      UUID REFERENCES users(id)
);

-- ============================================================
-- BOOKING
-- [IMPROVED v2] Thêm version cho optimistic locking, hash OTP
-- ============================================================
CREATE TABLE appointments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_name         VARCHAR(255) NOT NULL,
    client_email        VARCHAR(255) NOT NULL,
    client_phone        VARCHAR(20) NOT NULL,
    lawyer_id           UUID NOT NULL REFERENCES lawyer_profiles(id),
    service_id          UUID NOT NULL REFERENCES services(id),
    scheduled_at        TIMESTAMP NOT NULL,
    duration_minutes    INT NOT NULL DEFAULT 60,
    timezone            VARCHAR(50) DEFAULT 'Asia/Ho_Chi_Minh',
    meeting_type        VARCHAR(20) NOT NULL DEFAULT 'OFFICE',
    meeting_link        VARCHAR(500),
    status              VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    cancel_reason       TEXT,
    internal_notes      TEXT,
    source              VARCHAR(50) DEFAULT 'WEBSITE',
    utm_source          VARCHAR(100),
    utm_medium          VARCHAR(100),
    utm_campaign        VARCHAR(100),
    otp_code_hash       VARCHAR(64),
    otp_expires_at     TIMESTAMP,
    version             BIGINT NOT NULL DEFAULT 0,
    confirmed_at        TIMESTAMP,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_appointments_lawyer ON appointments(lawyer_id);
CREATE INDEX idx_appointments_scheduled ON appointments(scheduled_at);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_client_phone ON appointments(client_phone);

CREATE TABLE availability_slots (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lawyer_id       UUID NOT NULL REFERENCES lawyer_profiles(id) ON DELETE CASCADE,
    slot_date       DATE NOT NULL,
    start_time      TIME NOT NULL,
    end_time        TIME NOT NULL,
    is_available    BOOLEAN DEFAULT TRUE,
    appointment_id  UUID REFERENCES appointments(id),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(lawyer_id, slot_date, start_time)
);
CREATE INDEX idx_availability_slots_lookup ON availability_slots(lawyer_id, slot_date, is_available) WHERE is_available = TRUE;

-- ============================================================
-- CRM & LEADS
-- ============================================================
CREATE TABLE leads (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(255) NOT NULL,
    email               VARCHAR(255),
    phone               VARCHAR(20),
    service_id          UUID REFERENCES services(id),
    message             TEXT,
    source              VARCHAR(50) NOT NULL,
    channel             VARCHAR(20),
    campaign_id         VARCHAR(100),
    ad_group_id         VARCHAR(100),
    utm_source          VARCHAR(100),
    utm_medium          VARCHAR(100),
    utm_campaign        VARCHAR(100),
    status              VARCHAR(30) NOT NULL DEFAULT 'NEW',
    assigned_to         UUID REFERENCES users(id),
    duplicate_hash      VARCHAR(64),
    ip_address          VARCHAR(45),
    user_agent          VARCHAR(500),
    first_contact_at    TIMESTAMP,
    last_contact_at     TIMESTAMP,
    notes               TEXT,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_leads_phone ON leads(phone);
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_duplicate_hash ON leads(duplicate_hash);

CREATE TABLE lead_notes (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id     UUID NOT NULL REFERENCES leads(id),
    user_id     UUID REFERENCES users(id),
    content     TEXT NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE reviews (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_name     VARCHAR(255) NOT NULL,
    client_role     VARCHAR(255),
    content_vi      TEXT NOT NULL,
    content_en      TEXT,
    rating          INT CHECK (rating BETWEEN 1 AND 5),
    lawyer_id       UUID REFERENCES lawyer_profiles(id),
    service_id      UUID REFERENCES services(id),
    is_featured     BOOLEAN DEFAULT FALSE,
    is_published    BOOLEAN DEFAULT FALSE,
    source          VARCHAR(50) DEFAULT 'WEBSITE',
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_reviews_published ON reviews(is_published) WHERE is_published = TRUE;

CREATE TABLE newsletter_subscribers (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email               VARCHAR(255) NOT NULL UNIQUE,
    name                VARCHAR(255),
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    verification_token  VARCHAR(100),
    verified_at         TIMESTAMP,
    unsubscribed_at     TIMESTAMP,
    source              VARCHAR(50) DEFAULT 'WEBSITE',
    ip_address          VARCHAR(45),
    created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_newsletter_email ON newsletter_subscribers(email);

-- ============================================================
-- JOBS
-- ============================================================
CREATE TABLE job_postings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           VARCHAR(500) NOT NULL,
    title_en        VARCHAR(500),
    department      VARCHAR(100),
    location        VARCHAR(255),
    job_type        VARCHAR(50),
    description_vi  TEXT,
    description_en  TEXT,
    requirements_vi TEXT,
    requirements_en TEXT,
    salary_range    VARCHAR(100),
    status          VARCHAR(20) DEFAULT 'DRAFT',
    deadline        DATE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE job_applications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id          UUID NOT NULL REFERENCES job_postings(id),
    full_name       VARCHAR(255) NOT NULL,
    email           VARCHAR(255) NOT NULL,
    phone           VARCHAR(20),
    cv_url          VARCHAR(1000),
    cover_letter    TEXT,
    status          VARCHAR(20) DEFAULT 'NEW',
    applied_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CONTENT MANAGEMENT
-- ============================================================
CREATE TABLE categories (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug            VARCHAR(255) NOT NULL UNIQUE,
    parent_id       UUID REFERENCES categories(id) ON DELETE SET NULL,
    meta_title_vi   VARCHAR(255),
    meta_title_en   VARCHAR(255),
    meta_desc_vi    VARCHAR(500),
    meta_desc_en    VARCHAR(500),
    display_order   INT DEFAULT 0,
    version         BIGINT NOT NULL DEFAULT 0,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMP,
    created_by      UUID REFERENCES users(id),
    updated_by      UUID REFERENCES users(id)
);

CREATE TABLE tags (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug            VARCHAR(100) NOT NULL UNIQUE,
    version         BIGINT NOT NULL DEFAULT 0,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMP,
    created_by      UUID REFERENCES users(id),
    updated_by      UUID REFERENCES users(id)
);

CREATE TABLE posts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug            VARCHAR(255) NOT NULL UNIQUE,
    thumbnail_url   VARCHAR(1000),
    author_id       UUID NOT NULL REFERENCES users(id),
    category_id     UUID REFERENCES categories(id) ON DELETE SET NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    published_at    TIMESTAMP,
    scheduled_at    TIMESTAMP,
    views           INT DEFAULT 0,
    reading_time    INT,
    og_image_url    VARCHAR(1000),
    is_featured     BOOLEAN DEFAULT FALSE,
    language        VARCHAR(5) DEFAULT 'vi',
    version         BIGINT NOT NULL DEFAULT 0,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMP,
    created_by      UUID REFERENCES users(id),
    updated_by      UUID REFERENCES users(id)
);
CREATE INDEX idx_posts_published ON posts(status, published_at) WHERE status = 'PUBLISHED';
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_category ON posts(category_id);

CREATE TABLE post_tags (
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    tag_id  UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);

CREATE TABLE post_lawyers (
    post_id   UUID REFERENCES posts(id) ON DELETE CASCADE,
    lawyer_id UUID NOT NULL REFERENCES lawyer_profiles(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, lawyer_id)
);

CREATE TABLE case_studies (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug            VARCHAR(255) NOT NULL UNIQUE,
    outcome         VARCHAR(500),
    thumbnail_url   VARCHAR(1000),
    is_featured     BOOLEAN DEFAULT FALSE,
    is_published    BOOLEAN DEFAULT FALSE,
    version         BIGINT NOT NULL DEFAULT 0,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMP,
    created_by      UUID REFERENCES users(id),
    updated_by      UUID REFERENCES users(id)
);

CREATE TABLE case_study_services (
    case_study_id   UUID REFERENCES case_studies(id) ON DELETE CASCADE,
    service_id      UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    PRIMARY KEY (case_study_id, service_id)
);

-- ============================================================
-- CHATBOT
-- ============================================================
CREATE TABLE chatbot_sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id      VARCHAR(100) NOT NULL UNIQUE,
    user_ip         VARCHAR(45),
    user_agent      VARCHAR(500),
    language        VARCHAR(5) DEFAULT 'vi',
    started_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    ended_at        TIMESTAMP,
    escalated       BOOLEAN DEFAULT FALSE,
    lead_id         UUID REFERENCES leads(id) ON DELETE SET NULL,
    session_key     VARCHAR(255)
);
CREATE INDEX idx_chatbot_sessions_session ON chatbot_sessions(session_id);

CREATE TABLE chatbot_messages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id      VARCHAR(100) NOT NULL REFERENCES chatbot_sessions(session_id) ON DELETE CASCADE,
    role            VARCHAR(20) NOT NULL,
    content         VARCHAR(4000) NOT NULL,
    intent          VARCHAR(100),
    confidence      DECIMAL(3,2),
    retention_until TIMESTAMP NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_chatbot_messages_session ON chatbot_messages(session_id);
CREATE INDEX idx_chatbot_messages_retention ON chatbot_messages(retention_until) WHERE retention_until < NOW();

-- ============================================================
-- OUTBOX (Async Events)
-- ============================================================
CREATE TABLE outbox_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aggregate_type VARCHAR(100) NOT NULL,
    aggregate_id   UUID NOT NULL,
    event_type      VARCHAR(100) NOT NULL,
    payload         JSONB NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    processed       BOOLEAN DEFAULT FALSE,
    processed_at    TIMESTAMP
);
CREATE INDEX idx_outbox_unprocessed ON outbox_events(processed) WHERE processed = FALSE;
CREATE INDEX idx_outbox_unprocessed_ordered ON outbox_events(created_at) WHERE processed = FALSE;
