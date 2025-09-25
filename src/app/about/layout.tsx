"use client";

import { usePathname } from "next/navigation";
import classnames from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBox,
  faChartPie,
  faCircleInfo,
  faCode,
  faFileCode,
  faHandshake,
  faGavel,
} from "@fortawesome/free-solid-svg-icons";

import Link from "next/link";

const links = {
  About: [
    { href: "/about", label: "About", icon: faCircleInfo },
    { href: "/about/format", label: "Dataset Format", icon: faFileCode },
    { href: "/about/ahorn-loader", label: "ahorn-loader", icon: faBox },
  ],
  Contributing: [
    {
      href: "/about/contributing",
      label: "Contributing Guidelines",
      icon: faHandshake,
    },
    { href: "/about/datasheet", label: "Datasheet Page", icon: faChartPie },
    { href: "/about/dataset-converter", label: "Converter", icon: faCode },
    { href: "/about/code-of-conduct", label: "Code of Conduct", icon: faGavel },
  ],
};

export default function AboutLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isActive = (link: string) => {
    if (link === "/about") {
      return pathname === "/about";
    } else {
      return pathname.startsWith(link);
    }
  };

  return (
    <div className="sm:flex">
      <aside>
        <nav className="sm:w-3xs flex flex-1 flex-col">
          <ul className="flex flex-1 flex-col gap-y-7">
            {Object.entries(links).map(([group_name, group]) => (
              <li key={group_name}>
                <div className="text-xs font-semibold text-gray-400">
                  {group_name}
                </div>
                <ul className="-mx-2 mt-2 space-y-1">
                  {group.map((link) => {
                    const active = isActive(link.href);
                    return (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className={classnames(
                            "flex gap-x-3 rounded-md p-2 text-sm font-semibold",
                            {
                              "text-primary bg-gray-50": active,
                              "hover:text-primary group text-gray-700 hover:bg-gray-50":
                                !active,
                            },
                          )}
                        >
                          <FontAwesomeIcon
                            icon={link.icon}
                            className={classnames("shrink-0 text-xl", {
                              "text-primary": active,
                              "group-hover:text-primary text-gray-400": !active,
                            })}
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
      </aside>
      <main
        className="prose max-w-none flex-1 max-sm:mt-8 sm:ml-10"
        data-pagefind-body
      >
        {children}
      </main>
    </div>
  );
}
