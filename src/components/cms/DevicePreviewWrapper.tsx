'use client';

import React, { useState } from 'react';
import { Smartphone, Tablet, Monitor, RotateCcw } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface DevicePreviewWrapperProps {
    children: React.ReactNode;
}

type DeviceType = 'desktop' | 'tablet' | 'mobile';

const cn = (...inputs: (string | undefined | null | false)[]) => twMerge(clsx(inputs));

export default function DevicePreviewWrapper({ children }: DevicePreviewWrapperProps) {
    const [device, setDevice] = useState<DeviceType>('desktop');

    const getWidth = () => {
        switch (device) {
            case 'mobile':
                return 'max-w-[375px]';
            case 'tablet':
                return 'max-w-[768px]';
            case 'desktop':
            default:
                return 'max-w-full';
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100 dark:bg-zinc-900 overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700 shadow-sm z-10">
                <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 mr-2">Preview Mode:</span>
                    <button
                        onClick={() => setDevice('desktop')}
                        className={cn(
                            "p-2 rounded-md transition-colors",
                            device === 'desktop' ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300" : "hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-500 dark:text-gray-400"
                        )}
                        title="Desktop (100%)"
                    >
                        <Monitor size={20} />
                    </button>
                    <button
                        onClick={() => setDevice('tablet')}
                        className={cn(
                            "p-2 rounded-md transition-colors",
                            device === 'tablet' ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300" : "hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-500 dark:text-gray-400"
                        )}
                        title="Tablet (768px)"
                    >
                        <Tablet size={20} />
                    </button>
                    <button
                        onClick={() => setDevice('mobile')}
                        className={cn(
                            "p-2 rounded-md transition-colors",
                            device === 'mobile' ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300" : "hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-500 dark:text-gray-400"
                        )}
                        title="Mobile (375px)"
                    >
                        <Smartphone size={20} />
                    </button>
                </div>

                <div className="flex items-center">
                    <button
                        onClick={() => setDevice('desktop')}
                        className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                        title="Reset View"
                    >
                        <RotateCcw size={14} />
                        <span>Reset</span>
                    </button>
                </div>
            </div>

            {/* Preview Area */}
            <div className="flex-1 overflow-auto p-8 bg-gray-50/50 dark:bg-zinc-950/50 flex justify-center">
                <div
                    className={cn(
                        "bg-white dark:bg-black shadow-2xl transition-all duration-500 ease-in-out border border-gray-200 dark:border-zinc-800 overflow-hidden relative",
                        getWidth(),
                        device === 'desktop' ? "w-full h-full rounded-none border-none shadow-none" : "h-[800px] rounded-xl border-8 border-gray-800/10 dark:border-zinc-800"
                    )}
                    style={{
                        minHeight: device !== 'desktop' ? '800px' : '100%',
                        width: device === 'desktop' ? '100%' : undefined
                    }}
                >
                    {device !== 'desktop' && (
                        <div className="absolute top-0 left-0 right-0 h-6 bg-gray-100 dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 flex justify-center items-center">
                            <div className="w-16 h-1 rounded-full bg-gray-300 dark:bg-zinc-700" />
                        </div>
                    )}

                    <div className={cn("h-full w-full overflow-auto", device !== 'desktop' ? "pt-6" : "")}>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
