'use client';

import React from 'react';
import { useSiteStore } from '@/store/useSiteStore';
import { X, Check } from 'lucide-react';
import { Template } from '@/store/types';

interface TemplateSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (templateId: string) => void;
}

export default function TemplateSelector({ isOpen, onClose, onSelect }: TemplateSelectorProps) {
    const { templates } = useSiteStore();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-100 dark:border-zinc-800">
                <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-zinc-800">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Choose a Template</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
                    {templates.map((template) => (
                        <button
                            key={template.id}
                            onClick={() => onSelect(template.id)}
                            className="group relative flex flex-col items-center text-center p-6 border-2 border-dashed border-gray-200 dark:border-zinc-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-xl transition-all"
                        >
                            <div className="text-4xl mb-3 grayscale group-hover:grayscale-0 transition-all scale-90 group-hover:scale-100 duration-200">
                                {template.thumbnail || '📄'}
                            </div>
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">{template.name}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {template.areas.join(', ')}
                            </p>

                            {/* Checkmark overlay on hover could go here */}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-blue-500">
                                <Check size={16} />
                            </div>
                        </button>
                    ))}
                </div>

                <div className="p-4 bg-gray-50 dark:bg-zinc-900/50 text-center text-xs text-gray-500 border-t border-gray-100 dark:border-zinc-800">
                    You can save your own page layouts as templates later.
                </div>
            </div>
        </div>
    );
}
