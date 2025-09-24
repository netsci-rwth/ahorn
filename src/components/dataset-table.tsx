"use client";

import Link from "next/link";
import Tag from "@/components/tag";
import { useState } from "react";

type Dataset = {
  slug: string;
  title: string;
  tags: string[];
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
    return matchesSearch && matchesTags;
  });

  return (
    <div className="flex flex-col gap-8 md:flex-row">
      {/* Sidebar */}
      <aside className="md:w-72 md:min-w-[18rem] md:pr-8 mb-8 md:mb-0">
        <div className="mb-6">
          <div className="mb-2 text-sm font-semibold text-gray-700">
            Filter by name:
          </div>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search datasets..."
            className="block w-full rounded-md border border-gray-300 bg-white py-1.5 pl-3 pr-3 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <div className="mb-2 text-sm font-semibold text-gray-700">
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
                  className="text-primary focus:ring-primary rounded border-gray-300"
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
      <div className="flex-1">
        <table className="min-w-full divide-y divide-gray-300">
          <thead>
            <tr>
              <th className="px-3 py-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                Name
              </th>
              <th className="px-3 py-3 text-left text-sm font-semibold text-gray-900">
                Tags
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={2}
                  className="py-12 text-center text-sm text-gray-400"
                >
                  No datasets found matching your search and filter.
                </td>
              </tr>
            ) : (
              filtered.map((dataset) => (
                <tr key={dataset.slug}>
                  <td className="whitespace-nowrap py-4 pr-3 text-sm font-medium text-gray-900">
                    <Link href={`/dataset/${dataset.slug}`}>{dataset.title}</Link>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
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
