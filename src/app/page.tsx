'use client';

import { useSiteStore } from "@/store/useSiteStore";
import BlockRenderer from "@/components/cms/editor/BlockRenderer";

export default function Home() {
  const { sitemap, pageComponents } = useSiteStore();

  const homeNode = sitemap.find(n => n.slug === '/');

  if (!homeNode) {
    return <div className="p-10 text-center">Home page not found. Please create a page with slug '/'.</div>;
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
