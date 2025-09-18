import type { ReactElement } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";

import { readMdxFile } from "@/lib/mdx";
import { theme } from "@/theme";

type RenderedMdx = {
  content: ReactElement;
  frontmatter: Record<string, unknown>;
};

type ThemedImageProps = {
  src: string;
  alt: string;
  caption?: string;
  priority?: boolean;
};

function isErrnoException(error: unknown): error is NodeJS.ErrnoException {
  return typeof error === "object" && error !== null && "code" in error;
}

function createThemedImageComponent(templateKey: keyof typeof theme.images) {
  const template = theme.images[templateKey];
  const assumedHeight = Math.round(template.maxWidth * 0.62);

  return function ThemedImage({ src, alt, caption, priority }: ThemedImageProps): ReactElement {
    return (
      <figure
        data-image-template={templateKey}
        style={{
          maxWidth: template.maxWidth,
          borderRadius: template.borderRadius,
          padding: template.padding,
          background: template.background,
          boxShadow: template.boxShadow,
        }}
        className="overflow-hidden"
      >
        <Image
          src={src}
          alt={alt}
          priority={priority}
          unoptimized
          width={template.maxWidth}
          height={assumedHeight}
          className="h-auto w-full object-cover"
          style={{ borderRadius: `calc(${template.borderRadius} - 6px)` }}
        />
        {caption ? (
          <figcaption
            style={{
              color: template.captionColor,
              fontSize: template.captionSize,
              textTransform: template.captionTransform,
            }}
            className="tracking-wide"
          >
            {caption}
          </figcaption>
        ) : null}
      </figure>
    );
  };
}

async function compileMdx(slug: string[], visited: Set<string>): Promise<RenderedMdx> {
  const slugKey = slug.join("/");
  if (visited.has(slugKey)) {
    throw new Error(`Circular Include detected for slug "${slugKey}".`);
  }

  visited.add(slugKey);

  let source: string;
  try {
    ({ source } = await readMdxFile(slug));
  } catch (error) {
    if (isErrnoException(error) && error.code === "ENOENT") {
      notFound();
    }
    throw error;
  }

  const ImageSmall = createThemedImageComponent("image_small");
  const ImageMedium = createThemedImageComponent("image_medium");
  const ImageBig = createThemedImageComponent("image_big");

  const { content, frontmatter } = await compileMDX({
    source,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
      },
    },
    components: {
      Include: createIncludeComponent(new Set(visited)),
      ImageSmall,
      ImageMedium,
      ImageBig,
    },
  });

  return { content, frontmatter };
}

function createIncludeComponent(visited: Set<string>) {
  return async function Include({ slug }: { slug: string }): Promise<ReactElement> {
    const includeSlug = slug
      .split("/")
      .map((segment) => segment.trim())
      .filter(Boolean);

    if (!includeSlug.length) {
      throw new Error("Include component requires a non-empty slug");
    }

    const { content } = await compileMdx(includeSlug, new Set(visited));
    return content;
  };
}

export async function renderMdx(slug: string[]): Promise<RenderedMdx> {
  return compileMdx(slug, new Set());
}

export async function MDXRenderer({ slug }: { slug: string[] }): Promise<ReactElement> {
  const { content } = await compileMdx(slug, new Set());
  return (
    <article className="docs-content prose prose-slate mx-auto w-full max-w-3xl dark:prose-invert">
      {content}
    </article>
  );
}

