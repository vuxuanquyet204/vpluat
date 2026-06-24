-- Add name column to services table for easier admin lookup
ALTER TABLE services ADD COLUMN IF NOT EXISTS name VARCHAR(255);

-- Copy slug values to name if name is null (for existing records)
UPDATE services SET name = slug WHERE name IS NULL;

-- Make name non-nullable after populating
ALTER TABLE services ALTER COLUMN name SET NOT NULL;
