export const dynamic = "force-static";
export const revalidate = false;

import type { MetadataRoute } from "next";

import { getAllDocSlugs } from "@/lib/mdx";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const DEFAULT_PRIORITY = 0.6;

function buildUrl(slug: string[]): string {
  if (slug.length === 1 && slug[0] === "home") {
    return BASE_URL;
  }

  return `${BASE_URL}/${slug.join("/")}`;
}

function getPriorityForSlug(slug: string[]): number {
  if (slug.length === 0) {
    return 1.0;
  }

  if (slug.length === 1) {
    return 0.8;
  }

  return DEFAULT_PRIORITY;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getAllDocSlugs();
  const uniqueSlugs = new Set<string>(slugs.map((segments) => segments.join("/")));

  uniqueSlugs.add("home");

  return Array.from(uniqueSlugs).map((joinedSlug) => {
    const segments = joinedSlug.split("/").filter(Boolean);
    const url = buildUrl(segments);

    return {
      url,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: getPriorityForSlug(segments),
    } satisfies MetadataRoute.Sitemap[number];
  });
}


