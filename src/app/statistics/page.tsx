import fs from "fs";
import path from "path";
import Link from "next/link";
import type { Metadata } from "next";

import PageHeader from "@/components/page-header";
import StatisticsBlock from "@/components/statistics-block";
import { getParentSlug } from "@/utils/datasets";
import { formatNetworkType, formatNumber } from "@/utils/format";
import { getTagDisplayLabel } from "@/utils/tags";

export const metadata: Metadata = {
  title: "Statistics | AHORN - Aachen Higher-Order Repository of Networks",
  description:
    "Repository-level statistics for the AHORN higher-order network dataset collection.",
};

type Frontmatter = {
  title?: unknown;
  disable?: unknown;
  source?: unknown;
  license?: unknown;
  citation?: unknown;
  parent?: unknown;
  related?: unknown;
  tags?: unknown;
  "network-type"?: unknown;
  attachments?: unknown;
  statistics?: Record<string, unknown>;
};

type DatasetSummary = {
  slug: string;
  title: string;
  isSubDataset: boolean;
  numNodes: number | null;
  numRelations: number | null;
};

type SplitCount = {
  primary: number;
  secondary: number;
};

type RepositoryStatistics = {
  datasetCount: number;
  primaryDatasetCount: number;
  uniqueTagCount: number;
  totalTagAssignments: number;
  downloadableFileCount: number;
  datasetsWithAttachments: number;
  networkTypeCounts: Record<string, number>;
  tagCounts: Record<string, number>;
  domainTagCounts: Record<string, SplitCount>;
  sourceTagCounts: Record<string, SplitCount>;
  metadataTagCounts: Record<string, SplitCount>;
  formatCounts: Record<string, number>;
  revisionCounts: Record<string, number>;
  licenseCounts: Record<string, SplitCount>;
  sourceHostCounts: Record<string, SplitCount>;
  citationCount: number;
  relatedCount: number;
  nodeBuckets: Record<string, SplitCount>;
  relationBuckets: Record<string, SplitCount>;
  topByNodes: DatasetSummary[];
  topByRelations: DatasetSummary[];
};

const SIZE_BUCKETS = [
  { label: "Under 1K", min: 0, max: 999 },
  { label: "1K-9.9K", min: 1_000, max: 9_999 },
  { label: "10K-99K", min: 10_000, max: 99_999 },
  { label: "100K-999K", min: 100_000, max: 999_999 },
  { label: "1M+", min: 1_000_000, max: Number.POSITIVE_INFINITY },
];

function getStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function increment(counts: Record<string, number>, key: string, by = 1) {
  counts[key] = (counts[key] ?? 0) + by;
}

function incrementSplitCount(
  counts: Record<string, SplitCount>,
  key: string,
  kind: keyof SplitCount,
) {
  counts[key] = counts[key] ?? { primary: 0, secondary: 0 };
  counts[key][kind] += 1;
}

function getStatisticValue(
  statistics: Frontmatter["statistics"],
  key: string,
): number | null {
  const value = statistics?.[key];
  return typeof value === "number" ? value : null;
}

function getSourceHost(source: unknown): string {
  if (typeof source !== "string") {
    return "Unknown";
  }

  try {
    return new URL(source).hostname.replace(/^www\./, "");
  } catch {
    return "Unknown";
  }
}

function getLicenseLabel(license: unknown): string {
  if (!license) {
    return "Unknown";
  }

  if (typeof license === "string") {
    return license === "unprovided-reuse-encouraged"
      ? "Reuse encouraged"
      : license;
  }

  if (typeof license === "object") {
    const spdx = (license as { spdx?: unknown }).spdx;
    return typeof spdx === "string" ? spdx : "Custom";
  }

  return "Unknown";
}

function isRevisionKey(key: string): boolean {
  return /^revision-\d+$/i.test(key);
}

function getAttachmentStats(attachments: unknown): {
  revisionCount: number;
  formats: string[];
  formatCounts: Record<string, number>;
} {
  if (!attachments || typeof attachments !== "object") {
    return {
      revisionCount: 0,
      formats: [],
      formatCounts: {},
    };
  }

  const formats = new Set<string>();
  const formatCounts: Record<string, number> = {};
  const revisionEntries = Object.entries(attachments)
    .map(([key, value]) => ({ key, value }))
    .filter(
      (
        entry,
      ): entry is {
        key: string;
        value: Record<string, unknown>;
      } =>
        isRevisionKey(entry.key) &&
        entry.value !== null &&
        typeof entry.value === "object",
    );

  const revisionCount = revisionEntries.length;

  for (const { value: revision } of revisionEntries) {
    for (const [format, value] of Object.entries(revision)) {
      if (format === "changelog" || typeof value !== "string") {
        continue;
      }
      formats.add(format);
      increment(formatCounts, format);
    }
  }

  return {
    revisionCount,
    formats: [...formats].sort(),
    formatCounts,
  };
}

function bucketize(
  values: Array<{ value: number | null; isSubDataset: boolean }>,
): Record<string, SplitCount> {
  const buckets = Object.fromEntries(
    SIZE_BUCKETS.map(({ label }) => [label, { primary: 0, secondary: 0 }]),
  );

  for (const { value, isSubDataset } of values) {
    if (value === null) {
      continue;
    }

    const bucket = SIZE_BUCKETS.find(
      ({ min, max }) => value >= min && value <= max,
    );
    if (bucket) {
      incrementSplitCount(
        buckets,
        bucket.label,
        isSubDataset ? "secondary" : "primary",
      );
    }
  }

  return buckets;
}

function topBy(
  datasets: DatasetSummary[],
  key: "numNodes" | "numRelations",
): DatasetSummary[] {
  return datasets
    .filter((dataset) => dataset[key] !== null)
    .sort((a, b) => (b[key] ?? 0) - (a[key] ?? 0))
    .slice(0, 8);
}

async function getRepositoryStatistics(): Promise<RepositoryStatistics> {
  const datasetsDir = path.join(process.cwd(), "src", "datasets");
  const filenames = await fs.promises.readdir(datasetsDir);

  const imported = await Promise.all(
    filenames
      .filter((filename) => filename.endsWith(".mdx"))
      .map(async (filename) => {
        const { frontmatter } = (await import(`@/datasets/${filename}`)) as {
          frontmatter: Frontmatter;
        };
        return {
          slug: path.parse(filename).name,
          frontmatter,
        };
      }),
  );

  const datasets: DatasetSummary[] = [];
  const networkTypeCounts: Record<string, number> = {};
  const tagCounts: Record<string, number> = {};
  const domainTagCounts: Record<string, SplitCount> = {};
  const sourceTagCounts: Record<string, SplitCount> = {};
  const metadataTagCounts: Record<string, SplitCount> = {};
  const formatCounts: Record<string, number> = {};
  const revisionCounts: Record<string, number> = {};
  const licenseCounts: Record<string, SplitCount> = {};
  const sourceHostCounts: Record<string, SplitCount> = {};
  let citationCount = 0;
  let relatedCount = 0;
  let primaryDatasetCount = 0;
  let totalTagAssignments = 0;
  let downloadableFileCount = 0;
  let datasetsWithAttachments = 0;

  for (const { slug, frontmatter } of imported) {
    if (frontmatter.disable === true) {
      continue;
    }

    const networkTypes = getStringArray(frontmatter["network-type"]);
    const tags = getStringArray(frontmatter.tags);
    const isSubDataset = getParentSlug(frontmatter.parent) !== null;
    const sourceHost = getSourceHost(frontmatter.source);
    const license = getLicenseLabel(frontmatter.license);
    const attachmentStats = getAttachmentStats(frontmatter.attachments);
    const related = getStringArray(frontmatter.related);
    const hasCitation =
      Array.isArray(frontmatter.citation) && frontmatter.citation.length > 0;

    if (!isSubDataset) {
      primaryDatasetCount += 1;
    }

    totalTagAssignments += tags.length;
    for (const type of networkTypes) {
      increment(networkTypeCounts, type);
    }
    for (const tag of tags) {
      increment(tagCounts, tag);
      const [prefix, value] = tag.split(":").map((part) => part.trim());
      if (prefix === "domain" && value) {
        incrementSplitCount(
          domainTagCounts,
          value,
          isSubDataset ? "secondary" : "primary",
        );
      }
      if (prefix === "source" && value) {
        incrementSplitCount(
          sourceTagCounts,
          value,
          isSubDataset ? "secondary" : "primary",
        );
      }
      if (prefix === "metadata" && value) {
        incrementSplitCount(
          metadataTagCounts,
          value,
          isSubDataset ? "secondary" : "primary",
        );
      }
    }
    for (const [format, count] of Object.entries(
      attachmentStats.formatCounts,
    )) {
      increment(formatCounts, format, count);
      downloadableFileCount += count;
    }
    if (attachmentStats.revisionCount > 0) {
      datasetsWithAttachments += 1;
    }
    increment(
      revisionCounts,
      attachmentStats.revisionCount === 1
        ? "1 revision"
        : `${attachmentStats.revisionCount} revisions`,
    );
    incrementSplitCount(
      licenseCounts,
      license,
      isSubDataset ? "secondary" : "primary",
    );
    incrementSplitCount(
      sourceHostCounts,
      sourceHost,
      isSubDataset ? "secondary" : "primary",
    );

    if (!isSubDataset && hasCitation) {
      citationCount += 1;
    }
    if (!isSubDataset && related.length > 0) {
      relatedCount += 1;
    }

    datasets.push({
      slug,
      title: typeof frontmatter.title === "string" ? frontmatter.title : slug,
      isSubDataset,
      numNodes: getStatisticValue(frontmatter.statistics, "num-nodes"),
      numRelations: getStatisticValue(frontmatter.statistics, "num-edges"),
    });
  }

  datasets.sort((a, b) => a.title.localeCompare(b.title));

  return {
    datasetCount: datasets.length,
    primaryDatasetCount,
    uniqueTagCount: Object.keys(tagCounts).length,
    totalTagAssignments,
    downloadableFileCount,
    datasetsWithAttachments,
    networkTypeCounts,
    tagCounts,
    domainTagCounts,
    sourceTagCounts,
    metadataTagCounts,
    formatCounts,
    revisionCounts,
    licenseCounts,
    sourceHostCounts,
    citationCount,
    relatedCount,
    nodeBuckets: bucketize(
      datasets.map((dataset) => ({
        value: dataset.numNodes,
        isSubDataset: dataset.isSubDataset,
      })),
    ),
    relationBuckets: bucketize(
      datasets.map((dataset) => ({
        value: dataset.numRelations,
        isSubDataset: dataset.isSubDataset,
      })),
    ),
    topByNodes: topBy(datasets, "numNodes"),
    topByRelations: topBy(datasets, "numRelations"),
  };
}

function formatPercent(value: number, total: number): string {
  if (total === 0) {
    return "0%";
  }
  return `${Math.round((value / total) * 100)}%`;
}

function displayFormat(format: string): string {
  return format.toUpperCase();
}

type CountListItem = {
  label: string;
  value: number;
  href?: string;
};

type SplitDistributionItem = {
  label: string;
  primary: number;
  secondary: number;
  href?: string;
};

function CountList({
  items,
  valueFormatter = formatNumber,
}: {
  items: CountListItem[];
  valueFormatter?: (value: number) => string;
}) {
  const maxValue = Math.max(...items.map(({ value }) => value), 1);

  return (
    <ul className="space-y-3">
      {items.map(({ label, value, href }) => {
        const content = (
          <>
            <div className="mb-1 flex items-center justify-between gap-3 text-sm">
              <span className="min-w-0 truncate font-medium text-black-100 dark:text-white">
                {label}
              </span>
              <span className="shrink-0 text-xs font-semibold text-black-75 dark:text-black-25">
                {valueFormatter(value)}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/90 dark:bg-black-100/70">
              <div
                className="h-2 rounded-full bg-blue-100 dark:bg-blue-50"
                style={{ width: `${Math.max(4, (value / maxValue) * 100)}%` }}
              />
            </div>
          </>
        );

        return (
          <li key={label}>
            {href ? (
              <Link
                href={href}
                className="-mx-2 -my-1 block rounded-lg px-2 py-1 transition hover:bg-white/75 hover:text-blue-100 focus:ring-2 focus:ring-blue-100/30 focus:outline-none dark:hover:bg-black-100/55 dark:hover:text-blue-50"
              >
                {content}
              </Link>
            ) : (
              content
            )}
          </li>
        );
      })}
    </ul>
  );
}

function sortedEntries(
  counts: Record<string, number>,
  limit?: number,
  formatter?: (label: string) => string,
  hrefBuilder?: (label: string) => string,
): CountListItem[] {
  const entries = Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([label, value]) => ({
      label: formatter ? formatter(label) : label,
      value,
      href: hrefBuilder?.(label),
    }));

  return typeof limit === "number" ? entries.slice(0, limit) : entries;
}

function sortedSplitEntries(
  counts: Record<string, SplitCount>,
  hrefBuilder?: (label: string) => string,
  limit?: number,
): SplitDistributionItem[] {
  const entries = Object.entries(counts)
    .map(([label, value]) => ({
      label,
      primary: value.primary,
      secondary: value.secondary,
      href: hrefBuilder?.(label),
    }))
    .sort(
      (a, b) =>
        b.primary + b.secondary - (a.primary + a.secondary) ||
        a.label.localeCompare(b.label),
    );

  return typeof limit === "number" ? entries.slice(0, limit) : entries;
}

function splitCountItems(counts: Record<string, SplitCount>) {
  return Object.entries(counts).map(([label, value]) => ({
    label,
    primary: value.primary,
    secondary: value.secondary,
  }));
}

function tagFilterHref(tag: string): string {
  return `/dataset?tags=${encodeURIComponent(tag)}`;
}

function networkTypeFilterHref(type: string): string {
  return `/dataset?types=${encodeURIComponent(type)}`;
}

function tagFamilyFilterHref(prefix: string) {
  return (value: string) => tagFilterHref(`${prefix}: ${value}`);
}

function datasetMetricItems({
  datasets,
  valueKey,
}: {
  datasets: DatasetSummary[];
  valueKey: "numNodes" | "numRelations";
}): CountListItem[] {
  return datasets.flatMap((dataset) => {
    const value = dataset[valueKey];

    return value === null
      ? []
      : [
          {
            label: dataset.title,
            value,
            href: `/dataset/${dataset.slug}`,
          },
        ];
  });
}

const chartPalette = [
  "bg-blue-100 dark:bg-blue-50",
  "bg-turquoise-100 dark:bg-turquoise-50",
  "bg-green-100 dark:bg-green-50",
  "bg-orange-100 dark:bg-orange-75",
  "bg-magenta-100 dark:bg-magenta-50",
  "bg-purple-100 dark:bg-purple-50",
] as const;

const domainChartPalette = [
  {
    primary: "bg-blue-100 dark:bg-blue-50",
    secondary: "bg-blue-25 dark:bg-blue-100/35",
  },
  {
    primary: "bg-turquoise-100 dark:bg-turquoise-50",
    secondary: "bg-turquoise-25 dark:bg-turquoise-100/35",
  },
  {
    primary: "bg-green-100 dark:bg-green-50",
    secondary: "bg-green-25 dark:bg-green-100/35",
  },
  {
    primary: "bg-orange-100 dark:bg-orange-75",
    secondary: "bg-orange-25 dark:bg-orange-100/35",
  },
  {
    primary: "bg-magenta-100 dark:bg-magenta-50",
    secondary: "bg-magenta-25 dark:bg-magenta-100/35",
  },
  {
    primary: "bg-purple-100 dark:bg-purple-50",
    secondary: "bg-purple-25 dark:bg-purple-100/35",
  },
] as const;

function ratio(value: number, total: number): number {
  return total === 0 ? 0 : value / total;
}

function HeroMetricPanel({
  statistics,
  citationCoverage,
  relatedCoverage,
}: {
  statistics: RepositoryStatistics;
  citationCoverage: string;
  relatedCoverage: string;
}) {
  const averageTags =
    statistics.datasetCount === 0
      ? 0
      : statistics.totalTagAssignments / statistics.datasetCount;

  return (
    <StatisticsBlock
      variant="primary"
      className="min-w-0 overflow-hidden p-0 lg:col-span-7"
      bodyClassName="mt-0"
    >
      <div className="grid min-w-0 gap-0 lg:grid-cols-[1.15fr_1.85fr]">
        <div className="border-b border-blue-25/80 p-6 lg:border-r lg:border-b-0 dark:border-blue-75/30">
          <p className="text-xs font-semibold tracking-widest text-blue-100 uppercase dark:text-blue-50">
            Repository index
          </p>
          <p className="mt-5 text-6xl leading-none font-semibold tracking-tight text-black-100 sm:text-7xl dark:text-white">
            {formatNumber(statistics.datasetCount)}
          </p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-black-75 dark:text-black-25">
            datasets with typed models, structured metadata, source links, and
            downloadable research artifacts.
          </p>
        </div>
        <dl className="grid min-w-0 sm:grid-cols-2">
          {[
            {
              title: "Unique tags",
              value: formatNumber(statistics.uniqueTagCount),
              detail: `${averageTags.toFixed(1)} tags per dataset on average`,
            },
            {
              title: "Downloadable files",
              value: formatNumber(statistics.downloadableFileCount),
              detail: `${formatNumber(statistics.datasetsWithAttachments)} datasets include attachments`,
            },
            {
              title: "Citation coverage",
              value: citationCoverage,
              detail: `${formatNumber(statistics.citationCount)} primary datasets include citation metadata`,
            },
            {
              title: "Related links",
              value: relatedCoverage,
              detail: `${formatNumber(statistics.relatedCount)} primary datasets point to related entries`,
            },
          ].map((metric) => (
            <div key={metric.title} className="min-w-0 p-5">
              <dt className="text-xs font-semibold tracking-wide text-black-50 uppercase dark:text-black-50">
                {metric.title}
              </dt>
              <dd className="mt-2 text-3xl leading-tight font-semibold tracking-tight text-black-100 dark:text-white">
                {metric.value}
              </dd>
              <dd className="mt-2 text-sm leading-6 wrap-break-word text-black-75 dark:text-black-25">
                {metric.detail}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </StatisticsBlock>
  );
}

function StackedDistribution({
  title,
  items,
}: {
  title: string;
  items: CountListItem[];
}) {
  const total = items.reduce((sum, item) => sum + item.value, 0);

  return (
    <StatisticsBlock
      title={title}
      variant="primary"
      className="min-w-0 lg:col-span-4"
    >
      <div className="flex h-4 overflow-hidden rounded-full bg-black-10 dark:bg-black-75/40">
        {items.map((item, index) => (
          <Link
            key={item.label}
            href={item.href ?? "#"}
            aria-label={`${item.label}: ${formatPercent(item.value, total)}`}
            className={`${chartPalette[index % chartPalette.length]} min-w-1 transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-100`}
            style={{ width: `${Math.max(2, ratio(item.value, total) * 100)}%` }}
          />
        ))}
      </div>
      <dl className="mt-5 grid gap-3 sm:grid-cols-2">
        {items.map((item, index) => (
          <div key={item.label} className="flex items-center gap-3">
            <span
              className={`size-2.5 shrink-0 rounded-full ${chartPalette[index % chartPalette.length]}`}
            />
            <dt className="min-w-0 flex-1 truncate text-sm font-medium text-black-100 dark:text-white">
              {item.label}
            </dt>
            <dd className="text-sm font-semibold text-black-75 dark:text-black-25">
              {formatPercent(item.value, total)}
            </dd>
          </div>
        ))}
      </dl>
    </StatisticsBlock>
  );
}

function BucketHistogram({
  title,
  items,
}: {
  title: string;
  items: Array<{
    label: string;
    primary: number;
    secondary: number;
  }>;
}) {
  const maxValue = Math.max(
    ...items.map(({ primary, secondary }) => primary + secondary),
    1,
  );

  return (
    <StatisticsBlock title={title} className="min-w-0 lg:col-span-2">
      <div className="flex h-44 min-w-0 items-end gap-2">
        {items.map((item, index) => (
          <div key={item.label} className="flex min-w-0 flex-1 flex-col">
            <div className="flex h-32 items-end rounded-t-md bg-black-10/70 dark:bg-black-75/25">
              {(() => {
                const color =
                  domainChartPalette[index % domainChartPalette.length];
                const itemTotal = item.primary + item.secondary;
                const totalHeight = Math.max(8, (itemTotal / maxValue) * 100);
                const primaryHeight =
                  itemTotal === 0 ? 0 : (item.primary / itemTotal) * 100;

                return (
                  <div
                    className={`relative w-full overflow-hidden rounded-t-md ${color.secondary}`}
                    style={{
                      height: `${totalHeight}%`,
                    }}
                  >
                    <div
                      className={`absolute inset-x-0 bottom-0 rounded-t-md ${color.primary}`}
                      style={{
                        height: `${primaryHeight}%`,
                      }}
                    />
                  </div>
                );
              })()}
            </div>
            <div className="mt-2 text-center">
              <p className="text-xs font-semibold text-black-100 dark:text-white">
                {item.secondary > 0
                  ? `${formatNumber(item.primary)} + ${formatNumber(
                      item.secondary,
                    )}`
                  : formatNumber(item.primary)}
              </p>
              <p className="mt-1 truncate text-[11px] text-black-50 dark:text-black-50">
                {item.label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </StatisticsBlock>
  );
}

function SplitDistribution({
  title,
  items,
  assignmentLabel,
  className = "lg:col-span-2",
  labelFormatter = getTagDisplayLabel,
}: {
  title: string;
  items: SplitDistributionItem[];
  assignmentLabel: string;
  className?: string;
  labelFormatter?: (label: string) => string;
}) {
  const total = items.reduce(
    (sum, item) => sum + item.primary + item.secondary,
    0,
  );
  const maxValue = Math.max(
    ...items.map(({ primary, secondary }) => primary + secondary),
    1,
  );

  return (
    <StatisticsBlock
      title={title}
      variant="primary"
      className={`min-w-0 ${className}`}
    >
      <div className="mb-4 flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-black-50 dark:text-black-50">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-blue-100 dark:bg-blue-50" />
          Primary
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-blue-25 dark:bg-blue-100/35" />
          Sub-datasets
        </span>
      </div>
      <ul className="space-y-3">
        {items.map((item, index) => {
          const color = domainChartPalette[index % domainChartPalette.length];
          const itemTotal = item.primary + item.secondary;
          const percent = formatPercent(itemTotal, total);
          const totalWidth = Math.max(4, (itemTotal / maxValue) * 100);
          const primaryWidth =
            itemTotal === 0 ? 0 : (item.primary / itemTotal) * 100;
          const content = (
            <>
              <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                <span className="min-w-0 truncate font-medium text-black-100 dark:text-white">
                  {labelFormatter(item.label)}
                </span>
                <span className="shrink-0 text-xs font-semibold text-black-75 tabular-nums dark:text-black-25">
                  {item.secondary > 0
                    ? `${formatNumber(item.primary)} + ${formatNumber(
                        item.secondary,
                      )}`
                    : formatNumber(item.primary)}{" "}
                  · {percent}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/90 dark:bg-black-100/70">
                <div
                  className={`h-2 overflow-hidden rounded-full ${color.secondary}`}
                  style={{ width: `${totalWidth}%` }}
                >
                  <div
                    className={`h-full rounded-full ${color.primary}`}
                    style={{ width: `${primaryWidth}%` }}
                  />
                </div>
              </div>
            </>
          );

          return (
            <li key={item.label}>
              {item.href ? (
                <Link
                  href={item.href}
                  aria-label={`${labelFormatter(item.label)}: ${formatNumber(
                    item.primary,
                  )} primary assignments and ${formatNumber(
                    item.secondary,
                  )} sub-dataset assignments, ${percent} of ${assignmentLabel}`}
                  className="-mx-2 -my-1 block rounded-lg px-2 py-1 transition hover:bg-white/75 hover:text-blue-100 focus:ring-2 focus:ring-blue-100/30 focus:outline-none dark:hover:bg-black-100/55 dark:hover:text-blue-50"
                >
                  {content}
                </Link>
              ) : (
                content
              )}
            </li>
          );
        })}
      </ul>
    </StatisticsBlock>
  );
}

function CoverageMeter({
  title,
  value,
  total,
  detail,
}: {
  title: string;
  value: number;
  total: number;
  detail: string;
}) {
  const percent = Math.round(ratio(value, total) * 100);

  return (
    <StatisticsBlock
      title={title}
      variant="secondary"
      className="min-w-0 lg:col-span-2"
    >
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
        <div
          className="grid size-24 shrink-0 place-items-center rounded-full"
          style={{
            background: `conic-gradient(var(--color-blue-100) ${percent}%, var(--color-blue-10) 0)`,
          }}
        >
          <div className="grid size-16 place-items-center rounded-full bg-white text-lg font-semibold text-black-100 dark:bg-black-100 dark:text-white">
            {percent}%
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-sm leading-6 wrap-break-word text-black-75 dark:text-black-25">
            {detail}
          </p>
          <p className="mt-2 text-xs font-semibold tracking-wide text-black-50 uppercase dark:text-black-50">
            {formatNumber(value)} of {formatNumber(total)}
          </p>
        </div>
      </div>
    </StatisticsBlock>
  );
}

function FormatInventory({ items }: { items: CountListItem[] }) {
  const maxValue = Math.max(...items.map(({ value }) => value), 1);

  return (
    <StatisticsBlock
      title="Attachment Format Inventory"
      className="min-w-0 lg:col-span-3"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-md border border-black-10 bg-black-10/40 p-3 dark:border-black-75/35 dark:bg-black-75/18"
          >
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-mono text-sm font-semibold text-black-100 dark:text-white">
                {item.label}
              </p>
              <p className="text-sm font-semibold text-blue-100 dark:text-blue-50">
                {formatNumber(item.value)}
              </p>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white dark:bg-black-100">
              <div
                className="h-full rounded-full bg-blue-100 dark:bg-blue-50"
                style={{
                  width: `${Math.max(6, (item.value / maxValue) * 100)}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </StatisticsBlock>
  );
}

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-5 max-w-3xl min-w-0">
      <h2 className="text-2xl font-semibold tracking-tight wrap-break-word text-black-100 dark:text-white">
        {title}
      </h2>
      {description && (
        <p className="mt-2 text-sm leading-6 wrap-break-word text-black-75 dark:text-black-25">
          {description}
        </p>
      )}
    </div>
  );
}

export default async function StatisticsPage() {
  const statistics = await getRepositoryStatistics();
  const networkTypeItems = sortedEntries(
    statistics.networkTypeCounts,
    undefined,
    formatNetworkType,
    networkTypeFilterHref,
  );
  const formatItems = sortedEntries(
    statistics.formatCounts,
    undefined,
    displayFormat,
  );
  const domainItems = sortedSplitEntries(
    statistics.domainTagCounts,
    tagFamilyFilterHref("domain"),
  );
  const sourceItems = sortedSplitEntries(
    statistics.sourceTagCounts,
    tagFamilyFilterHref("source"),
  );
  const metadataItems = sortedSplitEntries(
    statistics.metadataTagCounts,
    tagFamilyFilterHref("metadata"),
  );
  const licenseItems = sortedSplitEntries(statistics.licenseCounts);
  const sourceHostItems = sortedSplitEntries(
    statistics.sourceHostCounts,
    undefined,
    8,
  );
  const citationCoverage = formatPercent(
    statistics.citationCount,
    statistics.primaryDatasetCount,
  );
  const relatedCoverage = formatPercent(
    statistics.relatedCount,
    statistics.primaryDatasetCount,
  );

  return (
    <>
      <PageHeader
        eyebrow="Repository"
        title="Statistics"
        description="Repository-level statistics for AHORN datasets, metadata coverage, published formats, and dataset scale."
        className="mb-8"
      />

      <section>
        <SectionHeading title="Repository Overview" />
        <HeroMetricPanel
          statistics={statistics}
          citationCoverage={citationCoverage}
          relatedCoverage={relatedCoverage}
        />
      </section>

      <section className="mt-12">
        <SectionHeading
          title="Collection Shape"
          description="How the collection is distributed across higher-order network interpretations and dataset scale."
        />
        <div className="grid min-w-0 gap-4 lg:grid-cols-8">
          <StackedDistribution
            title="Network Type Mix"
            items={networkTypeItems}
          />
          <BucketHistogram
            title="Node Count Distribution"
            items={splitCountItems(statistics.nodeBuckets)}
          />
          <BucketHistogram
            title="Relation Count Distribution"
            items={splitCountItems(statistics.relationBuckets)}
          />
        </div>
      </section>

      <section className="mt-12">
        <SectionHeading
          title="Publication Readiness"
          description="Download coverage, revision hygiene, and the practical metadata needed for reuse."
        />
        <div className="grid min-w-0 gap-4 lg:grid-cols-6">
          <FormatInventory items={formatItems} />
          <CoverageMeter
            title="Citation Coverage"
            value={statistics.citationCount}
            total={statistics.primaryDatasetCount}
            detail="Primary datasets with citation metadata available on the page."
          />
          <StatisticsBlock
            title="Published Revisions"
            className="lg:col-span-2"
          >
            <CountList items={sortedEntries(statistics.revisionCounts)} />
          </StatisticsBlock>
          <CoverageMeter
            title="Related Dataset Coverage"
            value={statistics.relatedCount}
            total={statistics.primaryDatasetCount}
            detail="Primary datasets that point readers to related AHORN entries."
          />
        </div>
      </section>

      <section className="mt-12">
        <SectionHeading
          title="Tags and Metadata Families"
          description="How structured domain, source, and metadata tags are distributed across primary datasets and sub-datasets."
        />
        <div className="grid min-w-0 gap-4 lg:grid-cols-6">
          <SplitDistribution
            title="Data Domain Distribution"
            items={domainItems}
            assignmentLabel="domain assignments"
          />
          <SplitDistribution
            title="Source Distribution"
            items={sourceItems}
            assignmentLabel="source assignments"
          />
          <SplitDistribution
            title="Metadata Distribution"
            items={metadataItems}
            assignmentLabel="metadata assignments"
          />
        </div>
      </section>

      <section className="mt-12">
        <SectionHeading
          title="Sources and Licensing"
          description="Where primary datasets and sub-datasets originate, and how reuse terms are represented across the repository."
        />
        <div className="grid min-w-0 gap-4 lg:grid-cols-4">
          <SplitDistribution
            title="License Distribution"
            items={licenseItems}
            assignmentLabel="license records"
          />
          <SplitDistribution
            title="Source Host Distribution"
            items={sourceHostItems}
            assignmentLabel="source host records"
            labelFormatter={(label) => label}
          />
        </div>
      </section>

      <section className="mt-12">
        <SectionHeading
          title="Largest Datasets"
          description="The largest datasets by available node and relation counts."
        />
        <div className="grid gap-4 lg:grid-cols-2">
          <StatisticsBlock title="By Nodes">
            <CountList
              items={datasetMetricItems({
                datasets: statistics.topByNodes,
                valueKey: "numNodes",
              })}
            />
          </StatisticsBlock>
          <StatisticsBlock title="By Relations">
            <CountList
              items={datasetMetricItems({
                datasets: statistics.topByRelations,
                valueKey: "numRelations",
              })}
            />
          </StatisticsBlock>
        </div>
      </section>
    </>
  );
}
