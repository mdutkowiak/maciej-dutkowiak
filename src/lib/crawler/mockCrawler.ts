import { ScanResult, SEOPageReport } from '@/store/types';

// Mock function to simulate crawling a page for SEO checks
export async function mockCrawlPage(slug: string): Promise<SEOPageReport> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const isHealthy = Math.random() > 0.3;

    return {
        pageId: Math.random().toString(36).substr(2, 9),
        path: slug,
        slug: slug,
        seoScore: isHealthy ? 'good' : (Math.random() > 0.5 ? 'warning' : 'critical'),
        missingTags: isHealthy ? [] : ['meta-description', 'h1'].filter(() => Math.random() > 0.5),
        brokenLinks: isHealthy ? 0 : Math.floor(Math.random() * 5),
        missingAltCount: isHealthy ? 0 : Math.floor(Math.random() * 3),
        securityIssues: isHealthy ? 0 : (Math.random() > 0.8 ? 1 : 0),
    };
}

// Mock Link Checker
export async function checkLinkStatus(url: string): Promise<ScanResult> {
    // Real implementation would use fetch(url, { method: 'HEAD' })
    return {
        url,
        status: Math.random() > 0.1 ? 200 : 404, // 10% chance of 404
        checkedAt: new Date().toISOString()
    };
}
