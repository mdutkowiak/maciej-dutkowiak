'use client';

import Link from 'next/link';
import { LayoutDashboard, FileText, Search, Settings, Server, ExternalLink, Globe, Image, BarChart3, Zap } from 'lucide-react';
import { StatCard, RecentEditsWidget, QuickActionsWidget } from "@/components/cms/dashboard/DashboardWidgets";
import StorageStatsWidget from "@/components/cms/dashboard/StorageStatsWidget";
import { useSiteStore } from '@/store/useSiteStore';
import { useEffect } from 'react';

export default function AdminPage() {
    const { dashboardStats, fetchDashboardStats } = useSiteStore();

    useEffect(() => {
        fetchDashboardStats();
    }, [fetchDashboardStats]);

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                <p className="text-gray-500 dark:text-gray-400">Welcome back, Maciej. Here's what's happening with LaQ CMS.</p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Pages"
                    value={dashboardStats.totalPages.toString()}
                    change={`${dashboardStats.publishedPages} Published / ${dashboardStats.draftPages} Drafts`}
                    icon={<FileText size={20} />}
                />
                <StatCard
                    title="Media Assets"
                    value="43"
                    change="+5 this week"
                    icon={<Image size={20} />}
                />
                <StatCard
                    title="Total Views"
                    value={dashboardStats.totalViews}
                    change="+12% vs last month"
                    icon={<BarChart3 size={20} />}
                />
                <StatCard
                    title="Avg. Load Time"
                    value="0.4s"
                    change="-0.1s improvement"
                    icon={<Zap size={20} />}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Col */}
                <div className="lg:col-span-2 space-y-8">
                    <RecentEditsWidget />
                    {/* Storage Widget Added Here */}
                    <StorageStatsWidget />
                </div>

                {/* Right Col */}
                <div className="space-y-8">
                    <QuickActionsWidget />

                    {/* System Status / Mini Card */}
                    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
                        <h3 className="font-semibold mb-4 text-sm uppercase text-gray-400 tracking-wider">System Status</h3>
                        <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-900/20 p-2 rounded-lg">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-sm font-medium">All Systems Operational</span>
                        </div>
                        <div className="mt-4 text-xs text-gray-400">
                            Last checked: Just now
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
