import React from "react";
import Link from "next/link";

const legal_links = [
  { name: "Legal Notice", link: "/legal/imprint" },
  { name: "Privacy", link: "/legal/privacy" },
];

const Footer = () => {
  return (
    <footer className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between">
        <div className="flex justify-center gap-6 md:order-2">
          {legal_links.map((link) => (
            <Link
              key={link.link}
              href={link.link}
              className="text-gray-600 hover:text-gray-800"
            >
              {link.name}
            </Link>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-gray-600 md:order-1 md:mt-0">
          <Link href="/">AHORN</Link> is a project by the{" "}
          <a href="https://netsci.rwth-aachen.de/">
            Computational Network Science
          </a>{" "}
          group at <a href="https://rwth-aachen.de/">RWTH Aachen University</a>.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
