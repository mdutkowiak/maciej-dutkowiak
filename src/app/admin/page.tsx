import Link from 'next/link';
import { Edit3, BarChart } from 'lucide-react';

export default function AdminDashboard() {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link href="/admin/editor" className="group">
                    <div className="p-6 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl hover:shadow-lg transition-all border-l-4 border-l-blue-500">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                                <Edit3 size={24} />
                            </div>
                            <h2 className="text-xl font-semibold">Visual Editor</h2>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">
                            Open the Drag & Drop editor to build and manage your pages.
                        </p>
                    </div>
                </Link>

                <Link href="/admin/seo-report" className="group">
                    <div className="p-6 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl hover:shadow-lg transition-all border-l-4 border-l-green-500">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
                                <BarChart size={24} />
                            </div>
                            <h2 className="text-xl font-semibold">SEO Audit</h2>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">
                            Check site health, broken links, and missing metadata.
                        </p>
                    </div>
                </Link>
            </div>
        </div>
    );
}
