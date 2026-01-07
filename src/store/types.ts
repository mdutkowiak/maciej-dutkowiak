export type GenericStatus = 'draft' | 'published' | 'archived';

export interface SEOData {
  title: string;
  description: string;
  ogImage?: string;
  keywords?: string[];
  canonicalUrl?: string;
  noIndex?: boolean;
}

export interface ComponentData {
  id: string;
  type: 'HeroCover' | 'RichText' | 'GridSystem' | 'ProductShowcase' | 'ExperienceFragment';
  props: Record<string, any>;
  children?: ComponentData[]; // For containers like GridSystem or ExperienceFragment
}

export interface PageSection {
  id: string;
  templateArea: string; // e.g., 'header', 'main', 'sidebar', 'footer'
  components: ComponentData[];
}

export interface PageData {
  id: string;
  slug: string;
  templateId: string;
  status: GenericStatus;
  seo: SEOData;
  content: Record<string, any>; // Flexible content store can also be used if not using strict component tree
  sections: PageSection[]; // Component tree structure
  lastModified: string;
}

export interface SitemapNode {
  id: string;
  title: string;
  slug: string;
  status: GenericStatus;
  children: SitemapNode[];
}

export interface Template {
  id: string;
  name: string;
  areas: string[]; // e.g., ['header', 'main', 'footer']
  thumbnail?: string;
}

// Crawler / SEO Audit Types
export interface ScanResult {
  url: string;
  status: number; // 200, 404, etc.
  checkedAt: string;
}

export interface SEOPageReport {
  pageId: string;
  path: string; // computed full path
  slug: string;
  seoScore: 'good' | 'warning' | 'critical';
  missingTags: string[]; // e.g., ['h1', 'alt', 'meta-description']
  brokenLinks: number;
}
