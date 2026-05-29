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
    <div
      className={classNames({
        "grid gap-x-8 gap-y-9 md:grid-cols-2 xl:grid-cols-3":
          columns !== "single",
        grid: columns === "single",
      })}
    >
      {datasets.map((dataset) => {
        const isSingleColumn = columns === "single";

        return (
          <article key={dataset.slug} className="h-full">
            <Link
              href={`/dataset/${dataset.slug}`}
              className={classNames(
                "relative flex h-full min-w-0 transition",
                "before:absolute before:left-0 before:w-0.5 before:bg-blue-75 before:transition hover:bg-blue-10/35 hover:before:bg-blue-100 dark:before:bg-blue-50 dark:hover:bg-blue-100/10",
                {
                  "flex-col py-4 pr-3 pl-4 before:top-4 before:h-9":
                    isSingleColumn,
                  "min-h-60 flex-col py-5 pr-4 pl-5 before:top-5 before:h-12":
                    !isSingleColumn,
                },
              )}
            >
              <div className="min-w-0">
                {dataset.networkTypes.length > 0 && (
                  <p
                    className={classNames(
                      "font-semibold tracking-wide text-blue-100 uppercase dark:text-blue-50",
                      {
                        "text-[0.68rem]": isSingleColumn,
                        "text-xs": !isSingleColumn,
                      },
                    )}
                  >
                    {dataset.networkTypes.map(formatNetworkType).join(" / ")}
                  </p>
                )}
                <h3
                  className={classNames(
                    "mt-1 font-semibold tracking-tight text-black-100 transition dark:text-white",
                    {
                      "text-base leading-6": isSingleColumn,
                      "text-xl leading-7": !isSingleColumn,
                    },
                  )}
                >
                  {dataset.title}
                </h3>
              </div>

              {dataset.summary && (
                <p
                  className={classNames(
                    "text-sm text-black-75 dark:text-black-25",
                    {
                      "mt-2 line-clamp-3 leading-6": isSingleColumn,
                      "mt-4 leading-6": !isSingleColumn,
                    },
                  )}
                >
                  {dataset.summary}
                </p>
              )}

              {dataset.tags.length > 0 && (
                <div
                  className={classNames("flex flex-wrap gap-2", {
                    "mt-3": isSingleColumn,
                    "mt-5": !isSingleColumn,
                  })}
                >
                  {dataset.tags.map((tag) => (
                    <Tag key={tag} name={tag} />
                  ))}
                </div>
              )}

              <p
                className={classNames(
                  "mt-auto text-xs font-semibold tracking-wide text-black-50 dark:text-black-50",
                  {
                    "pt-3": isSingleColumn,
                    "pt-5": !isSingleColumn,
                  },
                )}
              >
                {formatScale(dataset)}
              </p>
            </Link>
          </article>
        );
      })}
    </div>
  );
}
