"use client";

import React, { FC, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { addBasePath } from "next/dist/client/add-base-path";
import classnames from "classnames";

import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";

import Logo from "@/app/icon.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faXmark } from "@fortawesome/free-solid-svg-icons";

const links = [
  { name: "Home", link: "/" },
  { name: "Datasets", link: "/dataset" },
  { name: "Statistics", link: "/statistics" },
  { name: "Tools", link: "/tools" },
  { name: "About", link: "/about" },
];

const MAX_SEARCH_RESULTS = 8;
const PAGEFIND_BUNDLE_PATH = `${addBasePath("/_pagefind/")}/`;

const SearchBox = ({ onNavigate }: { onNavigate: () => void }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      if (target.closest("a[href]")) {
        onNavigate();
      }
    };

    container.addEventListener("click", handleClick);

    return () => {
      container.removeEventListener("click", handleClick);
    };
  }, [onNavigate]);

  return (
    <div
      ref={containerRef}
      className="navbar-search relative w-full sm:w-52 md:w-72"
    >
      {React.createElement("pagefind-config", {
        "base-url": addBasePath("/"),
        "bundle-path": PAGEFIND_BUNDLE_PATH,
        "excerpt-length": 16,
      })}
      {React.createElement("pagefind-searchbox", {
        "max-results": MAX_SEARCH_RESULTS,
      })}
    </div>
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

  // Prevent background scrolling while mobile menu is open
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
      className="sticky top-0 z-50 border-b border-black-25 bg-white dark:border-black-100 dark:bg-black-100"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between gap-4">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            {/* Mobile menu button*/}
            <DisclosureButton
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="group relative inline-flex items-center justify-center rounded-lg p-2 text-black-50 transition-colors hover:bg-black-10 hover:text-black-100 focus-visible:ring-2 focus-visible:ring-blue-100/30 focus-visible:outline-none dark:text-black-50 dark:hover:bg-black-75/35 dark:hover:text-white"
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
              className="flex shrink-0 items-center text-xl font-extrabold tracking-widest text-blue-100"
            >
              <Logo className="mr-2 h-6 w-6" />
              AHORN
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:h-full sm:items-stretch sm:gap-2">
              {links.map((link) => {
                const active = isActive(link.link);
                return (
                  <Link
                    key={link.link}
                    href={link.link}
                    className={classnames(
                      "relative inline-flex h-full items-center rounded-lg px-4 text-sm font-semibold transition-colors after:absolute after:right-4 after:bottom-0 after:left-4 after:h-0.5 after:rounded-t-sm after:transition-colors after:content-[''] focus-visible:ring-2 focus-visible:ring-blue-100/30 focus-visible:outline-none",
                      {
                        "text-blue-100 after:bg-blue-100 dark:text-blue-50 dark:after:bg-blue-50":
                          active,
                        "text-black-75 after:bg-transparent hover:text-blue-100 hover:after:bg-blue-100/45 dark:text-black-25 dark:hover:text-blue-50 dark:hover:after:bg-blue-50/45":
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
            <SearchBox onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state. */}
      <DisclosurePanel className="sm:hidden">
        {({ close }) => (
          <div className="space-y-2 border-t border-black-25 py-3 dark:border-black-100">
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
                    "block rounded-lg px-3 py-2.5 text-base font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-blue-100/30 focus-visible:outline-none",
                    {
                      "bg-blue-10 text-blue-100 dark:bg-blue-100/15 dark:text-blue-50":
                        active,
                      "text-black-75 hover:bg-black-10 hover:text-blue-100 dark:text-black-25 dark:hover:bg-black-75/35 dark:hover:text-blue-50":
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
