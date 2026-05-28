import Link from "next/link";

import Tag from "@/components/tag";
import { formatNetworkType, formatNumber } from "@/utils/format";
import classNames from "classnames";

type DatasetFrontmatter = {
  title?: unknown;
  "network-type"?: unknown;
  tags?: unknown;
  statistics?: Record<string, unknown>;
};

type DatasetModule = {
  frontmatter: DatasetFrontmatter;
};

type DatasetCard = {
  slug: string;
  title: string;
  summary?: string;
  networkTypes: string[];
  tags: string[];
  numNodes: number | null;
  numEdges: number | null;
};

type DatasetCardListProps = {
  slugs: readonly string[];
  columns?: "responsive" | "single";
  summaries?: Partial<Record<string, string>>;
};

function getStatisticValue(
  statistics: DatasetFrontmatter["statistics"],
  key: string,
): number | null {
  const value = statistics?.[key];
  return typeof value === "number" ? value : null;
}

function getStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function formatScale(dataset: Pick<DatasetCard, "numNodes" | "numEdges">) {
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

async function loadDatasetCard(
  slug: string,
  summary?: string,
): Promise<DatasetCard> {
  const { frontmatter } = (await import(
    `../datasets/${slug}.mdx`
  )) as DatasetModule;

  return {
    slug,
    title: typeof frontmatter.title === "string" ? frontmatter.title : slug,
    summary,
    networkTypes: getStringArray(frontmatter["network-type"]),
    tags: getStringArray(frontmatter.tags),
    numNodes: getStatisticValue(frontmatter.statistics, "num-nodes"),
    numEdges: getStatisticValue(frontmatter.statistics, "num-edges"),
  };
}

export default async function DatasetCardList({
  slugs,
  columns = "responsive",
  summaries = {},
}: DatasetCardListProps) {
  if (slugs.length === 0) {
    return null;
  }

  const datasets = await Promise.all(
    slugs.map((slug) => loadDatasetCard(slug, summaries[slug])),
  );

  return (
    <div className={classNames("grid gap-4", { "md:grid-cols-2 xl:grid-cols-3": columns !== "single" })}>
      {datasets.map((dataset) => (
        <article key={dataset.slug} className="h-full">
          <Link href={`/dataset/${dataset.slug}`} className={classNames("group flex h-full rounded-xl transition bg-slate-50/85 hover:bg-white dark:bg-slate-900/70 dark:hover:bg-slate-900", { "flex-col p-3": columns === "single", "min-h-60 flex-col p-4": columns !== "single" })}>
            <div className="min-w-0">
              <h3 className={classNames("font-semibold tracking-tight text-slate-950 transition group-hover:text-primary dark:text-white dark:group-hover:text-sky-300", { "text-base": columns === "single", "text-lg": columns !== "single" })}>
                {dataset.title}
              </h3>
              {dataset.networkTypes.length > 0 && (
                <p className="mt-1 text-xs font-semibold tracking-wide text-primary uppercase dark:text-sky-300">
                  {dataset.networkTypes.map(formatNetworkType).join(" / ")}
                </p>
              )}
            </div>

            {dataset.summary && (
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {dataset.summary}
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              {dataset.tags.map((tag) => (
                <Tag key={tag} name={tag} />
              ))}
            </div>

            <p className="mt-auto pt-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
              {formatScale(dataset)}
            </p>
          </Link>
        </article>
      ))}
    </div>
  );
}
