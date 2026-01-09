-- Phase 15: Advanced SEO & Link Auditor Schema

-- Create seo_audits table
CREATE TABLE IF NOT EXISTS public.seo_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id TEXT REFERENCES public.sitemap(id) ON DELETE CASCADE,
    score VARCHAR(20) CHECK (score IN ('good', 'warning', 'critical')),
    missing_tags JSONB DEFAULT '[]'::jsonb,
    broken_links_count INTEGER DEFAULT 0,
    security_issues_count INTEGER DEFAULT 0,
    missing_alt_count INTEGER DEFAULT 0,
    heading_errors JSONB DEFAULT '[]'::jsonb,
    keyword_density JSONB DEFAULT '{}'::jsonb,
    word_count INTEGER DEFAULT 0,
    reading_time INTEGER DEFAULT 0,
    last_run TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(page_id)
);

-- Add security_issues_count if it doesn't exist (in case of partial migration)
-- ALTER TABLE public.seo_audits ADD COLUMN IF NOT EXISTS security_issues_count INTEGER DEFAULT 0;

-- Enable RLS
ALTER TABLE public.seo_audits ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Enable read access for all users" ON public.seo_audits
    FOR SELECT USING (true);

CREATE POLICY "Enable insert/update for all users" ON public.seo_audits
    FOR ALL USING (true);
