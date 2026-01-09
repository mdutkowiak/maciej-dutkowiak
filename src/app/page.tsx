'use client';

import { useSiteStore } from "@/store/useSiteStore";
import BlockRenderer from "@/components/cms/editor/BlockRenderer";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { sitemap, pageComponents, pageCustomCode, initializeSite, loadPageContent, isLoading } = useSiteStore();

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

  if (!homeNode || homeNode.status === 'archived') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-10 text-center bg-white dark:bg-black">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          {!homeNode ? 'Home page not found' : 'Under Construction'}
        </h1>
        <p className="text-gray-500 mb-6">
          {!homeNode
            ? "Please create a page with slug '/' in the admin panel."
            : "This page is currently unpublished. Check back soon!"}
        </p>
        <a href="/admin" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Go to Admin Panel
        </a>
      </div>
    );
  }

  const components = pageComponents[homeNode.id] || [];
  const customCode = pageCustomCode[homeNode.id] || { css: '', js: '' };
  const pageData = homeNode.pageData || {};

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
      {components.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-400">
          <h1 className="text-2xl font-bold mb-2">Welcome to your new site</h1>
          <p>This page is empty. Go to <a href="/admin" className="text-blue-500 underline">Admin Panel</a> to add content.</p>
        </div>
      ) : (
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
          {components.map(component => (
            <BlockRenderer key={component.id} component={component} isEditable={false} />
          ))}
        </main>
      )}
    </div>
  );
}
