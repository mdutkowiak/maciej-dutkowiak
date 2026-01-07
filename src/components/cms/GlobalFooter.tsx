'use client';

import React from 'react';
import Link from 'next/link';
import { useSiteStore } from '@/store/useSiteStore';
import { Facebook, Instagram, Twitter, Youtube, Linkedin, Github } from 'lucide-react';

const SOCIAL_ICONS: Record<string, any> = {
    facebook: Facebook,
    instagram: Instagram,
    twitter: Twitter,
    youtube: Youtube,
    linkedin: Linkedin,
    github: Github,
};

export default function GlobalFooter() {
    const { siteSettings } = useSiteStore();

    if (!siteSettings) return null;

    const { footer } = siteSettings;

    return (
        <footer
            className="py-12 mt-20"
            style={{ backgroundColor: footer.bgColor, color: footer.textColor }}
        >
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand/About */}
                    <div>
                        <span className="font-bold text-2xl tracking-tight mb-4 block">
                            LaQ CMS
                        </span>
                        <p className="opacity-60 text-sm leading-relaxed max-w-xs">
                            Empowering creators with a flexible, high-performance headless CMS solution built on Next.js and Supabase.
                        </p>
                    </div>

                    {/* Dynamic Sections */}
                    {footer.sections.map((section) => (
                        <div key={section.id}>
                            <h3 className="font-bold text-sm uppercase tracking-widest mb-6 opacity-40">
                                {section.title}
                            </h3>
                            <ul className="flex flex-col gap-3">
                                {section.links.map((link) => (
                                    <li key={link.id}>
                                        <Link
                                            href={link.href}
                                            className="text-sm hover:opacity-60 transition-opacity"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {/* Connect/Socials */}
                    <div>
                        <h3 className="font-bold text-sm uppercase tracking-widest mb-6 opacity-40">
                            Connect
                        </h3>
                        <div className="flex gap-4">
                            {footer.socialLinks.map((social, idx) => {
                                const Icon = SOCIAL_ICONS[social.platform.toLowerCase()] || Twitter;
                                return (
                                    <a
                                        key={idx}
                                        href={social.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 rounded-full border border-current hover:bg-current hover:text-black transition-all"
                                        style={{ borderColor: footer.textColor + '33' }}
                                    >
                                        <Icon size={18} />
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div
                    className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-xs opacity-40"
                    style={{ borderColor: footer.textColor + '11' }}
                >
                    <p>{footer.copyright}</p>
                    <div className="flex gap-6">
                        <Link href="/privacy">Privacy Policy</Link>
                        <Link href="/terms">Terms of Service</Link>
                        <Link href="/sitemap">Sitemap</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
