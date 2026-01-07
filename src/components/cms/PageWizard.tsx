'use client';

import React, { useState } from 'react';
import { useSiteStore } from '@/store/useSiteStore';
import { X, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { Template } from '@/store/types';

interface PageWizardProps {
    isOpen: boolean;
    onClose: () => void;
    parentId: string | null;
}

export default function PageWizard({ isOpen, onClose, parentId }: PageWizardProps) {
    const { templates, addPage } = useSiteStore();
    const [step, setStep] = useState<1 | 2>(1);

    // Form State
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [seoTitle, setSeoTitle] = useState('');
    const [seoDesc, setSeoDesc] = useState('');

    if (!isOpen) return null;

    const handleNext = () => {
        if (step === 1 && selectedTemplateId) {
            setStep(2);
        }
    };

    const handleBack = () => {
        setStep(1);
    };

    const handleSubmit = () => {
        if (!title || !selectedTemplateId) return;

        addPage(parentId, {
            title,
            slug: slug.startsWith('/') ? slug : `/${slug}`,
            templateId: selectedTemplateId,
            // In a real app we would pass SEO data here too
        });

        // Reset and Close
        resetForm();
        onClose();
    };

    const resetForm = () => {
        setStep(1);
        setSelectedTemplateId(null);
        setTitle('');
        setSlug('');
        setSeoTitle('');
        setSeoDesc('');
    }

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setTitle(val);
        // Auto-generate slug if not manually edited (simple heuristic)
        if (!slug || slug === '/' + title.toLowerCase().replace(/\s+/g, '-')) {
            setSlug('/' + val.toLowerCase().replace(/\s+/g, '-'));
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-4xl overflow-hidden border border-gray-100 dark:border-zinc-800 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-zinc-800">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create New Page</h3>
                        <p className="text-xs text-gray-500">Step {step} of 2</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    {step === 1 ? (
                        // Step 1: Select Template
                        <>
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Select a Template</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {templates.map((template) => (
                                    <button
                                        key={template.id}
                                        onClick={() => setSelectedTemplateId(template.id)}
                                        className={`group relative flex flex-col items-center text-center p-6 border-2 rounded-xl transition-all ${selectedTemplateId === template.id
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                : 'border-dashed border-gray-200 dark:border-zinc-700 hover:border-blue-300'
                                            }`}
                                    >
                                        <div className="text-4xl mb-3 grayscale group-hover:grayscale-0 transition-all">
                                            {template.thumbnail || '📄'}
                                        </div>
                                        <h4 className="font-medium text-gray-900 dark:text-gray-100">{template.name}</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {template.areas.join(', ')}
                                        </p>

                                        {selectedTemplateId === template.id && (
                                            <div className="absolute top-2 right-2 text-blue-500">
                                                <Check size={16} />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </>
                    ) : (
                        // Step 2: Page Details
                        <div className="space-y-6 max-w-lg mx-auto">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Page Title</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="e.g. My Awesome Page"
                                    value={title}
                                    onChange={handleTitleChange}
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug (URL)</label>
                                <div className="flex items-center">
                                    <span className="px-3 py-2 bg-gray-100 dark:bg-zinc-800 border border-r-0 border-gray-300 dark:border-zinc-700 rounded-l-lg text-gray-500 text-sm">/</span>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-r-lg bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-sm"
                                        placeholder="my-awesome-page"
                                        value={slug.startsWith('/') ? slug.substring(1) : slug}
                                        onChange={(e) => setSlug('/' + e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100 dark:border-zinc-800">
                                <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-3">SEO Metadata (Optional)</h5>
                                <div className="space-y-4">
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
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm h-20 resize-none"
                                            placeholder="What is this page about?"
                                            value={seoDesc}
                                            onChange={(e) => setSeoDesc(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-gray-100 dark:border-zinc-800 flex justify-between bg-gray-50 dark:bg-zinc-900/50">
                    {step === 2 ? (
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                        >
                            <ArrowLeft size={16} /> Back
                        </button>
                    ) : (
                        <div /> // Spacer
                    )}

                    {step === 1 ? (
                        <button
                            onClick={handleNext}
                            disabled={!selectedTemplateId}
                            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next <ArrowRight size={16} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={!title}
                            className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Create Page <Check size={16} />
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}
