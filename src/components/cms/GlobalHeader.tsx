'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSiteStore } from '@/store/useSiteStore';
import { Search, Menu, X, ChevronDown } from 'lucide-react';

export default function GlobalHeader() {
    const { siteSettings, sitemap } = useSiteStore();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    if (!siteSettings) return null;

    const { header } = siteSettings;

    return (
        <header
            className="sticky top-0 z-50 w-full border-b backdrop-blur-md transition-all duration-300"
            style={{
                backgroundColor: header.bgColor + 'EE', // Semi-transparent
                color: header.textColor,
                borderColor: header.accentColor + '33' // Subtle accent color for border
            }}
        >
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    {header.logoUrl ? (
                        <img src={header.logoUrl} alt="Logo" className="h-8 w-auto object-contain" />
                    ) : (
                        <span className="font-bold text-xl tracking-tight" style={{ color: header.accentColor }}>
                            LaQ <span style={{ color: header.textColor }}>CMS</span>
                        </span>
                    )}
                </Link>

                {/* Desktop Menu */}
                <nav className="hidden md:flex items-center gap-8">
                    {header.menuItems.length > 0 ? (
                        header.menuItems.map((item) => (
                            <div key={item.id} className="relative group">
                                <Link
                                    href={item.href}
                                    className="flex items-center gap-1 text-sm font-medium hover:opacity-70 transition-opacity"
                                >
                                    {item.label}
                                    {item.children && item.children.length > 0 && <ChevronDown size={14} />}
                                </Link>

                                {/* Desktop Dropdown (Submenu) */}
                                {item.children && item.children.length > 0 && (
                                    <div className="absolute top-full left-0 pt-2 opacity-0 translate-y-2 invisible group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible transition-all duration-200">
                                        <div
                                            className="min-w-[200px] rounded-lg shadow-xl border p-2"
                                            style={{ backgroundColor: header.bgColor, borderColor: header.accentColor + '22' }}
                                        >
                                            {item.children.map((child) => (
                                                <Link
                                                    key={child.id}
                                                    href={child.href}
                                                    className="block px-4 py-2 text-sm rounded-md hover:bg-black/5 transition-colors"
                                                >
                                                    {child.label}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        // Fallback to top-level sitemap if no menu items defined
                        sitemap.filter(n => n.slug !== '/').slice(0, 5).map(node => (
                            <Link key={node.id} href={node.slug} className="text-sm font-medium hover:opacity-70">
                                {node.title}
                            </Link>
                        ))
                    )}
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    {header.showSearch && (
                        <button
                            className="p-2 rounded-full hover:bg-black/5 transition-colors"
                            aria-label="Search"
                        >
                            <Search size={20} />
                        </button>
                    )}

                    <button
                        className="md:hidden p-2"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div
                    className="md:hidden border-t animate-in slide-in-from-top duration-300"
                    style={{ backgroundColor: header.bgColor }}
                >
                    <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
                        {header.menuItems.map((item) => (
                            <div key={item.id}>
                                <Link
                                    href={item.href}
                                    className="text-lg font-semibold"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {item.label}
                                </Link>
                                {item.children && (
                                    <div className="mt-2 ml-4 flex flex-col gap-2">
                                        {item.children.map(child => (
                                            <Link
                                                key={child.id}
                                                href={child.href}
                                                className="text-gray-500"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                {child.label}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </header>
    );
}
