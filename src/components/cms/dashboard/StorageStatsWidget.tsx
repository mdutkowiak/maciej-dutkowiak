'use client';

import React, { useEffect, useState } from 'react';
import { Database, HardDrive, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function StorageStatsWidget() {
    const [stats, setStats] = useState({
        dbSize: '0 MB',
        mediaSize: '0 MB',
        mediaCount: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                // Mocking DB size (since we can't easily query Postgres size from client RLS enabled usually)
                // In real world you'd call a Postgres function or Edge Function
                // We'll estimate based on record count for now
                const { count: pageCount } = await supabase.from('sitemap').select('*', { count: 'exact', head: true });
                const { count: contentCount } = await supabase.from('page_content').select('*', { count: 'exact', head: true });

                const estimatedDbSize = ((pageCount || 0) * 0.002 + (contentCount || 0) * 0.05).toFixed(2); // Mock: 2KB and 50KB

                // Storage Files
                const { data: files } = await supabase.storage.from('media').list();
                const totalBytes = files?.reduce((acc: number, file: any) => acc + (file.metadata?.size || 0), 0) || 0;
                const mediaSizeMB = (totalBytes / 1024 / 1024).toFixed(2);

                setStats({
                    dbSize: `${estimatedDbSize} MB`,
                    mediaSize: `${mediaSizeMB} MB`,
                    mediaCount: files?.length || 0
                });
            } catch (error) {
                console.error('Stats error:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm flex items-center justify-center">
                <Loader2 className="animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Database size={16} /> Storage Usage
            </h3>

            <div className="space-y-4">
                {/* Database */}
                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500">Database (Postgres)</span>
                        <span className="font-medium text-gray-900 dark:text-gray-200">{stats.dbSize}</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: '5%' }}></div>
                    </div>
                </div>

                {/* Media Storage */}
                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500">Media Assets ({stats.mediaCount} files)</span>
                        <span className="font-medium text-gray-900 dark:text-gray-200">{stats.mediaSize}</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: '0%' }}></div>
                    </div>
                </div>

                <div className="pt-2 text-xs text-green-600 flex items-center gap-1">
                    <HardDrive size={12} />
                    <span>Free Tier: 500MB Database / 1GB Storage</span>
                </div>
            </div>
        </div>
    );
}
