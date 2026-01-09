-- Phase 14: Dynamic Document Types
-- Add page_data column to sitemap to store structured data defined by templates

ALTER TABLE sitemap ADD COLUMN IF NOT EXISTS page_data JSONB DEFAULT '{}';

-- Optional: If we want to store templates in DB later
-- CREATE TABLE IF NOT EXISTS templates (
--     id TEXT PRIMARY KEY,
--     name TEXT NOT NULL,
--     fields JSONB DEFAULT '[]',
--     areas TEXT[] DEFAULT '{}',
--     thumbnail TEXT
-- );
