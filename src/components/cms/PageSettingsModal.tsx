'use client';

import React, { useState, useEffect } from 'react';
import { useSiteStore } from '@/store/useSiteStore';
import { X, Check, Globe, AlertCircle, Loader2 } from 'lucide-react';
import { SitemapNode } from '@/store/types';

interface PageSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    node: SitemapNode;
}

export default function PageSettingsModal({ isOpen, onClose, node }: PageSettingsModalProps) {
    const { updatePageProperties } = useSiteStore();

    const [title, setTitle] = useState(node.title);
    const [slug, setSlug] = useState(node.slug);

    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load initial data
    useEffect(() => {
        if (isOpen) {
            setTitle(node.title);
            setSlug(node.slug);
            setError(null);
        }
    }, [isOpen, node]);

    if (!isOpen) return null;

    const handleSave = async () => {
        setIsSaving(true);
        setError(null);

        const result = await updatePageProperties(node.id, {
            title,
            slug: slug.startsWith('/') ? slug : `/${slug}`
        });

        setIsSaving(false);
        if (result.success) {
            onClose();
        } else {
            setError(result.error || 'Failed to update page');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-zinc-800 flex flex-col">

                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                            <Globe size={18} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Page Settings</h3>
                            <p className="text-xs text-gray-500">Manage URL and page title</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5">
                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm border border-red-100 dark:border-red-900/20">
                            <AlertCircle size={14} />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Page Title</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Slug (URL)</label>
                            <div className="flex items-center">
                                <span className="px-3 py-2 bg-gray-100 dark:bg-zinc-800 border border-r-0 border-gray-300 dark:border-zinc-700 rounded-l-lg text-gray-400 text-sm">/</span>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-r-lg bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-sm"
                                    value={slug.startsWith('/') ? slug.substring(1) : slug}
                                    onChange={(e) => setSlug('/' + e.target.value)}
                                />
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1 italic">Note: Changing the slug may break existing links to this page.</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-gray-100 dark:border-zinc-800 flex justify-end gap-3 bg-gray-50/50 dark:bg-zinc-900/50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || !title || !slug}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Check size={16} />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
