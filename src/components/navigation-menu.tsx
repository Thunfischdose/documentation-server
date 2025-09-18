'use client';

import type { ReactNode } from "react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type TreeItem = {
  type: "file" | "directory";
  name: string;
  slug: string[];
  hasChildren?: boolean;
  title?: string;
};

type TreeResponse = {
  items: TreeItem[];
};

type DocIndexEntry = {
  slug: string[];
  title: string;
  content: string;
};

type NavigationMenuProps = {
  docs: DocIndexEntry[];
};

type DocLink = DocIndexEntry & {
  href: string;
};

type SearchResult = {
  doc: DocLink;
  snippet: string;
};

type SearchProps = {
  docs: DocLink[];
  onNavigate?: () => void;
};

const ROOT_KEY = "";
const INDENT_PX = 18;
const FALLBACK_HEADER_HEIGHT = 64;
const MAX_RESULTS = 8;

function slugKey(slug: string[]): string {
  return slug.join("/");
}

function slugToHref(slug: string[]): string {
  if (slug.length === 1 && slug[0] === "home") {
    return "/";
  }

  return `/${slug.join("/")}`;
}

function humanizeName(value: string): string {
  return value
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase())
    .trim();
}

function deriveActiveSlug(pathname: string): string[] {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) {
    return ["home"];
  }
  return segments;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildSnippet(content: string, normalizedQuery: string): string {
  if (!normalizedQuery) {
    return content.slice(0, 140).trim();
  }

  const lowerContent = content.toLowerCase();
  const matchIndex = lowerContent.indexOf(normalizedQuery);
  const radius = 80;

  if (matchIndex === -1) {
    return content.slice(0, 160).trim();
  }

  const start = Math.max(0, matchIndex - radius);
  const end = Math.min(content.length, matchIndex + normalizedQuery.length + radius);
  let snippet = content.slice(start, end).trim();

  if (start > 0) {
    snippet = `...${snippet}`;
  }

  if (end < content.length) {
    snippet = `${snippet}...`;
  }

  return snippet.replace(/\s+/g, " ");
}

function renderHighlightedSnippet(snippet: string, normalizedQuery: string): ReactNode {
  if (!normalizedQuery) {
    return snippet;
  }

  const expression = escapeRegExp(normalizedQuery);
  const matcher = new RegExp(`(${expression})`, "ig");
  const parts = snippet.split(matcher);

  return parts.map((part, index) => {
    if (part.toLowerCase() === normalizedQuery) {
      return (
        <mark key={`${part}-${index}`} className="bg-yellow-200 text-neutral-900 dark:bg-yellow-400/60">
          {part}
        </mark>
      );
    }

    return <span key={`${part}-${index}`}>{part}</span>;
  });
}

function Search({ docs, onNavigate }: SearchProps) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();

  const results = useMemo<SearchResult[]>(() => {
    if (!normalizedQuery) {
      return [];
    }

    return docs
      .map((doc) => {
        const haystack = `${doc.title} ${doc.href} ${doc.content}`.toLowerCase();
        if (!haystack.includes(normalizedQuery)) {
          return null;
        }

        return {
          doc,
          snippet: buildSnippet(doc.content, normalizedQuery),
        } satisfies SearchResult;
      })
      .filter((entry): entry is SearchResult => entry !== null)
      .slice(0, MAX_RESULTS);
  }, [docs, normalizedQuery]);

  return (
    <div className="relative w-full">
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        type="search"
        placeholder="Search documentation"
        className="w-full rounded-md bg-white/80 px-3 py-2 text-sm text-neutral-900 shadow-sm ring-1 ring-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-neutral-900/80 dark:text-neutral-100 dark:ring-neutral-700 dark:placeholder:text-neutral-400"
      />
      {query && (
        <button
          type="button"
          onClick={() => setQuery("")}
          className="absolute inset-y-0 right-2 text-xs font-semibold text-neutral-400 hover:text-neutral-600 focus:text-neutral-600 focus:outline-none dark:text-neutral-500 dark:hover:text-neutral-300"
        >
          Clear
        </button>
      )}

      {normalizedQuery && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-md border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
          {results.length === 0 ? (
            <p className="px-3 py-2 text-sm text-neutral-500 dark:text-neutral-400">No matches found.</p>
          ) : (
            <ul className="max-h-72 overflow-auto py-1">
              {results.map(({ doc, snippet }) => (
                <li key={doc.href}>
                  <Link
                    href={doc.href}
                    className="block px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
                    onClick={() => {
                      setQuery("");
                      onNavigate?.();
                    }}
                  >
                    <span className="font-medium">{doc.title}</span>
                    <span className="ml-2 text-xs text-neutral-400 dark:text-neutral-500">{doc.href}</span>
                    <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                      {renderHighlightedSnippet(snippet, normalizedQuery)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default function NavigationMenu({ docs }: NavigationMenuProps) {
  const pathname = usePathname();
  const activeSlug = useMemo(() => deriveActiveSlug(pathname), [pathname]);
  const headerRef = useRef<HTMLElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [nodes, setNodes] = useState<Record<string, TreeItem[]>>({});
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const [loadingKeys, setLoadingKeys] = useState<Set<string>>(new Set());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [headerHeight, setHeaderHeight] = useState<number>(FALLBACK_HEADER_HEIGHT);

  const docLinks = useMemo<DocLink[]>(() => {
    return docs.map((doc) => ({ ...doc, href: slugToHref(doc.slug) }));
  }, [docs]);

  useLayoutEffect(() => {
    const updateHeight = () => {
      const height = headerRef.current?.offsetHeight ?? FALLBACK_HEADER_HEIGHT;
      setHeaderHeight(height);
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  const loadChildren = useCallback(async (slug: string[]) => {
    const key = slug.length ? slugKey(slug) : ROOT_KEY;

    setLoadingKeys((prev) => {
      const updated = new Set(prev);
      updated.add(key);
      return updated;
    });

    try {
      const query = slug.length ? `?slug=${encodeURIComponent(slug.join("/"))}` : "";
      const response = await fetch(`/api/docs/tree${query}`, { cache: "no-store" });

      if (!response.ok) {
        const { error } = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(error ?? `Request failed with status ${response.status}`);
      }

      const data = (await response.json()) as TreeResponse;
      setNodes((prev) => ({ ...prev, [key]: data.items }));
      setErrorMessage(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to fetch documentation tree.";
      setErrorMessage(message);
    } finally {
      setLoadingKeys((prev) => {
        const updated = new Set(prev);
        updated.delete(key);
        return updated;
      });
    }
  }, []);

  useEffect(() => {
    void loadChildren([]);
  }, [loadChildren]);

  useEffect(() => {
    if (!isOpen) {
      setExpandedKeys(new Set());
      return;
    }

    let cancelled = false;

    const expandActivePath = async () => {
      const directories = activeSlug.slice(0, -1).map((_, index) => activeSlug.slice(0, index + 1));
      if (directories.length === 0) {
        return;
      }

      const keysToExpand: string[] = [];

      for (const directory of directories) {
        if (cancelled) {
          return;
        }

        const key = slugKey(directory);
        const isLoaded = Boolean(nodes[key]);
        const isLoading = loadingKeys.has(key);

        if (!isLoaded && !isLoading) {
          await loadChildren(directory);
          if (cancelled) {
            return;
          }
        }

        keysToExpand.push(key);
      }

      if (!cancelled && keysToExpand.length) {
        setExpandedKeys((prev) => {
          const updated = new Set(prev);
          keysToExpand.forEach((key) => updated.add(key));
          return updated;
        });
      }
    };

    void expandActivePath();

    return () => {
      cancelled = true;
    };
  }, [isOpen, activeSlug, nodes, loadingKeys, loadChildren]);

  const toggleDirectory = (slug: string[], hasChildren?: boolean) => {
    if (!hasChildren) {
      return;
    }

    const key = slugKey(slug);
    const alreadyExpanded = expandedKeys.has(key);

    if (alreadyExpanded) {
      setExpandedKeys((prev) => {
        const updated = new Set(prev);
        updated.delete(key);
        return updated;
      });
      return;
    }

    if (!nodes[key] && !loadingKeys.has(key)) {
      void loadChildren(slug);
    }

    setExpandedKeys((prev) => new Set(prev).add(key));
  };

  const closeMenu = () => {
    setIsOpen(false);
    setErrorMessage(null);
  };

  const renderTree = (parentSlug: string[], depth: number): React.ReactNode => {
    const key = parentSlug.length ? slugKey(parentSlug) : ROOT_KEY;
    const items = nodes[key];

    if (!items) {
      if (loadingKeys.has(key)) {
        return <p className="px-2 py-2 text-sm text-neutral-500">Loading...</p>;
      }
      return null;
    }

    return (
      <ul className="space-y-1">
        {items.map((item) => {
          const itemKey = slugKey(item.slug);
          const isExpanded = expandedKeys.has(itemKey);
          const isLoading = loadingKeys.has(itemKey);
          const label = item.type === "file" ? item.title ?? humanizeName(item.name) : humanizeName(item.name);
          const paddingLeft = depth * INDENT_PX;

          if (item.type === "directory") {
            return (
              <li key={itemKey}>
                <button
                  type="button"
                  onClick={() => toggleDirectory(item.slug, item.hasChildren)}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-neutral-200 dark:hover:bg-neutral-800"
                  style={{ paddingLeft }}
                >
                  <span className={`transition-transform ${isExpanded ? "rotate-90" : ""}`}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="h-4 w-4"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
                    </svg>
                  </span>
                  <span>{label}</span>
                  {isLoading && <span className="ml-auto text-xs text-neutral-400">Loading...</span>}
                </button>
                {isExpanded && (
                  <div className="ml-1 border-l border-dashed border-neutral-300 pl-2 dark:border-neutral-700">
                    {renderTree(item.slug, depth + 1)}
                  </div>
                )}
              </li>
            );
          }

          const href = slugToHref(item.slug);
          const isActive = pathname === href;

          return (
            <li key={itemKey}>
              <Link
                href={href}
                onClick={closeMenu}
                className={`flex items-center rounded-md px-2 py-1.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isActive
                    ? "bg-neutral-900 text-white dark:bg-neutral-200 dark:text-neutral-900"
                    : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
                }`}
                style={{ paddingLeft }}
              >
                <span className="truncate">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    );
  };

  const panelTop = headerHeight;
  const panelHeight = `calc(100vh - ${panelTop}px)`;

  return (
    <>
      <header
        ref={headerRef}
        className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80"
      >
        <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3 md:px-6">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="inline-flex items-center justify-center rounded-md border border-neutral-300 p-2 text-neutral-700 transition hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
            aria-label="Open documentation navigation"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
          <span className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Documentation</span>
        </div>
      </header>

      {isOpen && (
        <div
          className="fixed left-0 right-0 bottom-0 z-50"
          style={{ top: panelTop, height: panelHeight }}
        >
          <div
            className="absolute inset-0 bg-black/40"
            aria-hidden="true"
            onClick={closeMenu}
          />
          <div className="relative z-10 flex h-full">
            <div className="flex h-full w-full max-w-xs flex-col bg-white text-neutral-900 shadow-xl dark:bg-neutral-950 dark:text-neutral-100 sm:max-w-sm">
              <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                    Content Explorer
                  </p>
                  <p className="text-lg font-semibold">Documentation</p>
                </div>
                <button
                  type="button"
                  onClick={closeMenu}
                  className="rounded-md border border-neutral-300 p-2 text-neutral-600 transition hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                  aria-label="Close navigation"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M6 18L18 6" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4">
                <div className="space-y-4">
                  <Search docs={docLinks} onNavigate={closeMenu} />

                  {errorMessage && (
                    <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
                      {errorMessage}
                    </p>
                  )}

                  {renderTree([], 0)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}



