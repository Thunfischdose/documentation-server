export const dynamic = "force-static";
export const revalidate = false;

import type { MetadataRoute } from "next";

import { getAllDocSlugs } from "@/lib/mdx";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

function buildAssets(slug: string[]): { url: string; title?: string }[] {
  const segments = slug.join("/");

  if (segments === "product1/product1") {
    return [
      {
        url: new URL("/assets/product1/product1/control-plane-overview.svg", BASE_URL).toString(),
        title: "Product 1 Control Plane Overview",
      },
    ];
  }

  if (segments === "product2/user-guide") {
    return [
      {
        url: new URL("/assets/product2/user-guide/automation-timeline.svg", BASE_URL).toString(),
        title: "Product 2 Automation Timeline",
      },
    ];
  }

  return [];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getAllDocSlugs();

  return slugs.flatMap((segments) => {
    const pageUrl = new URL(`/${segments.join("/")}`, BASE_URL).toString();
    const images = buildAssets(segments);

    return [
      {
        url: pageUrl,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.5,
        images: images.length
          ? images.map((image) => ({ url: image.url, title: image.title }))
          : undefined,
      },
    ];
  });
}


