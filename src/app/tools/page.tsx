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
    description: "A Python library for hypergraph analysis and visualization.",
    link: "https://hypernetx.readthedocs.io/en/latest/",
  },
];

export default function ToolsPage() {
  return (
    <div data-pagefind-body>
      <h1 className="mb-8 text-3xl font-bold text-gray-900">Tools</h1>
      <ul className="grid grid-cols-1 gap-10 md:grid-cols-2">
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
                className="rounded-lg bg-white object-contain shadow-lg"
              />
            </a>
            <div>
              <a
                href={tool.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary text-xl font-semibold hover:underline"
              >
                {tool.name}
              </a>
              <p className="mt-2 max-w-md text-gray-600">{tool.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
