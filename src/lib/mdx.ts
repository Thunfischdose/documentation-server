import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

function isErrnoException(error: unknown): error is NodeJS.ErrnoException {
  return typeof error === "object" && error !== null && "code" in error;
}


export type DocNode = {
  type: "file" | "directory";
  name: string;
  slug: string[];
  filePath: string;
  children?: DocNode[];
};

export type DocListItem = {
  type: "file" | "directory";
  name: string;
  slug: string[];
  hasChildren?: boolean;
  title?: string;
};

export type SeoMetadata = {
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
};

const CONTENT_EXTENSION = ".mdx";
const CONTENT_ROOT = path.join(process.cwd(), "content");

function assertSafeSlug(slug: string[]): void {
  if (!slug.length) {
    throw new Error("Slug must contain at least one segment");
  }

  for (const segment of slug) {
    if (!segment || segment.includes("..") || segment.includes("/") || segment.includes("\\")) {
      throw new Error(`Invalid slug segment: ${segment}`);
    }
  }
}

export function getContentRoot(): string {
  return CONTENT_ROOT;
}

async function readSeoMetadataFile(filePath: string): Promise<SeoMetadata | null> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as SeoMetadata;
  } catch (error) {
    if (isErrnoException(error) && error.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

export async function getSeoMetadata(slug: string[]): Promise<SeoMetadata | null> {
  const candidates: string[] = [];

  for (let index = slug.length; index >= 0; index -= 1) {
    const parts = slug.slice(0, index);
    const candidate = path.join(CONTENT_ROOT, ...parts, "seo.json");
    candidates.push(candidate);
  }

  const rootCandidate = path.join(CONTENT_ROOT, "seo.json");
  candidates.push(rootCandidate);

  for (const candidate of candidates) {
    const seo = await readSeoMetadataFile(candidate);
    if (seo) {
      return seo;
    }
  }

  return null;
}

export async function readMdxFile(slug: string[]): Promise<{ source: string; filePath: string }> {
  assertSafeSlug(slug);
  const relativeFilePath = `${path.join(...slug)}${CONTENT_EXTENSION}`;
  const filePath = path.join(CONTENT_ROOT, relativeFilePath);
  const source = await fs.readFile(filePath, "utf8");
  return { source, filePath };
}

export async function mdxExists(slug: string[]): Promise<boolean> {
  try {
    await readMdxFile(slug);
    return true;
  } catch (error: unknown) {
    if (error instanceof Error && "code" in error && (error as NodeJS.ErrnoException).code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

async function collectDocs(dirPath: string, ancestorSlug: string[] = []): Promise<DocNode[]> {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });

  const nodes = await Promise.all<DocNode | null>(
    entries.map(async (entry) => {
      if (entry.isDirectory()) {
        const directorySlug = [...ancestorSlug, entry.name];
        const children = await collectDocs(path.join(dirPath, entry.name), directorySlug);
        if (!children.length) {
          return null;
        }
        return {
          type: "directory" as const,
          name: entry.name,
          slug: directorySlug,
          filePath: path.join(dirPath, entry.name),
          children,
        } satisfies DocNode;
      }

      if (!entry.isFile() || !entry.name.endsWith(CONTENT_EXTENSION)) {
        return null;
      }

      const baseName = entry.name.slice(0, -CONTENT_EXTENSION.length);
      const fileSlug = [...ancestorSlug, baseName];
      return {
        type: "file" as const,
        name: baseName,
        slug: fileSlug,
        filePath: path.join(dirPath, entry.name),
      } satisfies DocNode;
    })
  );

  return nodes
    .filter((node): node is DocNode => node !== null)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getDocsTree(): Promise<DocNode[]> {
  return collectDocs(CONTENT_ROOT);
}

export async function getAllDocSlugs(): Promise<string[][]> {
  const tree = await getDocsTree();
  const slugs: string[][] = [];

  const walk = (node: DocNode) => {
    if (node.type === "file") {
      slugs.push(node.slug);
      return;
    }

    node.children?.forEach(walk);
  };

  tree.forEach(walk);
  return slugs;
}

export async function getChildNodes(slug: string[] = []): Promise<DocListItem[]> {
  const targetPath = path.join(CONTENT_ROOT, ...slug);
  const stat = await fs.stat(targetPath).catch(() => {
    throw new Error("Requested path does not exist");
  });

  if (!stat.isDirectory()) {
    throw new Error("Requested slug is not a directory");
  }

  const entries = await fs.readdir(targetPath, { withFileTypes: true });

  const items = await Promise.all<DocListItem | null>(
    entries.map(async (entry) => {
      if (entry.name.startsWith(".")) {
        return null;
      }

      if (entry.isDirectory()) {
        const directorySlug = [...slug, entry.name];
        const childEntries = await fs.readdir(path.join(targetPath, entry.name), { withFileTypes: true });
        const hasChildren = childEntries.some((child) => {
          if (child.isDirectory()) {
            return true;
          }
          return child.isFile() && child.name.endsWith(CONTENT_EXTENSION);
        });

        return {
          type: "directory" as const,
          name: entry.name,
          slug: directorySlug,
          hasChildren,
        } satisfies DocListItem;
      }

      if (!entry.isFile() || !entry.name.endsWith(CONTENT_EXTENSION)) {
        return null;
      }

      const baseName = entry.name.slice(0, -CONTENT_EXTENSION.length);
      const fileSlug = [...slug, baseName];

      const filePath = path.join(targetPath, entry.name);
      const source = await fs.readFile(filePath, "utf8");
      const { data } = matter(source);
      const title = typeof data.title === "string" ? data.title : undefined;

      return {
        type: "file" as const,
        name: baseName,
        slug: fileSlug,
        title,
      } satisfies DocListItem;
    })
  );

  return items
    .filter((item): item is DocListItem => item !== null)
    .sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === "directory" ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
}

export type DocIndexEntry = {
  slug: string[];
  title: string;
  content: string;
};

function stripMarkdown(value: string): string {
  return value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^\)]*\)/g, " ")
    .replace(/\[[^\]]*\]\([^\)]*\)/g, " ")
    .replace(/[\*_~>#-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function getDocsIndex(): Promise<DocIndexEntry[]> {
  const tree = await getDocsTree();
  const entries: DocIndexEntry[] = [];

  const visit = async (node: DocNode): Promise<void> => {
    if (node.type === "file") {
      const { source } = await readMdxFile(node.slug);
      const { data, content } = matter(source);
      const title = typeof data.title === "string" ? data.title : node.slug[node.slug.length - 1];
      entries.push({ slug: node.slug, title, content: stripMarkdown(content) });
      return;
    }

    await Promise.all(node.children?.map(visit) ?? []);
  };

  await Promise.all(tree.map(visit));

  return entries.sort((a, b) => a.title.localeCompare(b.title));
}






