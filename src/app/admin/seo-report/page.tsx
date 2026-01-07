import SEOReportTable from './SEOReportTable';

// Mock data for server component or client fetch
const mockReports = [
    { pageId: '1', path: '/', slug: '/', seoScore: 'good' as const, missingTags: [], brokenLinks: 0 },
    { pageId: '2', path: '/about', slug: '/about', seoScore: 'warning' as const, missingTags: ['meta-description'], brokenLinks: 1 },
];

export default function SEOReportPage() {
    return (
        <div className="p-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">SEO Audit</h1>
                <p className="text-gray-500 dark:text-gray-400">Review the health of your site pages.</p>
            </div>
            <SEOReportTable reports={mockReports} />
        </div>
    );
}
