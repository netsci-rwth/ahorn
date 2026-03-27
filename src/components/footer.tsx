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
    <footer className="mt-12 border-t border-slate-200/80 bg-white/40">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm md:order-2 md:justify-end">
            {legal_links.map((link) => (
              <React.Fragment key={link.link}>
                <Link
                  href={link.link}
                  className="text-slate-600 hover:text-slate-900"
                >
                  {link.name}
                </Link>
                <span className="hidden text-slate-300 md:inline">&bull;</span>
              </React.Fragment>
            ))}
            <a
              href="https://github.com/netsci-rwth/ahorn"
              target="_blank"
              className="text-slate-600 hover:text-slate-900"
            >
              <span className="sr-only">GitHub</span>
              <FontAwesomeIcon icon={faGithub} className="inline h-5 w-5" />
            </a>
          </div>
          <p className="mt-6 text-center text-sm text-slate-600 md:order-1 md:mt-0 md:text-left">
            <Link href="/" className="hover:text-slate-900">
              AHORN
            </Link>{" "}
            is a project by the{" "}
            <a
              href="https://netsci.rwth-aachen.de/"
              className="hover:text-slate-900"
            >
              Chair for Computational Network Science
            </a>{" "}
            at{" "}
            <a href="https://rwth-aachen.de/" className="hover:text-slate-900">
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
