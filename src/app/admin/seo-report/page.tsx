'use client';

import { useEffect } from 'react';
import SEOReportTable from './SEOReportTable';
import { useSiteStore } from '@/store/useSiteStore';

export default function SEOReportPage() {
    const { seoReports, fetchAllSeoReports } = useSiteStore();

    useEffect(() => {
        fetchAllSeoReports();
    }, []);

    const reportsArray = Object.values(seoReports);

    return (
        <div className="p-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">SEO Audit</h1>
                <p className="text-gray-500 dark:text-gray-400">Review the health of your site pages.</p>
            </div>
            <SEOReportTable reports={reportsArray} />
        </div>
    );
}
