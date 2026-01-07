'use client';

import React from 'react';
import { Clock, ExternalLink, Zap, MousePointerClick, TrendingUp } from 'lucide-react';
import Link from 'next/link';

// --- Stat Card ---
interface StatCardProps {
    title: string;
    value: string;
    change?: string;
    icon: React.ReactNode;
}

export function StatCard({ title, value, change, icon }: StatCardProps) {
    return (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</h4>
                    <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
                    {change && (
                        <div className="mt-1 flex items-center text-xs font-medium text-green-600">
                            <TrendingUp size={12} className="mr-1" />
                            {change}
                        </div>
                    )}
                </div>
                <div className="p-2 bg-gray-50 dark:bg-zinc-800 rounded-lg text-gray-500 dark:text-gray-400">
                    {icon}
                </div>
            </div>
        </div>
    );
}

// --- Recent Edits Widget ---
interface RecentEdit {
    id: string;
    page: string;
    author: string;
    time: string;
    status: 'published' | 'draft';
}

const MOCK_RECENT_EDITS: RecentEdit[] = [
    { id: '1', page: 'Homepage', author: 'Maciej', time: '10 min ago', status: 'published' },
    { id: '2', page: 'About Us', author: 'Maciej', time: '2 hours ago', status: 'published' },
    { id: '3', page: 'Services', author: 'Admin', time: 'Yesterday', status: 'draft' },
    { id: '4', page: 'Contact', author: 'Admin', time: '3 days ago', status: 'published' },
];

export function RecentEditsWidget() {
    return (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm col-span-1 md:col-span-2">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Clock size={16} /> Recent Activity
            </h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-zinc-800 rounded-md">
                        <tr>
                            <th className="px-4 py-2 rounded-l-md text-gray-400 font-medium">Page</th>
                            <th className="px-4 py-2 font-medium text-gray-400">Author</th>
                            <th className="px-4 py-2 font-medium text-gray-400">Time</th>
                            <th className="px-4 py-2 rounded-r-md font-medium text-gray-400">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {MOCK_RECENT_EDITS.map((item) => (
                            <tr key={item.id} className="border-b border-gray-100 dark:border-zinc-800 last:border-0 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{item.page}</td>
                                <td className="px-4 py-3 text-gray-500">{item.author}</td>
                                <td className="px-4 py-3 text-gray-500">{item.time}</td>
                                <td className="px-4 py-3">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${item.status === 'published' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                                        }`}>
                                        {item.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="mt-4 text-center">
                <Link href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1">
                    View all history <ExternalLink size={12} />
                </Link>
            </div>
        </div>
    );
}

// --- Quick Actions Widget ---
export function QuickActionsWidget() {
    return (
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-5 shadow-lg text-white">
            <h3 className="font-semibold text-lg mb-1">Quick Actions</h3>
            <p className="text-blue-100 text-sm mb-6">Common tasks to get you started.</p>

            <div className="grid grid-cols-2 gap-3">
                <button className="flex flex-col items-center justify-center bg-white/10 hover:bg-white/20 p-3 rounded-lg transition-colors border border-white/10 backdrop-blur-sm">
                    <Zap size={20} className="mb-2 text-yellow-300" />
                    <span className="text-xs font-medium">New Page</span>
                </button>
                <button className="flex flex-col items-center justify-center bg-white/10 hover:bg-white/20 p-3 rounded-lg transition-colors border border-white/10 backdrop-blur-sm">
                    <MousePointerClick size={20} className="mb-2 text-cyan-300" />
                    <span className="text-xs font-medium">Audit SEO</span>
                </button>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 text-xs text-blue-200 text-center">
                Pro-Portfolio v1.0.3
            </div>
        </div>
    );
}
