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
              <div className="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase dark:text-slate-400">
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
                          ? "bg-primary/10 text-primary dark:bg-primary/15"
                          : "text-slate-700 hover:bg-slate-50 hover:text-primary dark:text-slate-300 dark:hover:bg-slate-900/70",
                      )}
                    >
                      {item.icon && (
                        <FontAwesomeIcon
                          icon={item.icon}
                          className={classNames(
                            "shrink-0 text-base",
                            active
                              ? "text-primary"
                              : "text-slate-400 group-hover:text-primary dark:text-slate-500",
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
