'use client';

import React from 'react';
import {
    FileText,
    Image,
    Settings,
    Users,
    CircleHelp,
    Box
} from 'lucide-react';
import { useSiteStore } from '@/store/useSiteStore';
import Tooltip from '@/components/ui/Tooltip';

export default function NavigationRail() {
    const { activeMode, setActiveMode } = useSiteStore();

    const items = [
        { id: 'content', icon: FileText, label: 'Content' },
        { id: 'media', icon: Image, label: 'Media' },
        { id: 'settings', icon: Settings, label: 'Settings' },
        { id: 'users', icon: Users, label: 'Users' },
    ] as const;

    return (
        <aside className="w-[60px] bg-zinc-950 flex flex-col items-center py-4 border-r border-white/5 z-[100] shrink-0">
            {/* Logo */}
            <div className="mb-8 p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20">
                <Box size={22} className="text-white" />
            </div>

            {/* Main Modes */}
            <nav className="flex-1 flex flex-col gap-2">
                {items.map((item) => {
                    const isActive = activeMode === item.id;
                    const Icon = item.icon;

                    return (
                        <Tooltip key={item.id} content={item.label}>
                            <button
                                onClick={() => setActiveMode(item.id)}
                                className={`
                                    relative p-3 rounded-xl transition-all group
                                    ${isActive
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                        : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'}
                                `}
                            >
                                <Icon size={22} />
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />
                                )}
                            </button>
                        </Tooltip>
                    );
                })}
            </nav>

            {/* Bottom Actions */}
            <div className="mt-auto flex flex-col gap-2">
                <Tooltip content="Help & Docs">
                    <button
                        onClick={() => setActiveMode('help')}
                        className={`p-3 rounded-xl transition-all ${activeMode === 'help' ? 'bg-blue-600 text-white' : 'text-zinc-500 hover:text-zinc-200'}`}
                    >
                        <CircleHelp size={22} />
                    </button>
                </Tooltip>

                <div className="h-px bg-white/5 my-2 w-8 mx-auto" />

                <button className="p-3 text-zinc-500 hover:text-zinc-200 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-white/10 flex items-center justify-center font-bold text-xs text-zinc-300">
                        MD
                    </div>
                </button>
            </div>
        </aside>
    );
}
