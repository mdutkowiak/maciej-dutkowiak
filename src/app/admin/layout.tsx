'use client';

import React from 'react';
import SitemapTree from '@/components/cms/SitemapTree';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen w-full overflow-hidden bg-white dark:bg-black text-gray-900 dark:text-white">
            {/* Sidebar */}
            <aside className="shrink-0 z-20">
                <SitemapTree />
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
