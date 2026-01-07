import { create } from 'zustand';
import { SitemapNode, ComponentData, GenericStatus, Template } from './types';
import { arrayMove } from '@dnd-kit/sortable';

interface CustomCode {
    css: string;
    js: string;
}

interface SiteStore {
    sitemap: SitemapNode[];
    activePageId: string | null;

    // Page Content Maps
    pageComponents: Record<string, ComponentData[]>;
    pageCustomCode: Record<string, CustomCode>;
    selectedComponentId: string | null;

    // Actions
    setSitemap: (nodes: SitemapNode[]) => void;
    setActivePage: (id: string) => void;
    setSelectedComponent: (id: string | null) => void;
    updateComponent: (pageId: string, componentId: string, props: Record<string, any>) => void;

    addPage: (parentId: string | null, page: Partial<SitemapNode>) => void;
    updatePageStatus: (id: string, status: GenericStatus) => void;
    deletePage: (id: string) => void;
    togglePageLock: (id: string) => void;

    // Editor Actions
    addComponent: (pageId: string, component: ComponentData) => void;
    removeComponent: (pageId: string, componentId: string) => void;
    reorderComponents: (pageId: string, oldIndex: number, newIndex: number) => void;
    updateCustomCode: (pageId: string, type: 'css' | 'js', code: string) => void;
    // Template Actions
    templates: Template[];
    saveTemplate: (name: string, pageId: string) => void;
    deleteTemplate: (id: string) => void;
}

const INITIAL_TEMPLATES: Template[] = [
    { id: 'blank', name: 'Blank Page', areas: ['main'], thumbnail: '📄' },
    { id: 'landing', name: 'Landing Page', areas: ['header', 'main', 'footer'], thumbnail: '🚀' },
    { id: 'blog', name: 'Blog Post', areas: ['header', 'main', 'sidebar', 'footer'], thumbnail: '📝' },
];

const INITIAL_SITEMAP: SitemapNode[] = [
    { id: 'home', title: 'Home', slug: '/', status: 'published', lastModified: new Date().toISOString(), children: [] },
    { id: 'about', title: 'About', slug: '/about', status: 'published', lastModified: new Date().toISOString(), children: [] },
];

export const useSiteStore = create<SiteStore>((set, get) => ({
    sitemap: INITIAL_SITEMAP,
    activePageId: 'home',
    pageComponents: {},
    pageCustomCode: {},
    selectedComponentId: null,
    templates: INITIAL_TEMPLATES,

    setSitemap: (nodes) => set({ sitemap: nodes }),
    setActivePage: (id) => set({ activePageId: id, selectedComponentId: null }),

    // Templates
    saveTemplate: (name, pageId) => set((state) => {
        const components = state.pageComponents[pageId] || [];
        // In a real app, we would deep clone and sanitize IDs here
        const newTemplate: Template = {
            id: Math.random().toString(36).substr(2, 9),
            name,
            areas: ['main'], // Simplified for now
            thumbnail: '💾'
        };
        // We'd also need to store the component structure associated with this template
        // For MVP, we'll just store the metadata in 'templates' and maybe a separate 'templateComponents' map if needed
        // For now, let's just add the definition.

        return { templates: [...state.templates, newTemplate] };
    }),

    deleteTemplate: (id) => set((state) => ({
        templates: state.templates.filter(t => t.id !== id)
    })),

    addPage: (parentId, page) => set((state) => {
        const newPage: SitemapNode = {
            id: Math.random().toString(36).substr(2, 9),
            title: page.title || 'New Page',
            slug: page.slug || '/new-page',
            status: 'draft',
            lastModified: new Date().toISOString(),
            children: [],
            ...page
        };

        // If a templateId was passed (we'll need to update addPage signature or handle it in the caller),
        // we would pre-fill pageComponents here. 
        // For now, we keep the addPage simple and handle template hydration in the UI logic or separate action.

        const addToParent = (nodes: SitemapNode[]): SitemapNode[] => {
            return nodes.map(node => {
                if (node.id === parentId) {
                    return { ...node, children: [...node.children, newPage] };
                }
                if (node.children.length > 0) {
                    return { ...node, children: addToParent(node.children) };
                }
                return node;
            });
        };

        if (!parentId) {
            return { sitemap: [...state.sitemap, newPage] };
        }

        return { sitemap: addToParent(state.sitemap) };
    }),

    updatePageStatus: (id, status) => set((state) => {
        /* ... existing logic ... */
        const updateRecursive = (nodes: SitemapNode[]): SitemapNode[] => {
            return nodes.map(node => {
                if (node.id === id) {
                    return { ...node, status };
                }
                if (node.children.length > 0) {
                    return { ...node, children: updateRecursive(node.children) };
                }
                return node;
            });
        };

        return { sitemap: updateRecursive(state.sitemap) };
    }),

    deletePage: (id) => set((state) => {
        /* ... existing logic ... */
        const deleteRecursive = (nodes: SitemapNode[]): SitemapNode[] => {
            return nodes
                .filter(node => node.id !== id)
                .map(node => ({
                    ...node,
                    children: deleteRecursive(node.children)
                }));
        };

        return { sitemap: deleteRecursive(state.sitemap) };
    }),

    togglePageLock: (id) => set((state) => {
        const toggleRecursive = (nodes: SitemapNode[]): SitemapNode[] => {
            return nodes.map(node => {
                if (node.id === id) {
                    return { ...node, locked: !node.locked };
                }
                if (node.children.length > 0) {
                    return { ...node, children: toggleRecursive(node.children) };
                }
                return node;
            });
        };
        return { sitemap: toggleRecursive(state.sitemap) };
    }),

    // --- Editor Actions ---

    setSelectedComponent: (id) => set({ selectedComponentId: id }),

    updateComponent: (pageId, componentId, props) => set((state) => ({
        pageComponents: {
            ...state.pageComponents,
            [pageId]: (state.pageComponents[pageId] || []).map(c =>
                c.id === componentId ? { ...c, props: { ...c.props, ...props } } : c
            )
        }
    })),

    addComponent: (pageId, component) => set((state) => ({
        pageComponents: {
            ...state.pageComponents,
            [pageId]: [...(state.pageComponents[pageId] || []), component],
        },
        // Update lastModified when content changes
        sitemap: (function updateTimestamp(nodes: SitemapNode[]): SitemapNode[] {
            return nodes.map(n => {
                if (n.id === pageId) return { ...n, lastModified: new Date().toISOString() };
                if (n.children.length) return { ...n, children: updateTimestamp(n.children) };
                return n;
            });
        })(state.sitemap)
    })),

    removeComponent: (pageId, componentId) => set((state) => ({
        pageComponents: {
            ...state.pageComponents,
            [pageId]: (state.pageComponents[pageId] || []).filter(c => c.id !== componentId)
        }
    })),

    reorderComponents: (pageId, oldIndex, newIndex) => set((state) => ({
        pageComponents: {
            ...state.pageComponents,
            [pageId]: arrayMove(state.pageComponents[pageId] || [], oldIndex, newIndex)
        }
    })),

    updateCustomCode: (pageId, type, code) => set((state) => ({
        pageCustomCode: {
            ...state.pageCustomCode,
            [pageId]: {
                ...(state.pageCustomCode[pageId] || { css: '', js: '' }),
                [type]: code
            }
        }
    }))

}));
