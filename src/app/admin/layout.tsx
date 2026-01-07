'use client';

import React from 'react';
import SitemapTree from '@/components/cms/SitemapTree';
import SitemapActionBar from '@/components/cms/SitemapActionBar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen w-full overflow-hidden bg-white dark:bg-black text-gray-900 dark:text-white">
            {/* Sidebar */}
            <aside className="shrink-0 z-20 flex flex-col w-64 border-r border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <SitemapActionBar />
                <div className="flex-1 overflow-hidden relative">
                    <SitemapTree />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                <div className="h-full w-full overflow-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
