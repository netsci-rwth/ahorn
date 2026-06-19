"use client";

import Link from "next/link";
import Tag from "@/components/tag";
import { useState, useMemo, useEffect, Suspense, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import classNames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDown,
  faArrowUp,
  faMagnifyingGlass,
  faRotateLeft,
  faSliders,
} from "@fortawesome/free-solid-svg-icons";

import MultiRangeSlider from "@/components/multirange";
import Surface from "@/components/surface";
import { formatNetworkType, formatNumber } from "@/utils/format";
import {
  compareTagsBySemanticGroup,
  getTagDisplayLabel,
  groupByTagSemanticGroup,
} from "@/utils/tags";

enum NetworkType {
  simplicialComplex = "simplicial-complex",
  hypergraph = "hypergraph",
}

type Dataset = {
  slug: string;
  title: string;
  isSubDataset: boolean;
  networkType: NetworkType[];
  tags: string[];
  license: unknown;
  statistics: {
    numNodes: number;
  };
};

export type DatasetTableProps = {
  datasets: Dataset[];
};

function getAllTags(datasets: Dataset[]): string[] {
  const tagSet = new Set<string>();
  datasets.forEach((d) => d.tags.forEach((tag) => tagSet.add(tag)));
  return Array.from(tagSet).sort(compareTagsBySemanticGroup);
}

function getLicenseLabel(license: unknown): string {
  if (typeof license === "object") {
    const spdx = (license as { spdx?: unknown }).spdx;
    return typeof spdx === "string" ? spdx : "Custom";
  }

  return "Unknown";
}

function getAllLicenses(datasets: Dataset[]): string[] {
  const licenseSet = new Set<string>();
  datasets.forEach((dataset) => {
    licenseSet.add(getLicenseLabel(dataset.license));
  });
  return Array.from(licenseSet).sort();
}

function FilterSection({
  title,
  active,
  onReset,
  children,
}: {
  title: string;
  active?: boolean;
  onReset?: () => void;
  children: ReactNode;
}) {
  return (
    <li className="border-t border-black-10 pt-5 first:border-t-0 first:pt-0 dark:border-black-75/35">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold tracking-wide text-black-50 uppercase dark:text-black-50">
          {title}
        </span>
        <span className="flex w-16 shrink-0 justify-end">
          <button
            type="button"
            onClick={onReset}
            disabled={!active || !onReset}
            aria-hidden={!active || !onReset}
            tabIndex={active && onReset ? 0 : -1}
            className={classNames(
              "inline-flex items-center gap-1.5 text-xs font-medium text-blue-100 hover:text-blue-75 dark:text-blue-50",
              active && onReset
                ? "cursor-pointer"
                : "pointer-events-none invisible",
            )}
          >
            <FontAwesomeIcon icon={faRotateLeft} className="size-3" />
            Reset
          </button>
        </span>
      </div>
      <div className="mt-3">{children}</div>
    </li>
  );
}

function SortButton({
  label,
  active,
  direction,
  align = "left",
  onClick,
}: {
  label: string;
  active: boolean;
  direction: "asc" | "desc";
  align?: "left" | "right";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={classNames(
        "group inline-flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-sm font-semibold transition-colors hover:bg-white/75 hover:text-blue-100 focus:ring-2 focus:ring-blue-100/25 focus:outline-none dark:hover:bg-black-100/70 dark:hover:text-blue-50",
        active
          ? "text-blue-100 dark:text-blue-50"
          : "text-black-100 dark:text-white",
        align === "right" && "justify-end",
      )}
    >
      <span>{label}</span>
      <FontAwesomeIcon
        icon={direction === "asc" ? faArrowUp : faArrowDown}
        className={classNames(
          "size-3 transition-opacity",
          active ? "opacity-100" : "opacity-25 group-hover:opacity-60",
        )}
      />
    </button>
  );
}

function DatasetTableContent({ datasets }: DatasetTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [includeSubDatasets, setIncludeSubDatasets] = useState(
    () => searchParams.get("includeSubdatasets") === "true",
  );
  const datasetPool = useMemo(
    () =>
      includeSubDatasets
        ? datasets
        : datasets.filter((dataset) => !dataset.isSubDataset),
    [datasets, includeSubDatasets],
  );

  // Compute global min/max node counts
  const nodeExtremes = useMemo(() => {
    if (datasetPool.length === 0) return { min: 0, max: 0 };
    let min = Infinity;
    let max = -Infinity;
    for (const dataset of datasetPool) {
      const n = dataset.statistics.numNodes;
      if (n < min) min = n;
      if (n > max) max = n;
    }
    return { min, max };
  }, [datasetPool]);

  // Initialize state from URL parameters
  const [search, setSearch] = useState(() => searchParams.get("search") || "");
  const [selectedTags, setSelectedTags] = useState<string[]>(() => {
    const tags = searchParams.get("tags");
    return tags ? tags.split(",").filter(Boolean) : [];
  });
  const [selectedNetworkTypes, setSelectedNetworkTypes] = useState<
    NetworkType[]
  >(() => {
    const types = searchParams.get("types");
    return types ? (types.split(",").filter(Boolean) as NetworkType[]) : [];
  });
  const [selectedLicenses, setSelectedLicenses] = useState<string[]>(() => {
    const licenses = searchParams.get("licenses");
    return licenses ? licenses.split(",").filter(Boolean) : [];
  });
  const [sortField, setSortField] = useState<"title" | "numNodes">(
    () => (searchParams.get("sort") as "title" | "numNodes") || "title",
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(
    () => (searchParams.get("dir") as "asc" | "desc") || "asc",
  );
  const [nodeRangeMin, setNodeRangeMin] = useState(() => {
    const min = searchParams.get("minNodes");
    return min ? parseInt(min, 10) : nodeExtremes.min;
  });
  const [nodeRangeMax, setNodeRangeMax] = useState(() => {
    const max = searchParams.get("maxNodes");
    return max ? parseInt(max, 10) : nodeExtremes.max;
  });

  const allTags = getAllTags(datasetPool);
  const groupedTags = groupByTagSemanticGroup(allTags, (tag) => tag);
  const allLicenses = getAllLicenses(datasetPool);

  // Reset node range when extremes change
  useMemo(() => {
    if (!searchParams.get("minNodes")) setNodeRangeMin(nodeExtremes.min);
    if (!searchParams.get("maxNodes")) setNodeRangeMax(nodeExtremes.max);
  }, [nodeExtremes.min, nodeExtremes.max, searchParams]);

  // Sync state to URL
  useEffect(() => {
    const params = new URLSearchParams();

    if (search) params.set("search", search);
    if (selectedTags.length > 0) params.set("tags", selectedTags.join(","));
    if (selectedNetworkTypes.length > 0)
      params.set("types", selectedNetworkTypes.join(","));
    if (selectedLicenses.length > 0)
      params.set("licenses", selectedLicenses.join(","));
    if (includeSubDatasets) params.set("includeSubdatasets", "true");
    if (sortField !== "title") params.set("sort", sortField);
    if (sortDirection !== "asc") params.set("dir", sortDirection);
    if (nodeRangeMin !== nodeExtremes.min)
      params.set("minNodes", nodeRangeMin.toString());
    if (nodeRangeMax !== nodeExtremes.max)
      params.set("maxNodes", nodeRangeMax.toString());

    const paramString = params.toString();
    const newUrl = paramString ? `?${paramString}` : window.location.pathname;

    if (window.location.search !== `?${paramString}` && paramString) {
      router.replace(newUrl, { scroll: false });
    } else if (!paramString && window.location.search) {
      router.replace(newUrl, { scroll: false });
    }
  }, [
    search,
    selectedTags,
    selectedNetworkTypes,
    selectedLicenses,
    includeSubDatasets,
    sortField,
    sortDirection,
    nodeRangeMin,
    nodeRangeMax,
    nodeExtremes.min,
    nodeExtremes.max,
    router,
  ]);

  const handleTagChange = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleNetworkTypeChange = (type: NetworkType) => {
    setSelectedNetworkTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const handleLicenseChange = (license: string) => {
    setSelectedLicenses((prev) =>
      prev.includes(license)
        ? prev.filter((value) => value !== license)
        : [...prev, license],
    );
  };

  const handleSort = (field: "title" | "numNodes") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filtered = datasetPool.filter((d) => {
    const matchesSearch = d.title.toLowerCase().includes(search.toLowerCase());
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.every((tag) => d.tags.includes(tag));
    const matchesNetworkType =
      selectedNetworkTypes.length === 0 ||
      selectedNetworkTypes.every((type) => d.networkType.includes(type));
    const matchesLicense =
      selectedLicenses.length === 0 ||
      selectedLicenses.includes(getLicenseLabel(d.license));
    const matchesRange =
      d.statistics.numNodes >= nodeRangeMin &&
      d.statistics.numNodes <= nodeRangeMax;
    return (
      matchesSearch &&
      matchesTags &&
      matchesNetworkType &&
      matchesLicense &&
      matchesRange
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    let comparison = 0;
    if (sortField === "title") {
      comparison = a.title.localeCompare(b.title);
    } else if (sortField === "numNodes") {
      comparison = a.statistics.numNodes - b.statistics.numNodes;
    }

    return sortDirection === "asc" ? comparison : -comparison;
  });

  const isNodeRangeFiltered =
    nodeRangeMin !== nodeExtremes.min || nodeRangeMax !== nodeExtremes.max;
  const activeFilterCount =
    (search.trim() === "" ? 0 : 1) +
    (isNodeRangeFiltered ? 1 : 0) +
    (includeSubDatasets ? 1 : 0) +
    selectedNetworkTypes.length +
    selectedTags.length +
    selectedLicenses.length;

  const clearAllFilters = () => {
    setSearch("");
    setSelectedTags([]);
    setSelectedNetworkTypes([]);
    setSelectedLicenses([]);
    setIncludeSubDatasets(false);
    setNodeRangeMin(nodeExtremes.min);
    setNodeRangeMax(nodeExtremes.max);
  };

  const renderFilterControls = (idPrefix: string) => (
    <>
      <div className="mb-5 flex items-start justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-black-100 dark:text-white">
          <FontAwesomeIcon
            icon={faSliders}
            className="size-3.5 text-blue-100"
          />
          Filters
        </h2>

        <button
          type="button"
          onClick={clearAllFilters}
          disabled={activeFilterCount === 0}
          aria-hidden={activeFilterCount === 0}
          tabIndex={activeFilterCount > 0 ? 0 : -1}
          className={classNames(
            "inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-blue-100 hover:bg-blue-10 dark:text-blue-50 dark:hover:bg-blue-100/15",
            activeFilterCount > 0
              ? "cursor-pointer"
              : "pointer-events-none invisible",
          )}
        >
          <FontAwesomeIcon icon={faRotateLeft} className="size-3" />
          Clear
        </button>
      </div>

      <ul className="space-y-5">
        <FilterSection
          title="Name"
          active={search.trim() !== ""}
          onReset={() => setSearch("")}
        >
          <div className="relative">
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-black-50"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search datasets..."
              className="block w-full rounded-lg border border-black-25 bg-white py-2.5 pr-3 pl-9 text-sm text-black-100 placeholder-black-50 transition focus:border-blue-100 focus:ring-2 focus:ring-blue-100/20 focus:outline-none dark:border-black-75 dark:bg-black-100 dark:text-white dark:placeholder-black-50"
            />
          </div>
        </FilterSection>

        <FilterSection
          title="Dataset scope"
          active={includeSubDatasets}
          onReset={() => setIncludeSubDatasets(false)}
        >
          <label className="flex cursor-pointer items-start gap-2">
            <input
              id={`${idPrefix}-include-subdatasets`}
              type="checkbox"
              checked={includeSubDatasets}
              onChange={(event) => setIncludeSubDatasets(event.target.checked)}
              className="mt-0.5 rounded border-black-25 bg-white text-blue-100 focus:ring-blue-100 dark:border-black-75 dark:bg-black-100 dark:focus:ring-blue-100"
            />
            <span className="min-w-0">
              <span className="block text-sm font-medium text-black-75 dark:text-black-25">
                Include sub-datasets
              </span>
              <span className="mt-0.5 block text-xs leading-5 text-black-50 dark:text-black-50">
                Show dataset variants that belong to a primary dataset.
              </span>
            </span>
          </label>
        </FilterSection>

        <FilterSection
          title="Node size (|V|)"
          active={isNodeRangeFiltered}
          onReset={() => {
            setNodeRangeMin(nodeExtremes.min);
            setNodeRangeMax(nodeExtremes.max);
          }}
        >
          <MultiRangeSlider
            min={nodeExtremes.min}
            max={nodeExtremes.max}
            value={{ min: nodeRangeMin, max: nodeRangeMax }}
            onChange={({ min, max }) => {
              setNodeRangeMin(min);
              setNodeRangeMax(max);
            }}
          />
        </FilterSection>

        <FilterSection
          title="Network type"
          active={selectedNetworkTypes.length > 0}
          onReset={() => setSelectedNetworkTypes([])}
        >
          <ul className="grid gap-2">
            {Object.values(NetworkType).map((type) => (
              <li key={type} className="flex items-center gap-2">
                <input
                  id={`${idPrefix}-network-type-${type}`}
                  type="checkbox"
                  checked={selectedNetworkTypes.includes(type)}
                  onChange={() => handleNetworkTypeChange(type)}
                  className="rounded border-black-25 bg-white text-blue-100 focus:ring-blue-100 dark:border-black-75 dark:bg-black-100 dark:focus:ring-blue-100"
                />
                <label
                  htmlFor={`${idPrefix}-network-type-${type}`}
                  className="cursor-pointer text-sm font-medium text-black-75 capitalize dark:text-black-25"
                >
                  {type === NetworkType.simplicialComplex
                    ? "Simplicial Complex"
                    : "Hypergraph"}
                </label>
              </li>
            ))}
          </ul>
        </FilterSection>

        <FilterSection
          title="Tags"
          active={selectedTags.length > 0}
          onReset={() => setSelectedTags([])}
        >
          <ul className="space-y-4">
            {groupedTags.map((group) => (
              <li key={group.key} className="min-w-0">
                <p className="mb-2 text-[11px] font-semibold tracking-wide text-black-50 uppercase dark:text-black-50">
                  {group.title}
                </p>
                <ul className="flex flex-wrap gap-2">
                  {group.items.map((tag) => {
                    const tagInputId = `${idPrefix}-tag-${encodeURIComponent(
                      tag,
                    )}`;

                    return (
                      <li key={tag} className="flex min-w-0 items-center gap-2">
                        <input
                          id={tagInputId}
                          type="checkbox"
                          checked={selectedTags.includes(tag)}
                          onChange={() => handleTagChange(tag)}
                          className="rounded border-black-25 bg-white text-blue-100 focus:ring-blue-100 dark:border-black-75 dark:bg-black-100 dark:focus:ring-blue-100"
                        />
                        <label
                          htmlFor={tagInputId}
                          className="min-w-0 cursor-pointer text-xs"
                        >
                          <Tag
                            name={tag}
                            displayName={getTagDisplayLabel(tag)}
                            interactive
                            selected={selectedTags.includes(tag)}
                          />
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
        </FilterSection>

        <FilterSection
          title="License"
          active={selectedLicenses.length > 0}
          onReset={() => setSelectedLicenses([])}
        >
          <ul className="grid gap-2">
            {allLicenses.map((license) => (
              <li key={license} className="flex items-center gap-2">
                <input
                  id={`${idPrefix}-license-${license}`}
                  type="checkbox"
                  checked={selectedLicenses.includes(license)}
                  onChange={() => handleLicenseChange(license)}
                  className="rounded border-black-25 bg-white text-blue-100 focus:ring-blue-100 dark:border-black-75 dark:bg-black-100 dark:focus:ring-blue-100"
                />
                <label
                  htmlFor={`${idPrefix}-license-${license}`}
                  className="cursor-pointer text-sm font-medium text-black-75 dark:text-black-25"
                >
                  {license}
                </label>
              </li>
            ))}
          </ul>
        </FilterSection>
      </ul>
    </>
  );

  return (
    <div className="grid min-w-0 gap-5 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start lg:gap-8">
      <div className="lg:hidden">
        <Surface variant="primary" className="p-4">
          {renderFilterControls("mobile")}
        </Surface>
      </div>

      <aside className="hidden lg:block">
        <Surface variant="primary" className="p-4">
          {renderFilterControls("desktop")}
        </Surface>
      </aside>

      <div className="max-w-full min-w-0 flex-1">
        <Surface variant="primary" className="overflow-hidden">
          <div className="border-b border-black-25 bg-black-10/35 px-4 py-4 sm:flex-row sm:items-end sm:justify-between dark:border-black-75 dark:bg-black-75/18">
            <h2 className="text-sm font-semibold text-black-100 dark:text-white">
              Dataset Index
            </h2>
            <p className="mt-1 text-sm text-black-50 dark:text-black-50">
              Showing {formatNumber(sorted.length)} of{" "}
              {formatNumber(datasets.length)} datasets
            </p>
          </div>

          <ul className="divide-y divide-black-10 md:hidden dark:divide-black-75/45">
            {sorted.length === 0 ? (
              <li className="px-4 py-12 text-center text-sm text-black-50 dark:text-black-50">
                <div className="mx-auto max-w-sm">
                  <p className="font-medium text-black-75 dark:text-black-25">
                    No datasets match the current filters.
                  </p>
                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={clearAllFilters}
                      className="mt-3 inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-blue-100 hover:text-blue-75 dark:text-blue-50"
                    >
                      <FontAwesomeIcon icon={faRotateLeft} className="size-3" />
                      Clear all filters
                    </button>
                  )}
                </div>
              </li>
            ) : (
              sorted.map((dataset) => (
                <li key={dataset.slug}>
                  <Link
                    href={`/dataset/${dataset.slug}`}
                    className="group block px-4 py-4 transition-colors hover:bg-blue-10/35 dark:hover:bg-blue-100/10"
                  >
                    <div className="min-w-0">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <h3 className="font-semibold wrap-break-word text-black-100 group-hover:text-blue-100 dark:text-white dark:group-hover:text-blue-50">
                          {dataset.title}
                        </h3>
                        {dataset.isSubDataset && (
                          <span className="rounded-md border border-black-25 px-2 py-0.5 text-[11px] font-semibold text-black-50 dark:border-black-75 dark:text-black-50">
                            Sub-dataset
                          </span>
                        )}
                      </div>
                      <p className="mt-1 font-mono text-xs wrap-break-word text-black-50 dark:text-black-50">
                        {dataset.slug}
                      </p>
                      <p className="mt-2 text-xs font-semibold tracking-wide text-black-50 dark:text-black-50">
                        {formatNumber(dataset.statistics.numNodes)} nodes
                      </p>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {dataset.networkType.map((type) => (
                        <span
                          key={type}
                          className="rounded-md bg-blue-10 px-2 py-1 text-xs font-semibold text-blue-100 ring-1 ring-blue-100/15 dark:bg-blue-100/15 dark:text-blue-50 dark:ring-blue-50/15"
                        >
                          {formatNetworkType(type)}
                        </span>
                      ))}
                    </div>
                    {dataset.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {dataset.tags.map((tag: string) => (
                          <Tag
                            key={tag}
                            name={tag}
                            selected={selectedTags.includes(tag)}
                          />
                        ))}
                      </div>
                    )}
                  </Link>
                </li>
              ))
            )}
          </ul>

          <div className="hidden max-w-full overflow-x-auto md:block">
            <table className="w-full min-w-2xl border-collapse">
              <thead className="sticky top-0 z-10 bg-black-10/90 backdrop-blur dark:bg-black-100/95">
                <tr className="border-b border-black-25 dark:border-black-75">
                  <th className="px-4 py-3 text-left">
                    <SortButton
                      label="Name"
                      active={sortField === "title"}
                      direction={sortDirection}
                      onClick={() => handleSort("title")}
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-black-100 dark:text-white">
                    Type
                  </th>
                  <th className="px-4 py-3 text-right">
                    <SortButton
                      label="|V|"
                      active={sortField === "numNodes"}
                      direction={sortDirection}
                      align="right"
                      onClick={() => handleSort("numNodes")}
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-black-100 dark:text-white">
                    Tags
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black-10 dark:divide-black-75/45">
                {sorted.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-16 text-center text-sm text-black-50 dark:text-black-50"
                    >
                      <div className="mx-auto max-w-sm">
                        <p className="font-medium text-black-75 dark:text-black-25">
                          No datasets match the current filters.
                        </p>
                        {activeFilterCount > 0 && (
                          <button
                            type="button"
                            onClick={clearAllFilters}
                            className="mt-3 inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-blue-100 hover:text-blue-75 dark:text-blue-50"
                          >
                            <FontAwesomeIcon
                              icon={faRotateLeft}
                              className="size-3"
                            />
                            Clear all filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  sorted.map((dataset) => (
                    <tr
                      key={dataset.slug}
                      className="group transition-colors hover:bg-blue-10/35 dark:hover:bg-blue-100/10"
                    >
                      <td className="py-4 pr-4 pl-5 align-top">
                        <Link
                          href={`/dataset/${dataset.slug}`}
                          className="font-semibold text-black-100 group-hover:text-blue-100 dark:text-white dark:group-hover:text-blue-50"
                        >
                          {dataset.title}
                        </Link>
                        {dataset.isSubDataset && (
                          <span className="ml-2 rounded-md border border-black-25 px-2 py-0.5 align-middle text-[11px] font-semibold text-black-50 dark:border-black-75 dark:text-black-50">
                            Sub-dataset
                          </span>
                        )}
                        <div className="mt-1 font-mono text-xs text-black-50 dark:text-black-50">
                          {dataset.slug}
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top text-sm text-black-75 dark:text-black-25">
                        <div className="flex max-w-48 flex-wrap gap-1.5">
                          {dataset.networkType.map((type) => (
                            <span
                              key={type}
                              className="rounded-md bg-blue-10 px-2 py-1 text-xs font-semibold text-blue-100 ring-1 ring-blue-100/15 dark:bg-blue-100/15 dark:text-blue-50 dark:ring-blue-50/15"
                            >
                              {formatNetworkType(type)}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right align-top text-sm font-medium whitespace-nowrap text-black-75 tabular-nums dark:text-black-25">
                        {formatNumber(dataset.statistics.numNodes)}
                      </td>
                      <td className="px-4 py-4 align-top text-sm text-black-75 dark:text-black-25">
                        <div className="flex max-w-xl flex-wrap gap-2">
                          {dataset.tags.map((tag: string) => (
                            <Tag
                              key={tag}
                              name={tag}
                              selected={selectedTags.includes(tag)}
                              onClick={() =>
                                setSelectedTags((prev) =>
                                  prev.includes(tag) ? prev : [...prev, tag],
                                )
                              }
                            />
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Surface>
      </div>
    </div>
  );
}

export default function DatasetTable({ datasets }: DatasetTableProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DatasetTableContent datasets={datasets} />
    </Suspense>
  );
}
