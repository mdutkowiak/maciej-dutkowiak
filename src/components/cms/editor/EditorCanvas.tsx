'use client';

import React, { useEffect, useRef } from 'react';
import { useDroppable, DragOverlay } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash } from 'lucide-react';

import { useSiteStore } from '@/store/useSiteStore';
import { ComponentData } from '@/store/types';
import BlockRenderer from './BlockRenderer';

interface SortableBlockProps {
    component: ComponentData;
    onRemove: () => void;
}

function SortableBlock({ component, onRemove }: SortableBlockProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: component.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="group relative mb-4">
            {/* Hover Actions */}
            <div className="absolute -top-3 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex gap-2">
                <div {...attributes} {...listeners} className="bg-blue-600 text-white text-xs px-2 py-1 rounded cursor-grab active:cursor-grabbing shadow-md">
                    Drag
                </div>
                <button onClick={onRemove} className="bg-red-600 text-white p-1 rounded hover:bg-red-700 shadow-md">
                    <Trash size={12} />
                </button>
            </div>

            <div className="border border-transparent group-hover:border-blue-400 rounded-lg transition-colors p-1">
                <BlockRenderer component={component} />
            </div>
        </div>
    )
}

export default function EditorCanvas() {
    const { activePageId, pageComponents, removeComponent, pageCustomCode } = useSiteStore();
    const { setNodeRef } = useDroppable({ id: 'editor-canvas' });

    const components = activePageId ? (pageComponents[activePageId] || []) : [];
    const customCode = activePageId ? (pageCustomCode[activePageId] || { css: '', js: '' }) : { css: '', js: '' };

    // --- JS Execution Logic ---
    const jsExecuted = useRef(false);

    useEffect(() => {
        if (!customCode.js || !activePageId) return;

        try {
            // Safe-ish execution? No, effectively eval. 
            // In a real app, use sandboxing or strict limitations.
            // For this MVP, we wrap in a function scope.
            const runCode = new Function(customCode.js);
            runCode();
            jsExecuted.current = true;
        } catch (e) {
            console.error("Custom JS Error:", e);
        }
    }, [customCode.js, activePageId]);

    return (
        <div className="min-h-full">
            {/* Custom CSS Injection */}
            <style dangerouslySetInnerHTML={{ __html: customCode.css }} />

            <div ref={setNodeRef} className="p-8 min-h-[600px] bg-white dark:bg-black">
                {components.length === 0 ? (
                    <div className="h-64 border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-xl flex items-center justify-center text-gray-400">
                        Drop components here
                    </div>
                ) : (
                    <SortableContext items={components.map(c => c.id)} strategy={verticalListSortingStrategy}>
                        {components.map(comp => (
                            <SortableBlock
                                key={comp.id}
                                component={comp}
                                onRemove={() => activePageId && removeComponent(activePageId, comp.id)}
                            />
                        ))}
                    </SortableContext>
                )}
            </div>
        </div>
    );
}
