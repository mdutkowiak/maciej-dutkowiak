'use client';

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Type, Image, Columns, Box } from 'lucide-react';
import { ComponentData } from '@/store/types';

interface ToolkitItemProps {
    type: ComponentData['type'];
    label: string;
    icon: React.ReactNode;
}

function ToolkitItem({ type, label, icon }: ToolkitItemProps) {
    // We use a unique ID for the draggable source, but the payload 'data' tells us what to create
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: `toolkit-${type}`,
        data: {
            type: 'ToolkitItem',
            componentType: type,
        },
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg cursor-grab hover:shadow-md transition-all active:cursor-grabbing mb-2"
        >
            <div className="text-gray-500 dark:text-gray-400">{icon}</div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</span>
        </div>
    );
}

export default function ComponentToolkit() {
    return (
        <div className="flex-1 bg-gray-50/50 dark:bg-zinc-950/50 p-4 flex flex-col min-h-0 overflow-y-auto">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Components</h3>

            <ToolkitItem type="HeroCover" label="Hero Cover" icon={<Image size={18} />} />
            <ToolkitItem type="RichText" label="Rich Text" icon={<Type size={18} />} />
            <ToolkitItem type="GridSystem" label="Grid System" icon={<Columns size={18} />} />
            <ToolkitItem type="ProductShowcase" label="Showcase" icon={<Box size={18} />} />
        </div>
    );
}
