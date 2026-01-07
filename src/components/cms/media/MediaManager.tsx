'use client';

import React, { useState, useEffect } from 'react';
import { Upload, X, Check, Loader2, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface MediaItem {
    id: string; // File name as ID
    url: string;
    name: string;
    size?: number;
    type?: string;
}

interface MediaManagerProps {
    onSelect?: (url: string) => void;
    onClose?: () => void;
}

export default function MediaManager({ onSelect, onClose }: MediaManagerProps) {
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        fetchMedia();
    }, []);

    const fetchMedia = async () => {
        setIsLoading(true);
        const { data, error } = await supabase.storage.from('media').list();
        if (data) {
            const items = data.map(file => {
                // Get public URL
                const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(file.name);
                return {
                    id: file.name,
                    name: file.name,
                    url: publicUrl,
                    size: file.metadata?.size,
                    type: file.metadata?.mimetype
                };
            });
            setMedia(items);
        } else {
            console.error('Error loading media:', error);
        }
        setIsLoading(false);
    };

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
            const { error } = await supabase.storage.from('media').upload(fileName, file);

            if (error) throw error;
            await fetchMedia(); // Refresh list
        } catch (e) {
            console.error('Upload failed:', e);
            alert('Upload failed. Ensure you created a "media" bucket in Supabase Storage and set it to Public.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this file?')) return;

        await supabase.storage.from('media').remove([id]);
        setMedia(media.filter(m => m.id !== id));
        if (selectedId === id) setSelectedId(null);
    };

    const handleConfirm = () => {
        if (selectedId && onSelect) {
            const item = media.find(m => m.id === selectedId);
            if (item) onSelect(item.url);
        }
        if (onClose) onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 md:p-8">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-4xl h-[80vh] rounded-xl shadow-2xl flex flex-col border border-gray-200 dark:border-zinc-800">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-zinc-800">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Media Library</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                        <X size={24} />
                    </button>
                </div>

                {/* content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {isLoading ? (
                        <div className="flex h-full items-center justify-center">
                            <Loader2 className="animate-spin text-blue-500" size={32} />
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {/* Upload Button */}
                            <label className="aspect-[4/3] border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors group relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleUpload}
                                    disabled={isUploading}
                                />
                                {isUploading ? (
                                    <Loader2 className="animate-spin text-blue-500" />
                                ) : (
                                    <>
                                        <div className="p-3 bg-gray-100 dark:bg-zinc-800 rounded-full group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                                            <Upload size={24} className="text-gray-500 group-hover:text-blue-500" />
                                        </div>
                                        <span className="mt-2 text-sm text-gray-500 group-hover:text-blue-500 font-medium">Upload New</span>
                                    </>
                                )}
                            </label>

                            {/* Items */}
                            {media.map(item => (
                                <div
                                    key={item.id}
                                    onClick={() => setSelectedId(item.id)}
                                    className={`relative aspect-[4/3] group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${selectedId === item.id ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-transparent'}`}
                                >
                                    <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

                                    {selectedId === item.id && (
                                        <div className="absolute top-2 right-2 bg-blue-500 text-white p-1 rounded-full shadow-lg z-10">
                                            <Check size={12} />
                                        </div>
                                    )}

                                    <button
                                        onClick={(e) => handleDelete(e, item.id)}
                                        className="absolute bottom-2 right-2 p-1.5 bg-red-100 text-red-600 rounded-md opacity-0 group-hover:opacity-100 hover:bg-red-200 transition-all z-20"
                                        title="Delete"
                                    >
                                        <Trash2 size={14} />
                                    </button>

                                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity truncate">
                                        {item.name}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 dark:border-zinc-800 flex justify-between bg-gray-50 dark:bg-zinc-950 rounded-b-xl">
                    <div className="text-sm text-gray-500">
                        {selectedId ? '1 item selected' : 'No items selected'}
                    </div>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={!selectedId}
                            className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Insert Image
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
