# Pro-Portfolio Suite (Headless CMS)

A modern, high-performance Headless CMS built with Next.js, tailored for portfolio management and content flexibility.

## Features

-   **Drag & Drop Editor**: Visual builder with components like Hero Cover, Rich Text, and Grid Systems (powered by @dnd-kit).
-   **Structured Content**: Hierarchical sitemap tree with custom page templates.
-   **SEO First**: Built-in SEO Auditor for checking 404 links, H1 tags, and Alt descriptions.
-   **Device Preview**: Real-time responsive preview (Mobile, Tablet, Desktop).
-   **Performance**: Integrated Cache Manager for ISR (Incremental Static Regeneration) control.

## Tech Stack

-   **Framework**: Next.js 15 (App Router)
-   **Styling**: Tailwind CSS
-   **Icons**: Lucide React
-   **State/Logic**: TypeScript, @dnd-kit

## Getting Started

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/YOUR_USERNAME/pro-portfolio-suite.git
    cd pro-portfolio-suite
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Run the development server**:
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) to view the application.

## Admin Panel

Access the various tools via the source code (currently located at):
-   **SEO Report**: `src/app/admin/seo-report`
-   **Cache Manager**: `src/app/admin/cache`
