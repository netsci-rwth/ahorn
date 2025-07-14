import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Tools | AHORN - Aachen Higher-Order Repository of Networks",
  description: "A collection of tools for analyzing and visualizing networks.",
};

const tools = [
  {
    name: "TopoNetX",
    logo: "images/tools/toponetx.webp",
    description:
      "A Python library for higher-order network analysis, supporting simplicial and cell complexes.",
    link: "https://github.com/pyt-team/TopoNetX",
  },
  {
    name: "HyperNetX",
    logo: "images/tools/hypernetx.png",
    description:
      "A Python library for hypergraph analysis and visualization.",
    link: "https://hypernetx.readthedocs.io/en/latest/",
  },
];

export default function ToolsPage() {
  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Tools</h1>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {tools.map((tool) => (
          <li key={tool.name} className="flex items-center gap-8">
            <a
              href={tool.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Image
                src={tool.logo}
                alt={tool.name + " logo"}
                width={96}
                height={96}
                className="rounded-lg shadow-lg bg-white object-contain"
              />
            </a>
            <div>
              <a
                href={tool.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xl font-semibold text-primary hover:underline"
              >
                {tool.name}
              </a>
              <p className="mt-2 text-gray-600 max-w-md">
                {tool.description}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
