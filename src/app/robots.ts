import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const DISALLOW_EXPORTS = process.env.NEXT_PUBLIC_ROBOTS_DISALLOW ?? "";

export const dynamic = "force-static";
export const revalidate = false;

function buildDisallowList(): string[] {
  if (!DISALLOW_EXPORTS) {
    return [];
  }

  return DISALLOW_EXPORTS.split(",").map((segment) => segment.trim()).filter(Boolean);
}

export default function robots(): MetadataRoute.Robots {
  const disallow = buildDisallowList();

  return {
    rules: {
      userAgent: "*",
      allow: ["/"],
      disallow,
    },
    sitemap: [
      new URL("/sitemap.xml", BASE_URL).toString(),
      new URL("/image-sitemap.xml", BASE_URL).toString(),
    ],
  };
}
