"use client";

import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { ReactNode } from "react";

export type TabBarProps = {
  label?: string;
  tabs: string[];
  children: ReactNode[];
};

export default function TabBar({ label, tabs, children }: TabBarProps) {
  if (tabs.length !== children.length) {
    throw new Error("Number of tabs must match number of children");
  }

  return (
    <TabGroup>
      <TabList className="border-b border-gray-200 dark:border-gray-700">
        <nav
          aria-label={label}
          className="-mb-px flex items-baseline space-x-8"
        >
          {label && (
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {label}
            </h3>
          )}
          {tabs.map((tab) => (
            <Tab
              key={tab}
              className="cursor-pointer border-b-2 border-transparent px-1 py-2 text-sm font-medium whitespace-nowrap text-gray-500 outline-none select-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:outline-none data-hover:border-gray-300 data-hover:text-gray-700 data-selected:border-primary data-selected:text-primary dark:text-gray-400 dark:focus-visible:ring-offset-gray-900 dark:data-hover:border-gray-600 dark:data-hover:text-gray-300 dark:data-selected:border-primary dark:data-selected:text-primary"
            >
              {tab}
            </Tab>
          ))}
        </nav>
      </TabList>
      <TabPanels className="mt-6">
        {children.map((child, index) => (
          <TabPanel key={index}>{child}</TabPanel>
        ))}
      </TabPanels>
    </TabGroup>
  );
}
