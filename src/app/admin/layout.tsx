'use client';

import React from 'react';
import SitemapTree from '@/components/cms/SitemapTree';
import SitemapActionBar from '@/components/cms/SitemapActionBar';
import { useEffect } from 'react';
import { useSiteStore } from '@/store/useSiteStore';
import Link from 'next/link'; // Assuming Link is needed for the new layout

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { initializeSite } = useSiteStore();

    useEffect(() => {
        initializeSite();
    }, []);

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-black">
            {/* Sidebar (Sitemap) */}
            <div className="w-64 border-r border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col">
                <div className="h-14 border-b border-gray-200 dark:border-zinc-800 flex items-center px-4 font-bold text-xl tracking-tight">
                    CMS <span className="text-blue-600 ml-1">Admin</span>
                </div>

                {/* Sitemap Actions */}
                <SitemapActionBar />

                {/* Sitemap Tree */}
                <SitemapTree />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Navigation */}
                <header className="h-14 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between px-6">
                    <div className="flex gap-6">
                        <Link href="/admin" className="text-sm font-medium text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors">Dashboard</Link>
                        <Link href="/admin/editor" className="text-sm font-medium text-blue-600 dark:text-blue-400">Editor</Link>
                        <Link href="/admin/seo-report" className="text-sm font-medium text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors">SEO Report</Link>
                        <Link href="/admin/cache" className="text-sm font-medium text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors">Performance</Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white">Settings</button>
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-xs">MD</div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto bg-gray-100 dark:bg-black">
                    {children}
                </main>
            </div>
        </div>
    );
}
