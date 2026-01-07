import { create } from 'zustand';
import { SitemapNode, ComponentData, GenericStatus } from './types';
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

    // Actions
    setSitemap: (nodes: SitemapNode[]) => void;
    setActivePage: (id: string) => void;
    addPage: (parentId: string | null, page: Partial<SitemapNode>) => void;
    updatePageStatus: (id: string, status: GenericStatus) => void;
    deletePage: (id: string) => void;

    // Editor Actions
    addComponent: (pageId: string, component: ComponentData) => void;
    removeComponent: (pageId: string, componentId: string) => void;
    reorderComponents: (pageId: string, oldIndex: number, newIndex: number) => void;
    updateCustomCode: (pageId: string, type: 'css' | 'js', code: string) => void;
}

const INITIAL_SITEMAP: SitemapNode[] = [
    { id: 'home', title: 'Home', slug: '/', status: 'published', children: [] },
    { id: 'about', title: 'About', slug: '/about', status: 'published', children: [] },
];

export const useSiteStore = create<SiteStore>((set) => ({
    sitemap: INITIAL_SITEMAP,
    activePageId: 'home',
    pageComponents: {},
    pageCustomCode: {},

    setSitemap: (nodes) => set({ sitemap: nodes }),
    setActivePage: (id) => set({ activePageId: id }),

    addPage: (parentId, page) => set((state) => {
        const newPage: SitemapNode = {
            id: Math.random().toString(36).substr(2, 9),
            title: page.title || 'New Page',
            slug: page.slug || '/new-page',
            status: 'draft',
            children: [],
            ...page
        };
        /* ... existing recursive logic ... */
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

    // --- Editor Actions ---

    addComponent: (pageId, component) => set((state) => ({
        pageComponents: {
            ...state.pageComponents,
            [pageId]: [...(state.pageComponents[pageId] || []), component]
        }
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
