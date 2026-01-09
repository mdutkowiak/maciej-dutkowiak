'use client';

import React, { useState, useMemo } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    FileText,
    Folder,
    GripVertical,
    Plus,
    Trash2,
    Eye,
    EyeOff,
    Lock,
    File,
    MoreVertical,
    ChevronRight,
    ChevronDown,
    Copy,
    Move,
    Clipboard,
    Search
} from 'lucide-react';
import { useSiteStore } from '@/store/useSiteStore';
import { SitemapNode } from '@/store/types';
import Tooltip from '@/components/ui/Tooltip';

// --- Sortable Item Component ---
interface SortableItemProps {
    node: SitemapNode;
    depth: number;
}

function SortableItem({ node, depth }: SortableItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: node.id });

    const {
        activePageId,
        setActivePage,
        collapsedNodes,
        toggleNodeCollapse,
        copyPage,
        pastePage,
        copiedPageId,
        movePage,
        deletePage // Assuming it exists or we should implement it
    } = useSiteStore();

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        paddingLeft: `${depth * 16 + 8}px`,
        opacity: isDragging ? 0.4 : 1,
    };

    const isActive = activePageId === node.id;
    const isCollapsed = collapsedNodes.includes(node.id);
    const hasChildren = node.children.length > 0;

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        toggleNodeCollapse(node.id);
    };

    const handleAction = (action: () => void) => {
        action();
        setIsMenuOpen(false);
    };

    return (
        <div className="relative">
            <div
                ref={setNodeRef}
                style={style}
                {...attributes}
                {...listeners}
                onClick={() => setActivePage(node.id)}
                className={`
                    flex items-center justify-between py-2 pr-2 cursor-pointer select-none group border-l-4 transition-colors duration-150
                    ${isActive
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                        : 'border-transparent hover:bg-gray-50 dark:hover:bg-zinc-800'
                    }
                `}
            >
                <div className="flex items-center gap-1.5 overflow-hidden">
                    {/* Expand/Collapse Chevron */}
                    <div
                        onClick={handleToggle}
                        className={`p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${hasChildren ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                    >
                        {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                    </div>

                    {/* Status Dot */}
                    <Tooltip content={`Modified: ${node.lastModified ? new Date(node.lastModified).toLocaleDateString() : 'Unknown'}`}>
                        <div
                            className={`w-2 h-2 rounded-full shrink-0 ${node.status === 'published' ? 'bg-green-500' : 'bg-gray-300 dark:bg-zinc-600'}`}
                        />
                    </Tooltip>

                    {/* Icon */}
                    {node.locked ? (
                        <Lock size={14} className="text-amber-500 shrink-0" />
                    ) : (
                        hasChildren ? <Folder size={14} className="text-blue-400 shrink-0" /> : <File size={14} className="text-gray-400 shrink-0" />
                    )}

                    <span className={`text-sm truncate ${isActive ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                        {node.title}
                    </span>
                </div>

                {/* Context Menu Trigger */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
                        className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                        <MoreVertical size={14} />
                    </button>

                    {/* Context Menu Dropdown */}
                    {isMenuOpen && (
                        <>
                            <div className="fixed inset-0 z-[60]" onClick={() => setIsMenuOpen(false)} />
                            <div className="absolute top-full right-4 z-[70] min-w-[160px] bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-xl py-1 animate-in fade-in zoom-in-95 duration-100">
                                <button
                                    onClick={() => handleAction(() => { })} // TODO: Open wizard for child
                                    className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-zinc-700"
                                >
                                    <Plus size={14} className="text-blue-500" /> Add Child Page
                                </button>
                                <button
                                    onClick={() => handleAction(() => copyPage(node.id))}
                                    className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-zinc-700"
                                >
                                    <Copy size={14} /> Copy Page
                                </button>
                                <button
                                    disabled={!copiedPageId}
                                    onClick={() => handleAction(() => pastePage(node.id))}
                                    className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-zinc-700 disabled:opacity-30"
                                >
                                    <Clipboard size={14} /> Paste Under
                                </button>
                                <button
                                    onClick={() => handleAction(() => { })} // TODO: Open move modal
                                    className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-zinc-700"
                                >
                                    <Move size={14} /> Move Page
                                </button>
                                <div className="h-px bg-gray-100 dark:bg-zinc-700 my-1" />
                                <button
                                    onClick={() => handleAction(() => deletePage?.(node.id))}
                                    className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600"
                                >
                                    <Trash2 size={14} /> Delete
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Recursive Children */}
            {hasChildren && !isCollapsed && (
                <div className="ml-2 border-l border-gray-100 dark:border-zinc-800">
                    {node.children.map(child => (
                        <SortableItem key={child.id} node={child} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );
}

// --- Main Tree Component ---
export default function SitemapTree() {
    const { sitemap, setSitemap, errorMessage } = useSiteStore();
    const [searchQuery, setSearchQuery] = useState('');

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragEnd(event: DragEndEvent) {
        if (searchQuery) return;
        const { active, over } = event;
        if (active.id !== over?.id) {
            const oldIndex = sitemap.findIndex((i) => i.id === active.id);
            const newIndex = sitemap.findIndex((i) => i.id === over?.id);
            if (oldIndex !== -1 && newIndex !== -1) {
                setSitemap(arrayMove(sitemap, oldIndex, newIndex));
            }
        }
    }

    const filteredSitemap = useMemo(() => {
        if (!searchQuery) return sitemap;
        const filterRecursive = (nodes: SitemapNode[]): SitemapNode[] => {
            return nodes.reduce((acc, node) => {
                const matches = node.title.toLowerCase().includes(searchQuery.toLowerCase());
                const children = filterRecursive(node.children);
                if (matches || children.length > 0) {
                    acc.push({ ...node, children });
                }
                return acc;
            }, [] as SitemapNode[]);
        };
        return filterRecursive(sitemap);
    }, [sitemap, searchQuery]);

    return (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 shadow-sm">
            {/* Search Bar */}
            <div className="p-3 border-b border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50">
                <div className="relative group">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search pages..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg py-1.5 pl-9 pr-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder-gray-400 dark:text-white"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-auto py-2 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-zinc-700">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={filteredSitemap.map(n => n.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {filteredSitemap.map((node) => (
                            <SortableItem key={node.id} node={node} depth={0} />
                        ))}
                    </SortableContext>
                </DndContext>

                {filteredSitemap.length === 0 && (
                    <div className="text-center py-12 text-gray-400 text-sm px-6">
                        {errorMessage ? (
                            <div className="text-red-500 bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-100 dark:border-red-900/20">
                                <p className="font-bold mb-1 text-xs">Connection Error</p>
                                <p className="text-xs opacity-80">{errorMessage}</p>
                            </div>
                        ) : (
                            <div className="opacity-60 flex flex-col items-center gap-3">
                                <FileText size={32} className="opacity-20" />
                                <p>{searchQuery ? 'No matching pages found.' : 'Your sitemap is empty.'}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer Info */}
            <div className="p-3 bg-gray-50/50 dark:bg-zinc-900/50 text-[10px] text-gray-400 border-t border-gray-100 dark:border-zinc-800 text-center uppercase tracking-widest font-medium">
                {sitemap.length} Pages • LaQ CMS
            </div>
        </div>
    );
}
