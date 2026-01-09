'use client';

import React, { useState } from 'react';
import { useSiteStore } from '@/store/useSiteStore';
import { SitemapNode } from '@/store/types';
import { X, Check, FileText, Folder, ChevronRight, ChevronDown, Search } from 'lucide-react';

interface NodePickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (nodeId: string | null) => void;
    title?: string;
    excludeNodeId?: string; // Prevent picking itself or its children as parent
}

export default function NodePickerModal({ isOpen, onClose, onSelect, title = 'Select Destination', excludeNodeId }: NodePickerModalProps) {
    const { sitemap } = useSiteStore();
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [collapsedNodes, setCollapsedNodes] = useState<string[]>([]);

    if (!isOpen) return null;

    const toggleCollapse = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setCollapsedNodes(prev =>
            prev.includes(id) ? prev.filter(n => n !== id) : [...prev, id]
        );
    };

    const isDescendant = (nodes: SitemapNode[], targetId: string, searchId: string): boolean => {
        for (const node of nodes) {
            if (node.id === searchId) {
                const checkChildren = (children: SitemapNode[]): boolean => {
                    for (const child of children) {
                        if (child.id === targetId) return true;
                        if (child.children && checkChildren(child.children)) return true;
                    }
                    return false;
                };
                return node.children ? checkChildren(node.children) : false;
            }
            if (node.children && isDescendant(node.children, targetId, searchId)) return true;
        }
        return false;
    };

    const isExcluded = (id: string) => {
        if (!excludeNodeId) return false;
        if (id === excludeNodeId) return true;
        // Check if id is a descendant of excludeNodeId
        return isDescendant(sitemap, id, excludeNodeId);
    };

    const renderNode = (node: SitemapNode, depth: number) => {
        if (isExcluded(node.id)) return null;
        if (searchQuery && !node.title.toLowerCase().includes(searchQuery.toLowerCase()) && !node.children?.some(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()))) {
            // Basic search filtering (simplistic)
            // return null; 
        }

        const isCollapsed = collapsedNodes.includes(node.id);
        const isSelected = selectedId === node.id;
        const hasChildren = node.children && node.children.length > 0;

        return (
            <div key={node.id}>
                <div
                    className={`
                        flex items-center py-2 px-3 rounded-lg cursor-pointer transition-all
                        ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300'}
                    `}
                    style={{ paddingLeft: `${depth * 20 + 8}px` }}
                    onClick={() => setSelectedId(node.id)}
                >
                    <div className="w-5 flex items-center justify-center">
                        {hasChildren && (
                            <button onClick={(e) => toggleCollapse(node.id, e)} className="p-0.5 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded text-gray-400">
                                {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                            </button>
                        )}
                    </div>
                    <div className="mr-2">
                        {isSelected ? <Check size={16} className="text-green-500" /> : (node.slug === '/' ? <Folder size={16} /> : <FileText size={16} />)}
                    </div>
                    <span className="text-sm truncate font-medium">{node.title}</span>
                </div>
                {hasChildren && !isCollapsed && (
                    <div className="mt-0.5">
                        {node.children.map(child => renderNode(child, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-zinc-800 flex flex-col max-h-[80vh]">

                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-1">
                        <X size={20} />
                    </button>
                </div>

                {/* Search */}
                <div className="p-3 border-b border-gray-100 dark:border-zinc-800">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            className="w-full pl-9 pr-3 py-1.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Search pages..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* List Area */}
                <div className="flex-1 overflow-y-auto p-2 custom-scrollbar min-h-[300px]">
                    <div
                        className={`
                            flex items-center py-2 px-3 mb-2 rounded-lg cursor-pointer transition-all
                            ${selectedId === 'root' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300'}
                        `}
                        onClick={() => setSelectedId('root')}
                    >
                        <div className="w-5" />
                        <div className="mr-2">
                            {selectedId === 'root' ? <Check size={16} className="text-green-500" /> : <Folder size={16} />}
                        </div>
                        <span className="text-sm font-bold uppercase tracking-tight">Root (No Parent)</span>
                    </div>
                    {sitemap.map(node => renderNode(node, 0))}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 dark:border-zinc-800 flex justify-end gap-3 bg-gray-50/50 dark:bg-zinc-900/50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onSelect(selectedId === 'root' ? null : selectedId)}
                        disabled={!selectedId}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
                    >
                        Select
                    </button>
                </div>
            </div>
        </div>
    );
}
