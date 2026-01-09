'use client';

import React, { useState } from 'react';
import { X, Image as ImageIcon, Code, Eye, FileText, Settings, AlertTriangle, CheckCircle2, Search, ExternalLink } from 'lucide-react';
import { useSiteStore } from '@/store/useSiteStore';
import MediaManager from '@/components/cms/media/MediaManager';

export default function PropertiesPanel() {
    const {
        activePageId,
        pageComponents,
        selectedComponentId,
        setSelectedComponent,
        updateComponent,
        getNodeById,
        templates,
        updatePageData,
        seoReports,
        runSeoAudit
    } = useSiteStore();

    const [showMediaManager, setShowMediaManager] = useState(false);
    const [activeImageField, setActiveImageField] = useState<string | null>(null);
    const [isCodeView, setIsCodeView] = useState(false);

    if (!activePageId) return null;

    const node = getNodeById(activePageId);
    if (!node) return null;

    const template = templates.find(t => t.id === node.templateId);
    const pageData = node.pageData || {};

    const handlePageDataChange = (key: string, value: any) => {
        updatePageData(activePageId, { [key]: value });
    };

    // --- Render Component Properties ---
    if (selectedComponentId) {
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
            <div className="flex flex-col flex-1 min-h-0 bg-white dark:bg-zinc-900 shadow-lg z-30">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                        <Settings size={16} className="text-blue-500" />
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Component Props</h3>
                    </div>
                    <button
                        onClick={() => setSelectedComponent(null)}
                        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
                    <div className="bg-gray-50 dark:bg-zinc-800/50 p-3 rounded-lg text-[10px] text-gray-500 font-mono mb-4">
                        ID: {component.id} <br />
                        Type: {component.type}
                    </div>

                    {/* HeroCover Fields */}
                    {component.type === 'HeroCover' && (
                        <>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-tight mb-1">Title</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-transparent text-sm"
                                    value={component.props.title || ''}
                                    onChange={(e) => handleChange('title', e.target.value)}
                                    placeholder="Hero Title"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-tight mb-1">Subtitle</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-transparent text-sm"
                                    value={component.props.subtitle || ''}
                                    onChange={(e) => handleChange('subtitle', e.target.value)}
                                    placeholder="Subtitle text"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-tight mb-1">Background Image</label>
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

                    {/* Image Alt Validation */}
                    {Object.entries(component.props).some(([k, v]) => typeof v === 'string' && (v.includes('.jpg') || v.includes('.png') || v.includes('.webp'))) && !component.props.alt && (
                        <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-lg animate-pulse">
                            <AlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-[11px] font-bold text-amber-700 dark:text-amber-400">Missing Alt Text</p>
                                <p className="text-[10px] text-amber-600 dark:text-amber-500">Add an 'alt' property to improve accessibility and SEO scores.</p>
                            </div>
                        </div>
                    )}

                    {/* RichText Fields */}
                    {component.type === 'RichText' && (
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-tight">Content</label>
                                <button
                                    onClick={() => setIsCodeView(!isCodeView)}
                                    className="text-[10px] flex items-center gap-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 font-bold"
                                >
                                    {isCodeView ? <><Eye size={12} /> Visual</> : <><Code size={12} /> Source</>}
                                </button>
                            </div>

                            {isCodeView ? (
                                <textarea
                                    className="w-full px-3 py-2 border border-blue-300 dark:border-blue-900 rounded-md bg-gray-50 dark:bg-zinc-900 h-64 font-mono text-xs text-gray-800 dark:text-gray-200 outline-none focus:ring-1 focus:ring-blue-500"
                                    value={component.props.content || ''}
                                    onChange={(e) => handleChange('content', e.target.value)}
                                    placeholder="<html>...</html>"
                                />
                            ) : (
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-transparent h-48 font-sans text-sm outline-none focus:ring-1 focus:ring-blue-500"
                                    value={component.props.content || ''}
                                    onChange={(e) => handleChange('content', e.target.value)}
                                    placeholder="Enter content..."
                                />
                            )}
                        </div>
                    )}

                    {/* GridSystem Fields */}
                    {component.type === 'GridSystem' && (
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-tight mb-1">Columns</label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-transparent text-sm"
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
                    <div className="pt-4 border-t border-gray-100 dark:border-zinc-800">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Spacing & Style</h4>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-2">Vertical Padding</label>
                            <input
                                type="range"
                                min="0" max="24" step="1"
                                className="w-full h-1.5 bg-gray-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                value={component.props.paddingY || '4'}
                                onChange={(e) => handleChange('paddingY', e.target.value)}
                            />
                            <div className="text-right text-[10px] font-mono text-gray-400 mt-1">{component.props.paddingY || 4} units</div>
                        </div>
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

    // --- Render Page Data (No Component Selected) ---
    return (
        <div className="flex flex-col flex-1 min-h-0 bg-white dark:bg-zinc-900 animate-in slide-in-from-right duration-300">
            <div className="flex items-center gap-2 p-4 border-b border-gray-200 dark:border-zinc-800">
                <FileText size={16} className="text-blue-500" />
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Page Content Data</h3>
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
                <div className="bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-100 dark:border-blue-900/30">
                    <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Active Template</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{template?.name || 'Standard'}</p>
                </div>

                {/* SEO Status Bar */}
                {seoReports[activePageId] && (
                    <div className={`p-3 rounded-lg border flex items-center justify-between ${seoReports[activePageId].seoScore === 'good' ? 'bg-green-50 border-green-100 text-green-700 dark:bg-green-900/10 dark:border-green-900/30 dark:text-green-400' :
                            seoReports[activePageId].seoScore === 'critical' ? 'bg-red-50 border-red-100 text-red-700 dark:bg-red-900/10 dark:border-red-900/30 dark:text-red-400' :
                                'bg-amber-50 border-amber-100 text-amber-700 dark:bg-amber-900/10 dark:border-amber-900/30 dark:text-amber-400'
                        }`}>
                        <div className="flex items-center gap-2">
                            {seoReports[activePageId].seoScore === 'good' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                            <span className="text-xs font-bold uppercase tracking-tight">SEO Score: {seoReports[activePageId].seoScore}</span>
                        </div>
                        <button
                            onClick={() => runSeoAudit(activePageId)}
                            className="text-[10px] font-bold underline hover:no-underline"
                        >
                            Re-run Audit
                        </button>
                    </div>
                )}

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider">SEO & Metadata</h4>
                        {!seoReports[activePageId] && (
                            <button
                                onClick={() => runSeoAudit(activePageId)}
                                className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 dark:bg-zinc-800 text-[10px] font-bold text-gray-600 dark:text-gray-400 rounded hover:bg-blue-500 hover:text-white transition-all"
                            >
                                <Search size={10} />
                                Run First Audit
                            </button>
                        )}
                    </div>

                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">SEO Title</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-transparent text-sm"
                                value={node.seo_metadata?.title || ''}
                                onChange={(e) => useSiteStore.getState().updatePageProperties(activePageId, { seoTitle: e.target.value })}
                                placeholder="Page title for Google..."
                            />
                            {(node.seo_metadata?.title?.length || 0) < 30 && (
                                <p className="text-[10px] text-amber-500 mt-1">Title is too short (min 30 chars recommended)</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">SEO Description</label>
                            <textarea
                                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-transparent text-sm h-20 resize-none"
                                value={node.seo_metadata?.description || ''}
                                onChange={(e) => useSiteStore.getState().updatePageProperties(activePageId, { seoDesc: e.target.value })}
                                placeholder="Describe this page for search results..."
                            />
                        </div>

                        {/* Search Preview Component */}
                        <div className="mt-4">
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Google Preview</label>
                            <div className="p-4 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
                                <div className="text-[12px] text-[#202124] dark:text-[#bdc1c6] truncate mb-0.5">
                                    maciej-dutkowiak.vercel.app › {node.slug === '/' ? 'home' : node.slug.replace('/', '')}
                                </div>
                                <div className="text-[18px] text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer leading-tight mb-1 truncate">
                                    {node.seo_metadata?.title || node.title || 'Untitled Page'}
                                </div>
                                <div className="text-[14px] text-[#4d5156] dark:text-[#bdc1c6] line-clamp-2 leading-relaxed">
                                    {node.seo_metadata?.description || 'Please provide a meta description to see how this page will appear in search results.'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="h-px bg-gray-100 dark:bg-zinc-800 my-6" />

                {template?.fields && template.fields.length > 0 ? (
                    <div className="space-y-5">
                        <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Document Fields</h4>
                        {template.fields.map(field => (
                            <div key={field.id} className="space-y-1.5">
                                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-tight">
                                    {field.label} {field.required && <span className="text-red-500">*</span>}
                                </label>

                                {field.type === 'text' && (
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-transparent text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        value={pageData[field.id] || ''}
                                        onChange={(e) => handlePageDataChange(field.id, e.target.value)}
                                        placeholder={`Enter ${field.label.toLowerCase()}...`}
                                    />
                                )}

                                {field.type === 'select' && (
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-transparent text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={pageData[field.id] || ''}
                                        onChange={(e) => handlePageDataChange(field.id, e.target.value)}
                                    >
                                        <option value="">Select...</option>
                                        {field.options?.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                )}

                                {field.type === 'date' && (
                                    <input
                                        type="date"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-transparent text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={pageData[field.id] || ''}
                                        onChange={(e) => handlePageDataChange(field.id, e.target.value)}
                                    />
                                )}

                                {field.type === 'boolean' && (
                                    <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-lg cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-zinc-700 transition-all">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            checked={!!pageData[field.id]}
                                            onChange={(e) => handlePageDataChange(field.id, e.target.checked)}
                                        />
                                        <span className="text-sm text-gray-600 dark:text-gray-300">{field.label}</span>
                                    </label>
                                )}

                                {field.defaultValue !== undefined && pageData[field.id] === undefined && (
                                    <p className="text-[10px] text-gray-400 italic">Default: {String(field.defaultValue)}</p>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400 space-y-3">
                        <div className="p-3 bg-gray-100 dark:bg-zinc-800 rounded-full">
                            <Settings size={24} className="opacity-50" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">No Custom Fields</p>
                            <p className="text-xs px-6">This template does not define any dynamic data fields. Select a component in the editor to view its properties.</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 bg-gray-50 dark:bg-zinc-900/80 border-t border-gray-200 dark:border-zinc-800">
                <p className="text-[10px] text-gray-500 italic text-center">Data is autosaved as draft.</p>
            </div>
        </div>
    );
}
