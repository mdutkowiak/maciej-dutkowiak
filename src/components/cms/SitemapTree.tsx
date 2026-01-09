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
import PageWizard from './PageWizard';
import PageSettingsModal from './PageSettingsModal';
import NodePickerModal from './NodePickerModal';

// --- Sortable Item Component ---
interface SortableItemProps {
    node: SitemapNode;
    depth: number;
    onAddChild: (id: string) => void;
    onEditSettings: (node: SitemapNode) => void;
    onPickerAction: (nodeId: string, action: 'move' | 'copy') => void;
    isDeletedMode?: boolean;
}

function SortableItem({ node, depth, onAddChild, onEditSettings, onPickerAction, isDeletedMode = false }: SortableItemProps) {
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
        deletePage,
        restorePage
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
    const hasChildren = node.children && node.children.length > 0;

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
                className={`
                    group flex items-center py-2 pr-4 border-l-2 transition-all cursor-pointer
                    ${isActive
                        ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-500'
                        : 'border-transparent hover:bg-gray-50 dark:hover:bg-zinc-800/50'}
                `}
                onClick={() => !node.isDeleted && setActivePage(node.id)}
            >
                {/* Collapse/Expand Toggle */}
                <div className="w-6 flex items-center justify-center">
                    {hasChildren ? (
                        <button
                            onClick={handleToggle}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded transition-colors text-gray-400"
                        >
                            {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                        </button>
                    ) : (
                        <div className="w-1 h-1 bg-gray-300 dark:bg-zinc-700 rounded-full" />
                    )}
                </div>

                {/* Status Indicator */}
                <div className="mr-3">
                    <div className={`w-2 h-2 rounded-full ${node.status === 'published' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.4)]'}`} />
                </div>

                {/* Handle (Dnd) */}
                <div {...attributes} {...listeners} className="p-1 text-gray-300 hover:text-gray-500 dark:text-zinc-700 dark:hover:text-zinc-500 transition-colors opacity-0 group-hover:opacity-100">
                    <GripVertical size={14} />
                </div>

                {/* Icon */}
                <div className={`mr-2 ${isActive ? 'text-blue-500' : 'text-gray-400'}`}>
                    {node.slug === '/' ? <Folder size={16} /> : <FileText size={16} />}
                </div>

                {/* Title */}
                <span className={`flex-1 text-sm truncate ${isActive ? 'font-bold text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'}`}>
                    {node.title}
                </span>

                {/* Actions Button */}
                <div className="relative">
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
                        className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${isMenuOpen ? 'bg-gray-100 dark:bg-zinc-800 opacity-100' : 'hover:bg-gray-100 dark:hover:bg-zinc-800'}`}
                    >
                        <MoreVertical size={14} className="text-gray-400" />
                    </button>

                    {/* Context Menu Dropdown */}
                    {isMenuOpen && (
                        <>
                            <div className="fixed inset-0 z-[60]" onClick={() => setIsMenuOpen(false)} />
                            <div className="absolute top-full right-0 z-[70] min-w-[180px] bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-xl py-1 animate-in fade-in zoom-in-95 duration-100 mt-1">
                                <div className="flex flex-col p-1">
                                    {node.isDeleted ? (
                                        <button
                                            onClick={() => handleAction(() => restorePage(node.id))}
                                            className="flex items-center gap-2 px-3 py-1.5 text-xs text-green-600 hover:bg-green-50 rounded"
                                        >
                                            <Eye size={14} />
                                            <span>Restore Page</span>
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => handleAction(() => onAddChild(node.id))}
                                                className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-800 rounded"
                                            >
                                                <Plus size={14} />
                                                <span>Add Child Page</span>
                                            </button>
                                            <button
                                                onClick={() => handleAction(() => onEditSettings(node))}
                                                className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-800 rounded"
                                            >
                                                <Search size={14} />
                                                <span>Page Settings</span>
                                            </button>
                                            <div className="h-px bg-gray-100 dark:bg-zinc-800 my-1" />
                                            <button
                                                onClick={() => handleAction(() => onPickerAction(node.id, 'move'))}
                                                className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-800 rounded"
                                            >
                                                <Move size={14} />
                                                <span>Move to...</span>
                                            </button>
                                            <button
                                                onClick={() => handleAction(() => onPickerAction(node.id, 'copy'))}
                                                className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-800 rounded"
                                            >
                                                <Copy size={14} />
                                                <span>Copy to...</span>
                                            </button>
                                            <button
                                                onClick={() => handleAction(() => copyPage(node.id))}
                                                className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-800 rounded"
                                            >
                                                <Clipboard size={14} />
                                                <span>Copy (Clipboard)</span>
                                            </button>
                                            <button
                                                onClick={() => handleAction(() => pastePage(node.id))}
                                                disabled={!copiedPageId}
                                                className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-800 rounded disabled:opacity-50"
                                            >
                                                <Plus size={14} />
                                                <span>Paste Inside</span>
                                            </button>
                                        </>
                                    )}
                                    <div className="h-px bg-gray-100 dark:bg-zinc-800 my-1" />
                                    <button
                                        onClick={() => handleAction(() => deletePage(node.id))}
                                        className="flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded"
                                    >
                                        <Trash2 size={14} />
                                        <span>{node.isDeleted ? 'Delete Permanently' : 'Delete'}</span>
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// --- Main Tree Component ---
export default function SitemapTree({ filter = 'active' }: { filter?: 'active' | 'deleted' }) {
    const { sitemap, setSitemap, collapsedNodes, movePage, copyPage, pastePage } = useSiteStore();
    const [searchQuery, setSearchQuery] = useState('');

    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [pickerTargetId, setPickerTargetId] = useState<string | null>(null);
    const [pickerAction, setPickerAction] = useState<'move' | 'copy'>('move');

    const [wizardParentId, setWizardParentId] = useState<string | null>(null);
    const [settingsNode, setSelectedNode] = useState<SitemapNode | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Flat list for rendering and DnD
    const flatNodes = useMemo(() => {
        const flatten = (nodes: SitemapNode[]): SitemapNode[] => {
            return nodes.reduce((acc: SitemapNode[], node) => {
                const matchesFilter = filter === 'deleted' ? node.isDeleted : !node.isDeleted;
                const isCollapsed = collapsedNodes.includes(node.id);

                if (matchesFilter) {
                    acc.push(node);
                }

                // Only recurse if the node is NOT collapsed AND matches the filter OR is a parent of matching nodes
                // In "deleted" mode, we usually don't care about parent collapse in the same way, but let's keep consistency.
                if (node.children && node.children.length > 0 && !isCollapsed) {
                    acc.push(...flatten(node.children));
                }
                return acc;
            }, []);
        };
        return flatten(sitemap);
    }, [sitemap, filter, collapsedNodes]);

    const filteredNodes = useMemo(() => {
        if (!searchQuery) return flatNodes;
        return flatNodes.filter(n => n.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [flatNodes, searchQuery]);

    function handleDragEnd(event: DragEndEvent) {
        if (searchQuery || filter === 'deleted') return;
        const { active, over } = event;
        if (active && over && active.id !== over.id) {
            // For MVP: simple reordering of the top level or current siblings would be complex in a flat view.
            // dnd-kit's arrayMove works best on the array we're actually sorting.
            // If we want real tree reordering, we'd need to update the nested structure.
            const oldIndex = sitemap.findIndex((i) => i.id === active.id);
            const newIndex = sitemap.findIndex((i) => i.id === over.id);
            if (oldIndex !== -1 && newIndex !== -1) {
                setSitemap(arrayMove(sitemap, oldIndex, newIndex));
            }
        }
    }

    // Helper to find real depth for display
    const findDepth = (nodes: SitemapNode[], id: string, depth = 0): number | null => {
        for (const n of nodes) {
            if (n.id === id) return depth;
            const d = n.children ? findDepth(n.children, id, depth + 1) : null;
            if (d !== null) return d;
        }
        return null;
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-900 min-h-0 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50/50 dark:bg-zinc-900/50 border-b border-gray-100 dark:border-zinc-800">
                <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Filter pages..."
                        className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={filteredNodes.map(n => n.id)} strategy={verticalListSortingStrategy}>
                        {filteredNodes.map((node) => (
                            <SortableItem
                                key={node.id}
                                node={node}
                                depth={findDepth(sitemap, node.id) || 0}
                                isDeletedMode={filter === 'deleted'}
                                onAddChild={(id) => { setWizardParentId(id); setIsWizardOpen(true); }}
                                onEditSettings={(n) => { setSelectedNode(n); setIsSettingsOpen(true); }}
                                onPickerAction={(id, action) => {
                                    setPickerTargetId(id);
                                    setPickerAction(action);
                                    setIsPickerOpen(true);
                                }}
                            />
                        ))}
                    </SortableContext>
                </DndContext>

                {filteredNodes.length === 0 && (
                    <div className="text-center py-12 text-gray-400 text-sm px-6">
                        <p>{searchQuery ? 'No matching pages found.' : filter === 'deleted' ? 'Recycle bin is empty.' : 'Sitemap is empty.'}</p>
                    </div>
                )}
            </div>

            {/* Modals */}
            <PageWizard isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} parentId={wizardParentId} />
            {settingsNode && <PageSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} node={settingsNode} />}
            <NodePickerModal
                isOpen={isPickerOpen}
                onClose={() => setIsPickerOpen(false)}
                title={pickerAction === 'move' ? 'Move Page to...' : 'Copy Page to...'}
                excludeNodeId={pickerAction === 'move' ? pickerTargetId! : undefined}
                onSelect={async (destId) => {
                    if (pickerTargetId) {
                        if (pickerAction === 'move') {
                            await movePage(pickerTargetId, destId);
                        } else {
                            // Copy to destination
                            // For copy, we set clipboard and then paste inside destId
                            copyPage(pickerTargetId);
                            await pastePage(destId);
                        }
                    }
                    setIsPickerOpen(false);
                }}
            />
        </div>
    );
}
