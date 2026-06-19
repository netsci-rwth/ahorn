"use client";

import {
  Menu,
  MenuButton,
  MenuHeading,
  MenuItem,
  MenuItems,
  MenuSection,
  MenuSeparator,
} from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowUpRightFromSquare,
  faChevronDown,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";

import { formatFileSize } from "@/utils/format";
import type { AttachmentFormat } from "@/utils/zenodo";

export type DownloadOption = {
  format: AttachmentFormat;
  url: string;
  size?: number;
};

function formatDownloadFormat(format: AttachmentFormat): string {
  return format.toUpperCase();
}

export default function DownloadButtonGroup({
  primary,
  secondary,
  zenodoUrl,
}: {
  primary: DownloadOption;
  secondary: DownloadOption[];
  zenodoUrl?: string | null;
}) {
  const formats = [primary, ...secondary];
  const hasMenuItems = secondary.length > 0 || Boolean(zenodoUrl);

  return (
    <Menu
      as="div"
      className="relative inline-flex max-w-full shrink-0 items-stretch rounded-lg"
    >
      <a
        href={primary.url}
        download
        className={`hover:bg-black-5 inline-flex min-h-8 max-w-full items-center gap-1.5 border border-black-25 bg-white px-2.5 text-xs font-semibold text-black-75 hover:text-blue-100 dark:border-black-75 dark:bg-black-100 dark:text-black-25 dark:hover:bg-black-75 dark:hover:text-blue-50 ${
          hasMenuItems
            ? "rounded-l-lg border-r-0 dark:border-r-0"
            : "rounded-lg"
        }`}
      >
        <FontAwesomeIcon
          icon={faDownload}
          className="size-3 shrink-0 text-black-50 dark:text-black-50"
        />
        <span className="truncate">Download</span>
      </a>

      {hasMenuItems && (
        <>
          <MenuButton
            type="button"
            className="hover:bg-black-5 group inline-flex min-h-8 cursor-pointer list-none items-center rounded-r-lg border border-black-25 bg-white px-2 text-xs font-semibold text-black-75 dark:border-black-75 dark:bg-black-100 dark:text-black-25 dark:hover:bg-black-75"
            aria-label="Choose download format"
          >
            <FontAwesomeIcon
              icon={faChevronDown}
              className="size-3 transition-transform group-data-open:rotate-180"
            />
          </MenuButton>
          <MenuItems
            anchor="bottom end"
            className="z-20 mt-2 min-w-44 overflow-hidden rounded-lg border border-black-10 bg-white py-1 shadow-xl dark:border-black-75 dark:bg-black-100"
          >
            <MenuSection>
              <MenuHeading className="px-3 py-2 text-[11px] font-semibold tracking-wide text-black-50 uppercase dark:text-black-50">
                All formats
              </MenuHeading>
              {formats.map((option) => (
                <MenuItem
                  key={option.format}
                  as="a"
                  href={option.url}
                  download
                  className="hover:bg-black-5 data-focus:bg-black-5 flex min-w-0 items-center justify-between gap-3 px-3 py-2 text-xs font-medium text-black-75 data-focus:text-blue-100 dark:text-black-25 dark:hover:bg-black-75 dark:hover:text-blue-50 dark:data-focus:bg-black-75 dark:data-focus:text-blue-50"
                >
                  <span className="truncate">
                    {formatDownloadFormat(option.format)}
                  </span>
                  {typeof option.size === "number" && (
                    <span className="shrink-0 text-black-50 dark:text-black-50">
                      {formatFileSize(option.size)}
                    </span>
                  )}
                </MenuItem>
              ))}
            </MenuSection>

            {zenodoUrl && (
              <>
                <MenuSeparator className="my-1 h-px bg-black-10 dark:bg-black-75" />
                <MenuSection>
                  <MenuHeading className="px-3 py-2 text-[11px] font-semibold tracking-wide text-black-50 uppercase dark:text-black-50">
                    Source
                  </MenuHeading>
                  <MenuItem
                    as="a"
                    href={zenodoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:bg-black-5 data-focus:bg-black-5 flex min-w-0 items-center justify-between gap-3 px-3 py-2 text-xs font-medium text-black-75 data-focus:text-blue-100 dark:text-black-25 dark:hover:bg-black-75 dark:hover:text-blue-50 dark:data-focus:bg-black-75 dark:data-focus:text-blue-50"
                  >
                    <span className="truncate">Zenodo record</span>
                    <FontAwesomeIcon
                      icon={faArrowUpRightFromSquare}
                      className="size-2.5 shrink-0 text-black-50 dark:text-black-50"
                    />
                  </MenuItem>
                </MenuSection>
              </>
            )}
          </MenuItems>
        </>
      )}
    </Menu>
  );
}
