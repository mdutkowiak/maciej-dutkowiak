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
import { FileText, Folder, GripVertical, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { useSiteStore } from '@/store/useSiteStore';
import { SitemapNode } from '@/store/types';

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

    const { activePageId, setActivePage, updatePageStatus, deletePage } = useSiteStore();

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        marginLeft: `${depth * 20}px`,
        opacity: isDragging ? 0.5 : 1,
    };

    const isActive = activePageId === node.id;

    return (
        <div style={style} className="mb-1 select-none">
            <div
                ref={setNodeRef}
                className={`
          group flex items-center justify-between p-2 rounded-lg text-sm border transition-all
          ${isActive
                        ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300'
                        : 'bg-white border-transparent hover:bg-gray-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 border-gray-100 dark:border-zinc-800 text-gray-700 dark:text-gray-300'
                    }
        `}
            >
                <div className="flex items-center gap-2 flex-1 overflow-hidden" onClick={() => setActivePage(node.id)}>
                    <div {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600 dark:text-zinc-600 dark:hover:text-zinc-400">
                        <GripVertical size={14} />
                    </div>
                    {node.children.length > 0 ? <Folder size={16} className="shrink-0" /> : <FileText size={16} className="shrink-0" />}
                    <span className="truncate font-medium">{node.title}</span>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            updatePageStatus(node.id, node.status === 'published' ? 'draft' : 'published');
                        }}
                        className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-zinc-700 ${node.status === 'published' ? 'text-green-600' : 'text-gray-400'}`}
                        title={node.status === 'published' ? 'Unpublish' : 'Publish'}
                    >
                        {node.status === 'published' ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Are you sure you want to delete this page?')) deletePage(node.id);
                        }}
                        className="p-1 rounded hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 text-gray-400 transition-colors"
                        title="Delete Page"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            {/* Recursive rendering for children could go here, but for simple list sortable it's complex. 
          For MVP we will flatten or handle only 1 level, OR use a different recursive strategy.
          Here we assume a flat list for the drag context for simplicity in this MVP 
          but render children visually. */}
            {node.children.length > 0 && (
                <div className="mt-1">
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
    const { sitemap, setSitemap, addPage } = useSiteStore();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Note: True nested drag and drop is complex. 
    // For this MVP, we are enabling sorting only at the top level to demonstrate the tech stack.
    // Deep nesting reordering would require a more complex recursive SortableContext.

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (active.id !== over?.id) {
            // Find indices in the root array
            const oldIndex = sitemap.findIndex((i) => i.id === active.id);
            const newIndex = sitemap.findIndex((i) => i.id === over?.id);

            if (oldIndex !== -1 && newIndex !== -1) {
                setSitemap(arrayMove(sitemap, oldIndex, newIndex));
            }
        }
    }

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-zinc-950 border-r border-gray-200 dark:border-zinc-800 w-80">
            <div className="p-4 border-b border-gray-200 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-900">
                <h2 className="font-semibold text-gray-900 dark:text-white">Sitemap</h2>
                <button
                    onClick={() => addPage(null, { title: 'New Page', slug: '/new' })}
                    className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                    title="Add Page"
                >
                    <Plus size={16} />
                </button>
            </div>

            <div className="flex-1 overflow-auto p-4">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={sitemap.map(n => n.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {sitemap.map((node) => (
                            <SortableItem key={node.id} node={node} depth={0} />
                        ))}
                    </SortableContext>
                </DndContext>

                {sitemap.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm">
                        No pages yet. Click + to add one.
                    </div>
                )}
            </div>
        </div>
    );
}
