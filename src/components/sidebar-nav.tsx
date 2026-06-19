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
              <div className="px-2 text-xs font-semibold tracking-wide text-black-50 uppercase dark:text-black-50">
                {groupTitle}
              </div>
            )}
            <ul className={classNames("space-y-1", groupTitle ? "mt-2" : "")}>
              {items.map((item) => {
                const active = isActive(item.href);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={classNames(
                        "group flex items-center rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                        item.icon ? "gap-x-2.5" : "gap-x-0",
                        active
                          ? "bg-blue-10 text-blue-100 dark:bg-blue-100/15 dark:text-blue-50"
                          : "text-black-75 hover:bg-black-10/70 hover:text-blue-100 dark:text-black-25 dark:hover:bg-black-75/35 dark:hover:text-blue-50",
                      )}
                    >
                      {item.icon && (
                        <FontAwesomeIcon
                          icon={item.icon}
                          className={classNames(
                            "size-3.5 shrink-0",
                            active
                              ? "text-blue-100 dark:text-blue-50"
                              : "text-black-50 group-hover:text-blue-100 dark:text-black-50 dark:group-hover:text-blue-50",
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
