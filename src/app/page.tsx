export const dynamic = "force-static";
export const revalidate = false;

import type { Metadata } from "next";

import { MDXRenderer, renderMdx } from "@/components/mdx-renderer";
import { getSeoMetadata } from "@/lib/mdx";

const HOME_SLUG = ["home"];
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

function buildCanonicalUrl(): string {
  return new URL("/", BASE_URL).toString();
}

export async function generateMetadata(): Promise<Metadata> {
  const [mdxResult, seo] = await Promise.all([
    renderMdx(HOME_SLUG),
    getSeoMetadata(HOME_SLUG),
  ]);

  const frontmatter = mdxResult.frontmatter as Record<string, unknown>;
  const mdxTitle = typeof frontmatter.title === "string" ? frontmatter.title : undefined;
  const mdxDescription = typeof frontmatter.description === "string" ? frontmatter.description : undefined;
  const rawKeywords = frontmatter.keywords;
  const mdxKeywords = Array.isArray(rawKeywords) ? rawKeywords.map((value) => String(value)) : undefined;

  const title = seo?.seoTitle ?? mdxTitle ?? "MyCompany Documentation";
  const description = mdxDescription ?? seo?.seoDescription;
  const keywords = mdxKeywords ?? seo?.seoKeywords;
  const canonical = buildCanonicalUrl();

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical,
    },
    openGraph: {
      type: "website",
      url: canonical,
      title,
      description,
      siteName: "MyCompany Documentation",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function HomePage() {
  return (
    <main className="space-y-10">
      <MDXRenderer slug={HOME_SLUG} />
    </main>
  );
}


