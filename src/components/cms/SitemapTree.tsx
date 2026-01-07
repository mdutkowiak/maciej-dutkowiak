'use client';

import React from 'react';
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
import { FileText, Folder, GripVertical, Plus, Trash2, Eye, EyeOff, Lock, File } from 'lucide-react';
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

    // Remove inline actions, as we now use the Top Bar
    const { activePageId, setActivePage } = useSiteStore();

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        // Increased indentation for better tree visualization
        paddingLeft: `${depth * 16 + 12}px`,
        opacity: isDragging ? 0.4 : 1,
    };

    const isActive = activePageId === node.id;
    const isFolder = node.children.length > 0;

    return (
        <div className="relative">
            <div
                ref={setNodeRef}
                style={style}
                {...attributes}
                {...listeners}
                onClick={() => setActivePage(node.id)}
                className={`
                    flex items-center justify-between py-2 pr-4 cursor-pointer select-none group border-l-4 transition-colors duration-150
                    ${isActive
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                        : 'border-transparent hover:bg-gray-50 dark:hover:bg-zinc-800'
                    }
                `}
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    {/* Status Dot with Tooltip */}
                    <Tooltip content={`Modified: ${node.lastModified ? new Date(node.lastModified).toLocaleDateString() : 'Unknown'}`}>
                        <div
                            className={`w-2 h-2 rounded-full shrink-0 ${node.status === 'published' ? 'bg-green-500' : 'bg-gray-300 dark:bg-zinc-600'}`}
                        />
                    </Tooltip>

                    {/* Icon based on type/state */}
                    {node.locked ? (
                        <Lock size={14} className="text-amber-500 shrink-0" />
                    ) : (
                        isFolder ? <Folder size={14} className="text-gray-400 shrink-0" /> : <File size={14} className="text-gray-400 shrink-0" />
                    )}

                    <span className={`text-sm truncate ${isActive ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                        {node.title}
                    </span>
                </div>
            </div>

            {/* Recursive Children - Simplified for MVP (only 1 level deep visualization in this loop) */}
            {node.children.length > 0 && (
                <div className="border-l border-gray-100 dark:border-zinc-800 ml-4">
                    {node.children.map(child => (
                        <SortableItem key={child.id} node={child} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );
}

// --- Main Tree Component ---
// ... imports
import { Search } from 'lucide-react';
import { useState, useMemo } from 'react';

// ... SortableItem (no change)

// --- Main Tree Component ---
export default function SitemapTree() {
    const { sitemap, setSitemap } = useSiteStore();
    const [searchQuery, setSearchQuery] = useState('');

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragEnd(event: DragEndEvent) {
        // Drag logic disabled when searching
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

    // Filter Logic
    const filteredSitemap = useMemo(() => {
        if (!searchQuery) return sitemap;

        const filterRecursive = (nodes: SitemapNode[]): SitemapNode[] => {
            return nodes.reduce((acc, node) => {
                const matches = node.title.toLowerCase().includes(searchQuery.toLowerCase());
                const children = filterRecursive(node.children);

                if (matches || children.length > 0) {
                    // Include if matches or has matching children
                    acc.push({ ...node, children });
                }
                return acc;
            }, [] as SitemapNode[]);
        };

        return filterRecursive(sitemap);
    }, [sitemap, searchQuery]);

    return (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800">
            {/* Search Bar */}
            <div className="p-3 border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50">
                <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search pages..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-800 border-none rounded-md py-1.5 pl-9 pr-3 text-sm focus:ring-1 focus:ring-blue-500 placeholder-gray-400 dark:text-white"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-auto py-2">
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
                    <div className="text-center py-8 text-gray-400 text-sm">
                        {searchQuery ? 'No matching pages.' : 'No pages. Use top bar to create one.'}
                    </div>
                )}
            </div>

            {/* Footer Info */}
            <div className="p-3 text-[10px] text-gray-400 border-t border-gray-100 dark:border-zinc-800 text-center uppercase tracking-wider">
                {sitemap.length} Pages • LaQ CMS • made by Maciej Dutkowiak
            </div>
        </div>
    );
}
