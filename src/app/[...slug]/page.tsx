'use client';

import { useSiteStore } from "@/store/useSiteStore";
import BlockRenderer from "@/components/cms/editor/BlockRenderer";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";

export default function DynamicPage() {
    const params = useParams();
    const slugParts = params.slug as string[];
    const currentSlug = `/${slugParts.join('/')}`;

    const { sitemap, pageComponents, initializeSite, loadPageContent, isLoading } = useSiteStore();

    useEffect(() => {
        initializeSite();
    }, [initializeSite]);

    // Find node recursively
    const findNodeBySlug = (nodes: any[], slug: string): any => {
        for (const node of nodes) {
            if (node.slug === slug) return node;
            if (node.children) {
                const found = findNodeBySlug(node.children, slug);
                if (found) return found;
            }
        }
        return null;
    };

    const currentNode = findNodeBySlug(sitemap, currentSlug);

    useEffect(() => {
        if (currentNode && !pageComponents[currentNode.id]) {
            loadPageContent(currentNode.id);
        }
    }, [currentNode, pageComponents, loadPageContent]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    if (!currentNode) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-10 text-center bg-white dark:bg-black">
                <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">404</h1>
                <h2 className="text-xl font-semibold mb-6 text-gray-500">Page not found</h2>
                <p className="text-gray-400 mb-8 max-w-md">The page you are looking for doesn't exist or has been moved.</p>
                <a href="/" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Return Home
                </a>
            </div>
        );
    }

    const components = pageComponents[currentNode.id] || [];

    return (
        <div className="min-h-screen bg-white dark:bg-black font-sans text-gray-900 dark:text-gray-100">
            <main>
                {components.length === 0 ? (
                    <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-400">
                        <h1 className="text-2xl font-bold mb-2">Empty Page</h1>
                        <p>This page exists but has no content yet.</p>
                    </div>
                ) : (
                    components.map(component => (
                        <BlockRenderer key={component.id} component={component} isEditable={false} />
                    ))
                )}
            </main>
        </div>
    );
}
