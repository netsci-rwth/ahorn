"use client";

import Link from "next/link";
import Tag from "@/components/tag";
import { useState, useMemo, useEffect } from "react";

import MultiRangeSlider from "@/components/multirange";
import { formatNumber } from "@/utils/format";

type Dataset = {
  slug: string;
  title: string;
  tags: string[];
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
  return Array.from(tagSet).sort();
}

export default function DatasetTable({ datasets }: DatasetTableProps) {
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const allTags = getAllTags(datasets);

  // Compute global min/max node counts and keep local state in sync
  const nodeExtremes = useMemo(() => {
    if (datasets.length === 0) return { min: 0, max: 0 };
    let min = Infinity;
    let max = -Infinity;
    for (const dataset of datasets) {
      const n = dataset.statistics.numNodes;
      if (n < min) min = n;
      if (n > max) max = n;
    }
    return { min, max };
  }, [datasets]);

  const [nodeRangeMin, setNodeRangeMin] = useState<number>(nodeExtremes.min);
  const [nodeRangeMax, setNodeRangeMax] = useState<number>(nodeExtremes.max);

  useEffect(() => {
    setNodeRangeMin(nodeExtremes.min);
    setNodeRangeMax(nodeExtremes.max);
  }, [nodeExtremes.min, nodeExtremes.max]);

  const handleTagChange = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const filtered = datasets.filter((d) => {
    const matchesSearch = d.title.toLowerCase().includes(search.toLowerCase());
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.every((tag) => d.tags.includes(tag));
    const matchesRange =
      d.statistics.numNodes >= nodeRangeMin &&
      d.statistics.numNodes <= nodeRangeMax;
    return matchesSearch && matchesTags && matchesRange;
  });

  return (
    <div className="flex flex-col gap-8 md:flex-row">
      {/* Sidebar */}
      <aside className="mb-8 flex flex-col gap-y-8 md:mb-0 md:w-72 md:min-w-[18rem] md:pr-8">
        <div>
          <div className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            Filter by name:
          </div>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search datasets..."
            className="block w-full rounded-md border border-gray-300 bg-white py-1.5 pr-3 pl-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
          />
        </div>
        <div>
          <div className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            Filter by node size (|V|):
          </div>
          <MultiRangeSlider
            min={nodeExtremes.min}
            max={nodeExtremes.max}
            onChange={({ min, max }) => {
              setNodeRangeMin(min);
              setNodeRangeMax(max);
            }}
          />
        </div>
        <div>
          <div className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            Filter by tag:
          </div>
          <ul className="flex flex-wrap gap-3">
            {allTags.map((tag) => (
              <li key={tag} className="flex items-center gap-1">
                <input
                  id={`tag-${tag}`}
                  type="checkbox"
                  checked={selectedTags.includes(tag)}
                  onChange={() => handleTagChange(tag)}
                  className="rounded border-gray-300 bg-white text-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:focus:ring-primary"
                />
                <label
                  htmlFor={`tag-${tag}`}
                  className="cursor-pointer text-xs"
                >
                  <Tag name={tag} />
                </label>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Table */}
      <div className="w-full flex-1 overflow-x-auto">
        <table className="w-full divide-y divide-gray-300 dark:divide-gray-700">
          <thead>
            <tr>
              <th className="px-3 py-3 text-left text-sm font-semibold text-gray-900 sm:pl-0 dark:text-gray-100">
                Name
              </th>
              <th className="px-3 py-3 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                |V|
              </th>
              <th className="px-3 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                Tags
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="py-12 text-center text-sm text-gray-400 dark:text-gray-500"
                >
                  No datasets found matching your search and filter.
                </td>
              </tr>
            ) : (
              filtered.map((dataset) => (
                <tr key={dataset.slug}>
                  <td className="py-4 pr-3 text-sm font-medium whitespace-nowrap text-gray-900 dark:text-gray-100">
                    <Link href={`/dataset/${dataset.slug}`}>
                      {dataset.title}
                    </Link>
                  </td>
                  <td className="px-3 py-4 text-right text-sm whitespace-nowrap text-gray-500 dark:text-gray-300">
                    {formatNumber(dataset.statistics.numNodes)}
                  </td>
                  <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-300">
                    <div className="flex flex-wrap gap-2">
                      {dataset.tags.map((tag: string) => (
                        <Tag key={tag} name={tag} />
                      ))}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
