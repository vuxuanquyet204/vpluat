-- Add detail columns to services table so admin can edit description / price / duration / category
-- and public detail page can render meaningful content.
ALTER TABLE services ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS price NUMERIC(15, 2);
ALTER TABLE services ADD COLUMN IF NOT EXISTS duration INTEGER;
ALTER TABLE services ADD COLUMN IF NOT EXISTS category VARCHAR(100);

-- Backfill category with slug where missing so the public filter has something to match.
-- (parent lives in the same services table via parent_id self-reference; using a subquery.)
UPDATE services s
   SET category = COALESCE((SELECT p.slug FROM services p WHERE p.id = s.parent_id), s.slug)
 WHERE s.category IS NULL;

-- Backfill description with the service name where missing so public detail page
-- always has *some* content to render.
UPDATE services
   SET description = COALESCE(NULLIF(description, ''), name, slug)
 WHERE description IS NULL OR description = '';
