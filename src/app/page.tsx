import Link from "next/link";
import type { Metadata } from "next";
import Button from "@/components/button";
import Tag from "@/components/tag";
import { formatNetworkType, formatNumber } from "@/utils/format";

export const metadata: Metadata = {
  title: "AHORN - Aachen Higher-Order Repository of Networks",
  description:
    "Comprehensive repository of research-quality simplicial complex, cell complex, and hypergraph datasets for higher-order network science.",
};

type DatasetFrontmatter = {
  title?: unknown;
  "network-type"?: unknown;
  tags?: unknown;
  statistics?: Record<string, unknown>;
};

type DatasetModule = {
  frontmatter: DatasetFrontmatter;
};

type PopularDatasetConfig = {
  slug: string;
  summary: string;
};

type PopularDataset = {
  slug: string;
  title: string;
  summary: string;
  networkTypes: string[];
  tags: string[];
  numNodes: number | null;
  numEdges: number | null;
};

const POPULAR_DATASETS: PopularDatasetConfig[] = [
  {
    slug: "karate-club",
    summary:
      "A compact classic benchmark for exploring community structure and higher-order representations.",
  },
  {
    slug: "contact-high-school",
    summary:
      "Temporal proximity data from a school setting, useful for social interaction and contact-pattern studies.",
  },
  {
    slug: "dblp-coauthorship",
    summary:
      "Scholarly collaboration data built from co-authorship patterns in computer science.",
  },
  {
    slug: "senate-bills",
    summary:
      "Legislative sponsorship data capturing relationships between senators and bills.",
  },
  {
    slug: "algebra-questions",
    summary:
      "Question-answer interactions around algebra topics, with labeled higher-order question categories.",
  },
  {
    slug: "walmart-trips",
    summary:
      "Retail basket data that turns shopping trips into higher-order co-purchase structure.",
  },
];

function getStatisticValue(
  statistics: DatasetFrontmatter["statistics"],
  key: string,
): number | null {
  const value = statistics?.[key];
  return typeof value === "number" ? value : null;
}

function formatScale(dataset: Pick<PopularDataset, "numNodes" | "numEdges">) {
  const nodeLabel =
    dataset.numNodes === null
      ? "Unknown nodes"
      : `${formatNumber(dataset.numNodes)} nodes`;
  const edgeLabel =
    dataset.numEdges === null
      ? "See details"
      : `${formatNumber(dataset.numEdges)} relations`;

  return `${nodeLabel} · ${edgeLabel}`;
}

async function getPopularDatasets(): Promise<PopularDataset[]> {
  return Promise.all(
    POPULAR_DATASETS.map(async ({ slug, summary }) => {
      const { frontmatter } = (await import(
        `../datasets/${slug}.mdx`
      )) as DatasetModule;

      const networkTypes = Array.isArray(frontmatter["network-type"])
        ? frontmatter["network-type"].filter(
            (type): type is string => typeof type === "string",
          )
        : [];
      const tags = Array.isArray(frontmatter.tags)
        ? frontmatter.tags.filter(
            (tag): tag is string => typeof tag === "string",
          )
        : [];

      return {
        slug,
        title: typeof frontmatter.title === "string" ? frontmatter.title : slug,
        summary,
        networkTypes,
        tags,
        numNodes: getStatisticValue(frontmatter.statistics, "num-nodes"),
        numEdges: getStatisticValue(frontmatter.statistics, "num-edges"),
      };
    }),
  );
}

export default async function Home() {
  const popularDatasets = await getPopularDatasets();

  return (
    <>
      <section className="relative isolate pt-10">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-32"
        >
          <div
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
            className="relative left-[calc(50%-11rem)] aspect-1155/678 w-144.5 -translate-x-1/2 rotate-30 bg-linear-to-tr from-sky-300 to-primary opacity-30 sm:left-[calc(50%-30rem)] sm:w-288.75"
          />
        </div>
        <div className="w-full py-14 sm:py-18">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_20rem] lg:items-end">
            <div>
              <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-balance text-slate-950 sm:text-6xl lg:text-7xl dark:text-white">
                Aachen Higher-Order Repository of Networks
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-pretty text-slate-600 sm:text-xl dark:text-slate-300">
                Research-quality simplicial complex, cell complex, and
                hypergraph datasets for benchmarking, method development, and
                reproducible higher-order network science.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-3">
                <Button as={Link} href="/dataset" variant="primary">
                  Explore Datasets
                </Button>
                <Button
                  as={Link}
                  href="/about/contributing"
                  variant="secondary"
                >
                  Contribute a Dataset
                </Button>
                <Button as={Link} href="/about" variant="text">
                  Learn more{" "}
                  <span aria-hidden="true" className="ml-1">
                    →
                  </span>
                </Button>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {[
                [
                  "Curated",
                  "Research-oriented curation of datasets and extensive statistics.",
                ],
                ["Browsable", "Search, filter, and compare datasets quickly."],
                [
                  "Citable",
                  "Source attribution and BibTeX-ready references. Datasets indefinitely available on Zenodo.",
                ],
              ].map(([title, copy]) => (
                <div key={title} className="border-l-2 border-primary/20 pl-5">
                  <p className="text-sm font-semibold tracking-widest text-primary uppercase">
                    {title}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {copy}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-16 sm:mt-20" aria-labelledby="popular-datasets">
        <h2
          id="popular-datasets"
          className="mb-7 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white"
        >
          Popular Datasets
        </h2>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {popularDatasets.map((dataset) => (
            <article key={dataset.slug}>
              <Link
                href={`/dataset/${dataset.slug}`}
                className="flex min-h-72 flex-col rounded-2xl bg-slate-50/80 p-6 shadow-sm ring-1 ring-slate-950/5 transition duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-lg hover:shadow-slate-950/10 focus:ring-2 focus:ring-primary/40 focus:outline-none dark:bg-slate-900/70 dark:ring-white/10 dark:hover:bg-slate-900"
              >
                <p className="text-xs font-semibold tracking-wide text-primary uppercase dark:text-sky-300">
                  {dataset.networkTypes.map(formatNetworkType).join(" / ")}
                </p>

                <div className="mt-4 min-w-0">
                  <h3 className="text-xl font-semibold tracking-tight text-slate-950 transition-colors dark:text-white">
                    {dataset.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {dataset.summary}
                  </p>
                </div>

                <p className="mt-5 rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-950/5 dark:bg-slate-800/70 dark:text-slate-300 dark:ring-white/10">
                  {formatScale(dataset)}
                </p>

                <div className="mt-auto flex flex-wrap gap-2 pt-6">
                  {dataset.tags.map((tag) => (
                    <Tag key={tag} name={tag} />
                  ))}
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-16 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
        <div>
          <div className="prose max-w-none dark:prose-invert">
            <h2>What is AHORN?</h2>
            <p>
              AHORN is a repository of higher-order network datasets, providing
              researchers with access to resources for benchmarking, testing
              algorithms, and exploring new questions in network science.
            </p>
            <p>
              It is built around discoverability and reproducibility: each
              dataset page combines structured metadata, source links, download
              attachments, and citation information in one place.
            </p>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold tracking-widest text-primary uppercase">
            Work in Progress
          </p>
          <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
            AHORN was introduced at the{" "}
            <a
              href="https://conf.netsci.rwth-aachen.de/"
              className="font-semibold text-primary"
            >
              Higher Order Opportunities and Challenges
            </a>{" "}
            workshop in Aachen from August 11 to August 13, 2025. The repository
            is still expanding, and community contributions remain a central
            part of improving the collection and the overall user experience.
          </p>
        </div>
      </section>
    </>
  );
}
