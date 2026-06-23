import Image from "next/image";
import Link from "next/link";
import type { Key, ReactNode } from "react";
import classNames from "classnames";
import { common, createStarryNight } from "@wooorm/starry-night";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

import Button from "@/components/button";
import PageHeader from "@/components/page-header";
import { surfaceClassName } from "@/components/surface";

const starryNightPromise = createStarryNight(common);

const cardPaddingClassName = "min-w-0 p-4 sm:p-5";
const bodyTextClassName = "text-sm leading-6 text-black-75 dark:text-black-25";
const mutedTextClassName =
  "text-xs font-medium break-words text-black-50 dark:text-black-50";
const iconFrameClassName =
  "flex shrink-0 items-center justify-center rounded-md border border-black-25 bg-white dark:border-black-75 dark:bg-black-100/80";
const codePanelClassName =
  "min-w-0 overflow-hidden rounded-md bg-black-100 shadow-inner";

export const metadata = {
  title: "Tools | AHORN - Aachen Higher-Order Repository of Networks",
  description: "A collection of tools for analyzing and visualizing networks.",
};

type AccessMethod = {
  title: string;
  description: string;
  href: string;
  icon: IconDefinition;
  internal?: boolean;
  label: string;
  snippets?: UsageSnippet[];
};

type Tool = {
  name: string;
  logo?: string;
  description: string;
  link: string;
  featured?: boolean;
  hifSupport?: boolean;
  snippets?: UsageSnippet[];
};

type UsageSnippet = {
  title?: string;
  language: string;
  code: string;
};

type StarryNode = {
  type: string;
  tagName?: string;
  value?: string;
  properties?: {
    className?: string | string[];
  };
  children?: StarryNode[];
};

const accessMethods: AccessMethod[] = [
  {
    title: "ahorn-loader",
    description:
      "Download datasets from the command line or load them in Python.",
    href: "/about/ahorn-loader",
    icon: faDownload,
    label: "Python / CLI",
    snippets: [
      {
        title: "Download a dataset",
        language: "bash",
        code: "uvx ahorn-loader download karate-club",
      },
      {
        title: "Read from Python",
        language: "python",
        code: `import ahorn_loader

with ahorn_loader.read_dataset(
    "karate-club",
) as dataset:
    for line in dataset:
        print(line)`,
      },
    ],
  },
];

const tools: Tool[] = [
  {
    name: "TopoNetX",
    logo: "/images/tools/toponetx.webp",
    description:
      "A Python library for higher-order network analysis, supporting simplicial and cell complexes.",
    link: "https://github.com/pyt-team/TopoNetX",
    featured: true,
    snippets: [
      {
        language: "python",
        code: `import toponetx as tnx

SC = tnx.datasets.load_ahorn_dataset("karate-club")
B1 = SC.incidence_matrix(1)`,
      },
    ],
  },
  {
    name: "HyperNetX",
    logo: "/images/tools/hypernetx.png",
    description: "A Python library for hypergraph analysis and visualization.",
    link: "https://hypernetx.readthedocs.io/en/latest/",
    hifSupport: true,
    snippets: [
      {
        language: "python",
        code: `import ahorn_loader
import hypernetx as hnx

hif_path = "cooking.hif.json.gz"
ahorn_loader.download_dataset("cooking", hif_path, format="hif")

H = hnx.from_hif(filename=hif_path)
print(H)`,
      },
    ],
  },
  {
    name: "XGI",
    description:
      "A Python package for higher-order network analysis with support for hypergraphs, simplicial complexes, and related structures.",
    link: "https://xgi.readthedocs.io/",
    hifSupport: true,
    snippets: [
      {
        language: "python",
        code: `import ahorn_loader
import xgi

hif_path = "cooking.hif.json.gz"
ahorn_loader.download_dataset("cooking", hif_path, format="hif")

H = xgi.read_hif(hif_path)
H.cleanup()`,
      },
    ],
  },
  {
    name: "Hypergraphx",
    description:
      "A library for modeling and analyzing higher-order systems, including directed, temporal, and multiplex hypergraphs.",
    link: "https://hypergraphx.readthedocs.io/",
    hifSupport: true,
    snippets: [
      {
        language: "python",
        code: `import ahorn_loader
from hypergraphx.readwrite import read_hif

hif_path = "cooking.hif.json.gz"
ahorn_loader.download_dataset("cooking", hif_path, format="hif")

H = read_hif(hif_path)
print(H)`,
      },
    ],
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

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: ReactNode;
}) {
  return (
    <div className="mb-4 w-full min-w-0 sm:max-w-3xl">
      <h2 className="text-xl font-semibold tracking-tight text-black-100 dark:text-white">
        {title}
      </h2>
      <p className={classNames("prose mt-1.5", bodyTextClassName)}>
        {description}
      </p>
    </div>
  );
}

function renderStarryNode(node: StarryNode, key: Key): ReactNode {
  if (node.type === "text") {
    return node.value ?? "";
  }

  if (node.type === "root") {
    return node.children?.map((child, index) => renderStarryNode(child, index));
  }

  if (node.type !== "element" || node.tagName !== "span") {
    return node.children?.map((child, index) => renderStarryNode(child, index));
  }

  const className = Array.isArray(node.properties?.className)
    ? node.properties.className.join(" ")
    : node.properties?.className;

  return (
    <span key={key} className={className}>
      {node.children?.map((child, index) => renderStarryNode(child, index))}
    </span>
  );
}

async function HighlightedCode({ snippet }: { snippet: UsageSnippet }) {
  const starryNight = await starryNightPromise;
  const scope = starryNight.flagToScope(snippet.language);

  if (!scope) {
    return <>{snippet.code}</>;
  }

  return <>{renderStarryNode(starryNight.highlight(snippet.code, scope), 0)}</>;
}

async function UsageSnippetCard({ snippet }: { snippet: UsageSnippet }) {
  return (
    <div className={codePanelClassName}>
      {snippet.title && (
        <div className="flex min-w-0 items-center justify-between gap-3 border-b border-white/10 px-3 py-2">
          <p className="min-w-0 text-xs font-semibold wrap-break-word text-white">
            {snippet.title}
          </p>
          <span className="shrink-0 text-[11px] font-medium text-black-25">
            {snippet.language}
          </span>
        </div>
      )}
      <pre className="max-w-full min-w-0 overflow-x-auto px-3 py-3 text-xs leading-5 text-white sm:text-sm">
        <code className="block min-w-0 wrap-break-word whitespace-pre-wrap">
          <HighlightedCode snippet={snippet} />
        </code>
      </pre>
    </div>
  );
}

async function UsageSnippets({
  snippets,
}: {
  snippets?: UsageSnippet[];
  showHeadlines?: boolean;
}) {
  if (!snippets?.length) {
    return null;
  }

  return (
    <div
      className={classNames(
        "mt-4 grid min-w-0 items-start gap-3",
        snippets.length > 1 && "lg:grid-cols-2",
      )}
    >
      {snippets.map((snippet) => (
        <UsageSnippetCard
          key={`${snippet.title}-${snippet.language}`}
          snippet={snippet}
        />
      ))}
    </div>
  );
}

function ExternalActionButton({
  href,
  ariaLabel,
  className,
}: {
  href: string;
  ariaLabel: string;
  className?: string;
}) {
  return (
    <Button
      as="a"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      variant="secondary"
      aria-label={ariaLabel}
      className={classNames(
        "min-h-8 shrink-0 rounded-lg px-2.5 py-0 text-xs",
        className,
      )}
    >
      <span>Open</span>
    </Button>
  );
}

function AccessCard({
  title,
  description,
  href,
  icon,
  label,
  snippets,
}: AccessMethod) {
  return (
    <article
      className={surfaceClassName({
        variant: snippets?.length ? "primary" : "secondary",
        className: cardPaddingClassName,
      })}
    >
      <header className="flex min-w-0 items-start gap-3">
        <span
          className={classNames(
            iconFrameClassName,
            "mt-0.5 size-8 text-blue-100 dark:text-blue-50",
          )}
        >
          <FontAwesomeIcon icon={icon} className="size-3.5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="text-sm font-semibold text-black-100 dark:text-white">
              {title}
            </h3>
            <span className={mutedTextClassName}>{label}</span>
          </div>
          <p className={classNames("mt-1", bodyTextClassName)}>{description}</p>
        </div>
        <Button
          as={Link}
          href={href}
          variant="secondary"
          className="min-h-8 shrink-0 rounded-lg px-2.5 py-0 text-xs"
        >
          View guide
        </Button>
      </header>
      <UsageSnippets snippets={snippets} />
    </article>
  );
}

function ToolLogo({ tool }: { tool: Tool }) {
  if (tool.logo) {
    return (
      <span
        className={classNames(iconFrameClassName, "size-10 bg-white p-1.5")}
      >
        <Image
          src={tool.logo}
          alt=""
          width={40}
          height={40}
          className="max-h-7 object-contain"
        />
      </span>
    );
  }

  return (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-md border border-black-25 bg-black-10 text-[11px] font-semibold tracking-wide text-black-75 uppercase dark:border-black-75 dark:bg-black-100 dark:text-black-25">
      {tool.name.slice(0, 3)}
    </span>
  );
}

function ToolRow({ tool }: { tool: Tool }) {
  return (
    <article
      className={surfaceClassName({
        variant: tool.featured ? "primary" : "secondary",
        className: classNames(
          "group relative h-full max-w-full",
          cardPaddingClassName,
        ),
      })}
    >
      <ExternalActionButton
        href={tool.link}
        ariaLabel={`Open ${tool.name} project`}
        className="absolute top-4 right-4 sm:top-5 sm:right-5"
      />
      <header className="flex min-w-0 gap-3 pr-24 sm:gap-4">
        <ToolLogo tool={tool} />
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold tracking-tight text-black-100 dark:text-white">
              {tool.name}
            </h3>
          </div>
          <p className={classNames("mt-1", bodyTextClassName)}>
            {tool.description}
          </p>
        </div>
      </header>
      <UsageSnippets snippets={tool.snippets} />
    </article>
  );
}

function ToolList({
  tools,
  columns = "single",
}: {
  tools: Tool[];
  columns?: "single" | "two";
}) {
  return (
    <ul
      className={classNames(
        "grid w-full min-w-0 gap-3",
        columns === "two" && "lg:grid-cols-2",
      )}
    >
      {tools.map((tool) => (
        <li key={tool.name} className="h-full">
          <ToolRow tool={tool} />
        </li>
      ))}
    </ul>
  );
}

function ToolSection({
  title,
  description,
  tools,
  columns = "single",
}: {
  title: string;
  description: string;
  tools: Tool[];
  columns?: "single" | "two";
}) {
  return (
    <section className="w-full min-w-0 py-8">
      <div className="mb-4 w-full min-w-0 sm:max-w-3xl">
        <h2 className="text-xl font-semibold tracking-tight text-black-100 dark:text-white">
          {title}
        </h2>
        <p className={classNames("prose mt-1.5", bodyTextClassName)}>
          {description}
        </p>
      </div>
      <ToolList tools={tools} columns={columns} />
    </section>
  );
}

export default function ToolsPage() {
  return (
    <div className="min-w-0" data-pagefind-body>
      <PageHeader
        eyebrow="Ecosystem"
        title="Tools"
        description="Tools for downloading, loading, and analyzing AHORN datasets from code."
      />

      <section className="w-full min-w-0 py-8">
        <SectionHeading
          title="Start from AHORN"
          description={
            <>
              Use the loader for everyday downloads and Python scripts. If you
              are building services around the repository, consume the{" "}
              <a href="/api/datasets.json">
                Datasets JSON API
              </a>{" "}
              for machine-readable metadata.
            </>
          }
        />
        <div className="grid w-full min-w-0 items-start gap-3">
          {accessMethods.map((method) => (
            <AccessCard key={method.title} {...method} />
          ))}
        </div>
      </section>

      <ToolSection
        title="AHORN Integration"
        description="Libraries that provide a direct path from AHORN datasets into analysis workflows."
        tools={tools.filter((tool) => tool.featured)}
        columns="two"
      />
      <ToolSection
        title="HIF Support"
        description="Libraries that align with the Hypergraph Interchange Format for exchanging higher-order network data."
        tools={tools.filter((tool) => !tool.featured && tool.hifSupport)}
        columns="two"
      />
      <ToolSection
        title="Broader Ecosystem"
        description="Related packages for simplicial complexes, topology, and adjacent higher-order analysis workflows."
        tools={tools.filter((tool) => !tool.featured && !tool.hifSupport)}
        columns="two"
      />
    </div>
  );
}
