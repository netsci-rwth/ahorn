import Link from "next/link";

import Tag from "@/components/tag";
import { surfaceClassName } from "@/components/surface";
import { type DatasetFrontmatter } from "@/utils/datasets";
import { formatNetworkType, formatNumber } from "@/utils/format";
import classNames from "classnames";

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
  numInteractions: number | null;
};

type DatasetCardListProps = {
  slugs: readonly string[];
  columns?: "responsive" | "single";
  summaries?: Partial<Record<string, string>>;
  backgroundEffect?: boolean;
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

function formatScale(
  dataset: Pick<DatasetCard, "numNodes" | "numInteractions">,
) {
  const nodeLabel =
    dataset.numNodes === null
      ? "Unknown nodes"
      : `${formatNumber(dataset.numNodes)} nodes`;
  const interactionLabel =
    dataset.numInteractions === null
      ? "See details"
      : `${formatNumber(dataset.numInteractions)} relations`;

  return `${nodeLabel} · ${interactionLabel}`;
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
    numInteractions: getStatisticValue(
      frontmatter.statistics,
      "num-interactions",
    ),
  };
}

export default async function DatasetCardList({
  slugs,
  columns = "responsive",
  summaries = {},
  backgroundEffect = true,
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
        "grid gap-3": columns === "single",
      })}
    >
      {datasets.map((dataset) => {
        const isSingleColumn = columns === "single";
        const hasSummary = typeof dataset.summary === "string";

        return (
          <article key={dataset.slug} className="h-full">
            <Link
              href={`/dataset/${dataset.slug}`}
              className={surfaceClassName({
                variant:
                  isSingleColumn || !backgroundEffect ? "secondary" : "primary",
                interactive: true,
                className: classNames(
                  "relative flex h-full min-w-0",
                  "before:absolute before:left-0 before:w-0.5 before:bg-blue-75 before:transition hover:before:bg-blue-100 dark:before:bg-blue-50",
                  {
                    "flex-col py-4 pr-3 pl-4 before:top-4 before:h-9":
                      isSingleColumn,
                    "min-h-60 flex-col py-5 pr-4 pl-5 before:top-5 before:h-12":
                      !isSingleColumn && hasSummary,
                    "flex-col py-4 pr-4 pl-5 before:top-4 before:h-9":
                      !isSingleColumn && !hasSummary,
                  },
                ),
              })}
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
                  "text-xs font-semibold tracking-wide text-black-50 dark:text-black-50",
                  {
                    "mt-auto": hasSummary,
                    "mt-3": !hasSummary,
                    "pt-3": isSingleColumn,
                    "pt-5": !isSingleColumn && hasSummary,
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
