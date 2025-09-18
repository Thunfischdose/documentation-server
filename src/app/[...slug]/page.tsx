export const dynamic = "force-static";
export const revalidate = false;
export const dynamicParams = false;

import type { Metadata } from "next";

import { MDXRenderer, renderMdx } from "@/components/mdx-renderer";
import { getAllDocSlugs, getSeoMetadata } from "@/lib/mdx";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

type PageParams = {
  slug: string[];
};

type PageProps = {
  params: Promise<PageParams>;
};

function buildCanonicalUrl(slug: string[]): string {
  const path = slug.length ? `/${slug.join("/")}` : "/";
  return new URL(path, BASE_URL).toString();
}

export async function generateStaticParams(): Promise<PageParams[]> {
  const slugs = await getAllDocSlugs();
  return slugs
    .filter((segments) => segments.join("/") !== "home")
    .map((segments) => ({ slug: segments }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const [mdxResult, seo] = await Promise.all([
    renderMdx(slug),
    getSeoMetadata(slug),
  ]);

  const frontmatter = mdxResult.frontmatter as Record<string, unknown>;
  const fallbackTitle = slug.length ? slug[slug.length - 1] : "Documentation";
  const mdxTitle = typeof frontmatter.title === "string" ? frontmatter.title : undefined;
  const mdxDescription = typeof frontmatter.description === "string" ? frontmatter.description : undefined;
  const rawKeywords = frontmatter.keywords;
  const mdxKeywords = Array.isArray(rawKeywords) ? rawKeywords.map((value) => String(value)) : undefined;

  const title = seo?.seoTitle ?? mdxTitle ?? `${fallbackTitle} | MyCompany Documentation`;
  const description = mdxDescription ?? seo?.seoDescription;
  const keywords = mdxKeywords ?? seo?.seoKeywords;
  const canonical = buildCanonicalUrl(slug);

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical,
    },
    openGraph: {
      type: "article",
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

export default async function DocPage({ params }: PageProps) {
  const { slug } = await params;

  return (
    <main className="space-y-10">
      <MDXRenderer slug={slug} />
    </main>
  );
}


