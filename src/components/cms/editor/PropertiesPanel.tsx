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
    const [activeTab, setActiveTab] = useState<'content' | 'seo'>('content');
    const [socialPreviewMode, setSocialPreviewMode] = useState<'google' | 'facebook' | 'x' | 'linkedin'>('google');

    if (!activePageId) return null;

    const node = getNodeById(activePageId);
    if (!node) return null;

    const template = templates.find(t => t.id === node.templateId);
    const pageData = node.pageData || {};

    const handlePageDataChange = (key: string, value: any) => {
        updatePageData(activePageId, { [key]: value });
    };

    // --- Component Logic ---
    const component = selectedComponentId ? pageComponents[activePageId]?.find(c => c.id === selectedComponentId) : null;

    const handleComponentChange = (key: string, value: any) => {
        if (selectedComponentId) {
            updateComponent(activePageId, selectedComponentId, { [key]: value });
        }
    };

    const openMediaManager = (fieldKey: string) => {
        setActiveImageField(fieldKey);
        setShowMediaManager(true);
    };

    const handleMediaSelect = (url: string) => {
        if (activeImageField) {
            if (activeImageField === 'ogImage') {
                useSiteStore.getState().updatePageProperties(activePageId, { ogImage: url });
            } else {
                handleComponentChange(activeImageField, url);
            }
        }
        setShowMediaManager(false);
        setActiveImageField(null);
    };

    const renderSeoContent = () => (
        <div className="space-y-6">
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

            <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Target Keywords</label>
                <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-transparent text-sm"
                    value={node.seo_metadata?.keywords?.join(', ') || ''}
                    onChange={(e) => useSiteStore.getState().updatePageProperties(activePageId, {
                        keywords: e.target.value.split(',').map(s => s.trim()).filter(s => s.length > 0)
                    })}
                    placeholder="e.g. ecommerce, cms, react"
                />
            </div>

            <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Social Share Image (og:image)</label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-transparent text-sm font-mono text-gray-500"
                        value={node.seo_metadata?.ogImage || ''}
                        onChange={(e) => useSiteStore.getState().updatePageProperties(activePageId, { ogImage: e.target.value })}
                        placeholder="https://..."
                    />
                    <button
                        onClick={() => openMediaManager('ogImage')}
                        className="p-2 bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700"
                    >
                        <ImageIcon size={18} />
                    </button>
                </div>
            </div>

            {/* Unified Preview Section */}
            <div className="border-t border-gray-100 dark:border-zinc-800 pt-4">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                        <Search size={14} className="text-blue-500" />
                        Preview
                    </h4>
                    <div className="flex bg-gray-100 dark:bg-zinc-800 p-0.5 rounded-lg">
                        <button onClick={() => setSocialPreviewMode('google')} className={`p-1.5 rounded-md transition-all ${socialPreviewMode === 'google' ? 'bg-white dark:bg-zinc-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}><Search size={14} /></button>
                        <button onClick={() => setSocialPreviewMode('facebook')} className={`p-1.5 rounded-md transition-all ${socialPreviewMode === 'facebook' ? 'bg-white dark:bg-zinc-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>FB</button>
                        <button onClick={() => setSocialPreviewMode('x')} className={`p-1.5 rounded-md transition-all ${socialPreviewMode === 'x' ? 'bg-white dark:bg-zinc-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>X</button>
                        <button onClick={() => setSocialPreviewMode('linkedin')} className={`p-1.5 rounded-md transition-all ${socialPreviewMode === 'linkedin' ? 'bg-white dark:bg-zinc-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>IN</button>
                    </div>
                </div>

                {/* Preview Cards */}
                {socialPreviewMode === 'google' && (
                    <div className="p-4 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
                        <div className="text-[12px] text-[#202124] dark:text-[#bdc1c6] truncate mb-0.5">
                            maciej-dutkowiak.vercel.app › {node.slug === '/' ? 'home' : node.slug.replace('/', '')}
                        </div>
                        <div className="text-[18px] text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer leading-tight mb-1 truncate">
                            {node.seo_metadata?.title || node.title || 'Untitled Page'}
                        </div>
                        <div className="text-[14px] text-[#4d5156] dark:text-[#bdc1c6] line-clamp-2 leading-relaxed">
                            {node.seo_metadata?.description || 'No description provided.'}
                        </div>
                    </div>
                )}

                {socialPreviewMode !== 'google' && (
                    <div className={socialPreviewMode === 'x' ? "border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-950 shadow-sm" : "border border-gray-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-zinc-900 shadow-sm"}>
                        <div className={`bg-gray-100 dark:bg-zinc-800 relative flex items-center justify-center ${socialPreviewMode === 'x' ? 'aspect-[2/1]' : 'aspect-[1.91/1]'}`}>
                            {node.seo_metadata?.ogImage ? (
                                <img src={node.seo_metadata.ogImage} className="w-full h-full object-cover" alt="OG" />
                            ) : (
                                <ImageIcon className="text-gray-400" size={32} />
                            )}
                            {socialPreviewMode === 'x' && <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[10px] text-white">maciej-dutkowiak.vercel.app</div>}
                        </div>
                        <div className={socialPreviewMode === 'linkedin' ? "p-3 bg-white dark:bg-zinc-900" : "p-3 bg-gray-50 dark:bg-zinc-800/50"}>
                            {socialPreviewMode === 'facebook' && <p className="text-[11px] text-gray-500 uppercase font-medium mb-1">maciej-dutkowiak.vercel.app</p>}
                            <p className={`font-bold text-gray-900 dark:text-gray-100 line-clamp-1 ${socialPreviewMode === 'linkedin' ? 'text-sm' : 'text-sm'}`}>
                                {node.seo_metadata?.title || node.title}
                            </p>
                            {socialPreviewMode !== 'linkedin' && (
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2 leading-tight">
                                    {node.seo_metadata?.description || 'No description provided.'}
                                </p>
                            )}
                            {socialPreviewMode === 'linkedin' && <p className="text-[11px] text-gray-500 mt-0.5">maciej-dutkowiak.vercel.app</p>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="flex flex-col flex-1 min-h-0 bg-white dark:bg-zinc-900 shadow-lg z-30">
            {/* Header */}
            <div className="border-b border-gray-200 dark:border-zinc-800">
                <div className="flex items-center justify-between p-4 pb-0">
                    <div className="flex items-center gap-2 mb-4">
                        {selectedComponentId ? <Settings size={16} className="text-blue-500" /> : <FileText size={16} className="text-blue-500" />}
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                            {selectedComponentId ? 'Component Props' : 'Page Properties'}
                        </h3>
                    </div>
                    {selectedComponentId && (
                        <button onClick={() => setSelectedComponent(null)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-4">
                            <X size={20} />
                        </button>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex px-4 gap-6">
                    <button
                        onClick={() => setActiveTab('content')}
                        className={`pb-3 text-sm font-medium transition-all relative ${activeTab === 'content' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Content
                        {activeTab === 'content' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('seo')}
                        className={`pb-3 text-sm font-medium transition-all relative ${activeTab === 'seo' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        SEO
                        {activeTab === 'seo' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full" />}
                    </button>

                    {/* SEO Score Indicator (Right Aligned) */}
                    {seoReports[activePageId] && activeTab === 'content' && (
                        <div className="ml-auto mb-2 bg-gray-50 dark:bg-zinc-800 px-2 py-1 rounded text-[10px] font-bold text-gray-500">
                            Safe
                        </div>
                    )}
                </div>
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
                {activeTab === 'seo' ? renderSeoContent() : (
                    <>
                        {component ? (
                            <>
                                <div className="bg-gray-50 dark:bg-zinc-800/50 p-3 rounded-lg text-[10px] text-gray-500 font-mono mb-4">
                                    ID: {component.id} <br />
                                    Type: {component.type}
                                </div>

                                {/* HeroCover Fields */}
                                {component.type === 'HeroCover' && (
                                    <>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-tight mb-1">Title</label>
                                            <input type="text" className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-transparent text-sm" value={component.props.title || ''} onChange={(e) => handleComponentChange('title', e.target.value)} placeholder="Hero Title" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-tight mb-1">Subtitle</label>
                                            <input type="text" className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-transparent text-sm" value={component.props.subtitle || ''} onChange={(e) => handleComponentChange('subtitle', e.target.value)} placeholder="Subtitle text" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-tight mb-1">Heading Tag</label>
                                            <select className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-transparent text-sm" value={component.props.tag || 'h1'} onChange={(e) => handleComponentChange('tag', e.target.value)}>
                                                <option value="h1">H1 - Main Heading</option>
                                                <option value="h2">H2 - Section</option>
                                                <option value="h3">H3 - Subtitle</option>
                                                <option value="h4">H4 - Small</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-tight mb-1">Background Image</label>
                                            <div className="flex gap-2">
                                                <input type="text" className="flex-1 px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-transparent text-xs" value={component.props.imageUrl || ''} onChange={(e) => handleComponentChange('imageUrl', e.target.value)} placeholder="https://..." />
                                                <button onClick={() => openMediaManager('imageUrl')} className="p-2 bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"><ImageIcon size={16} /></button>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* RichText Fields */}
                                {component.type === 'RichText' && (
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-tight">Content</label>
                                            <button onClick={() => setIsCodeView(!isCodeView)} className="text-[10px] flex items-center gap-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 font-bold">{isCodeView ? <><Eye size={12} /> Visual</> : <><Code size={12} /> Source</>}</button>
                                        </div>
                                        {isCodeView ? (
                                            <textarea className="w-full px-3 py-2 border border-blue-300 dark:border-blue-900 rounded-md bg-gray-50 dark:bg-zinc-900 h-64 font-mono text-xs text-gray-800 dark:text-gray-200 outline-none focus:ring-1 focus:ring-blue-500" value={component.props.content || ''} onChange={(e) => handleComponentChange('content', e.target.value)} placeholder="<html>...</html>" />
                                        ) : (
                                            <textarea className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-transparent h-48 font-sans text-sm outline-none focus:ring-1 focus:ring-blue-500" value={component.props.content || ''} onChange={(e) => handleComponentChange('content', e.target.value)} placeholder="Enter content..." />
                                        )}
                                    </div>
                                )}

                                {/* GridSystem Fields */}
                                {component.type === 'GridSystem' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-tight mb-1">Layout Columns</label>
                                            <select className="w-full px-3 py-2 border border-gray-200 dark:border-zinc-700 rounded-md bg-transparent text-sm" value={component.props.cols || '3'} onChange={(e) => handleComponentChange('cols', e.target.value)}>
                                                <option value="1">1 Column (Stack)</option>
                                                <option value="2">2 Columns</option>
                                                <option value="3">3 Columns</option>
                                                <option value="4">4 Columns</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-tight mb-1">Items (Comma separated)</label>
                                            <textarea className="w-full px-3 py-2 border border-gray-200 dark:border-zinc-700 rounded-md bg-transparent text-sm h-24" value={(component.props.items || []).join(', ') || ''} onChange={(e) => handleComponentChange('items', e.target.value.split(',').map(s => s.trim()))} placeholder="Feature 1, Feature 2, Feature 3" />
                                        </div>
                                    </div>
                                )}

                                {/* ProductShowcase Fields */}
                                {component.type === 'ProductShowcase' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-tight mb-1">Product Title</label>
                                            <input type="text" className="w-full px-3 py-2 border border-gray-200 dark:border-zinc-700 rounded-md bg-transparent text-sm" value={component.props.title || ''} onChange={(e) => handleComponentChange('title', e.target.value)} placeholder="Product Name" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-tight mb-1">Description</label>
                                            <textarea className="w-full px-3 py-2 border border-gray-200 dark:border-zinc-700 rounded-md bg-transparent text-sm h-20" value={component.props.description || ''} onChange={(e) => handleComponentChange('description', e.target.value)} placeholder="Summary..." />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-tight mb-1">Price / Tag</label>
                                            <input type="text" className="w-full px-3 py-2 border border-gray-200 dark:border-zinc-700 rounded-md bg-transparent text-sm" value={component.props.price || ''} onChange={(e) => handleComponentChange('price', e.target.value)} placeholder="$99.99" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-tight mb-1">Product Image</label>
                                            <div className="flex gap-2">
                                                <input type="text" className="flex-1 px-3 py-2 border border-gray-200 dark:border-zinc-700 rounded-md bg-transparent text-xs" value={component.props.imageUrl || ''} onChange={(e) => handleComponentChange('imageUrl', e.target.value)} />
                                                <button onClick={() => openMediaManager('imageUrl')} className="p-2 bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-md"><ImageIcon size={16} /></button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Contextual Alert */}
                                {Object.entries(component.props).some(([k, v]) => typeof v === 'string' && (v.includes('http') && (v.includes('.jpg') || v.includes('.png') || v.includes('.webp')))) && !component.props.alt && (
                                    <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-lg animate-pulse">
                                        <AlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-[11px] font-bold text-amber-700 dark:text-amber-400">Missing Alt Text</p>
                                            <input type="text" className="mt-2 w-full px-2 py-1 bg-white dark:bg-zinc-800 border border-amber-200 dark:border-amber-900/50 rounded text-[10px]" placeholder="Enter alt text here..." onChange={(e) => handleComponentChange('alt', e.target.value)} />
                                        </div>
                                    </div>
                                )}

                                <div className="pt-4 border-t border-gray-100 dark:border-zinc-800">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Spacing & Style</h4>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-2">Vertical Padding</label>
                                        <input type="range" min="0" max="24" step="1" className="w-full h-1.5 bg-gray-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-600" value={component.props.paddingY || '4'} onChange={(e) => handleComponentChange('paddingY', e.target.value)} />
                                        <div className="text-right text-[10px] font-mono text-gray-400 mt-1">{component.props.paddingY || 4} units</div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            /* Document Fields (Page Data) */
                            <div className="space-y-6">
                                <div className="bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-100 dark:border-blue-900/30">
                                    <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Active Template</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{template?.name || 'Standard'}</p>
                                </div>

                                {seoReports[activePageId] && (
                                    <div className={`p-3 rounded-lg border flex items-center justify-between ${seoReports[activePageId].seoScore === 'good' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-amber-50 border-amber-100 text-amber-700'}`}>
                                        <div className="flex items-center gap-2">
                                            {seoReports[activePageId].seoScore === 'good' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                                            <span className="text-xs font-bold uppercase tracking-tight">SEO Score: {seoReports[activePageId].seoScore}</span>
                                        </div>
                                        <button onClick={() => runSeoAudit(activePageId)} className="text-[10px] font-bold underline hover:no-underline">Re-run Audit</button>
                                    </div>
                                )}

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
                                                    <input type="text" className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-transparent text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={pageData[field.id] || ''} onChange={(e) => handlePageDataChange(field.id, e.target.value)} placeholder={`Enter ${field.label.toLowerCase()}...`} />
                                                )}
                                                {field.type === 'select' && (
                                                    <select className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-transparent text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={pageData[field.id] || ''} onChange={(e) => handlePageDataChange(field.id, e.target.value)}>
                                                        <option value="">Select...</option>
                                                        {field.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                                    </select>
                                                )}
                                                {field.type === 'date' && (
                                                    <input type="date" className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-transparent text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={pageData[field.id] || ''} onChange={(e) => handlePageDataChange(field.id, e.target.value)} />
                                                )}
                                                {field.type === 'boolean' && (
                                                    <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-lg cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-zinc-700 transition-all">
                                                        <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" checked={!!pageData[field.id]} onChange={(e) => handlePageDataChange(field.id, e.target.checked)} />
                                                        <span className="text-sm text-gray-600 dark:text-gray-300">{field.label}</span>
                                                    </label>
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
                        )}
                    </>
                )}
            </div>

            {showMediaManager && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] overflow-hidden border border-gray-100 dark:border-zinc-800 flex flex-col relative">
                        <button onClick={() => setShowMediaManager(false)} className="absolute top-4 right-4 z-10 p-2 bg-white/10 text-white rounded-full hover:bg-white/20"><X size={20} /></button>
                        <MediaManager onSelect={handleMediaSelect} onClose={() => setShowMediaManager(false)} />
                    </div>
                </div>
            )}

            <div className="p-4 bg-gray-50 dark:bg-zinc-900/80 border-t border-gray-200 dark:border-zinc-800">
                <p className="text-[10px] text-gray-500 italic text-center">Data is autosaved as draft.</p>
            </div>
        </div>
    );
}

