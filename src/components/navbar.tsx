"use client";

import React, { FC, useEffect, useState } from "react";
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

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faLeaf,
  faSpinner,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

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

const SearchBox = ({ onNavigate }: { onNavigate: () => void }) => {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<React.ReactElement | string>("");
  const [results, setResults] = useState<SearchResult[]>([]);

  const router = useRouter();

  useEffect(() => {
    const queryResults = async (value: string) => {
      if (!value) {
        setResults([]);
        setError("");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      // load pagefind if not available yet
      if (pagefind == null) {
        try {
          await importPagefind();
        } catch (error) {
          setError(String(error));
          setIsLoading(false);
          return;
        }
      }

      try {
        const response = await pagefind!.search(value);
        if (!response) {
          setIsLoading(false);
          return;
        }
        const data = await Promise.all(
          response.results.map(async (o) => {
            const result = await o.data();
            result.url = result.url
              .replace(/\.html$/, "")
              .replace(/\.html#/, "#");
            return result;
          }),
        );
        setIsLoading(false);
        setError("");
        setResults(data);
      } catch (e) {
        setIsLoading(false);
        setError(String(e));
        setResults([]);
      }
    };

    queryResults(query);
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

  return (
    <Combobox
      as="div"
      className="relative w-full sm:w-48 md:w-64"
      onChange={handleSelect}
      immediate
    >
      <ComboboxInput
        aria-label="Search"
        spellCheck={false}
        autoComplete="off"
        type="search"
        className="block w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
        placeholder="Search..."
        value={query}
        onChange={(event) => setQuery(event.currentTarget.value)}
      />
      <ComboboxOptions
        as="ul"
        className="z-50 w-2xs rounded-md border border-gray-200 bg-white shadow-lg [--anchor-gap:6px] dark:border-gray-700 dark:bg-gray-800"
        aria-busy={isLoading}
        anchor="bottom"
      >
        {isLoading && (
          <li className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 dark:text-gray-300">
            <FontAwesomeIcon
              icon={faSpinner}
              className="h-4 w-4 animate-spin text-primary"
            />
            Searching…
          </li>
        )}

        {!isLoading && error && (
          <li className="px-3 py-2 text-sm text-red-600 dark:text-red-500">
            {error}
          </li>
        )}

        {!isLoading && !error && results.length === 0 && query && (
          <li className="px-3 py-2 text-sm text-gray-500 dark:text-gray-300">
            No results
          </li>
        )}

        {!isLoading &&
          !error &&
          results.map((r) => (
            <li key={r.url}>
              <ComboboxOption
                as={Link}
                href={r.url}
                value={r}
                className="block px-3 py-2 text-sm data-focus:bg-gray-100 dark:data-focus:bg-gray-700"
              >
                <div className="line-clamp-1 font-medium text-gray-800 dark:text-gray-100">
                  {r.meta?.title || r.url}
                </div>
                {r.excerpt && (
                  <div
                    className="mt-0.5 line-clamp-2 text-xs text-gray-500 dark:text-gray-300"
                    dangerouslySetInnerHTML={{ __html: r.excerpt }}
                  />
                )}
              </ComboboxOption>
            </li>
          ))}
      </ComboboxOptions>
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
      className="relative top-0 z-50 bg-white shadow-sm sm:sticky dark:bg-gray-900 dark:shadow-gray-800"
    >
      <div className="mx-auto max-w-7xl px-2 sm:px-8">
        <div className="relative flex h-16 items-center justify-between gap-4">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            {/* Mobile menu button*/}
            <DisclosureButton
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-hidden dark:text-gray-300 dark:hover:text-white"
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
              className="flex shrink-0 items-center text-2xl font-bold text-primary"
            >
              <FontAwesomeIcon icon={faLeaf} className="mr-2" />
              AHORN
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:items-stretch sm:space-x-8">
              {links.map((link) => {
                const active = isActive(link.link);
                return (
                  <Link
                    key={link.link}
                    href={link.link}
                    className={classnames(
                      "inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium",
                      {
                        "border-primary text-primary dark:text-white": active,
                        "border-white text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:border-gray-900 dark:text-gray-300 dark:hover:border-gray-700 dark:hover:text-gray-100":
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
          <div className="h-[calc(100vh-4rem)] space-y-1 bg-white px-2 pt-2 pb-3 dark:bg-gray-900">
            <div className="px-1 pb-2">
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
                    "block rounded-md px-3 py-2 text-base font-medium",
                    {
                      "bg-gray-900 text-white dark:bg-gray-800 dark:text-white":
                        active,
                      "text-gray-300 hover:bg-gray-700 hover:text-white dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white":
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
