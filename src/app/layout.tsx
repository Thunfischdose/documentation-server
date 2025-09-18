import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import Image from "next/image";
import NavigationMenu from "@/components/navigation-menu";
import { getDocsIndex } from "@/lib/mdx";
import { theme, themeToCssVariables } from "@/theme";
import "./globals.css";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "MyCompany Documentation",
    template: "%s | MyCompany Documentation",
  },
  description: "Browse and compose MyCompany product documentation authored in MDX.",
  openGraph: {
    siteName: "MyCompany Documentation",
    type: "website",
    url: BASE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "MyCompany Documentation",
    description: "Browse and compose MyCompany product documentation authored in MDX.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const docs = await getDocsIndex();
  const themeVariables = themeToCssVariables(theme);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-white text-neutral-900 antialiased dark:bg-neutral-950 dark:text-neutral-100`}
        style={themeVariables as CSSProperties}
      >
        <header className="flex items-center justify-between border-b border-neutral-200 bg-white/80 px-4 py-3 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80">
          <div className="flex items-center gap-3">
            <Image src="/logo.svg" alt="MyCompany" width={128} height={32} priority />
            <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Documentation</span>
          </div>
        </header>
        <NavigationMenu docs={docs} />
        <div className="mx-auto w-full max-w-5xl px-4 py-10 md:px-6">{children}</div>
      </body>
    </html>
  );
}



