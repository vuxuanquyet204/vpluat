-- ============================================================
-- V16__add_post_content_columns.sql
-- BRS v2.0 - Add title/excerpt/content/meta fields to posts table.
-- These columns were missing from V1, which meant the entity
-- builder silently dropped any user-entered title/body, leaving
-- posts.see empty even though the API returned 200 OK.
-- ============================================================

ALTER TABLE posts
    ADD COLUMN IF NOT EXISTS title       VARCHAR(1000),
    ADD COLUMN IF NOT EXISTS excerpt     VARCHAR(500),
    ADD COLUMN IF NOT EXISTS content     TEXT,
    ADD COLUMN IF NOT EXISTS meta_title  VARCHAR(255),
    ADD COLUMN IF NOT EXISTS meta_desc   VARCHAR(500);

-- Plain btree on title helps prefix lookups; full-text search is
-- intentionally out of scope here to avoid pulling in extensions.
CREATE INDEX IF NOT EXISTS idx_posts_title ON posts (title);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts (published_at) WHERE status = 'PUBLISHED';
