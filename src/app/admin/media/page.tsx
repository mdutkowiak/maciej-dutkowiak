'use client';

import React from 'react';
import MediaManager from '@/components/cms/media/MediaManager';

export default function MediaPage() {
    return (
        <div className="p-8 h-full flex flex-col">
            <h1 className="text-2xl font-bold mb-6">Media Library</h1>
            <div className="flex-1 relative border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 shadow-sm">
                <MediaManager
                    embedded={true}
                    onSelect={(url) => console.log('Selected:', url)}
                    onClose={() => { }}
                />
            </div>
        </div>
    );
}
