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

  // Pro Enhancements
  lastModified?: string; // ISO Date
  templateId?: string;
  locked?: boolean;
  isDeleted?: boolean;
  pageData?: Record<string, any>; // Phase 14: Dynamic Document Data
  seo_metadata?: SEOData;
}

export interface TemplateField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'rich-text' | 'image' | 'select' | 'boolean';
  required?: boolean;
  options?: { label: string; value: string }[]; // For 'select'
  defaultValue?: any;
}

export interface Template {
  id: string;
  name: string;
  areas: string[]; // e.g., ['header', 'main', 'footer']
  thumbnail?: string;
  fields?: TemplateField[]; // Phase 14: Custom fields defined by the template
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
  missingAltCount: number;
  securityIssues: number;
  wordCount?: number;
  readingTime?: number;
  keywordDensity?: Record<string, number>;
}

export interface MenuItem {
  id: string;
  label: string;
  href: string;
  children?: MenuItem[];
}

export interface FooterSection {
  id: string;
  title: string;
  links: { id: string; label: string; href: string }[];
}

export interface SiteSettings {
  header: {
    logoUrl: string;
    showSearch: boolean;
    menuItems: MenuItem[];
    bgColor: string;
    textColor: string;
    accentColor: string;
  };
  footer: {
    sections: FooterSection[];
    copyright: string;
    socialLinks: { platform: string; url: string }[];
    bgColor: string;
    textColor: string;
  };
  buttons: {
    bgColor: string;
    textColor: string;
    borderRadius: string;
  };
}

export interface MediaFolder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
}

export interface Asset {
  id: string;
  name: string;
  fileUrl: string;
  fileType: string;
  sizeBytes: number;
  folderId: string | null;
  isDeleted: boolean;
  createdAt: string;
  metadata: Record<string, any>;
}
