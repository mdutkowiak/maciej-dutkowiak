'use client';

import React, { useState } from 'react';
import { DndContext, DragOverlay, DragStartEvent, DragEndEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { Code } from 'lucide-react';

import DevicePreviewWrapper from '@/components/cms/DevicePreviewWrapper';
import ComponentToolkit from '@/components/cms/editor/ComponentToolkit';
import EditorCanvas from '@/components/cms/editor/EditorCanvas';
import CodeEditorPanel from '@/components/cms/editor/CodeEditorPanel';

import { useSiteStore } from '@/store/useSiteStore';
import { ComponentData } from '@/store/types';

export default function VisualEditorPage() {
    const { activePageId, addComponent, reorderComponents, pageComponents } = useSiteStore();
    const [activeDragItem, setActiveDragItem] = useState<ComponentData | null>(null);
    const [showCodePanel, setShowCodePanel] = useState(false);

    const sensors = useSensors(useSensor(PointerSensor));

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const { data } = active;

        // If dragging from toolkit, data.current should have our payload
        if (data.current && data.current.type === 'ToolkitItem') {
            setActiveDragItem({
                id: 'temp',
                type: data.current.componentType,
                props: {}
            });
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveDragItem(null);
        const { active, over } = event;

        if (!over || !activePageId) return;

        // 1. Dropping NEW from Toolkit to Canvas
        if (active.data.current?.type === 'ToolkitItem' && (over.id === 'editor-canvas' || typeof over.id === 'string')) {
            // Create new component
            const newComponent: ComponentData = {
                id: Math.random().toString(36).substr(2, 9),
                type: active.data.current.componentType,
                props: {}
            };
            addComponent(activePageId, newComponent);
            return;
        }

        // 2. Reordering inside Canvas
        // Logic similar to Sitemap but for components array
        const components = pageComponents[activePageId] || [];
        const oldIndex = components.findIndex(c => c.id === active.id);
        const newIndex = components.findIndex(c => c.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
            reorderComponents(activePageId, oldIndex, newIndex);
        }
    };

    if (!activePageId) {
        return <div className="p-8 text-center text-gray-500">Please select a page from the sitemap to edit.</div>;
    }

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex h-full relative">
                {/* Center: Device Preview & Canvas */}
                <div className="flex-1 overflow-hidden relative">
                    <DevicePreviewWrapper>
                        <EditorCanvas />
                    </DevicePreviewWrapper>

                    {/* Floating Action Buttons */}
                    <div className="absolute bottom-6 right-6 z-40">
                        <button
                            onClick={() => setShowCodePanel(!showCodePanel)}
                            className="flex items-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-full shadow-xl hover:bg-black transition-transform hover:scale-105"
                        >
                            <Code size={20} />
                            <span>Page Code</span>
                        </button>
                    </div>

                    {/* Code Panel Overlay */}
                    {showCodePanel && (
                        <CodeEditorPanel onClose={() => setShowCodePanel(false)} />
                    )}
                </div>

                {/* Right: Toolkit */}
                <ComponentToolkit />

                {/* Drag Overlay (Visual feedback while dragging) */}
                <DragOverlay>
                    {activeDragItem ? (
                        <div className="p-4 bg-white shadow-xl rounded opacity-80 border-2 border-blue-500">
                            Dragging {activeDragItem.type}...
                        </div>
                    ) : null}
                </DragOverlay>
            </div>
        </DndContext>
    );
}
