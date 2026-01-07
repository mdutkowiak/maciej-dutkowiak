'use client';

import React, { useState } from 'react';
import { X, Image as ImageIcon, Code, Eye } from 'lucide-react';
import { useSiteStore } from '@/store/useSiteStore';
import MediaManager from '@/components/cms/media/MediaManager';

export default function PropertiesPanel() {
    const {
        activePageId,
        pageComponents,
        selectedComponentId,
        setSelectedComponent,
        updateComponent
    } = useSiteStore();

    const [showMediaManager, setShowMediaManager] = useState(false);
    const [activeImageField, setActiveImageField] = useState<string | null>(null);
    const [isCodeView, setIsCodeView] = useState(false);

    if (!activePageId || !selectedComponentId) return null;

    const component = pageComponents[activePageId]?.find(c => c.id === selectedComponentId);
    if (!component) return null;

    const handleChange = (key: string, value: any) => {
        updateComponent(activePageId, selectedComponentId, { [key]: value });
    };

    const openMediaManager = (fieldKey: string) => {
        setActiveImageField(fieldKey);
        setShowMediaManager(true);
    };

    const handleMediaSelect = (url: string) => {
        if (activeImageField) {
            handleChange(activeImageField, url);
        }
        setShowMediaManager(false);
        setActiveImageField(null);
    };

    return (
        <div className="w-80 bg-white dark:bg-zinc-900 border-l border-gray-200 dark:border-zinc-800 flex flex-col h-full shadow-lg z-30">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-800">
                <h3 className="font-semibold text-gray-900 dark:text-white">Properties</h3>
                <button
                    onClick={() => setSelectedComponent(null)}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                    <X size={20} />
                </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-6">
                <div className="bg-gray-50 dark:bg-zinc-800/50 p-3 rounded-lg text-xs text-gray-500 font-mono mb-4">
                    ID: {component.id} <br />
                    Type: {component.type}
                </div>

                {/* Dynamic Fields based on Component Type */}
                {component.type === 'HeroCover' && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-transparent"
                                value={component.props.title || ''}
                                onChange={(e) => handleChange('title', e.target.value)}
                                placeholder="Hero Title"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subtitle</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-transparent"
                                value={component.props.subtitle || ''}
                                onChange={(e) => handleChange('subtitle', e.target.value)}
                                placeholder="Subtitle text"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Background Image</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-transparent text-xs"
                                    value={component.props.imageUrl || ''}
                                    onChange={(e) => handleChange('imageUrl', e.target.value)}
                                    placeholder="https://..."
                                />
                                <button
                                    onClick={() => openMediaManager('imageUrl')}
                                    className="p-2 bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                                >
                                    <ImageIcon size={16} />
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {component.type === 'RichText' && (
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Content</label>
                            <button
                                onClick={() => setIsCodeView(!isCodeView)}
                                className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-700 dark:text-blue-400"
                            >
                                {isCodeView ? <><Eye size={12} /> Visual</> : <><Code size={12} /> Source</>}
                            </button>
                        </div>

                        {isCodeView ? (
                            <textarea
                                className="w-full px-3 py-2 border border-blue-300 dark:border-blue-900 rounded-md bg-gray-50 dark:bg-zinc-900 h-64 font-mono text-xs text-gray-800 dark:text-gray-200"
                                value={component.props.content || ''}
                                onChange={(e) => handleChange('content', e.target.value)}
                                placeholder="<html>...</html>"
                            />
                        ) : (
                            <textarea
                                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-transparent h-48 font-mono text-sm"
                                value={component.props.content || ''}
                                onChange={(e) => handleChange('content', e.target.value)}
                                placeholder="<p>Enter content...</p>"
                            />
                        )}
                        <p className="text-[10px] text-gray-400 mt-1">
                            {isCodeView ? 'Editing raw HTML. Be careful with invalid tags.' : 'Standard text editor mode.'}
                        </p>
                    </div>
                )}

                {component.type === 'GridSystem' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Columns</label>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-transparent"
                            value={component.props.cols || '3'}
                            onChange={(e) => handleChange('cols', e.target.value)}
                        >
                            <option value="1">1 Column</option>
                            <option value="2">2 Columns</option>
                            <option value="3">3 Columns</option>
                            <option value="4">4 Columns</option>
                        </select>
                    </div>
                )}

                {/* Global Style overrides */}
                <hr className="border-gray-200 dark:border-zinc-800 my-4" />
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Styles</h4>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Padding (Y)</label>
                    <input
                        type="range"
                        min="0" max="24" step="1"
                        className="w-full"
                        value={component.props.paddingY || '4'}
                        onChange={(e) => handleChange('paddingY', e.target.value)}
                    />
                    <div className="text-right text-xs text-gray-500">{component.props.paddingY || 4}</div>
                </div>
            </div>

            {showMediaManager && (
                <MediaManager
                    onSelect={handleMediaSelect}
                    onClose={() => setShowMediaManager(false)}
                />
            )}
        </div>
    );
}
