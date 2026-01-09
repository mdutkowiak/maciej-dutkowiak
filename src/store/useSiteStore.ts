import { create } from 'zustand';
import { SitemapNode, ComponentData, GenericStatus, Template, SiteSettings, SEOPageReport } from './types';
import { arrayMove } from '@dnd-kit/sortable';
import { supabase } from '@/lib/supabase';

interface CustomCode {
    css: string;
    js: string;
}

interface SiteStore {
    isLoading: boolean;
    errorMessage: string | null;
    sitemap: SitemapNode[];
    activePageId: string | null;

    // Page Content Maps
    pageComponents: Record<string, ComponentData[]>;
    pageCustomCode: Record<string, CustomCode>;
    selectedComponentId: string | null;

    // Initialization
    initializeSite: () => Promise<void>;
    loadPageContent: (pageId: string) => Promise<void>;
    getNodeById: (id: string) => SitemapNode | null;

    // Actions
    setSitemap: (nodes: SitemapNode[]) => void;
    setActivePage: (id: string) => void;
    setSelectedComponent: (id: string | null) => void;
    updateComponent: (pageId: string, componentId: string, props: Record<string, any>) => void;

    addPage: (parentId: string | null, page: Partial<SitemapNode>) => Promise<void>;
    updatePageStatus: (id: string, status: GenericStatus) => Promise<void>;
    deletePage: (id: string) => Promise<void>;
    restorePage: (id: string) => Promise<void>;
    togglePageLock: (id: string) => Promise<void>;

    // Editor Actions
    addComponent: (pageId: string, component: ComponentData) => void;
    removeComponent: (pageId: string, componentId: string) => void;
    reorderComponents: (pageId: string, oldIndex: number, newIndex: number) => void;
    updateCustomCode: (pageId: string, type: 'css' | 'js', code: string) => void;
    savePageContent: (pageId: string) => Promise<void>; // Explicit save for content

    // Template Actions
    templates: Template[];
    saveTemplate: (name: string, pageId: string) => void;
    deleteTemplate: (id: string) => void;

    // Site Settings
    siteSettings: SiteSettings | null;
    fetchSiteSettings: () => Promise<void>;
    updateSiteSettings: (settings: Partial<SiteSettings>) => Promise<void>;

    // Sitemap UX & Actions
    collapsedNodes: string[];
    toggleNodeCollapse: (id: string) => Promise<void>;
    fetchUserPreferences: () => Promise<void>;
    copiedPageId: string | null;
    copyPage: (id: string) => void;
    pastePage: (parentId: string | null) => Promise<void>;
    movePage: (id: string, newParentId: string | null) => Promise<void>;
    updatePageProperties: (id: string, properties: { title?: string; slug?: string; seoTitle?: string; seoDesc?: string }) => Promise<{ success: boolean; error?: string }>;
    updatePageData: (id: string, data: Record<string, any>) => Promise<void>;

    // Dashboard Stats
    dashboardStats: {
        totalPages: number;
        publishedPages: number;
        draftPages: number;
        totalViews: string; // Mock for now but stored in state
    };
    fetchDashboardStats: () => Promise<void>;

    // Navigation & Modes (Phase 11)
    activeMode: 'content' | 'media' | 'settings' | 'users' | 'help';
    setActiveMode: (mode: 'content' | 'media' | 'settings' | 'users' | 'help') => void;

    // SEO Auditor (Phase 15)
    seoReports: Record<string, SEOPageReport>;
    runSeoAudit: (pageId: string) => Promise<void>;
    fetchAllSeoReports: () => Promise<void>;
}

const INITIAL_TEMPLATES: Template[] = [
    { id: 'blank', name: 'Blank Page', areas: ['main'], thumbnail: '📄' },
    {
        id: 'home',
        name: 'Home Layout',
        areas: ['hero', 'features', 'cta'],
        thumbnail: '🏠',
        fields: [
            { id: 'promo_text', label: 'Promo Banner Text', type: 'text' },
            { id: 'show_newsletter', label: 'Show Newsletter', type: 'boolean', defaultValue: true }
        ]
    },
    {
        id: 'landing',
        name: 'Landing Page',
        areas: ['header', 'main', 'footer'],
        thumbnail: '🚀',
        fields: [
            { id: 'campaign_id', label: 'Campaign ID', type: 'text' },
            { id: 'conversion_goal', label: 'Target conversion (%)', type: 'number' }
        ]
    },
    {
        id: 'blog',
        name: 'Blog Post',
        areas: ['header', 'main', 'sidebar', 'footer'],
        thumbnail: '📝',
        fields: [
            { id: 'author', label: 'Author Name', type: 'text', required: true },
            { id: 'publishDate', label: 'Publish Date', type: 'date' },
            { id: 'featured', label: 'Featured Post', type: 'boolean', defaultValue: false },
            {
                id: 'category', label: 'Category', type: 'select', options: [
                    { label: 'News', value: 'news' },
                    { label: 'Tutorial', value: 'tutorial' },
                    { label: 'Product', value: 'product' }
                ]
            }
        ]
    },
];

// Helper to reconstruct tree from flat array
const buildTree = (items: any[], parentId: string | null = null): SitemapNode[] => {
    return items
        .filter(item => item.parent_id === parentId)
        .map(item => ({
            id: item.id,
            title: item.title,
            slug: item.slug,
            status: item.status as GenericStatus,
            locked: item.locked,
            isDeleted: item.is_deleted,
            lastModified: item.last_modified,
            templateId: item.template_id,
            pageData: item.page_data || {},
            seo_metadata: item.seo_metadata || {},
            children: buildTree(items, item.id)
        }));
};

export const useSiteStore = create<SiteStore>((set, get) => ({
    isLoading: false,
    errorMessage: null, // New state for error handling
    sitemap: [],
    activePageId: null, // Start null, will set to 'home' or first page after load
    pageComponents: {},
    pageCustomCode: {},
    selectedComponentId: null,
    templates: INITIAL_TEMPLATES,
    siteSettings: null,
    dashboardStats: {
        totalPages: 0,
        publishedPages: 0,
        draftPages: 0,
        totalViews: '0',
    },
    activeMode: 'content',
    seoReports: {},

    initializeSite: async () => {
        set({ isLoading: true, errorMessage: null });
        try {
            await Promise.all([
                get().fetchSiteSettings(),
                get().fetchUserPreferences(),
                get().fetchDashboardStats()
            ]);
            const { data, error } = await supabase.from('sitemap').select('*').order('title');
            if (error) throw error;

            if (data) {
                const tree = buildTree(data);
                set({ sitemap: tree });
            }
        } catch (e: any) {
            console.error('Failed to init site:', e);
            let msg = 'Failed to load sitemap.';
            if (e?.message?.includes('relation "sitemap" does not exist')) {
                msg = 'Database tables not found. Please run the SQL migration.';
            } else if (e?.message) {
                msg = `Error: ${e.message}`;
            }
            set({ errorMessage: msg });
        } finally {
            set({ isLoading: false });
        }
    },

    getNodeById: (id: string) => {
        const find = (nodes: SitemapNode[]): SitemapNode | null => {
            for (const node of nodes) {
                if (node.id === id) return node;
                if (node.children && node.children.length > 0) {
                    const found = find(node.children);
                    if (found) return found;
                }
            }
            return null;
        };
        return find(get().sitemap);
    },

    addPage: async (parentId, page) => {
        const id = crypto.randomUUID();
        const { error } = await supabase.from('sitemap').insert({
            id,
            parent_id: parentId,
            title: page.title || 'Untitled Page',
            slug: page.slug || `/page-${Date.now()}`,
            status: page.status || 'draft',
            template_id: page.templateId || 'blank',
            locked: false,
            is_deleted: false,
            last_modified: new Date().toISOString()
        });

        if (error) throw error;
        await get().initializeSite();
    },

    fetchSiteSettings: async () => {
        try {
            const { data, error } = await supabase.from('site_settings').select('*').eq('id', 'global').single();
            if (data) {
                set({ siteSettings: data as SiteSettings });
            } else if (error && error.code === 'PGRST116') {
                console.warn('Site settings not found in DB');
            }
        } catch (e) {
            console.error('Error fetching site settings:', e);
        }
    },

    updateSiteSettings: async (settings) => {
        const current = get().siteSettings;
        if (!current) return;

        const updated = { ...current, ...settings };
        set({ siteSettings: updated });

        try {
            await supabase.from('site_settings').upsert({ id: 'global', ...updated });
        } catch (e) {
            console.error('Error updating site settings:', e);
        }
    },

    collapsedNodes: [],
    copiedPageId: null,

    fetchUserPreferences: async () => {
        try {
            const { data, error } = await supabase.from('user_preferences').select('collapsed_nodes').eq('user_id', 'anonymous').single();
            if (data) {
                set({ collapsedNodes: data.collapsed_nodes || [] });
            }
        } catch (e) {
            console.error('Error fetching user preferences:', e);
        }
    },

    toggleNodeCollapse: async (id) => {
        const collapsed = get().collapsedNodes;
        const newCollapsed = collapsed.includes(id)
            ? collapsed.filter(nid => nid !== id)
            : [...collapsed, id];

        set({ collapsedNodes: newCollapsed });

        try {
            await supabase.from('user_preferences').upsert({ user_id: 'anonymous', collapsed_nodes: newCollapsed });
        } catch (e) {
            console.error('Error persisting collapse state:', e);
        }
    },

    copyPage: (id) => {
        set({ copiedPageId: id });
    },

    pastePage: async (parentId) => {
        const { copiedPageId } = get();
        if (!copiedPageId) return;

        try {
            // Fetch parent slug for prefix
            let parentSlug = '';
            if (parentId) {
                const { data: parent } = await supabase.from('sitemap').select('slug').eq('id', parentId).single();
                parentSlug = parent?.slug === '/' ? '/' : (parent?.slug + '/');
            } else {
                parentSlug = '/';
            }

            // Fetch original node
            const { data: original, error: fetchError } = await supabase.from('sitemap').select('*').eq('id', copiedPageId).single();
            if (fetchError || !original) throw fetchError;

            // Simple slug generation for copy
            const leaf = original.slug.split('/').pop() || 'copy';
            const newSlug = `${parentSlug}${leaf}-copy-${Math.floor(Math.random() * 1000)}`;

            // Create new node
            const newId = crypto.randomUUID();
            const newPage = {
                id: newId,
                parent_id: parentId,
                title: `${original.title} (Copy)`,
                slug: newSlug,
                status: original.status,
                locked: original.locked,
                template_id: original.template_id,
                seo_metadata: original.seo_metadata,
                last_modified: new Date().toISOString()
            };

            const { error: insertError } = await supabase.from('sitemap').insert(newPage);
            if (insertError) throw insertError;

            // Fetch page content and clone it
            const { data: content, error: contentError } = await supabase.from('page_content').select('*').eq('page_id', copiedPageId).single();
            if (!contentError && content) {
                await supabase.from('page_content').insert({
                    page_id: newId,
                    components: content.components,
                    custom_code: content.custom_code
                });
            }

            await get().initializeSite();
        } catch (e) {
            console.error('Error pasting page:', e);
        }
    },

    movePage: async (id, newParentId) => {
        try {
            // Calculate new slug
            let parentSlug = '';
            if (newParentId) {
                const { data: parent } = await supabase.from('sitemap').select('slug').eq('id', newParentId).single();
                parentSlug = parent?.slug === '/' ? '/' : (parent?.slug + '/');
            } else {
                parentSlug = '/';
            }

            const { data: node } = await supabase.from('sitemap').select('slug').eq('id', id).single();
            if (!node) return;

            const leaf = node.slug.split('/').pop() || '';
            const newSlug = `${parentSlug}${leaf}`;

            const { error } = await supabase.from('sitemap').update({
                parent_id: newParentId,
                slug: newSlug
            }).eq('id', id);

            if (error) throw error;
            await get().initializeSite();
        } catch (e) {
            console.error('Error moving page:', e);
        }
    },

    updatePageProperties: async (id, props) => {
        try {
            const { data: current } = await supabase.from('sitemap').select('slug, seo_metadata').eq('id', id).single();
            const oldSlug = current?.slug;

            if (props.slug && props.slug !== oldSlug) {
                const { data: existing } = await supabase
                    .from('sitemap')
                    .select('id')
                    .eq('slug', props.slug)
                    .neq('id', id)
                    .single();

                if (existing) {
                    return { success: false, error: 'Slug already exists' };
                }

                await supabase.from('redirects').upsert({
                    old_path: oldSlug,
                    new_path: props.slug
                }, { onConflict: 'old_path' });
            }

            const updateData: any = {
                last_modified: new Date().toISOString()
            };
            if (props.title) updateData.title = props.title;
            if (props.slug) updateData.slug = props.slug;
            if (props.seoTitle || props.seoDesc) {
                updateData.seo_metadata = {
                    ...(current?.seo_metadata || {}),
                    title: props.seoTitle ?? current?.seo_metadata?.title,
                    description: props.seoDesc ?? current?.seo_metadata?.description
                };
            }

            const { error } = await supabase.from('sitemap').update(updateData).eq('id', id);
            if (error) throw error;
            await get().initializeSite();
            return { success: true };
        } catch (e: any) {
            console.error('Error updating page properties:', e);
            return { success: false, error: e.message };
        }
    },

    updatePageData: async (id, data) => {
        try {
            const { data: current } = await supabase.from('sitemap').select('page_data').eq('id', id).single();
            const newData = { ...(current?.page_data || {}), ...data };

            await supabase.from('sitemap').update({
                page_data: newData,
                last_modified: new Date().toISOString()
            }).eq('id', id);

            await get().initializeSite();
        } catch (e) {
            console.error('Error updating page data:', e);
        }
    },

    loadPageContent: async (pageId) => {
        const { data, error } = await supabase.from('page_content').select('*').eq('page_id', pageId).single();
        if (!error && data) {
            set((state) => ({
                pageComponents: { ...state.pageComponents, [pageId]: data.components || [] },
                pageCustomCode: { ...state.pageCustomCode, [pageId]: data.custom_code || { css: '', js: '' } }
            }));
        } else if (error && error.code === 'PGRST116') {
            // No content yet, initialize with empty
            set((state) => ({
                pageComponents: { ...state.pageComponents, [pageId]: [] },
                pageCustomCode: { ...state.pageCustomCode, [pageId]: { css: '', js: '' } }
            }));
        }
    },

    setSitemap: (nodes) => set({ sitemap: nodes }),
    setActivePage: (id) => set({ activePageId: id }),

    deletePage: async (id) => {
        const findNode = (nodes: SitemapNode[]): SitemapNode | null => {
            for (const n of nodes) {
                if (n.id === id) return n;
                if (n.children) {
                    const found = findNode(n.children);
                    if (found) return found;
                }
            }
            return null;
        };

        const node = findNode(get().sitemap);

        if (get().activePageId === id) {
            set({ activePageId: null });
        }

        if (node?.isDeleted) {
            await supabase.from('sitemap').delete().eq('id', id);
        } else {
            await supabase.from('sitemap').update({ is_deleted: true }).eq('id', id);
        }

        await get().initializeSite();
    },

    restorePage: async (id) => {
        await supabase.from('sitemap').update({ is_deleted: false }).eq('id', id);
        await get().initializeSite();
    },

    fetchDashboardStats: async () => {
        try {
            const { data: allPages, error: countError } = await supabase.from('sitemap').select('status');
            if (countError) throw countError;

            if (allPages) {
                const total = allPages.length;
                const published = allPages.filter((p: { status: string }) => p.status === 'published').length;
                const drafts = total - published;

                set({
                    dashboardStats: {
                        totalPages: total,
                        publishedPages: published,
                        draftPages: drafts,
                        totalViews: (total * 123).toLocaleString(),
                    }
                });
            }
        } catch (e) {
            console.error('Error fetching dashboard stats:', e);
        }
    },

    updatePageStatus: async (id, status) => {
        await supabase.from('sitemap').update({ status }).eq('id', id);
        set((state) => {
            const updateRecursive = (nodes: SitemapNode[]): SitemapNode[] => {
                return nodes.map(node => {
                    if (node.id === id) return { ...node, status };
                    if (node.children.length > 0) return { ...node, children: updateRecursive(node.children) };
                    return node;
                });
            };
            return { sitemap: updateRecursive(state.sitemap) };
        });
    },

    togglePageLock: async (id) => {
        const { data } = await supabase.from('sitemap').select('locked').eq('id', id).single();
        if (data) {
            await supabase.from('sitemap').update({ locked: !data.locked }).eq('id', id);
            await get().initializeSite();
        }
    },

    savePageContent: async (pageId) => {
        const components = get().pageComponents[pageId] || [];
        const customCode = get().pageCustomCode[pageId] || {};

        await supabase.from('page_content').upsert({
            page_id: pageId,
            components,
            custom_code: customCode
        });

        await supabase.from('sitemap').update({ last_modified: new Date().toISOString() }).eq('id', pageId);

        // Refresh sitemap in store to reflect last_modified and any other changes
        await get().initializeSite();
    },

    addComponent: (pageId, component) => {
        set((state) => ({
            pageComponents: {
                ...state.pageComponents,
                [pageId]: [...(state.pageComponents[pageId] || []), component],
            }
        }));
        get().savePageContent(pageId);
    },

    removeComponent: (pageId, componentId) => {
        set((state) => ({
            pageComponents: {
                ...state.pageComponents,
                [pageId]: (state.pageComponents[pageId] || []).filter(c => c.id !== componentId)
            }
        }));
        get().savePageContent(pageId);
    },

    updateComponent: (pageId, componentId, props) => {
        set((state) => ({
            pageComponents: {
                ...state.pageComponents,
                [pageId]: (state.pageComponents[pageId] || []).map(c =>
                    c.id === componentId ? { ...c, props: { ...c.props, ...props } } : c
                )
            }
        }));
        get().savePageContent(pageId);
    },

    reorderComponents: (pageId, oldIndex, newIndex) => {
        set((state) => ({
            pageComponents: {
                ...state.pageComponents,
                [pageId]: arrayMove(state.pageComponents[pageId] || [], oldIndex, newIndex)
            }
        }));
        get().savePageContent(pageId);
    },

    updateCustomCode: (pageId, type, code) => {
        set((state) => ({
            pageComponents: state.pageComponents,
            pageCustomCode: {
                ...state.pageCustomCode,
                [pageId]: {
                    ...(state.pageCustomCode[pageId] || { css: '', js: '' }),
                    [type]: code
                }
            }
        }));
        get().savePageContent(pageId);
    },

    fetchAllSeoReports: async () => {
        const { data, error } = await supabase.from('seo_audits').select('*, sitemap(slug)');
        if (error) {
            console.error('Error fetching SEO reports:', error);
            return;
        }

        const reports: Record<string, SEOPageReport> = {};
        data?.forEach((r: any) => {
            reports[r.page_id] = {
                pageId: r.page_id,
                path: r.sitemap?.slug || '/',
                slug: r.sitemap?.slug || '/',
                seoScore: r.score as any,
                missingTags: r.missing_tags || [],
                brokenLinks: r.broken_links_count || 0,
                missingAltCount: r.missing_alt_count || 0,
                securityIssues: r.security_issues_count || 0
            };
        });
        set({ seoReports: reports });
    },

    runSeoAudit: async (pageId: string) => {
        try {
            // 1. Fetch data
            const { data: node } = await supabase.from('sitemap').select('*').eq('id', pageId).single();
            const { data: content } = await supabase.from('page_content').select('*').eq('page_id', pageId).single();

            if (!node) return;

            const components = content?.components || [];
            const seo = node.seo_metadata || {};

            // 2. Perform Checks
            const missingTags: string[] = [];
            let brokenLinks = 0;
            let missingAltCount = 0;
            let securityIssues = 0;
            const headingHierarchy: string[] = [];

            // Metadata Checks
            if (!seo.title) missingTags.push('title');
            if (!seo.description) missingTags.push('description');
            if (!seo.ogImage) missingTags.push('og:image');

            // Recursive Component Scan
            const scan = (comps: any[]) => {
                comps.forEach(c => {
                    // Headings Check
                    if (c.type === 'Heading' || (c.props?.tag && c.props.tag.startsWith('h'))) {
                        headingHierarchy.push(c.props.tag || 'h2');
                    }

                    // Alt Text Check
                    const hasImage = Object.values(c.props).some(v => typeof v === 'string' && (v.includes('.jpg') || v.includes('.png') || v.includes('.webp')));
                    if (hasImage && !c.props.alt) {
                        missingAltCount++;
                    }

                    // Links & Security Check
                    Object.entries(c.props).forEach(([key, val]) => {
                        if (typeof val === 'string' && (key === 'href' || key === 'url' || key.toLowerCase().includes('link'))) {
                            if (val.startsWith('http')) {
                                if (c.props.target === '_blank' && !c.props.rel?.includes('noopener')) {
                                    securityIssues++;
                                }
                            } else if (val.startsWith('/')) {
                                const exists = get().sitemap.some(n => n.slug === val);
                                if (!exists && val !== '/') brokenLinks++;
                            }
                        }
                    });

                    if (c.children) scan(c.children);
                });
            };
            scan(components);

            // Heading Hierarchy Logic
            const h1Count = headingHierarchy.filter(h => h.toLowerCase() === 'h1').length;
            if (h1Count !== 1) missingTags.push('h1-unique');

            // 3. Calculate Score
            let score: 'good' | 'warning' | 'critical' = 'good';
            if (missingTags.length > 1 || brokenLinks > 0 || securityIssues > 0 || missingAltCount > 0) score = 'warning';
            if (missingTags.includes('title') || brokenLinks > 2) score = 'critical';

            // 4. Save Results
            await supabase.from('seo_audits').upsert({
                page_id: pageId,
                score,
                missing_tags: missingTags,
                broken_links_count: brokenLinks,
                security_issues_count: securityIssues,
                missing_alt_count: missingAltCount,
                last_run: new Date().toISOString()
            });

            await get().fetchAllSeoReports();
        } catch (e) {
            console.error('SEO Audit failed:', e);
        }
    },

    saveTemplate: (name, pageId) => set((state) => {
        return { templates: [...state.templates, { id: Math.random().toString(), name, areas: ['main'], thumbnail: '💾' }] };
    }),

    deleteTemplate: (id) => set((state) => ({
        templates: state.templates.filter(t => t.id !== id)
    })),

    setSelectedComponent: (id) => set({ selectedComponentId: id }),

    setActiveMode: (mode) => set({ activeMode: mode }),
}));
