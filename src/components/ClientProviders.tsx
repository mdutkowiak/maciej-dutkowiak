'use client';

import { useEffect } from 'react';
import { useSiteStore } from '@/store/useSiteStore';
import GlobalHeader from '@/components/cms/GlobalHeader';
import GlobalFooter from '@/components/cms/GlobalFooter';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
    const { initializeSite } = useSiteStore();

    useEffect(() => {
        initializeSite();
    }, [initializeSite]);

    return (
        <>
            <GlobalHeader />
            <div className="min-h-screen">
                {children}
            </div>
            <GlobalFooter />
        </>
    );
}
