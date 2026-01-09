'use client';

import { useSiteStore } from "@/store/useSiteStore";
import BlockRenderer from "@/components/cms/editor/BlockRenderer";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DynamicPage() {
    const params = useParams();
    const router = useRouter();
    const slugParts = params.slug as string[];
    const currentSlug = `/${slugParts.join('/')}`;

    const { sitemap, pageComponents, pageCustomCode, initializeSite, loadPageContent, isLoading } = useSiteStore();

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

    // Handle Redirects
    useEffect(() => {
        const checkRedirects = async () => {
            if (!isLoading && !currentNode) {
                const { data } = await supabase
                    .from('redirects')
                    .select('new_path')
                    .eq('old_path', currentSlug)
                    .single();

                if (data?.new_path) {
                    router.push(data.new_path);
                }
            }
        };
        checkRedirects();
    }, [currentNode, currentSlug, isLoading, router]);

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
    const customCode = pageCustomCode[currentNode.id] || { css: '', js: '' };
    const pageData = currentNode.pageData || {};

    return (
        <div className="min-h-screen bg-white dark:bg-black font-sans text-gray-900 dark:text-gray-100">
            {/* Custom CSS Injection */}
            <style dangerouslySetInnerHTML={{ __html: customCode.css }} />

            {/* Custom JS Injection (Safe execution) */}
            {customCode.js && (
                <script
                    dangerouslySetInnerHTML={{
                        __html: `(function(){ try { ${customCode.js} } catch(e) { console.error('Custom JS Error:', e); } })();`
                    }}
                />
            )}
            <main>
                {/* Render Template Document Fields (Phase 14) */}
                {Object.keys(pageData).length > 0 && (
                    <div className="container mx-auto px-4 py-8 mb-8 border-b border-gray-100 dark:border-zinc-800">
                        <div className="space-y-4">
                            {Object.entries(pageData).map(([key, val]) => (
                                <div key={key}>
                                    <p className="text-[10px] uppercase font-bold text-blue-500 mb-1">{key}</p>
                                    <div className="text-lg">{String(val)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {components.length === 0 ? (
                    <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-400">
                        <h1 className="text-2xl font-bold mb-2">Empty Page</h1>
                        <p>This page exists but has no content yet.</p>
                    </div>
                ) : (
                    components.map((component: any) => (
                        <BlockRenderer key={component.id} component={component} isEditable={false} />
                    ))
                )}
            </main>
        </div>
    );
}
