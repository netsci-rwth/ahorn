"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import classNames from "classnames";

type NavLink = {
  href: string;
  label: string;
  icon: IconDefinition;
};

type NavGroups = Record<string, NavLink[]>;

export default function AboutSidebarNav({ links }: { links: NavGroups }) {
  const pathname = usePathname();

  const isActive = (link: string) => {
    if (link === "/about") {
      return pathname === "/about";
    }

    return pathname.startsWith(link);
  };

  return (
    <nav className="flex flex-col">
      <ul className="flex flex-1 flex-col gap-y-5">
        {Object.entries(links).map(([groupName, group]) => (
          <li key={groupName}>
            <div className="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">
              {groupName}
            </div>
            <ul className="mt-2 space-y-0.5">
              {group.map((link) => {
                const active = isActive(link.href);

                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      className={classNames(
                        "group flex gap-x-2.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                        active
                          ? "bg-primary/8 text-primary"
                          : "text-slate-700 hover:bg-slate-50 hover:text-primary",
                      )}
                    >
                      <FontAwesomeIcon
                        icon={link.icon}
                        className={classNames(
                          "mt-0.5 shrink-0 text-base",
                          active
                            ? "text-primary"
                            : "text-slate-400 group-hover:text-primary",
                        )}
                      />
                      {link.label}
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
