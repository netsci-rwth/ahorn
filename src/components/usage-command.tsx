"use client";

import { useState } from "react";
import classNames from "classnames";

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

  const selectedPackageManager =
    packageManagers.find((manager) => manager.id === selectedManager) ??
    packageManagers[0];
  const command = selectedPackageManager.command(slug);

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xs font-semibold tracking-wide text-black-50 uppercase dark:text-black-50">
          Usage
        </h2>
        <div
          className="inline-flex rounded-xl border border-black-25 bg-white p-1 dark:border-black-75 dark:bg-black-100"
          role="tablist"
          aria-label="Package manager"
        >
          {packageManagers.map((manager) => {
            const isSelected = manager.id === selectedManager;

            return (
              <button
                key={manager.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                className={classNames(
                  "cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors",
                  isSelected
                    ? "bg-white text-black-100 shadow-sm dark:bg-black-100 dark:text-white"
                    : "text-black-50 hover:text-blue-100 dark:text-black-50 dark:hover:text-blue-50",
                )}
                onClick={() => {
                  setSelectedManager(manager.id);
                  window.localStorage.setItem(STORAGE_KEY, manager.id);
                }}
              >
                {manager.label}
              </button>
            );
          })}
        </div>
      </div>

      <pre className="overflow-x-auto rounded-xl bg-black-100 p-4 text-sm text-white shadow-inner">
        <code className="break-all whitespace-pre-wrap">{command}</code>
      </pre>
    </>
  );
}
