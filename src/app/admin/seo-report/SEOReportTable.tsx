'use client';

import React from 'react';
import { AlertCircle, CheckCircle, Smartphone, ExternalLink, Edit, RefreshCw, ShieldAlert, Image as ImageIcon } from 'lucide-react';
import { SEOPageReport } from '@/store/types';
import { useSiteStore } from '@/store/useSiteStore';
import Link from 'next/link';

interface SEOReportTableProps {
    reports: SEOPageReport[];
}

export default function SEOReportTable({ reports }: SEOReportTableProps) {
    return (
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-zinc-800 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    SEO Health Report
                    <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400">
                        {reports.length} Pages
                    </span>
                </h2>
                <button
                    onClick={() => reports.forEach(r => useSiteStore.getState().runSeoAudit(r.pageId))}
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                    <RefreshCw size={14} /> Run Global Audit
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                    <thead className="bg-gray-50 dark:bg-zinc-800/50 text-xs uppercase font-medium text-gray-500 dark:text-gray-400">
                        <tr>
                            <th className="px-6 py-3">Page Name</th>
                            <th className="px-6 py-3">Slug</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Issues Found</th>
                            <th className="px-6 py-3 text-center">404 Links</th>
                            <th className="px-6 py-3 text-center">Alt Tags</th>
                            <th className="px-6 py-3 text-center">Security</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                        {reports.map((report) => (
                            <tr key={report.pageId} className="hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                    {useSiteStore.getState().getNodeById(report.pageId)?.title || report.pageId}
                                </td>
                                <td className="px-6 py-4 font-mono text-xs text-blue-600 dark:text-blue-400">
                                    {report.slug}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        {report.seoScore === 'good' && (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                <CheckCircle size={12} /> Good
                                            </span>
                                        )}
                                        {report.seoScore === 'warning' && (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                                <AlertCircle size={12} /> Needs Work
                                            </span>
                                        )}
                                        {report.seoScore === 'critical' && (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                                <AlertCircle size={12} /> Critical
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {report.missingTags.length === 0 ? (
                                        <span className="text-gray-400">-</span>
                                    ) : (
                                        <div className="flex flex-wrap gap-1">
                                            {report.missingTags.map(tag => (
                                                <span key={tag} className="px-1.5 py-0.5 border border-red-200 bg-red-50 text-red-600 rounded text-[10px] uppercase font-bold dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400">
                                                    Missing {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {report.brokenLinks > 0 ? (
                                        <span className="text-red-500 font-bold">{report.brokenLinks}</span>
                                    ) : (
                                        <span className="text-gray-400">0</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {report.missingAltCount > 0 ? (
                                        <div className="flex items-center justify-center gap-1 text-amber-500 font-bold">
                                            <ImageIcon size={14} /> {report.missingAltCount}
                                        </div>
                                    ) : (
                                        <span className="text-gray-400">0</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {report.securityIssues > 0 ? (
                                        <div className="flex items-center justify-center gap-1 text-red-500 font-bold">
                                            <ShieldAlert size={14} /> {report.securityIssues}
                                        </div>
                                    ) : (
                                        <span className="text-gray-400">0</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => useSiteStore.getState().runSeoAudit(report.pageId)}
                                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors dark:hover:bg-blue-900/20 dark:hover:text-blue-400 mr-1"
                                    >
                                        <RefreshCw size={16} />
                                    </button>
                                    <Link href={`/admin/editor?page=${report.pageId}`} className="inline-block p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors dark:hover:bg-blue-900/20 dark:hover:text-blue-400">
                                        <Edit size={16} />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {reports.length === 0 && (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        No reports found. Run an audit to see results.
                    </div>
                )}
            </div>
        </div>
    );
}
