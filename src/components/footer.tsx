import React from "react";
import Link from "next/link";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

const legal_links = [
  { name: "Legal Notice", link: "/about/imprint" },
  { name: "Privacy", link: "/about/privacy" },
];

const Footer = () => {
  return (
    <footer className="mt-12 border-t border-black-10 bg-white/40 dark:border-black-100 dark:bg-black-100/70">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm md:order-2 md:justify-end">
            {legal_links.map((link) => (
              <React.Fragment key={link.link}>
                <Link
                  href={link.link}
                  className="text-black-75 hover:text-black-100 dark:text-black-50 dark:hover:text-white"
                >
                  {link.name}
                </Link>
                <span className="hidden text-black-25 md:inline dark:text-black-75">
                  &bull;
                </span>
              </React.Fragment>
            ))}
            <a
              href="https://github.com/netsci-rwth/ahorn"
              target="_blank"
              className="text-black-75 hover:text-black-100 dark:text-black-50 dark:hover:text-white"
            >
              <span className="sr-only">GitHub</span>
              <FontAwesomeIcon icon={faGithub} className="inline h-5 w-5" />
            </a>
          </div>
          <p className="mt-6 text-center text-sm text-black-75 md:order-1 md:mt-0 md:text-left dark:text-black-50">
            <Link
              href="/"
              className="hover:text-black-100 dark:hover:text-white"
            >
              AHORN
            </Link>{" "}
            is a project by the{" "}
            <a
              href="https://netsci.rwth-aachen.de/"
              className="hover:text-black-100 dark:hover:text-white"
            >
              Chair for Computational Network Science
            </a>{" "}
            at{" "}
            <a
              href="https://rwth-aachen.de/"
              className="hover:text-black-100 dark:hover:text-white"
            >
              RWTH Aachen University
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
