"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import classNames from "classnames";

type SidebarNavItem = {
  href: string;
  label: string;
  icon?: IconDefinition;
};

type SidebarNavProps = {
  links: Record<string, SidebarNavItem[]>;
  className?: string;
};

export default function SidebarNav({ links, className = "" }: SidebarNavProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/about") {
      return pathname === "/about";
    }

    if (href.startsWith("/about/")) {
      return pathname.startsWith(href);
    }

    return pathname === href;
  };

  return (
    <nav className={classNames("flex flex-col", className)}>
      <ul className="flex flex-1 flex-col gap-y-5">
        {Object.entries(links).map(([groupTitle, items]) => (
          <li key={groupTitle}>
            {groupTitle && (
              <div className="text-xs font-semibold tracking-widest text-black-50 uppercase dark:text-black-50">
                {groupTitle}
              </div>
            )}
            <ul className={classNames("space-y-0.5", groupTitle ? "mt-2" : "")}>
              {items.map((item) => {
                const active = isActive(item.href);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={classNames(
                        "group flex items-center rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                        item.icon ? "gap-x-2.5" : "gap-x-0",
                        active
                          ? "bg-blue-100/10 text-blue-100 dark:bg-blue-100/15 dark:text-blue-75"
                          : "text-black-75 hover:bg-white hover:text-blue-100 dark:text-black-25 dark:hover:bg-black-100/70",
                      )}
                    >
                      {item.icon && (
                        <FontAwesomeIcon
                          icon={item.icon}
                          className={classNames(
                            "shrink-0 text-base",
                            active
                              ? "text-blue-75"
                              : "text-black-50 group-hover:text-blue-100 dark:text-black-50",
                          )}
                        />
                      )}
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>
    </nav>
  );
}
