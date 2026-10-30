import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OmniSync | Universal Social Media Cross-Poster & Sync Engine",
  description: "Save social profile links, preview cross-post routes, and explore duplicate-loop protection in a local demo.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- App Router root layout shares these fonts across every route. */}
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Fira+Code:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
