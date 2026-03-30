import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBox, faCode } from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import PageHeader from "@/components/page-header";

export const metadata = {
  title: "Tools | AHORN - Aachen Higher-Order Repository of Networks",
  description: "A collection of tools for analyzing and visualizing networks.",
};

const integratedTools = [
  {
    name: "TopoNetX",
    logo: "images/tools/toponetx.webp",
    description:
      "A Python library for higher-order network analysis, supporting simplicial and cell complexes.",
    link: "https://github.com/pyt-team/TopoNetX",
  },
];

const ecosystemTools = [
  {
    name: "HyperNetX",
    logo: "images/tools/hypernetx.png",
    description: "A Python library for hypergraph analysis and visualization.",
    link: "https://hypernetx.readthedocs.io/en/latest/",
  },
  {
    name: "XGI",
    description:
      "A Python package for higher-order network analysis with support for hypergraphs, simplicial complexes, and related structures.",
    link: "https://xgi.readthedocs.io/",
  },
  {
    name: "Hypergraphx",
    description:
      "A library for modeling and analyzing higher-order systems, including directed, temporal, and multiplex hypergraphs.",
    link: "https://hypergraphx.readthedocs.io/",
  },
  {
    name: "PyTSPL",
    description:
      "A Python library for topological signal processing and learning on simplicial complexes and higher-order domains.",
    link: "https://pytspl.readthedocs.io/",
  },
  {
    name: "GUDHI",
    description:
      "A topological data analysis library with extensive support for simplicial complexes and related computational topology workflows.",
    link: "https://gudhi.inria.fr/python/latest/",
  },
];

const quickLinks: {
  title: string;
  description: string;
  href: string;
  icon: IconDefinition;
  internal?: boolean;
}[] = [
  {
    title: "Datasets JSON API",
    description: "Machine-readable metadata for the full repository.",
    href: "https://ahorn.rwth-aachen.de/api/datasets.json",
    icon: faCode,
  },
  {
    title: "ahorn-loader",
    description: "Python package for easier programmatic access and downloads.",
    href: "/about/ahorn-loader",
    icon: faBox,
    internal: true,
  },
];

type Tool = {
  name: string;
  logo?: string;
  description: string;
  link: string;
};

function QuickLink({
  title,
  description,
  href,
  icon,
  internal = false,
}: {
  title: string;
  description: string;
  href: string;
  icon: IconDefinition;
  internal?: boolean;
}) {
  const content = (
    <>
      <span className="inline-flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
        <FontAwesomeIcon icon={icon} className="size-4 text-primary" />
        {title}
      </span>
      <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
        {description}
      </p>
    </>
  );

  if (internal) {
    return (
      <Link
        href={href}
        className={
          "block rounded-2xl border border-slate-200/80 bg-white/75 px-4 py-4 shadow-sm transition-colors hover:border-primary/20 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/55 dark:hover:border-slate-700 dark:hover:bg-slate-900/80"
        }
      >
        {content}
      </Link>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={
        "block rounded-2xl border border-slate-200/80 bg-white/75 px-4 py-4 shadow-sm transition-colors hover:border-primary/20 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/55 dark:hover:border-slate-700 dark:hover:bg-slate-900/80"
      }
    >
      {content}
    </a>
  );
}

function ToolList({ tools }: { tools: Tool[] }) {
  return (
    <ul className="grid grid-cols-1 gap-x-12 gap-y-10 pl-0 md:grid-cols-2">
      {tools.map((tool) => (
        <li key={tool.name} className="mt-0 mb-0 pl-0">
          <a
            href={tool.link}
            target="_blank"
            className={
              "flex items-start gap-6 rounded-3xl bg-white/75 px-5 py-5 transition-colors hover:border-primary/20 hover:bg-slate-50 dark:bg-slate-950/45 dark:hover:bg-slate-900/75"
            }
          >
            <div className="flex size-24 shrink-0 items-center justify-center">
              {tool.logo ? (
                <Image
                  src={tool.logo}
                  alt={`${tool.name} logo`}
                  width={88}
                  height={88}
                  className="object-contain"
                  role="presentation"
                />
              ) : (
                <span className="inline-flex size-16 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold tracking-[0.2em] text-slate-700 uppercase ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700">
                  {tool.name.slice(0, 3)}
                </span>
              )}
            </div>
            <div>
              <h4 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                {tool.name}
              </h4>
              <p className="mt-2 max-w-md text-base leading-7 text-slate-600 dark:text-slate-300">
                {tool.description}
              </p>
            </div>
          </a>
        </li>
      ))}
    </ul>
  );
}

export default function ToolsPage() {
  return (
    <div data-pagefind-body>
      <PageHeader
        eyebrow="Ecosystem"
        title="Tools"
        description="Utilities and external libraries for programmatically accessing AHORN and working with higher-order network data."
      />

      <section className="grid gap-10 py-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
        <div className="prose max-w-full dark:prose-invert">
          <h2>Interacting with AHORN</h2>
          <p>
            If you want to programmatically interact with AHORN, we provide a
            JSON file that contains machine-readable data about all datasets in
            the repository. You can find it at{" "}
            <a
              href="https://ahorn.rwth-aachen.de/api/datasets.json"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://ahorn.rwth-aachen.de/api/datasets.json
            </a>
            .
          </p>
          <p>
            For a more convenient experience, we also provide the Python package{" "}
            <Link href="/about/ahorn-loader">ahorn-loader</Link> for easy access
            to the AHORN API.
          </p>
        </div>

        <div className="border-l-2 border-primary/20 pl-7 dark:border-slate-800">
          <p className="text-sm font-semibold tracking-[0.22em] text-primary uppercase dark:text-sky-300">
            Quick Access
          </p>
          <ul className="mt-4 space-y-4">
            {quickLinks.map((link) => (
              <li key={link.title}>
                <QuickLink {...link} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-slate-200 py-8 dark:border-slate-800">
        <div className="prose max-w-full dark:prose-invert">
          <h2>Libraries Integrating with AHORN</h2>
          <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
            These libraries complement AHORN and are useful for analyzing,
            transforming, and visualizing higher-order network data in practice.
          </p>
        </div>
        <div className="mt-8">
          <ToolList tools={integratedTools} />
        </div>
      </section>

      <section className="border-t border-slate-200 py-8 dark:border-slate-800">
        <div className="prose max-w-full dark:prose-invert">
          <h2>Related Tools in the Ecosystem</h2>
          <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
            These libraries are part of the broader higher-order network
            ecosystem and can be useful for working with AHORN datasets, even
            without direct integration.
          </p>
        </div>
        <div className="mt-8">
          <ToolList tools={ecosystemTools} />
        </div>
      </section>
    </div>
  );
}
