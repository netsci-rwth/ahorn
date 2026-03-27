"use client";

import React, { FC, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { addBasePath } from "next/dist/client/add-base-path";
import classnames from "classnames";

import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";

import Logo from "@/app/icon.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faSpinner, faXmark } from "@fortawesome/free-solid-svg-icons";

const links = [
  { name: "Home", link: "/" },
  { name: "Datasets", link: "/dataset" },
  { name: "Tools", link: "/tools" },
  { name: "About", link: "/about" },
];

// @ts-expect-error pagefind is dynamically loaded
let pagefind: {
  search: (
    query: string,
  ) => Promise<{ results: { data: () => SearchResult }[] }>;
  options: (options: Record<string, unknown>) => Promise<void>;
} = null;
export async function importPagefind() {
  pagefind = await import(
    /* webpackIgnore: true */ addBasePath("/_pagefind/pagefind.js")
  );
  await pagefind!.options({
    baseUrl: "/",
  });
}

type SearchResult = {
  excerpt: string;
  meta: {
    title: string;
  };
  url: string;
};

const SEARCH_DEBOUNCE_MS = 200;
const MAX_SEARCH_RESULTS = 8;

const SearchBox = ({ onNavigate }: { onNavigate: () => void }) => {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<React.ReactElement | string>("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const latestRequestId = useRef(0);

  const router = useRouter();

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      return;
    }

    const requestId = latestRequestId.current + 1;
    latestRequestId.current = requestId;

    const timeoutId = window.setTimeout(async () => {
      setResults([]);
      setError("");
      setIsLoading(true);

      // load pagefind if not available yet
      if (pagefind == null) {
        try {
          await importPagefind();
        } catch (error) {
          if (latestRequestId.current !== requestId) {
            return;
          }
          setError(String(error));
          setIsLoading(false);
          return;
        }
      }

      try {
        const response = await pagefind!.search(trimmedQuery);
        if (latestRequestId.current !== requestId) {
          return;
        }
        if (!response) {
          setResults([]);
          setIsLoading(false);
          return;
        }
        const data = await Promise.all(
          response.results.slice(0, MAX_SEARCH_RESULTS).map(async (o) => {
            const result = await o.data();
            result.url = result.url
              .replace(/\.html$/, "")
              .replace(/\.html#/, "#");
            return result;
          }),
        );
        if (latestRequestId.current !== requestId) {
          return;
        }
        setIsLoading(false);
        setError("");
        setResults(data);
      } catch (e) {
        if (latestRequestId.current !== requestId) {
          return;
        }
        setIsLoading(false);
        setError(String(e));
        setResults([]);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [query]);

  const handleSelect = (result: unknown) => {
    if (!result) {
      return;
    }

    const { url } = result as SearchResult;
    router.push(url);
    setQuery("");
    onNavigate();
  };

  const showOptions = query.trim() !== "" || isLoading || Boolean(error);

  return (
    <Combobox
      as="div"
      className="relative w-full sm:w-52 md:w-72"
      onChange={handleSelect}
      immediate
    >
      <ComboboxInput
        aria-label="Search"
        spellCheck={false}
        autoComplete="off"
        type="search"
        className="block w-full rounded-full border border-white/70 bg-white/80 px-4 py-2 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
        placeholder="Search datasets..."
        value={query}
        onChange={(event) => {
          const nextQuery = event.currentTarget.value;
          setQuery(nextQuery);

          if (!nextQuery.trim()) {
            latestRequestId.current += 1;
            setResults([]);
            setError("");
            setIsLoading(false);
          }
        }}
      />
      {showOptions && (
        <ComboboxOptions
          as="ul"
          className="z-50 w-[22rem] max-w-[calc(100vw-2rem)] rounded-2xl border border-white/70 bg-white/95 p-1 shadow-[0_20px_50px_rgb(15_23_42_/_0.16)] backdrop-blur-md [--anchor-gap:10px]"
          aria-busy={isLoading}
          anchor="bottom"
        >
          {isLoading && (
            <li className="flex items-center gap-2 px-3 py-2 text-sm text-slate-500">
              <FontAwesomeIcon
                icon={faSpinner}
                className="h-4 w-4 animate-spin text-primary"
              />
              Searching…
            </li>
          )}

          {!isLoading && error && (
            <li className="px-3 py-2 text-sm text-red-600">{error}</li>
          )}

          {!isLoading && !error && results.length === 0 && query && (
            <li className="px-3 py-2 text-sm text-slate-500">No results</li>
          )}

          {!isLoading &&
            !error &&
            results.map((r) => (
              <li key={r.url}>
                <ComboboxOption
                  as={Link}
                  href={r.url}
                  value={r}
                  className="block rounded-xl px-3 py-2 text-sm data-focus:bg-slate-100"
                >
                  <div className="line-clamp-1 font-semibold text-slate-900">
                    {r.meta?.title || r.url}
                  </div>
                  {r.excerpt && (
                    <div
                      className="mt-0.5 line-clamp-2 text-xs text-slate-500"
                      dangerouslySetInnerHTML={{ __html: r.excerpt }}
                    />
                  )}
                </ComboboxOption>
              </li>
            ))}
        </ComboboxOptions>
      )}
    </Combobox>
  );
};

const Navbar: FC = () => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isActive = (link: string) => {
    if (link === "/") {
      return pathname === "/";
    } else {
      return pathname.startsWith(link);
    }
  };

  // prevent background scrolling while mobile menu is open
  useEffect(() => {
    if (!mobileOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous || "";
    };
  }, [mobileOpen]);

  return (
    <Disclosure
      as="nav"
      className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/70 backdrop-blur-sm"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between gap-4 sm:px-1">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            {/* Mobile menu button*/}
            <DisclosureButton
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="group relative inline-flex items-center justify-center rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus:outline-hidden"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="absolute -inset-0.5"></span>
              <span className="sr-only">Open main menu</span>
              <FontAwesomeIcon
                icon={faBars}
                aria-hidden="true"
                className="block! size-6 group-data-open:hidden!"
              />
              <FontAwesomeIcon
                icon={faXmark}
                aria-hidden="true"
                className="hidden! size-6 group-data-open:block!"
              />
            </DisclosureButton>
          </div>
          <div className="flex h-full flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <Link
              href="/"
              className="flex shrink-0 items-center text-xl font-extrabold tracking-[0.18em] text-primary"
            >
              <Logo className="mr-2 h-6 w-6" />
              AHORN
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:items-center sm:gap-2">
              {links.map((link) => {
                const active = isActive(link.link);
                return (
                  <Link
                    key={link.link}
                    href={link.link}
                    className={classnames(
                      "inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold",
                      {
                        "bg-primary text-white shadow-sm": active,
                        "text-slate-600 hover:bg-slate-100 hover:text-slate-950":
                          !active,
                      },
                    )}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>
          {/* Desktop search box */}
          <div className="hidden sm:block">
            <SearchBox
              onNavigate={() => {
                close();
                setMobileOpen(false);
              }}
            />
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state. */}
      <DisclosurePanel className="sm:hidden">
        {({ close }) => (
          <div className="space-y-2 border-t border-slate-200 py-3">
            <div className="pb-2">
              <SearchBox
                onNavigate={() => {
                  close();
                  setMobileOpen(false);
                }}
              />
            </div>
            {links.map((link) => {
              const active = isActive(link.link);
              return (
                <Link
                  key={link.link}
                  href={link.link}
                  className={classnames(
                    "block rounded-xl px-3 py-2.5 text-base font-semibold",
                    {
                      "bg-primary text-white": active,
                      "text-slate-700 hover:bg-slate-100 hover:text-slate-950":
                        !active,
                    },
                  )}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
        )}
      </DisclosurePanel>
    </Disclosure>
  );
};

export default Navbar;
