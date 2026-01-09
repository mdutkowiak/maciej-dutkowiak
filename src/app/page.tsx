'use client';

import { useSiteStore } from "@/store/useSiteStore";
import BlockRenderer from "@/components/cms/editor/BlockRenderer";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { sitemap, pageComponents, initializeSite, loadPageContent, isLoading } = useSiteStore();

  useEffect(() => {
    initializeSite();
  }, [initializeSite]);

  // Find home node recursively
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

  const homeNode = findNodeBySlug(sitemap, '/');

  useEffect(() => {
    if (homeNode && !pageComponents[homeNode.id]) {
      loadPageContent(homeNode.id);
    }
  }, [homeNode, pageComponents, loadPageContent]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (!homeNode) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-10 text-center bg-white dark:bg-black">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Home page not found</h1>
        <p className="text-gray-500 mb-6">Please create a page with slug '/' in the admin panel.</p>
        <a href="/admin" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Go to Admin Panel
        </a>
      </div>
    );
  }

  const components = pageComponents[homeNode.id] || [];

  return (
    <div className="min-h-screen bg-white dark:bg-black font-sans text-gray-900 dark:text-gray-100">
      {components.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-400">
          <h1 className="text-2xl font-bold mb-2">Welcome to your new site</h1>
          <p>This page is empty. Go to <a href="/admin" className="text-blue-500 underline">Admin Panel</a> to add content.</p>
        </div>
      ) : (
        <main>
          {components.map(component => (
            <BlockRenderer key={component.id} component={component} isEditable={false} />
          ))}
        </main>
      )}
    </div>
  );
}
