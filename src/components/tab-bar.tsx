"use client";

import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { Children, ReactNode } from "react";

export type TabBarProps = {
  label?: string;
  tabs: string[];
  children: ReactNode;
};

export default function TabBar({ label, tabs, children }: TabBarProps) {
  const tabPanels = Children.toArray(children).filter(
    (child) => typeof child !== "string" || child.trim() !== "",
  );

  if (tabs.length !== tabPanels.length) {
    throw new Error("Number of tabs must match number of children");
  }

  return (
    <TabGroup>
      <div className="not-prose flex flex-col gap-2 border-b border-blue-25/80 pb-2 sm:flex-row sm:items-end sm:justify-between dark:border-blue-75/25">
        {label && (
          <h3 className="text-sm font-semibold tracking-wide text-black-75 uppercase dark:text-black-25">
            {label}
          </h3>
        )}
        <TabList className="flex max-w-full overflow-x-auto">
          <nav
            aria-label={label}
            className="inline-flex items-center gap-1 rounded-lg bg-blue-10/70 p-1 dark:bg-blue-100/15"
          >
            {tabs.map((tab) => (
              <Tab
                key={tab}
                className="cursor-pointer rounded-md px-3 py-1.5 text-sm font-semibold whitespace-nowrap text-black-75 transition outline-none select-none data-hover:text-black-100 data-selected:bg-white data-selected:text-blue-100 data-selected:shadow-sm dark:text-black-25 dark:data-hover:text-white dark:data-selected:bg-black-100 dark:data-selected:text-blue-50"
              >
                {tab}
              </Tab>
            ))}
          </nav>
        </TabList>
      </div>
      <TabPanels className="mt-6">
        {tabPanels.map((child, index) => (
          <TabPanel key={index}>{child}</TabPanel>
        ))}
      </TabPanels>
    </TabGroup>
  );
}
