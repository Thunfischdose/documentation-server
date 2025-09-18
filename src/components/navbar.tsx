'use client';

import type { ReactNode } from "react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

export type NavDoc = {
  slug: string[];
  title: string;
  content: string;
};

type DocLink = NavDoc & { href: string };

type NavBarProps = {
  docs: NavDoc[];
};

const NAV_EXCLUDED_ROOTS = new Set(["general"]);

function slugToHref(slug: string[]): string {
  if (slug.length === 1 && slug[0] === "home") {
    return "/";
  }

  return `/${slug.join("/")}`;
}

const MAX_RESULTS = 8;

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

type SearchResult = {
  doc: DocLink;
  snippet: string;
};

type SearchProps = {
  docs: DocLink[];
  className?: string;
  onNavigate?: () => void;
};

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

function Search({ docs, className, onNavigate }: SearchProps) {
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

  const containerClassName = ["relative w-full", className].filter(Boolean).join(" ");

  return (
    <div className={containerClassName}>
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

export default function NavBar({ docs }: NavBarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const docLinks = useMemo<DocLink[]>(() => {
    const mapped = docs.map((doc) => ({ ...doc, href: slugToHref(doc.slug) }));
    return mapped.sort((a, b) => {
      if (a.href === "/") {
        return -1;
      }
      if (b.href === "/") {
        return 1;
      }
      return a.title.localeCompare(b.title);
    });
  }, [docs]);

  const navLinks = useMemo(
    () =>
      docLinks.filter((doc) => {
        if (!doc.slug.length) {
          return false;
        }
        return !NAV_EXCLUDED_ROOTS.has(doc.slug[0]);
      }),
    [docLinks]
  );

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const linkClassName = (href: string) => {
    const isActive = pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
    const base = "rounded-md px-3 py-2 text-sm font-medium transition-colors";
    const inactive = "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100";
    const active = "bg-neutral-900 text-white hover:bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900";
    return [base, isActive ? active : inactive].join(" ");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/80 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-4 py-3 md:px-6">
        <Link href="/" className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Documentation
        </Link>

        <div className="hidden flex-1 items-center justify-end gap-4 md:flex">
          <Search docs={docLinks} className="max-w-md" />
          <nav className="flex flex-wrap items-center gap-2">
            {navLinks.map((doc) => (
              <Link key={doc.href} href={doc.href} className={linkClassName(doc.href)}>
                {doc.title}
              </Link>
            ))}
          </nav>
        </div>

        <button
          type="button"
          className="ml-auto inline-flex items-center justify-center rounded-md border border-neutral-200 p-2 text-neutral-700 transition hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 md:hidden"
          aria-label="Toggle navigation"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((previous) => !previous)}
        >
          {mobileOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M6 18L18 6" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          )}
        </button>
      </div>

      <div className={`${mobileOpen ? "block" : "hidden"} border-t border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 md:hidden`}>
        <div className="space-y-4 px-4 py-4">
          <Search docs={docLinks} className="w-full" onNavigate={() => setMobileOpen(false)} />
          <nav className="flex flex-col gap-2">
            {navLinks.map((doc) => (
              <Link key={doc.href} href={doc.href} className={linkClassName(doc.href)}>
                {doc.title}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}


