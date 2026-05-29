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
      <div className="flex flex-wrap items-center gap-3">
        {label && (
          <h3 className="text-sm font-semibold tracking-wide text-black-50 uppercase dark:text-black-50">
            {label}
          </h3>
        )}
        <TabList className="inline-flex rounded-lg bg-white p-1 dark:bg-black-100">
          <nav aria-label={label} className="flex items-center gap-1">
            {tabs.map((tab) => (
              <Tab
                key={tab}
                className="cursor-pointer rounded-md px-3 py-1.5 text-sm font-semibold whitespace-nowrap text-black-50 outline-none select-none focus-visible:ring-2 focus-visible:ring-blue-100/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:outline-none data-hover:text-black-100 data-selected:bg-white data-selected:text-blue-100 data-selected:shadow-sm dark:text-black-50 dark:focus-visible:ring-offset-black-100 dark:data-hover:text-white dark:data-selected:bg-black-100 dark:data-selected:text-blue-50"
              >
                {tab}
              </Tab>
            ))}
          </nav>
        </TabList>
      </div>
      <TabPanels className="mt-6">
        {children.map((child, index) => (
          <TabPanel key={index}>{child}</TabPanel>
        ))}
      </TabPanels>
    </TabGroup>
  );
}
