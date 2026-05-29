import fs from "fs";
import path from "path";
import Link from "next/link";
import type { Metadata } from "next";

import PageHeader from "@/components/page-header";
import Stat from "@/components/stat";
import StatisticsBlock from "@/components/statistics-block";
import { formatNetworkType, formatNumber } from "@/utils/format";

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
  related?: unknown;
  tags?: unknown;
  "network-type"?: unknown;
  attachments?: unknown;
  statistics?: Record<string, unknown>;
};

type DatasetSummary = {
  slug: string;
  title: string;
  numNodes: number | null;
  numRelations: number | null;
};

type RepositoryStatistics = {
  datasetCount: number;
  uniqueTagCount: number;
  networkTypeCounts: Record<string, number>;
  tagCounts: Record<string, number>;
  sourceTagCounts: Record<string, number>;
  metadataTagCounts: Record<string, number>;
  formatCounts: Record<string, number>;
  revisionCounts: Record<string, number>;
  licenseCounts: Record<string, number>;
  sourceHostCounts: Record<string, number>;
  citationCount: number;
  relatedCount: number;
  revisionsAfterFirst: number;
  changelogsAfterFirst: number;
  nodeBuckets: Record<string, number>;
  relationBuckets: Record<string, number>;
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

function getRevisionNumber(key: string): number | null {
  const match = key.match(/^revision-(\d+)$/i);
  return match ? Number.parseInt(match[1], 10) : null;
}

function getAttachmentStats(attachments: unknown): {
  revisionCount: number;
  formats: string[];
  formatCounts: Record<string, number>;
  revisionsAfterFirst: number;
  changelogsAfterFirst: number;
} {
  if (!attachments || typeof attachments !== "object") {
    return {
      revisionCount: 0,
      formats: [],
      formatCounts: {},
      revisionsAfterFirst: 0,
      changelogsAfterFirst: 0,
    };
  }

  const formats = new Set<string>();
  const formatCounts: Record<string, number> = {};
  let revisionCount = 0;
  let revisionsAfterFirst = 0;
  let changelogsAfterFirst = 0;

  for (const [revisionKey, revisionValue] of Object.entries(attachments)) {
    if (!isRevisionKey(revisionKey) || typeof revisionValue !== "object") {
      continue;
    }

    revisionCount += 1;
    const revisionNumber = getRevisionNumber(revisionKey);
    const revision = revisionValue as Record<string, unknown>;

    if (revisionNumber !== null && revisionNumber > 1) {
      revisionsAfterFirst += 1;
      if (Array.isArray(revision.changelog) && revision.changelog.length > 0) {
        changelogsAfterFirst += 1;
      }
    }

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
    revisionsAfterFirst,
    changelogsAfterFirst,
  };
}

function bucketize(values: Array<number | null>): Record<string, number> {
  const buckets = Object.fromEntries(
    SIZE_BUCKETS.map(({ label }) => [label, 0]),
  );

  for (const value of values) {
    if (value === null) {
      continue;
    }

    const bucket = SIZE_BUCKETS.find(
      ({ min, max }) => value >= min && value <= max,
    );
    if (bucket) {
      buckets[bucket.label] += 1;
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
  const sourceTagCounts: Record<string, number> = {};
  const metadataTagCounts: Record<string, number> = {};
  const formatCounts: Record<string, number> = {};
  const revisionCounts: Record<string, number> = {};
  const licenseCounts: Record<string, number> = {};
  const sourceHostCounts: Record<string, number> = {};
  let citationCount = 0;
  let relatedCount = 0;
  let revisionsAfterFirst = 0;
  let changelogsAfterFirst = 0;

  for (const { slug, frontmatter } of imported) {
    if (frontmatter.disable === true) {
      continue;
    }

    const networkTypes = getStringArray(frontmatter["network-type"]);
    const tags = getStringArray(frontmatter.tags);
    const sourceHost = getSourceHost(frontmatter.source);
    const license = getLicenseLabel(frontmatter.license);
    const attachmentStats = getAttachmentStats(frontmatter.attachments);
    const related = getStringArray(frontmatter.related);
    const hasCitation =
      Array.isArray(frontmatter.citation) && frontmatter.citation.length > 0;

    for (const type of networkTypes) {
      increment(networkTypeCounts, type);
    }
    for (const tag of tags) {
      increment(tagCounts, tag);
      const [prefix, value] = tag.split(":").map((part) => part.trim());
      if (prefix === "source" && value) {
        increment(sourceTagCounts, value);
      }
      if (prefix === "metadata" && value) {
        increment(metadataTagCounts, value);
      }
    }
    for (const [format, count] of Object.entries(
      attachmentStats.formatCounts,
    )) {
      increment(formatCounts, format, count);
    }
    increment(
      revisionCounts,
      attachmentStats.revisionCount === 1
        ? "1 revision"
        : `${attachmentStats.revisionCount} revisions`,
    );
    increment(licenseCounts, license);
    increment(sourceHostCounts, sourceHost);

    if (hasCitation) {
      citationCount += 1;
    }
    if (related.length > 0) {
      relatedCount += 1;
    }
    revisionsAfterFirst += attachmentStats.revisionsAfterFirst;
    changelogsAfterFirst += attachmentStats.changelogsAfterFirst;

    datasets.push({
      slug,
      title: typeof frontmatter.title === "string" ? frontmatter.title : slug,
      numNodes: getStatisticValue(frontmatter.statistics, "num-nodes"),
      numRelations: getStatisticValue(frontmatter.statistics, "num-edges"),
    });
  }

  datasets.sort((a, b) => a.title.localeCompare(b.title));

  return {
    datasetCount: datasets.length,
    uniqueTagCount: Object.keys(tagCounts).length,
    networkTypeCounts,
    tagCounts,
    sourceTagCounts,
    metadataTagCounts,
    formatCounts,
    revisionCounts,
    licenseCounts,
    sourceHostCounts,
    citationCount,
    relatedCount,
    revisionsAfterFirst,
    changelogsAfterFirst,
    nodeBuckets: bucketize(datasets.map((dataset) => dataset.numNodes)),
    relationBuckets: bucketize(datasets.map((dataset) => dataset.numRelations)),
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

function countItems(counts: Record<string, number>): CountListItem[] {
  return Object.entries(counts).map(([label, value]) => ({ label, value }));
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

function RankingList({
  datasets,
  valueKey,
}: {
  datasets: DatasetSummary[];
  valueKey: "numNodes" | "numRelations";
}) {
  return (
    <ol className="space-y-2.5">
      {datasets.map((dataset, index) => (
        <li key={dataset.slug}>
          <Link
            href={`/dataset/${dataset.slug}`}
            className="group flex items-center gap-3 rounded-lg bg-white/70 px-3 py-2.5 transition hover:bg-white focus:ring-2 focus:ring-blue-100/30 focus:outline-none dark:bg-black-100/50 dark:hover:bg-black-100/80"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-white dark:bg-blue-50 dark:text-black-100">
              {index + 1}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-black-100 group-hover:text-blue-100 dark:text-white dark:group-hover:text-blue-50">
                {dataset.title}
              </span>
            </span>
            <span className="shrink-0 text-sm font-semibold text-black-75 dark:text-black-25">
              {dataset[valueKey] === null
                ? "Unknown"
                : formatNumber(dataset[valueKey])}
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}

function CoveragePanel({
  title,
  value,
  detail,
  className = "",
}: {
  title: string;
  value: string;
  detail: string;
  className?: string;
}) {
  return (
    <StatisticsBlock title={title} className={className}>
      <div className="flex items-end justify-between gap-4">
        <p className="text-3xl leading-none font-semibold tracking-tight text-black-100 dark:text-white">
          {value}
        </p>
      </div>
      <p className="mt-3 text-sm leading-6 text-black-75 dark:text-black-25">
        {detail}
      </p>
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
    <div className="mb-5 max-w-3xl">
      <h2 className="text-2xl font-semibold tracking-tight text-black-100 dark:text-white">
        {title}
      </h2>
      {description && (
        <p className="mt-2 text-sm leading-6 text-black-75 dark:text-black-25">
          {description}
        </p>
      )}
    </div>
  );
}

function StatisticsSection({
  title,
  description,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      <SectionHeading title={title} description={description} />
      {children}
    </section>
  );
}

export default async function StatisticsPage() {
  const statistics = await getRepositoryStatistics();
  const citationCoverage = formatPercent(
    statistics.citationCount,
    statistics.datasetCount,
  );
  const relatedCoverage = formatPercent(
    statistics.relatedCount,
    statistics.datasetCount,
  );
  const changelogCoverage = formatPercent(
    statistics.changelogsAfterFirst,
    statistics.revisionsAfterFirst,
  );

  return (
    <>
      <PageHeader
        eyebrow="Repository"
        title="Statistics"
        description="Repository-level statistics for AHORN datasets, metadata coverage, published formats, and dataset scale."
        className="mb-8"
      />

      <StatisticsSection
        title="Repository at a Glance"
        description="A quick read on collection size, annotation depth, and the amount of linking between dataset pages."
      >
        <div className="grid gap-4 lg:grid-cols-[1.15fr_1.85fr]">
          <StatisticsBlock title="Snapshot" className="p-5 lg:p-6">
            <p className="max-w-xl text-sm leading-6 text-black-75 dark:text-black-25">
              AHORN currently indexes{" "}
              <span className="font-semibold text-black-100 dark:text-white">
                {formatNumber(statistics.datasetCount)} datasets
              </span>{" "}
              with structured tags, typed network models, revision metadata, and
              downloadable attachments.
            </p>
            <dl className="mt-6 grid grid-cols-2 gap-4">
              <div>
                <dt className="text-xs font-semibold tracking-wide text-black-75 uppercase dark:text-black-25">
                  Citations
                </dt>
                <dd className="mt-1 text-xl font-semibold text-black-100 dark:text-white">
                  {citationCoverage}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold tracking-wide text-black-75 uppercase dark:text-black-25">
                  Related
                </dt>
                <dd className="mt-1 text-xl font-semibold text-black-100 dark:text-white">
                  {relatedCoverage}
                </dd>
              </div>
            </dl>
          </StatisticsBlock>
          <div className="grid gap-4 sm:grid-cols-2">
            <Stat
              title="Datasets"
              value={formatNumber(statistics.datasetCount)}
              description="Datasets included in the repository."
            />
            <Stat
              title="Unique Tags"
              value={formatNumber(statistics.uniqueTagCount)}
              description="Distinct descriptive tags across datasets."
            />
            <Stat
              title="Citation Coverage"
              value={citationCoverage}
              description={`${formatNumber(statistics.citationCount)} datasets include citation metadata.`}
            />
            <Stat
              title="Related Links"
              value={relatedCoverage}
              description={`${formatNumber(statistics.relatedCount)} datasets point to related entries.`}
            />
          </div>
        </div>
      </StatisticsSection>

      <StatisticsSection
        title="Collection Shape"
        description="How the collection is distributed across higher-order network interpretations and dataset scale."
        className="mt-12"
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <StatisticsBlock
            title="Datasets per Network Type"
            className="lg:col-span-1"
          >
            <CountList
              items={sortedEntries(
                statistics.networkTypeCounts,
                undefined,
                formatNetworkType,
                networkTypeFilterHref,
              )}
            />
          </StatisticsBlock>
          <StatisticsBlock title="Node Count Buckets">
            <CountList items={countItems(statistics.nodeBuckets)} />
          </StatisticsBlock>
          <StatisticsBlock title="Relation Count Buckets">
            <CountList items={countItems(statistics.relationBuckets)} />
          </StatisticsBlock>
        </div>
      </StatisticsSection>

      <StatisticsSection
        title="Formats, Revisions, and Sources"
        description="Versioning, downloadable formats, licensing, source hosts, and changelog coverage."
        className="mt-12"
      >
        <div className="grid gap-4 lg:grid-cols-6">
          <StatisticsBlock title="Attachment Formats" className="lg:col-span-2">
            <CountList
              items={sortedEntries(
                statistics.formatCounts,
                undefined,
                displayFormat,
              )}
            />
          </StatisticsBlock>
          <StatisticsBlock
            title="Published Revisions"
            className="lg:col-span-2"
          >
            <CountList items={sortedEntries(statistics.revisionCounts)} />
          </StatisticsBlock>
          <CoveragePanel
            title="Revision Changelog Coverage"
            value={changelogCoverage}
            className="lg:col-span-2"
            detail={`${formatNumber(statistics.changelogsAfterFirst)} of ${formatNumber(
              statistics.revisionsAfterFirst,
            )} non-initial revisions include changelog entries.`}
          />
          <StatisticsBlock title="Licenses" className="lg:col-span-3">
            <CountList items={sortedEntries(statistics.licenseCounts)} />
          </StatisticsBlock>
          <StatisticsBlock title="Source Hosts" className="lg:col-span-3">
            <CountList items={sortedEntries(statistics.sourceHostCounts, 8)} />
          </StatisticsBlock>
        </div>
      </StatisticsSection>

      <StatisticsSection
        title="Tags and Metadata Families"
        description="The most common descriptive tags and the structured tag families used across dataset pages."
        className="mt-12"
      >
        <div className="grid gap-4 lg:grid-cols-[1.1fr_1.4fr]">
          <StatisticsBlock title="Top Tags">
            <CountList
              items={sortedEntries(
                statistics.tagCounts,
                12,
                undefined,
                tagFilterHref,
              )}
            />
          </StatisticsBlock>
          <StatisticsBlock title="Tag Families">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <h3 className="mb-3 text-xs font-semibold tracking-wide text-black-75 uppercase dark:text-black-25">
                  Source Tags
                </h3>
                <CountList
                  items={sortedEntries(
                    statistics.sourceTagCounts,
                    8,
                    undefined,
                    tagFamilyFilterHref("source"),
                  )}
                />
              </div>
              <div>
                <h3 className="mb-3 text-xs font-semibold tracking-wide text-black-75 uppercase dark:text-black-25">
                  Metadata Tags
                </h3>
                <CountList
                  items={sortedEntries(
                    statistics.metadataTagCounts,
                    8,
                    undefined,
                    tagFamilyFilterHref("metadata"),
                  )}
                />
              </div>
            </div>
          </StatisticsBlock>
        </div>
      </StatisticsSection>

      <StatisticsSection
        title="Largest Datasets"
        description="The largest datasets by available node and relation counts."
        className="mt-12"
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <StatisticsBlock title="By Nodes">
            <RankingList datasets={statistics.topByNodes} valueKey="numNodes" />
          </StatisticsBlock>
          <StatisticsBlock title="By Relations">
            <RankingList
              datasets={statistics.topByRelations}
              valueKey="numRelations"
            />
          </StatisticsBlock>
        </div>
      </StatisticsSection>
    </>
  );
}
