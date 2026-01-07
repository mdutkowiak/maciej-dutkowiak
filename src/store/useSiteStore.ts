import { create } from 'zustand';
import { SitemapNode, ComponentData, GenericStatus, Template, SiteSettings } from './types';
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

    // Actions
    setSitemap: (nodes: SitemapNode[]) => void;
    setActivePage: (id: string) => void;
    setSelectedComponent: (id: string | null) => void;
    updateComponent: (pageId: string, componentId: string, props: Record<string, any>) => void;

    addPage: (parentId: string | null, page: Partial<SitemapNode>) => Promise<void>;
    updatePageStatus: (id: string, status: GenericStatus) => Promise<void>;
    deletePage: (id: string) => Promise<void>;
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
}

const INITIAL_TEMPLATES: Template[] = [
    { id: 'blank', name: 'Blank Page', areas: ['main'], thumbnail: '📄' },
    { id: 'home', name: 'Home Layout', areas: ['hero', 'features', 'cta'], thumbnail: '🏠' },
    { id: 'landing', name: 'Landing Page', areas: ['header', 'main', 'footer'], thumbnail: '🚀' },
    { id: 'blog', name: 'Blog Post', areas: ['header', 'main', 'sidebar', 'footer'], thumbnail: '📝' },
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
            lastModified: item.last_modified,
            templateId: item.template_id,
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

    initializeSite: async () => {
        set({ isLoading: true, errorMessage: null });
        try {
            await get().fetchSiteSettings();
            const { data, error } = await supabase.from('sitemap').select('*').order('title');
            if (error) throw error;

            if (data) {
                const tree = buildTree(data);
                // Ensure there is at least a home page if DB is empty (First Run)
                if (tree.length === 0) {
                    // Optionally bootstrap DB here
                }
                set({ sitemap: tree });

                // Set active page to Home if exists, otherwise first node
                const homeNode = data.find((n: any) => n.slug === '/');
                if (homeNode) {
                    get().setActivePage(homeNode.id);
                } else if (tree.length > 0) {
                    get().setActivePage(tree[0].id);
                }
            }
        } catch (e: any) {
            console.error('Failed to init site:', e);
            // Display friendly error for common issues
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

    fetchSiteSettings: async () => {
        try {
            const { data, error } = await supabase.from('site_settings').select('*').eq('id', 'global').single();
            if (data) {
                set({ siteSettings: data as SiteSettings });
            } else if (error && error.code === 'PGRST116') {
                // Table doesn't exist or is empty - handle gracefully
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

    loadPageContent: async (pageId) => {
        // Check if already loaded? (Optional caching strategy)
        // if (get().pageComponents[pageId]) return; 

        try {
            const { data, error } = await supabase
                .from('page_content')
                .select('components, custom_code')
                .eq('page_id', pageId)
                .single();

            if (data) {
                set(state => ({
                    pageComponents: { ...state.pageComponents, [pageId]: data.components || [] },
                    pageCustomCode: { ...state.pageCustomCode, [pageId]: data.custom_code || { css: '', js: '' } }
                }));
            } else if (!error && !data) {
                // No content record yet, init empty
                set(state => ({
                    pageComponents: { ...state.pageComponents, [pageId]: [] }
                }));
            }
        } catch (e) {
            console.error('Error loading page content:', e);
        }
    },

    setActivePage: (id) => {
        set({ activePageId: id, selectedComponentId: null });
        get().loadPageContent(id);
    },

    setSitemap: (nodes) => set({ sitemap: nodes }), // Optimistic or Reorder update

    // --- Async Actions ---

    addPage: async (parentId, page) => {
        const newPage = {
            title: page.title || 'New Page',
            slug: page.slug || `/new-page-${Date.now()}`,
            parent_id: parentId,
            status: 'draft',
            template_id: page.templateId,
            seo_metadata: {}
        };

        const { data, error } = await supabase.from('sitemap').insert(newPage).select().single();

        if (data) {
            // Refresh Sitemap
            await get().initializeSite();
            // Create empty content record
            await supabase.from('page_content').insert({ page_id: data.id, components: [] });
        }
    },

    deletePage: async (id) => {
        // Cascade delete should handle children and content in DB
        await supabase.from('sitemap').delete().eq('id', id);
        await get().initializeSite();
    },

    updatePageStatus: async (id, status) => {
        await supabase.from('sitemap').update({ status }).eq('id', id);
        // Optimistic update
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
        // Need to find current value to toggle... or just fetch fresh
        // For now, let's just assume we want to toggle the local state and sync
        // Finding the node in local state is easier
        // Simplification for MVP:
        const { data } = await supabase.from('sitemap').select('locked').eq('id', id).single();
        if (data) {
            await supabase.from('sitemap').update({ locked: !data.locked }).eq('id', id);
            await get().initializeSite(); // Refresh to be safe
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

        // Update last modified of the page
        await supabase.from('sitemap').update({ last_modified: new Date().toISOString() }).eq('id', pageId);
    },

    // --- Component Actions (Optimistic Local + Save Trigger) ---
    // In a real app, you might auto-save or have a explicit save button. 
    // To keep it simple, we will update local store normally, 
    // AND trigger a debounced or immediate save?
    // Let's implement immediate save for now, or rely on "Publish/Save" button. 
    // User requested "Dev (Save) vs Live (Publish)". 
    // So 'pageComponents' in store = DEV state. 
    // We should autosave to DB 'page_content' which acts as Draft.
    // 'Publish' action would be separate? 
    // Actually, let's keep it simple: Actions update Store, and we rely on explicit 'savePageContent' call 
    // OR we trigger savePageContent inside these actions.

    // Let's trigger savePageContent on every component change for "Auto-Save Draft" experience.

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
        // Debounce this in real world (typing in text field triggers many updates)
        // For MVP, direct save is okay if traffic is low
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
            pageComponents: state.pageComponents, // No change
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

    // Templates
    saveTemplate: (name, pageId) => set((state) => {
        // Template logic... for now local only
        return { templates: [...state.templates, { id: Math.random().toString(), name, areas: ['main'], thumbnail: '💾' }] };
    }),

    deleteTemplate: (id) => set((state) => ({
        templates: state.templates.filter(t => t.id !== id)
    })),

    setSelectedComponent: (id) => set({ selectedComponentId: id }),

}));
