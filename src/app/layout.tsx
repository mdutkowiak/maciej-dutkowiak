import type { Metadata } from "next";
import "./globals.css";
import ClientProviders from "@/components/ClientProviders";

export const metadata: Metadata = {
  title: "LaQ CMS - Headless Content Management",
  description: "Next-gen headless CMS for modern web projects.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-white dark:bg-black" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
