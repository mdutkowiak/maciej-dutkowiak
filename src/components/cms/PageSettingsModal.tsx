'use client';

import React, { useState, useEffect } from 'react';
import { useSiteStore } from '@/store/useSiteStore';
import { X, Check, Globe, Search, AlertCircle, Loader2, Image as ImageIcon, Facebook, Twitter, Linkedin, Layout } from 'lucide-react';
import { SitemapNode } from '@/store/types';
import MediaManager from '@/components/cms/media/MediaManager';

interface PageSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    node: SitemapNode;
}

export default function PageSettingsModal({ isOpen, onClose, node }: PageSettingsModalProps) {
    const { updatePageProperties } = useSiteStore();

    const [title, setTitle] = useState(node.title);
    const [slug, setSlug] = useState(node.slug);
    const [seoTitle, setSeoTitle] = useState('');
    const [seoDesc, setSeoDesc] = useState('');
    const [keywords, setKeywords] = useState('');
    const [ogImage, setOgImage] = useState('');

    const [showMediaManager, setShowMediaManager] = useState(false);
    const [socialPreviewMode, setSocialPreviewMode] = useState<'google' | 'facebook' | 'twitter' | 'linkedin'>('google');

    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load initial SEO data from node if available
    useEffect(() => {
        if (isOpen) {
            setTitle(node.title);
            setSlug(node.slug);
            // Assuming seo_metadata is stored in node or we need to fetch it?
            // SitemapNode doesn't explicitly have seo_metadata in the type, but the DB has it.
            // Let's cast for now or assume it's there if we fetched it.
            const metadata = (node as any).seo_metadata || {};
            setSeoTitle(metadata.title || '');
            setSeoDesc(metadata.description || '');
            setKeywords((metadata.keywords || []).join(', '));
            setOgImage(metadata.ogImage || '');
            setError(null);
        }
    }, [isOpen, node]);

    if (!isOpen) return null;

    const handleSave = async () => {
        setIsSaving(true);
        setError(null);

        const result = await updatePageProperties(node.id, {
            title,
            slug: slug.startsWith('/') ? slug : `/${slug}`,
            seoTitle,
            seoDesc,
            keywords: keywords.split(',').map(k => k.trim()).filter(k => k),
            ogImage
        });

        setIsSaving(false);
        if (result.success) {
            onClose();
        } else {
            setError(result.error || 'Failed to update page');
        }
    };

    const handleMediaSelect = (url: string) => {
        setOgImage(url);
        setShowMediaManager(false);
    };

    return (
        <>
            {showMediaManager && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] overflow-hidden border border-gray-100 dark:border-zinc-800 flex flex-col relative">
                        <button
                            onClick={() => setShowMediaManager(false)}
                            className="absolute top-4 right-4 z-10 p-2 bg-white/10 text-white rounded-full hover:bg-white/20"
                        >
                            <X size={20} />
                        </button>
                        <MediaManager
                            onSelect={handleMediaSelect}
                            onClose={() => setShowMediaManager(false)}
                        />
                    </div>
                </div>
            )}

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
                                <p className="text-xs text-gray-500">Manage URL, title and SEO</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
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

                            <div className="pt-4 border-t border-gray-100 dark:border-zinc-800">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                                        <Search size={14} className="text-blue-500" />
                                        Social Share Preview
                                    </h4>
                                    <div className="flex bg-gray-100 dark:bg-zinc-800 p-0.5 rounded-lg">
                                        <button
                                            onClick={() => setSocialPreviewMode('google')}
                                            className={`p-1.5 rounded-md transition-all ${socialPreviewMode === 'google' ? 'bg-white dark:bg-zinc-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                                            title="Google Search"
                                        >
                                            <Search size={14} />
                                        </button>
                                        <button
                                            onClick={() => setSocialPreviewMode('facebook')}
                                            className={`p-1.5 rounded-md transition-all ${socialPreviewMode === 'facebook' ? 'bg-white dark:bg-zinc-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                                            title="Facebook"
                                        >
                                            <Facebook size={14} />
                                        </button>
                                        <button
                                            onClick={() => setSocialPreviewMode('twitter')}
                                            className={`p-1.5 rounded-md transition-all ${socialPreviewMode === 'twitter' ? 'bg-white dark:bg-zinc-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                                            title="Twitter / X"
                                        >
                                            <Twitter size={14} />
                                        </button>
                                        <button
                                            onClick={() => setSocialPreviewMode('linkedin')}
                                            className={`p-1.5 rounded-md transition-all ${socialPreviewMode === 'linkedin' ? 'bg-white dark:bg-zinc-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                                            title="LinkedIn"
                                        >
                                            <Linkedin size={14} />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {/* Meta Inputs */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Meta Title</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm"
                                            placeholder="Same as page title..."
                                            value={seoTitle}
                                            onChange={(e) => setSeoTitle(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Meta Description</label>
                                        <textarea
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm h-24 resize-none"
                                            placeholder="Brief summary of the page content..."
                                            value={seoDesc}
                                            onChange={(e) => setSeoDesc(e.target.value)}
                                        />
                                        <p className="text-[10px] text-gray-400 mt-1 text-right">{seoDesc.length} / 160 characters</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Target Keywords (comma separated)</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm"
                                            placeholder="e.g. cms, react, nextjs"
                                            value={keywords}
                                            onChange={(e) => setKeywords(e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Social Share Image (og:image)</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm font-mono text-gray-500"
                                                placeholder="https://..."
                                                value={ogImage}
                                                onChange={(e) => setOgImage(e.target.value)}
                                            />
                                            <button
                                                onClick={() => setShowMediaManager(true)}
                                                className="p-2 bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700"
                                            >
                                                <ImageIcon size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Preview Card */}
                                    <div className="mt-4 p-4 bg-gray-50 dark:bg-zinc-900/50 rounded-lg border border-gray-200 dark:border-zinc-800">
                                        <p className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider text-center">
                                            {socialPreviewMode === 'google' ? 'Google Search Result' :
                                                socialPreviewMode === 'facebook' ? 'Facebook Link Preview' :
                                                    socialPreviewMode === 'twitter' ? 'X / Twitter Card' : 'LinkedIn Post'}
                                        </p>

                                        {socialPreviewMode === 'google' && (
                                            <div className="bg-white p-3 rounded shadow-sm max-w-lg mx-auto font-sans">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-[10px]">L</div>
                                                    <div className="text-sm text-gray-800">example.com</div>
                                                </div>
                                                <h3 className="text-blue-700 text-lg hover:underline cursor-pointer truncate">
                                                    {seoTitle || title || 'Page Title'}
                                                </h3>
                                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                    {seoDesc || 'No description provided. Search engines will generate a description from the page content.'}
                                                </p>
                                            </div>
                                        )}

                                        {socialPreviewMode === 'facebook' && (
                                            <div className="bg-white rounded border border-gray-200 overflow-hidden max-w-sm mx-auto shadow-sm">
                                                <div className="w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                                                    {ogImage ? (
                                                        <img src={ogImage} alt="Preview" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <ImageIcon className="text-gray-300 w-12 h-12" />
                                                    )}
                                                </div>
                                                <div className="p-3 bg-[#f0f2f5] border-t border-gray-100">
                                                    <p className="text-[10px] text-gray-500 uppercase tracking-wide">EXAMPLE.COM</p>
                                                    <h4 className="font-bold text-gray-900 leading-tight mt-0.5 mb-1 line-clamp-2">
                                                        {seoTitle || title || 'Page Title'}
                                                    </h4>
                                                    <p className="text-xs text-gray-600 line-clamp-1">
                                                        {seoDesc || 'Description of the page...'}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {socialPreviewMode === 'twitter' && (
                                            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden max-w-[85%] mx-auto shadow-sm">
                                                <div className="w-full h-40 bg-gray-100 flex items-center justify-center overflow-hidden relative">
                                                    {ogImage ? (
                                                        <img src={ogImage} alt="Preview" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <ImageIcon className="text-gray-300 w-10 h-10" />
                                                    )}
                                                    <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                                                        example.com
                                                    </div>
                                                </div>
                                                <div className="p-3">
                                                    <h4 className="font-bold text-gray-900 text-sm mb-1 leading-snug">
                                                        {seoTitle || title || 'Page Title'}
                                                    </h4>
                                                    <p className="text-xs text-gray-500 line-clamp-2">
                                                        {seoDesc || 'Description of the page...'}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {socialPreviewMode === 'linkedin' && (
                                            <div className="bg-white rounded-md border border-gray-200 overflow-hidden max-w-sm mx-auto shadow-sm">
                                                <div className="w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                                                    {ogImage ? (
                                                        <img src={ogImage} alt="Preview" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <ImageIcon className="text-gray-300 w-12 h-12" />
                                                    )}
                                                </div>
                                                <div className="p-3 bg-white">
                                                    <h4 className="font-semibold text-gray-900 text-sm leading-tight mb-0.5 line-clamp-1">
                                                        {seoTitle || title || 'Page Title'}
                                                    </h4>
                                                    <p className="text-xs text-gray-500">example.com</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                </div>
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
        </>
    );
}
