import Link from 'next/link';
import { LayoutDashboard, FileText, Search, Settings, Server, ExternalLink, Globe } from 'lucide-react';
import { StatCard, RecentEditsWidget, QuickActionsWidget } from '@/components/cms/dashboard/DashboardWidgets';

export default function AdminPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome back, Creator.</p>
                </div>
                <a
                    href="/"
                    target="_blank"
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 px-4 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg shadow-sm transition-colors"
                >
                    <Globe size={16} /> View Live Site
                </a>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Pages" value="12" change="+2 this week" icon={<FileText size={20} />} />
                <StatCard title="SEO Health" value="94%" change="+5%" icon={<Search size={20} />} />
                <StatCard title="Storage Used" value="145 MB" icon={<Server size={20} />} />
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <RecentEditsWidget />
                <div className="space-y-6">
                    <QuickActionsWidget />

                    {/* Other specific links */}
                    <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Tools</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/admin/seo-report" className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 p-2 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                                    <Search size={16} /> SEO Report
                                </Link>
                            </li>
                            <li>
                                <Link href="/admin/cache" className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 p-2 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                                    <Settings size={16} /> Cache Manager
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
