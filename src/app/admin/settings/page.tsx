'use client';

import React, { useState, useEffect } from 'react';
import { useSiteStore } from '@/store/useSiteStore';
import { Save, Layout, Palette, Globe, Info, Plus, Trash2 } from 'lucide-react';

export default function GlobalSettingsPage() {
    const { siteSettings, updateSiteSettings, isLoading } = useSiteStore();
    const [localSettings, setLocalSettings] = useState(siteSettings);
    const [activeTab, setActiveTab] = useState<'header' | 'footer' | 'theme'>('header');
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

    useEffect(() => {
        if (siteSettings && !localSettings) {
            setLocalSettings(siteSettings);
        }
    }, [siteSettings]);

    const handleSave = async () => {
        if (!localSettings) return;
        setSaveStatus('saving');
        await updateSiteSettings(localSettings);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 3000);
    };

    if (!localSettings) {
        return (
            <div className="p-8 text-center text-gray-500">
                Loading site settings...
            </div>
        );
    }

    return (
        <div className="p-8 max-w-5xl mx-auto pb-24">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Global Site Settings</h1>
                    <p className="text-gray-500">Manage your header, footer, and global design tokens.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saveStatus === 'saving'}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all shadow-sm ${saveStatus === 'saved' ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                >
                    {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : (
                        <>
                            <Save size={18} />
                            Save Changes
                        </>
                    )}
                </button>
            </div>

            <div className="flex gap-1 border-b border-gray-200 dark:border-zinc-800 mb-8">
                <button
                    onClick={() => setActiveTab('header')}
                    className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'header' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-900'
                        }`}
                >
                    Header
                </button>
                <button
                    onClick={() => setActiveTab('footer')}
                    className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'footer' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-900'
                        }`}
                >
                    Footer
                </button>
                <button
                    onClick={() => setActiveTab('theme')}
                    className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'theme' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-900'
                        }`}
                >
                    Global Theme
                </button>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                {activeTab === 'header' && (
                    <div className="p-8 space-y-8 animate-in fade-in duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <section className="space-y-4">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <Palette size={20} className="text-blue-600" />
                                    Styling
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Background Color</label>
                                        <input
                                            type="color"
                                            value={localSettings.header.bgColor}
                                            onChange={(e) => setLocalSettings({ ...localSettings, header: { ...localSettings.header, bgColor: e.target.value } })}
                                            className="w-full h-10 rounded-md cursor-pointer"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Text Color</label>
                                        <input
                                            type="color"
                                            value={localSettings.header.textColor}
                                            onChange={(e) => setLocalSettings({ ...localSettings, header: { ...localSettings.header, textColor: e.target.value } })}
                                            className="w-full h-10 rounded-md cursor-pointer"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Accent Color</label>
                                        <input
                                            type="color"
                                            value={localSettings.header.accentColor}
                                            onChange={(e) => setLocalSettings({ ...localSettings, header: { ...localSettings.header, accentColor: e.target.value } })}
                                            className="w-full h-10 rounded-md cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-4">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <Info size={20} className="text-blue-600" />
                                    Content
                                </h3>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Logo URL</label>
                                    <input
                                        type="text"
                                        value={localSettings.header.logoUrl}
                                        onChange={(e) => setLocalSettings({ ...localSettings, header: { ...localSettings.header, logoUrl: e.target.value } })}
                                        placeholder="https://example.com/logo.png"
                                        className="w-full bg-gray-50 dark:bg-zinc-800 border-none rounded-lg p-3 text-sm"
                                    />
                                </div>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="showSearch"
                                        checked={localSettings.header.showSearch}
                                        onChange={(e) => setLocalSettings({ ...localSettings, header: { ...localSettings.header, showSearch: e.target.checked } })}
                                        className="w-4 h-4 rounded text-blue-600"
                                    />
                                    <label htmlFor="showSearch" className="text-sm font-medium">Show Search Bar</label>
                                </div>
                            </section>
                        </div>

                        <section className="border-t border-gray-100 dark:border-zinc-800 pt-8">
                            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                                <Layout size={20} className="text-blue-600" />
                                Navigation Menu
                            </h3>
                            <p className="text-sm text-gray-400 mb-4 italic">Menu builder is coming soon. Currently using top-level sitemap items.</p>
                            {/* Menu Builder will go here */}
                        </section>
                    </div>
                )}

                {activeTab === 'footer' && (
                    <div className="p-8 space-y-8 animate-in fade-in duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <section className="space-y-4">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <Palette size={20} className="text-blue-600" />
                                    Styling
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Background Color</label>
                                        <input
                                            type="color"
                                            value={localSettings.footer.bgColor}
                                            onChange={(e) => setLocalSettings({ ...localSettings, footer: { ...localSettings.footer, bgColor: e.target.value } })}
                                            className="w-full h-10 rounded-md cursor-pointer"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Text Color</label>
                                        <input
                                            type="color"
                                            value={localSettings.footer.textColor}
                                            onChange={(e) => setLocalSettings({ ...localSettings, footer: { ...localSettings.footer, textColor: e.target.value } })}
                                            className="w-full h-10 rounded-md cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-4">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <Globe size={20} className="text-blue-600" />
                                    Details
                                </h3>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Copyright Notice</label>
                                    <input
                                        type="text"
                                        value={localSettings.footer.copyright}
                                        onChange={(e) => setLocalSettings({ ...localSettings, footer: { ...localSettings.footer, copyright: e.target.value } })}
                                        className="w-full bg-gray-50 dark:bg-zinc-800 border-none rounded-lg p-3 text-sm"
                                    />
                                </div>
                            </section>
                        </div>

                        <section className="border-t border-gray-100 dark:border-zinc-800 pt-8">
                            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                                Share Icon Links
                            </h3>
                            <p className="text-sm text-gray-400 italic">Social links editor coming soon.</p>
                        </section>
                    </div>
                )}

                {activeTab === 'theme' && (
                    <div className="p-8 space-y-8 animate-in fade-in duration-300">
                        <div className="max-w-md">
                            <h3 className="font-bold text-lg mb-6">Global Design Tokens</h3>
                            <p className="text-sm text-gray-500 mb-8">Set the overall look and feel for your entire website. These tokens apply to all pages.</p>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Primary Brand Color</label>
                                    <div className="flex gap-4 items-center">
                                        <input
                                            type="color"
                                            className="w-12 h-12 rounded-lg cursor-pointer flex-shrink-0"
                                        />
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                placeholder="#2563eb"
                                                className="w-full bg-gray-50 dark:bg-zinc-800 border-none rounded-lg p-3 text-sm font-mono"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Border Radius</label>
                                    <select className="w-full bg-gray-50 dark:bg-zinc-800 border-none rounded-lg p-3 text-sm outline-none">
                                        <option value="none">Sharp (0px)</option>
                                        <option value="sm">Small (4px)</option>
                                        <option value="md">Medium (8px)</option>
                                        <option value="lg">Large (12px)</option>
                                        <option value="full">Round</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
