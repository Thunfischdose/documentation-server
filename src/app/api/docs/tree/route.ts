export const dynamic = "force-static";
export const revalidate = false;

import { NextRequest, NextResponse } from "next/server";

import { getChildNodes } from "@/lib/mdx";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const slugParam = url.searchParams.get("slug");
    const slug = slugParam
      ? slugParam
          .split("/")
          .map((segment) => segment.trim())
          .filter(Boolean)
      : [];

    const items = await getChildNodes(slug);
    return NextResponse.json({ items });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load documentation tree";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

