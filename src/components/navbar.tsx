"use client";

import React, { FC } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import classnames from "classnames";

import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faLeaf, faXmark } from "@fortawesome/free-solid-svg-icons";

const links = [
  { name: "Home", link: "/" },
  { name: "Networks", link: "/dataset" },
  { name: "Tools", link: "/tools" },
  { name: "About", link: "/about" },
];

const Navbar: FC = () => {
  const pathname = usePathname();
  const isActive = (link: string) => {
    if (link === "/") {
      return pathname === "/";
    } else {
      return pathname.startsWith(link);
    }
  };

  return (
    <Disclosure as="nav" className="relative sm:sticky top-0 z-50 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-2 sm:px-8">
        <div className="relative flex h-16 justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            {/* Mobile menu button*/}
            <DisclosureButton
              type="button"
              className="group focus:outline-hidden relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="absolute -inset-0.5"></span>
              <span className="sr-only">Open main menu</span>
              <FontAwesomeIcon icon={faBars} aria-hidden="true" className="block! size-6 group-data-open:hidden!" />
              <FontAwesomeIcon icon={faXmark} aria-hidden="true" className="hidden! size-6 group-data-open:block!" />
            </DisclosureButton>
          </div>
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <Link
              href="/"
              className="text-primary flex shrink-0 items-center text-2xl font-bold"
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
                        "border-primary text-gray-900": active,
                        "border-white text-gray-500 hover:border-gray-300 hover:text-gray-700":
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
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state. */}
      <DisclosurePanel className="sm:hidden">
        {({ close }) => (
          <div className="space-y-1 px-2 pb-3 pt-2">
            {links.map((link) => {
              const active = isActive(link.link);
              return (
                <Link
                  key={link.link}
                  href={link.link}
                  className={classnames(
                    "block rounded-md px-3 py-2 text-base font-medium",
                    {
                      "bg-gray-900 text-white": active,
                      "text-gray-300 hover:bg-gray-700 hover:text-white": !active,
                    },
                  )}
                  onNavigate={() => close()}
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
