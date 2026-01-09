'use client';

import React, { useState, useEffect } from 'react';
import {
    Upload,
    X,
    Check,
    Loader2,
    Trash2,
    FolderPlus,
    Folder,
    ChevronRight,
    Search,
    LayoutGrid,
    List,
    MoreVertical,
    ArrowLeft,
    Inbox
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { MediaFolder, Asset } from '@/store/types';

interface MediaManagerProps {
    onSelect?: (url: string) => void;
    onClose?: () => void;
    embedded?: boolean;
}

export default function MediaManager({ onSelect, onClose, embedded = false }: MediaManagerProps) {
    const [folders, setFolders] = useState<MediaFolder[]>([]);
    const [assets, setAssets] = useState<Asset[]>([]);
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showRecycleBin, setShowRecycleBin] = useState(false);

    useEffect(() => {
        fetchData();
    }, [currentFolderId, showRecycleBin]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Fetch Folders
            if (!showRecycleBin) {
                const { data: folderData } = await supabase
                    .from('media_folders')
                    .select('*')
                    .eq('parent_id', currentFolderId || null);

                if (folderData) setFolders(folderData.map((f: any) => ({
                    id: f.id,
                    name: f.name,
                    parentId: f.parent_id,
                    createdAt: f.created_at
                })));
            }

            // Fetch Assets
            let query = supabase
                .from('assets')
                .select('*')
                .eq('is_deleted', showRecycleBin);

            if (!showRecycleBin) {
                query = query.eq('folder_id', currentFolderId || null);
            }

            const { data: assetData } = await query;

            if (assetData) setAssets(assetData.map((a: any) => ({
                id: a.id,
                name: a.name,
                fileUrl: a.file_url,
                fileType: a.file_type,
                sizeBytes: a.size_bytes,
                folderId: a.folder_id,
                isDeleted: a.is_deleted,
                createdAt: a.created_at,
                metadata: a.metadata || {}
            })));

        } catch (e) {
            console.error('Error fetching media:', e);
        }
        setIsLoading(false);
    };

    const handleCreateFolder = async () => {
        const name = prompt('Folder name:');
        if (!name) return;

        try {
            await supabase.from('media_folders').insert({
                name,
                parent_id: currentFolderId
            });
            fetchData();
        } catch (e) {
            console.error('Failed to create folder:', e);
        }
    };

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
            const { data: uploadData, error: uploadError } = await supabase.storage.from('media').upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(fileName);

            // Create asset record
            await supabase.from('assets').insert({
                name: file.name,
                file_url: publicUrl,
                file_type: file.type,
                size_bytes: file.size,
                folder_id: currentFolderId
            });

            await fetchData();
        } catch (e: any) {
            console.error('Upload failed:', e);
            const msg = e.message || 'Unknown error';
            if (msg.toLowerCase().includes('bucket')) {
                alert(`Upload failed: Storage bucket 'media' not found. Please create it in Supabase Storage.`);
            } else {
                alert(`Upload failed: ${msg}. Check if 'assets' table exists and RLS policies are set.`);
            }
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteAsset = async (e: React.MouseEvent, asset: Asset) => {
        e.stopPropagation();
        const msg = showRecycleBin ? 'Permanently delete this file?' : 'Move to Recycle Bin?';
        if (!confirm(msg)) return;

        try {
            if (showRecycleBin) {
                // Real delete from storage and DB
                const fileName = asset.fileUrl.split('/').pop();
                if (fileName) await supabase.storage.from('media').remove([fileName]);
                await supabase.from('assets').delete().eq('id', asset.id);
            } else {
                // Soft delete
                await supabase.from('assets').update({ is_deleted: true }).eq('id', asset.id);
            }
            fetchData();
        } catch (e) {
            console.error('Delete failed:', e);
        }
    };

    const handleConfirm = () => {
        if (selectedId && onSelect) {
            const item = assets.find(a => a.id === selectedId);
            if (item) onSelect(item.fileUrl);
        }
        if (onClose) onClose();
    };

    const filteredAssets = assets.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const containerStyle = embedded
        ? "flex flex-col h-full bg-white dark:bg-zinc-900 border border-transparent"
        : "fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-8";

    return (
        <div className={containerStyle}>
            <div className={embedded ? "flex-1 flex flex-col overflow-hidden" : "bg-white dark:bg-zinc-900 w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl flex flex-col border border-gray-200 dark:border-zinc-800 overflow-hidden"}>

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 z-10">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Media Library</h2>
                            {showRecycleBin && <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] uppercase font-bold rounded">Recycle Bin</span>}
                        </div>

                        <div className="h-6 w-px bg-gray-200 dark:bg-zinc-800" />

                        <div className="flex items-center gap-1 text-sm">
                            <button
                                onClick={() => { setCurrentFolderId(null); setShowRecycleBin(false); }}
                                className="text-gray-500 hover:text-blue-600"
                            >
                                Root
                            </button>
                            {/* Breadcrumbs could go here */}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search media..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 pr-4 py-1.5 bg-gray-100 dark:bg-zinc-800 border-none rounded-full text-sm focus:ring-2 focus:ring-blue-500 w-48 md:w-64"
                            />
                        </div>
                        <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex items-center justify-between px-6 py-3 bg-gray-50 dark:bg-zinc-950 border-b border-gray-200 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                        {!showRecycleBin ? (
                            <>
                                <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer text-sm font-medium transition-colors shadow-sm">
                                    <Upload size={16} />
                                    <span>Upload</span>
                                    <input type="file" className="hidden" onChange={handleUpload} disabled={isUploading} />
                                </label>
                                <button
                                    onClick={handleCreateFolder}
                                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-700 text-sm font-medium transition-colors"
                                >
                                    <FolderPlus size={16} />
                                    <span>New Folder</span>
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setShowRecycleBin(false)}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400"
                            >
                                <ArrowLeft size={16} />
                                Back to Library
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-1 bg-gray-200 dark:bg-zinc-800 p-1 rounded-lg">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-zinc-700 shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <LayoutGrid size={16} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-zinc-700 shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <List size={16} />
                        </button>
                    </div>
                </div>

                {/* Main Viewport */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Sidebar navigation */}
                    <div className="w-56 border-r border-gray-200 dark:border-zinc-800 p-4 space-y-6 hidden md:block overflow-y-auto">
                        <div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Library</div>
                            <nav className="space-y-1">
                                <button
                                    onClick={() => { setShowRecycleBin(false); setCurrentFolderId(null); }}
                                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${!showRecycleBin && !currentFolderId ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800'}`}
                                >
                                    <Inbox size={16} />
                                    <span>All Media</span>
                                </button>
                                <button
                                    onClick={() => setShowRecycleBin(true)}
                                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${showRecycleBin ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/10'}`}
                                >
                                    <Trash2 size={16} />
                                    <span>Recycle Bin</span>
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 dark:bg-zinc-950/50">
                        {isLoading ? (
                            <div className="flex h-full items-center justify-center">
                                <Loader2 className="animate-spin text-blue-500" size={32} />
                            </div>
                        ) : (
                            <div className={viewMode === 'grid' ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" : "flex flex-col gap-2"}>
                                {/* Folders */}
                                {!showRecycleBin && folders.map(folder => (
                                    <div
                                        key={folder.id}
                                        onClick={() => setCurrentFolderId(folder.id)}
                                        className={viewMode === 'grid'
                                            ? "aspect-[4/3] bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:shadow-md transition-all group p-4"
                                            : "flex items-center gap-3 px-4 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg cursor-pointer hover:border-blue-500 transition-all"
                                        }
                                    >
                                        <div className={viewMode === 'grid' ? "p-3 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-500 group-hover:bg-amber-100 transition-colors mb-2" : "text-amber-500"}>
                                            <Folder size={viewMode === 'grid' ? 28 : 20} fill="currentColor" fillOpacity={0.2} />
                                        </div>
                                        <span className={`font-medium text-gray-700 dark:text-gray-300 truncate w-full text-center ${viewMode === 'list' ? 'text-left' : ''}`}>
                                            {folder.name}
                                        </span>
                                    </div>
                                ))}

                                {/* Upload Placeholder */}
                                {!showRecycleBin && viewMode === 'grid' && (
                                    <label className="aspect-[4/3] border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors group relative">
                                        <input type="file" className="hidden" onChange={handleUpload} disabled={isUploading} />
                                        {isUploading ? <Loader2 className="animate-spin text-blue-500" /> : (
                                            <>
                                                <Upload size={24} className="text-gray-400 group-hover:text-blue-500" />
                                                <span className="mt-2 text-xs text-gray-400 group-hover:text-blue-500 font-medium">Drop file here</span>
                                            </>
                                        )}
                                    </label>
                                )}

                                {/* Assets */}
                                {filteredAssets.map(asset => (
                                    <div
                                        key={asset.id}
                                        onClick={() => setSelectedId(asset.id)}
                                        className={viewMode === 'grid'
                                            ? `relative aspect-[4/3] group cursor-pointer rounded-xl overflow-hidden border-2 transition-all shadow-sm ${selectedId === asset.id ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-white dark:border-zinc-800'}`
                                            : `flex items-center gap-4 px-4 py-2 bg-white dark:bg-zinc-900 border rounded-lg cursor-pointer transition-all ${selectedId === asset.id ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10' : 'border-gray-200 dark:border-zinc-800 hover:border-blue-500'}`
                                        }
                                    >
                                        {viewMode === 'grid' ? (
                                            <>
                                                <img src={asset.fileUrl} alt={asset.name} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

                                                {selectedId === asset.id && (
                                                    <div className="absolute top-2 left-2 bg-blue-500 text-white p-1 rounded-full shadow-lg z-10 scale-110">
                                                        <Check size={12} />
                                                    </div>
                                                )}

                                                <button
                                                    onClick={(e) => handleDeleteAsset(e, asset)}
                                                    className={`absolute top-2 right-2 p-1.5 bg-white/90 dark:bg-zinc-800/90 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 text-gray-600 hover:text-red-600 transition-all z-20 shadow-sm`}
                                                >
                                                    <Trash2 size={14} />
                                                </button>

                                                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white text-[10px] opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                                                    <div className="truncate">{asset.name}</div>
                                                    <div className="text-white/60">{(asset.sizeBytes / 1024).toFixed(1)} KB</div>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-10 h-10 rounded bg-gray-100 dark:bg-zinc-800 flex-shrink-0">
                                                    <img src={asset.fileUrl} alt="" className="w-full h-full object-cover rounded" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{asset.name}</div>
                                                    <div className="text-xs text-gray-500">{(asset.sizeBytes / 1024).toFixed(1)} KB • {asset.fileType}</div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {selectedId === asset.id && <Check size={16} className="text-blue-500" />}
                                                    <button
                                                        onClick={(e) => handleDeleteAsset(e, asset)}
                                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}

                                {filteredAssets.length === 0 && folders.length === 0 && !isLoading && (
                                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-400 gap-3">
                                        <Inbox size={48} strokeWidth={1} />
                                        <p className="text-sm">This folder is empty</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 px-6 border-t border-gray-200 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-zinc-900 rounded-b-2xl">
                    <div className="flex items-center gap-2">
                        {selectedId && (
                            <>
                                <div className="w-8 h-8 rounded border dark:border-zinc-700 overflow-hidden shrink-0">
                                    <img src={assets.find(a => a.id === selectedId)?.fileUrl} className="w-full h-full object-cover" alt="" />
                                </div>
                                <div className="text-xs">
                                    <div className="font-semibold text-gray-900 dark:text-gray-100 truncate max-w-[120px]">{assets.find(a => a.id === selectedId)?.name}</div>
                                    <div className="text-gray-500">Selected</div>
                                </div>
                            </>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={!selectedId}
                            className="px-6 py-2 text-sm font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/25 active:scale-95"
                        >
                            Select Media
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
