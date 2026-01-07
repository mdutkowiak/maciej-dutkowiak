'use client';

import React, { useState } from 'react';
import { Trash2, RefreshCcw, Database } from 'lucide-react';

export default function CacheManager() {
    const [isPurging, setIsPurging] = useState(false);
    const [lastPurged, setLastPurged] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handlePurgeCache = async () => {
        setIsPurging(true);
        setMessage(null);

        try {
            // Simulation of API call to revalidate tags
            // await fetch('/api/revalidate?tag=all', { method: 'POST' });
            await new Promise(resolve => setTimeout(resolve, 1500)); // Mock delay

            const timestamp = new Date().toLocaleTimeString();
            setLastPurged(timestamp);
            setMessage({ type: 'success', text: 'Cache successfully purged and revalidated.' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to purge cache. Please try again.' });
        } finally {
            setIsPurging(false);
        }
    };

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                    <Database size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Cache Manager</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage application cache & ISR</p>
                </div>
            </div>

            <div className="mb-6">
                <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-lg border border-gray-100 dark:border-zinc-700">
                    <div className="flex justify-between items-center text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-400">Status:</span>
                        <span className="text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            Active
                        </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Last Purged:</span>
                        <span className="font-mono text-gray-900 dark:text-gray-200">
                            {lastPurged || 'Never'}
                        </span>
                    </div>
                </div>
            </div>

            <button
                onClick={handlePurgeCache}
                disabled={isPurging}
                className={`w-full py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 font-medium transition-all duration-200 
          ${isPurging
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-zinc-800 dark:text-zinc-600'
                        : 'bg-red-50 text-red-600 hover:bg-red-100 hover:shadow-md border border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/40 dark:hover:bg-red-900/40'
                    }`}
            >
                {isPurging ? (
                    <>
                        <RefreshCcw size={18} className="animate-spin" />
                        Purging Cache...
                    </>
                ) : (
                    <>
                        <Trash2 size={18} />
                        Purge Entire Cache
                    </>
                )}
            </button>

            {message && (
                <div className={`mt-4 p-3 rounded-lg text-sm text-center animate-in fade-in slide-in-from-top-1 
          ${message.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'}`}>
                    {message.text}
                </div>
            )}
        </div>
    );
}
