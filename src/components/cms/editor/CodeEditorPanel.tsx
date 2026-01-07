'use client';

import React, { useState } from 'react';
import { X, Code, Play } from 'lucide-react';
import { useSiteStore } from '@/store/useSiteStore';

interface CodeEditorPanelProps {
    onClose: () => void;
}

export default function CodeEditorPanel({ onClose }: CodeEditorPanelProps) {
    const { activePageId, pageCustomCode, updateCustomCode } = useSiteStore();
    const [activeTab, setActiveTab] = useState<'css' | 'js'>('css');

    if (!activePageId) return null;

    const code = pageCustomCode[activePageId] || { css: '', js: '' };

    return (
        <div className="absolute top-16 right-4 w-96 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-2xl rounded-xl z-50 flex flex-col overflow-hidden" style={{ maxHeight: 'calc(100vh - 100px)' }}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Code size={16} className="text-blue-500" />
                    Page Code Editor
                </h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <X size={18} />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-zinc-800">
                <button
                    onClick={() => setActiveTab('css')}
                    className={`flex-1 py-2 text-xs font-medium border-b-2 transition-colors ${activeTab === 'css' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:bg-gray-50 dark:hover:bg-zinc-800'}`}
                >
                    CSS (Scoped)
                </button>
                <button
                    onClick={() => setActiveTab('js')}
                    className={`flex-1 py-2 text-xs font-medium border-b-2 transition-colors ${activeTab === 'js' ? 'border-yellow-500 text-yellow-600' : 'border-transparent text-gray-500 hover:bg-gray-50 dark:hover:bg-zinc-800'}`}
                >
                    JavaScript (Execute)
                </button>
            </div>

            {/* Editor Area */}
            <div className="flex-1 bg-gray-900 text-gray-200 p-0 relative">
                <textarea
                    value={code[activeTab]}
                    onChange={(e) => updateCustomCode(activePageId, activeTab, e.target.value)}
                    className="w-full h-80 bg-transparent p-4 font-mono text-xs resize-none focus:outline-none"
                    placeholder={activeTab === 'css' ? "/* .my-class { color: red; } */" : "// console.log('Hello');"}
                    spellCheck={false}
                />
                {activeTab === 'js' && (
                    <div className="absolute bottom-2 right-2 text-[10px] text-gray-500 bg-black/50 px-2 py-1 rounded">
                        Runs on mount / update
                    </div>
                )}
            </div>
        </div>
    );
}
