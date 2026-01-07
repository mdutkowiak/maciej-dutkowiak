import React from 'react';
import { ComponentData } from '@/store/types';
import { twMerge } from 'tailwind-merge';

interface BlockRendererProps {
    component: ComponentData;
}

export default function BlockRenderer({ component }: BlockRendererProps) {
    switch (component.type) {
        case 'HeroCover':
            return (
                <div className="relative h-64 w-full bg-gray-200 dark:bg-zinc-800 flex items-center justify-center overflow-hidden rounded-lg group">
                    <img
                        src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80"
                        alt="Placeholder"
                        className="absolute inset-0 w-full h-full object-cover opacity-50"
                    />
                    <div className="relative z-10 text-center p-4">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Hero Section</h1>
                        <p className="text-gray-700 dark:text-gray-200 mt-2">Drag & Drop content here</p>
                    </div>
                </div>
            );

        case 'RichText':
            return (
                <div className="prose dark:prose-invert max-w-none p-4 border border-dashed border-gray-300 dark:border-zinc-700 rounded-lg min-h-[100px]">
                    <h3>Rich Text Block</h3>
                    <p>Start typing your content here...</p>
                </div>
            );

        case 'GridSystem':
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border border-dashed border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg">
                    <div className="h-24 bg-white dark:bg-zinc-900 rounded border border-gray-100 dark:border-zinc-800 flex items-center justify-center text-xs text-gray-400">Col 1</div>
                    <div className="h-24 bg-white dark:bg-zinc-900 rounded border border-gray-100 dark:border-zinc-800 flex items-center justify-center text-xs text-gray-400">Col 2</div>
                    <div className="h-24 bg-white dark:bg-zinc-900 rounded border border-gray-100 dark:border-zinc-800 flex items-center justify-center text-xs text-gray-400">Col 3</div>
                </div>
            );

        case 'ProductShowcase':
            return (
                <div className="flex gap-4 p-4 border rounded-lg bg-white dark:bg-zinc-900 shadow-sm">
                    <div className="w-24 h-24 bg-gray-100 dark:bg-zinc-800 rounded-md shrink-0"></div>
                    <div>
                        <h4 className="font-bold">Project Title</h4>
                        <p className="text-sm text-gray-500 mt-1">Short description of the project goes here. Showcase your work.</p>
                    </div>
                </div>
            );

        default:
            return <div className="p-4 border border-red-200 text-red-500">Unknown Component: {component.type}</div>;
    }
}
