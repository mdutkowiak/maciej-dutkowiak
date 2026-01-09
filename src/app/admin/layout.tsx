'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useSiteStore } from '@/store/useSiteStore';
import SitemapTree from '@/components/cms/SitemapTree';
import SitemapActionBar from '@/components/cms/SitemapActionBar';
import NavigationRail from '@/components/cms/NavigationRail';
import {
    Folder,
    Settings as SettingsIcon,
    ShieldCheck,
    HelpCircle,
    LayoutDashboard,
    Trash2
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { initializeSite, activePageId, activeMode } = useSiteStore();

    useEffect(() => {
        initializeSite();
    }, [initializeSite]);

    return (
        <div className="flex h-screen bg-white dark:bg-black overflow-hidden">
            {/* Far Left: Navigation Rail */}
            <NavigationRail />

            {/* Middle: Mode-specific Sidebar */}
            {activeMode !== 'help' && (
                <div className="w-72 border-r border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col shrink-0 animate-in slide-in-from-left-1 duration-200">
                    {activeMode === 'content' && (
                        <>
                            <div className="h-14 border-b border-gray-200 dark:border-zinc-800 flex items-center px-4 gap-2">
                                <LayoutDashboard size={16} className="text-blue-500" />
                                <span className="font-bold text-sm tracking-tight uppercase text-gray-400">Content</span>
                            </div>
                            <SitemapActionBar />
                            <div className="flex-1 overflow-y-auto">
                                <SitemapTree filter="active" />

                                <div className="mt-8 px-4 py-2 border-t border-gray-100 dark:border-zinc-800">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                                        <Trash2 size={12} />
                                        <span>Recycle Bin</span>
                                    </div>
                                    <SitemapTree filter="deleted" />
                                </div>
                            </div>
                        </>
                    )}

                    {activeMode === 'media' && (
                        <>
                            <div className="h-14 border-b border-gray-200 dark:border-zinc-800 flex items-center px-4 gap-2">
                                <Folder size={16} className="text-amber-500" />
                                <span className="font-bold text-sm tracking-tight uppercase text-gray-400">Media</span>
                            </div>
                            <div className="p-4 space-y-4">
                                <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Library</div>
                                <div className="space-y-1">
                                    <button className="w-full text-left px-3 py-2 text-sm rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium">All Assets</button>
                                    <button className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-gray-400">Logos</button>
                                    <button className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-gray-400">Blog Images</button>
                                </div>
                            </div>
                        </>
                    )}

                    {activeMode === 'settings' && (
                        <>
                            <div className="h-14 border-b border-gray-200 dark:border-zinc-800 flex items-center px-4 gap-2">
                                <SettingsIcon size={16} className="text-zinc-500" />
                                <span className="font-bold text-sm tracking-tight uppercase text-gray-400">Settings</span>
                            </div>
                            <div className="p-4 space-y-4">
                                <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Global</div>
                                <div className="space-y-1">
                                    <Link href="/admin/settings" className="block w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-gray-400">Branding</Link>
                                    <Link href="/admin/seo-report" className="block w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-gray-400">SEO Report</Link>
                                    <Link href="/admin/cache" className="block w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-gray-400">Performance</Link>
                                </div>
                            </div>
                        </>
                    )}

                    {activeMode === 'users' && (
                        <>
                            <div className="h-14 border-b border-gray-200 dark:border-zinc-800 flex items-center px-4 gap-2">
                                <ShieldCheck size={16} className="text-green-500" />
                                <span className="font-bold text-sm tracking-tight uppercase text-gray-400">Users</span>
                            </div>
                            <div className="p-6 text-center space-y-3">
                                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto">
                                    <ShieldCheck size={24} />
                                </div>
                                <p className="text-xs text-gray-500">User management is available in the Pro version.</p>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Navigation */}
                <header className="h-14 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between px-6">
                    <div className="flex gap-6">
                        <Link href="/admin" className="text-sm font-medium text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors">Dashboard</Link>
                        {activePageId && (
                            <Link href="/admin/editor" className="text-sm font-medium text-blue-600 dark:text-blue-400">Editor</Link>
                        )}
                        <Link href="/admin/seo-report" className="text-sm font-medium text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors">SEO Report</Link>
                        <Link href="/admin/settings" className="px-3 py-1 bg-blue-50 text-blue-600 rounded-md text-sm font-medium dark:bg-blue-900/20 dark:text-blue-400">Settings</Link>
                        <Link href="/admin/cache" className="text-sm font-medium text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors">Performance</Link>
                    </div>

                    <div className="flex items-center gap-4">
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
