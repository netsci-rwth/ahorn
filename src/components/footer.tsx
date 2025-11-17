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
    <footer className="bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between">
        <div className="flex justify-center gap-6 md:order-2">
          {legal_links.map((link) => (
            <React.Fragment key={link.link}>
              <Link
                href={link.link}
                className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
              >
                {link.name}
              </Link>
              <span className="mx-2 text-gray-400 dark:text-gray-600">
                &bull;
              </span>
            </React.Fragment>
          ))}
          <a
            href="https://github.com/netsci-rwth/ahorn"
            target="_blank"
            className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
          >
            <span className="sr-only">GitHub</span>
            <FontAwesomeIcon icon={faGithub} className="inline h-5 w-5" />
          </a>
        </div>
        <p className="mt-8 text-center text-sm text-gray-600 md:order-1 md:mt-0 dark:text-gray-300">
          <Link
            href="/"
            className="hover:text-gray-800 dark:text-gray-200 dark:hover:text-white"
          >
            AHORN
          </Link>{" "}
          is a project by the{" "}
          <a
            href="https://netsci.rwth-aachen.de/"
            className="hover:text-gray-800 dark:text-gray-200 dark:hover:text-white"
          >
            Computational Network Science
          </a>{" "}
          group at{" "}
          <a
            href="https://rwth-aachen.de/"
            className="hover:text-gray-800 dark:text-gray-200 dark:hover:text-white"
          >
            RWTH Aachen University
          </a>
          .
        </p>
      </div>
    </footer>
  );
};

export default Footer;
