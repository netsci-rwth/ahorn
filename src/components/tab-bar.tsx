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
          <h3 className="text-sm font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
            {label}
          </h3>
        )}
        <TabList className="inline-flex rounded-lg bg-slate-100 p-1 dark:bg-slate-900">
          <nav aria-label={label} className="flex items-center gap-1">
            {tabs.map((tab) => (
              <Tab
                key={tab}
                className="cursor-pointer rounded-md px-3 py-1.5 text-sm font-semibold whitespace-nowrap text-slate-500 outline-none select-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:outline-none data-hover:text-slate-900 data-selected:bg-white data-selected:text-primary data-selected:shadow-sm dark:text-slate-400 dark:focus-visible:ring-offset-slate-950 dark:data-hover:text-slate-100 dark:data-selected:bg-slate-800 dark:data-selected:text-sky-300"
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
