ALTER TABLE case_studies
    ADD COLUMN IF NOT EXISTS title_vi VARCHAR(1000),
    ADD COLUMN IF NOT EXISTS title_en VARCHAR(1000),
    ADD COLUMN IF NOT EXISTS excerpt_vi TEXT,
    ADD COLUMN IF NOT EXISTS excerpt_en TEXT,
    ADD COLUMN IF NOT EXISTS content_vi TEXT,
    ADD COLUMN IF NOT EXISTS content_en TEXT,
    ADD COLUMN IF NOT EXISTS og_image_url VARCHAR(1000),
    ADD COLUMN IF NOT EXISTS published_at TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_case_studies_published
    ON case_studies (is_published, updated_at DESC)
    WHERE deleted_at IS NULL;
