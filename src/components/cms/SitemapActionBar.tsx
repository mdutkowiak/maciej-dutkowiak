'use client';

import React from 'react';
import { Plus, Trash2, Lock, Unlock, Edit, Move, MoreHorizontal } from 'lucide-react';
import { useSiteStore } from '@/store/useSiteStore';
import { useState } from 'react';
import PageWizard from './PageWizard';

export default function SitemapActionBar() {
    const { activePageId, addPage, deletePage, togglePageLock, sitemap } = useSiteStore();
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [targetParentId, setTargetParentId] = useState<string | null>(null);

    const handleCreateClick = (parentId: string | null) => {
        setTargetParentId(parentId);
        setIsWizardOpen(true);
    };

    // Helper to find node by ID to check its state (e.g. is it locked?)
    const findNode = (nodes: any[], id: string): any => {
        for (const node of nodes) {
            if (node.id === id) return node;
            if (node.children?.length) {
                const found = findNode(node.children, id);
                if (found) return found;
            }
        }
        return null;
    };

    const activeNode = activePageId ? findNode(sitemap, activePageId) : null;

    if (!activeNode) {
        // Default State: Nothing selected -> Show Create
        return (
            <>
                <div className="h-12 border-b border-gray-200 dark:border-zinc-800 flex items-center px-4 bg-gray-50 dark:bg-zinc-900/50">
                    <button
                        onClick={() => handleCreateClick(null)}
                        className="flex items-center gap-2 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 px-3 py-1.5 rounded-md transition-colors w-full justify-center"
                    >
                        <Plus size={14} />
                        <span>Create Page</span>
                    </button>
                </div>
                <PageWizard
                    isOpen={isWizardOpen}
                    onClose={() => setIsWizardOpen(false)}
                    parentId={targetParentId}
                />
            </>
        );
    }

    // Selected State
    return (
        <div className="h-12 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between px-3 bg-blue-50/50 dark:bg-blue-900/10">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate max-w-[100px]" title={activeNode.title}>
                {activeNode.title}
            </span>

            <div className="flex items-center gap-1">
                <button
                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors"
                    title="Edit Properties"
                >
                    <Edit size={14} />
                </button>

                <button
                    onClick={() => togglePageLock(activeNode.id)}
                    className={`p-1.5 rounded transition-colors ${activeNode.locked ? 'text-amber-600 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/30' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-zinc-800'}`}
                    title={activeNode.locked ? "Unlock" : "Lock"}
                >
                    {activeNode.locked ? <Lock size={14} /> : <Unlock size={14} />}
                </button>

                <button
                    onClick={() => deletePage(activeNode.id)}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                    title="Delete Page"
                >
                    <Trash2 size={14} />
                </button>

                <div className="w-px h-4 bg-gray-300 dark:bg-zinc-700 mx-1" />

                <button
                    onClick={() => handleCreateClick(activeNode.id)}
                    className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded transition-colors"
                    title="Add Child Page"
                >
                    <Plus size={14} />
                </button>
            </div>

            <PageWizard
                isOpen={isWizardOpen}
                onClose={() => setIsWizardOpen(false)}
                parentId={targetParentId}
            />
        </div>
    );
}
