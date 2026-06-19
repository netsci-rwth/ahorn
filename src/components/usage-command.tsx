"use client";

import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { useState } from "react";

const STORAGE_KEY = "ahorn:usage-package-manager";

const packageManagers = [
  {
    id: "uvx",
    label: "uvx",
    command: (slug: string) => `uvx ahorn-loader download ${slug}`,
  },
  {
    id: "pipx",
    label: "pipx",
    command: (slug: string) => `pipx run ahorn-loader download ${slug}`,
  },
] as const;

export default function UsageCommand({ slug }: { slug: string }) {
  const [selectedManager, setSelectedManager] = useState<
    (typeof packageManagers)[number]["id"]
  >(() => {
    if (typeof window === "undefined") {
      return "uvx";
    }

    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && packageManagers.some((manager) => manager.id === stored)) {
      return stored as (typeof packageManagers)[number]["id"];
    }

    return "uvx";
  });

  const selectedIndex = Math.max(
    packageManagers.findIndex((manager) => manager.id === selectedManager),
    0,
  );

  return (
    <TabGroup
      selectedIndex={selectedIndex}
      onChange={(index) => {
        const manager = packageManagers[index] ?? packageManagers[0];
        setSelectedManager(manager.id);
        window.localStorage.setItem(STORAGE_KEY, manager.id);
      }}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xs font-semibold tracking-wide text-black-50 uppercase dark:text-black-50">
          Usage
        </h2>
        <TabList className="inline-flex rounded-lg bg-blue-10/70 p-1 dark:bg-blue-100/15">
          {packageManagers.map((manager) => (
            <Tab
              key={manager.id}
              className="cursor-pointer rounded-md px-2.5 py-1.5 text-xs font-semibold text-black-75 transition-colors outline-none data-hover:text-black-100 data-selected:bg-white data-selected:text-blue-100 data-selected:shadow-sm dark:text-black-25 dark:data-hover:text-white dark:data-selected:bg-black-100 dark:data-selected:text-blue-50"
            >
              {manager.label}
            </Tab>
          ))}
        </TabList>
      </div>

      <TabPanels>
        {packageManagers.map((manager) => (
          <TabPanel key={manager.id}>
            <pre className="overflow-x-auto rounded-lg bg-black-100 p-4 text-sm text-white shadow-inner">
              <code className="break-all whitespace-pre-wrap">
                {manager.command(slug)}
              </code>
            </pre>
          </TabPanel>
        ))}
      </TabPanels>
    </TabGroup>
  );
}
