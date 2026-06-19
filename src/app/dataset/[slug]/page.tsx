import fs from "fs";
import path from "path";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import Link from "next/link";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowUpRightFromSquare,
  faPaperclip,
  faHexagonNodes,
  faTag,
} from "@fortawesome/free-solid-svg-icons";

import Tag from "@/components/tag";
import Badge from "@/components/badge";
import Button from "@/components/button";
import CitationCopyButton from "@/components/CitationCopyButton";
import CopyTextButton from "@/components/CopyTextButton";
import DatasetCardList from "@/components/dataset-card-list";
import DownloadButtonGroup from "@/components/download-button-group";
import PageHeader from "@/components/page-header";
import Surface from "@/components/surface";
import UsageCommand from "@/components/usage-command";

import { citeToApa, citeToBibtex, toCite } from "@/utils/citation";
import {
  getBuildScriptSlug,
  getParentSlug,
  type DatasetFrontmatter,
} from "@/utils/datasets";
import {
  formatAttachmentTag,
  formatFileSize,
  formatNetworkType,
} from "@/utils/format";
import { tooltipArrowClassName, tooltipClassName } from "@/utils/tooltip";
import {
  getResolvedAttachmentFormatEntries,
  resolveAttachmentSizes,
  type AttachmentMap,
  type ResolvedRevisionAttachment,
} from "@/utils/zenodo";

type AttachmentRevision = {
  key: string;
  label: string;
  attachment: ResolvedRevisionAttachment;
  changelog: string[];
};

type ImportedDataset = {
  slug: string;
  frontmatter: DatasetFrontmatter;
};

function getStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function isSafeMarkdownUrl(url: string): boolean {
  if (url.startsWith("/")) {
    return true;
  }

  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

function renderInlineMarkdown(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;

  for (const match of text.matchAll(pattern)) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    const link = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link && isSafeMarkdownUrl(link[2])) {
      nodes.push(
        <a key={nodes.length} href={link[2]} target="_blank" rel="noreferrer">
          {link[1]}
        </a>,
      );
    } else if (token.startsWith("`") && token.endsWith("`")) {
      nodes.push(<code key={nodes.length}>{token.slice(1, -1)}</code>);
    } else {
      nodes.push(token);
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

function getZenodoRecordUrl(url: string): string | null {
  const parsedUrl = new URL(url, "https://ahorn.rwth-aachen.de/");
  if (parsedUrl.hostname !== "zenodo.org") {
    return null;
  }

  const match = parsedUrl.pathname.match(/^\/records\/\d+/);
  return match ? `https://zenodo.org${match[0]}` : null;
}

function formatExternalLinkLabel(url: string | undefined): string {
  if (!url) {
    return "Unknown";
  }

  try {
    const parsed = new URL(url, "https://ahorn.rwth-aachen.de/");
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

type SidebarSectionProps = {
  title: string;
  children: ReactNode;
  className?: string;
} & ComponentPropsWithoutRef<"section">;

function SidebarSection({
  title,
  children,
  className = "",
  ...rest
}: SidebarSectionProps) {
  return (
    <section className={className} {...rest}>
      <h2 className="mb-3 text-xs font-semibold tracking-wide text-black-50 uppercase dark:text-black-50">
        {title}
      </h2>
      {children}
    </section>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  try {
    const { frontmatter } = await import(`@/datasets/${slug}.mdx`);
    return {
      title: `${frontmatter.title || slug} | AHORN - Aachen Higher-Order Repository of Networks`,
    };
  } catch {
    return {
      title: `Dataset | AHORN - Aachen Higher-Order Repository of Networks`,
    };
  }
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const datasetsDir = path.join(process.cwd(), "src", "datasets");
  const filenames = await fs.promises.readdir(datasetsDir);
  return filenames
    .filter((filename) => filename.endsWith(".mdx"))
    .map((filename) => ({ slug: path.parse(filename).name }));
}

export default async function DatasetPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { default: Dataset, frontmatter } = await import(
    `@/datasets/${slug}.mdx`
  );
  const networkTypes = getStringArray(frontmatter["network-type"]);
  const tags = getStringArray(frontmatter.tags);
  const parentSlug = getParentSlug(frontmatter.parent);
  const datasetsDir = path.join(process.cwd(), "src", "datasets");
  const filenames = await fs.promises.readdir(datasetsDir);
  const importedDatasets = await Promise.all(
    filenames
      .filter((filename) => filename.endsWith(".mdx"))
      .map(async (filename) => {
        const importedSlug = path.parse(filename).name;
        const { frontmatter: importedFrontmatter } = (await import(
          `@/datasets/${filename}`
        )) as {
          frontmatter: DatasetFrontmatter;
        };

        return {
          slug: importedSlug,
          frontmatter: importedFrontmatter,
        } satisfies ImportedDataset;
      }),
  );
  const relatedDatasetSlugs = Array.isArray(frontmatter.related)
    ? frontmatter.related.filter(
        (relatedSlug: unknown): relatedSlug is string =>
          typeof relatedSlug === "string",
      )
    : [];
  const childDatasetSlugs = importedDatasets
    .filter((dataset) => getParentSlug(dataset.frontmatter.parent) === slug)
    .sort((left, right) => {
      const leftTitle =
        typeof left.frontmatter.title === "string"
          ? left.frontmatter.title
          : left.slug;
      const rightTitle =
        typeof right.frontmatter.title === "string"
          ? right.frontmatter.title
          : right.slug;

      return leftTitle.localeCompare(rightTitle);
    })
    .map((dataset) => dataset.slug);
  const parentTitle =
    parentSlug === null
      ? null
      : (() => {
          const matchedParent = importedDatasets.find(
            (dataset) => dataset.slug === parentSlug,
          );
          return typeof matchedParent?.frontmatter.title === "string"
            ? matchedParent.frontmatter.title
            : parentSlug;
        })();

  const attachmentMetadata = (frontmatter.attachments || {}) as AttachmentMap;
  const attachments = await resolveAttachmentSizes(attachmentMetadata);
  const citations = frontmatter.citation
    ? await toCite(frontmatter.citation)
    : null;
  const apaCitations = citations ? citeToApa(citations) : [];
  const bibtex = citations ? citeToBibtex(citations) : "";
  const attachmentEntries: AttachmentRevision[] = Object.entries(
    attachments,
  ).map(([key, attachment]) => ({
    key,
    label: formatAttachmentTag(key),
    attachment,
    changelog: attachment.changelog,
  }));
  const latestAttachmentEntry = attachmentEntries.at(-1) ?? null;
  const latestAttachment = latestAttachmentEntry?.attachment["ahorn"];
  const buildScriptSlug = getBuildScriptSlug(slug, frontmatter.parent);

  const licenseDisplay = (() => {
    const license = frontmatter.license;
    if (!license) return null;

    if (typeof license === "string") {
      if (license === "unprovided-reuse-encouraged") {
        return "No license information provided by the source. Author encourages reuse.";
      }
      return license;
    }

    if (typeof license === "object") {
      const spdx = (license as { spdx?: string }).spdx;
      const link = (license as { link?: string }).link;

      if (spdx && link) {
        return (
          <a href={link} target="_blank" rel="noreferrer">
            {spdx}
          </a>
        );
      }

      if (spdx) return spdx;
    }

    return null;
  })();

  return (
    <div className="max-w-full min-w-0" data-pagefind-body>
      <PageHeader
        eyebrow={
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="hover:text-blue-75">
                  Repository
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/dataset" className="hover:text-blue-75">
                  Datasets
                </Link>
              </li>
              {parentSlug !== null && (
                <>
                  <li aria-hidden="true">/</li>
                  <li>
                    <Link
                      href={`/dataset/${parentSlug}`}
                      className="hover:text-blue-75"
                    >
                      {parentTitle}
                    </Link>
                  </li>
                </>
              )}
            </ol>
          </nav>
        }
        title={frontmatter.title}
        actions={
          <Surface
            variant="secondary"
            className="flex w-full max-w-full flex-col overflow-hidden backdrop-blur sm:flex-row lg:max-w-120"
          >
            <CopyTextButton
              text={slug}
              label={
                <span className="relative flex min-w-0 flex-col justify-center text-left">
                  <span className="flex items-center gap-2">
                    <span className="font-semibold tracking-widest text-black-50 uppercase dark:text-black-50">
                      Slug
                    </span>
                  </span>
                  <span className="mt-0.5 flex min-w-0 items-center">
                    <code className="min-w-0 truncate font-medium text-black-75 dark:text-white">
                      {slug}
                    </code>
                  </span>
                </span>
              }
              successMessage="Slug copied to clipboard."
              errorMessage="Could not copy slug."
              className="min-w-0 flex-1 cursor-pointer justify-start px-3 py-2 text-xs hover:text-blue-100 dark:hover:text-blue-50"
            />
            {latestAttachment && (
              <Button
                as="a"
                href={latestAttachment.url}
                download
                target="_blank"
                className="justify-center rounded-none border-t border-black-25 px-3 py-2 text-xs shadow-none sm:border-t-0 sm:border-l"
              >
                <span className="text-center sm:max-w-16">
                  Download Dataset
                </span>
              </Button>
            )}
          </Surface>
        }
      >
        <div className="mt-6 flex min-w-0 flex-col gap-6 sm:flex-row sm:flex-wrap sm:gap-8">
          {networkTypes.length > 0 && (
            <div className="group relative min-w-0">
              <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-wide text-black-50 uppercase dark:text-black-50">
                <FontAwesomeIcon icon={faHexagonNodes} className="size-4" />
                Network Type
                <span className={tooltipClassName}>
                  These network types are suggested interpretations and do not
                  claim to be complete.
                  <span className={tooltipArrowClassName}></span>
                </span>
              </h3>
              <div className="flex min-w-0 flex-wrap gap-2">
                {networkTypes.map((type: string, index: number) => (
                  <Badge
                    key={index}
                    href={`/dataset?types=${encodeURIComponent(type)}`}
                    color="info"
                  >
                    {formatNetworkType(type)}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {tags.length > 0 && (
            <div className="min-w-0">
              <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-wide text-black-50 uppercase dark:text-black-50">
                <FontAwesomeIcon icon={faTag} className="size-4" />
                Tags
              </h3>
              <div className="flex min-w-0 flex-wrap gap-2">
                {tags.map((tag: string, index: number) => (
                  <Tag
                    key={index}
                    name={tag}
                    href={`/dataset?tags=${encodeURIComponent(tag)}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </PageHeader>

      <div className="mt-10 max-w-full min-w-0 lg:flex lg:items-start lg:justify-between lg:gap-10 xl:gap-12">
        <div className="min-w-0 flex-1">
          <div className="prose max-w-none min-w-0 wrap-break-word dark:prose-invert [&_code]:break-words [&_pre]:max-w-full [&_pre]:overflow-x-auto">
            <Dataset />
          </div>
          {childDatasetSlugs.length > 0 && (
            <section className="not-prose mt-10" data-pagefind-ignore>
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-semibold tracking-tight text-black-100 dark:text-white">
                  Sub-datasets
                </h2>
                <Badge color="info" className="px-2 py-0.5 text-[11px]">
                  {childDatasetSlugs.length}
                </Badge>
              </div>
              <DatasetCardList
                slugs={childDatasetSlugs}
                backgroundEffect={false}
              />
            </section>
          )}
        </div>

        <aside className="mt-10 w-full max-w-full min-w-0 shrink-0 lg:mt-0 lg:w-88">
          <div className="flex flex-col gap-y-8 lg:sticky lg:top-24">
            <section data-pagefind-ignore>
              <UsageCommand slug={slug} />
            </section>

            {(attachmentEntries.length > 0 || frontmatter.source) && (
              <SidebarSection title="Timeline">
                <ol
                  className="relative space-y-4 before:absolute before:top-3.5 before:bottom-3.5 before:left-3.5 before:w-px before:bg-black-25 dark:before:bg-black-75"
                  role="list"
                >
                  {[...attachmentEntries]
                    .reverse()
                    .map(({ key, label, attachment, changelog }) => {
                      const primaryAttachment = attachment["ahorn"];
                      const zenodoUrl = getZenodoRecordUrl(
                        primaryAttachment.url,
                      );
                      const additionalFormats =
                        getResolvedAttachmentFormatEntries(attachment)
                          .filter(([format]) => format !== "ahorn")
                          .map(([format, formatAttachment]) => ({
                            format,
                            url: new URL(
                              formatAttachment.url,
                              "https://ahorn.rwth-aachen.de/",
                            ).href,
                            size: formatAttachment.size,
                          }));

                      return (
                        <li key={key} className="relative flex min-w-0 gap-3">
                          <div className="relative z-10 flex size-7 shrink-0 items-center justify-center">
                            <span className="flex size-7 items-center justify-center rounded-full border border-black-25 bg-white text-black-50 dark:border-black-75 dark:bg-black-100 dark:text-black-50">
                              <FontAwesomeIcon
                                icon={faPaperclip}
                                className="size-2"
                              />
                            </span>
                          </div>

                          <div className="min-w-0 flex-1 rounded-lg border border-black-10 p-3 dark:border-black-75/40">
                            <div className="flex min-w-0 items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="flex min-w-0 flex-wrap items-center gap-2">
                                  <span className="truncate text-sm font-semibold text-black-100 dark:text-white">
                                    {label}
                                  </span>
                                </div>
                                {typeof primaryAttachment.size === "number" && (
                                  <p className="mt-0.5 text-xs text-black-50 dark:text-black-50">
                                    {formatFileSize(primaryAttachment.size)}
                                  </p>
                                )}
                              </div>
                              <DownloadButtonGroup
                                primary={{
                                  format: "ahorn",
                                  url: new URL(
                                    primaryAttachment.url,
                                    "https://ahorn.rwth-aachen.de/",
                                  ).href,
                                  size: primaryAttachment.size,
                                }}
                                secondary={additionalFormats}
                                zenodoUrl={zenodoUrl}
                              />
                            </div>

                            {changelog.length > 0 && (
                              <div className="mt-3">
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                                  <span className="text-xs font-medium text-black-50 dark:text-black-50">
                                    Changelog
                                  </span>
                                </div>
                              </div>
                            )}

                            {changelog.length > 0 && (
                              <div className="prose mt-2 text-xs leading-5 text-black-75 dark:text-black-25">
                                <ul className="my-0 pl-4" role="list">
                                  {changelog.map((entry, index) => (
                                    <li key={index}>
                                      {renderInlineMarkdown(entry)}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  {frontmatter.source && (
                    <li className="relative flex min-w-0 gap-3">
                      <div className="relative z-10 flex size-7 shrink-0 items-center justify-center">
                        <span className="flex size-7 items-center justify-center rounded-full border border-black-25 bg-white text-black-50 dark:border-black-75 dark:bg-black-100 dark:text-black-50">
                          <FontAwesomeIcon
                            icon={faArrowUpRightFromSquare}
                            className="size-2"
                          />
                        </span>
                      </div>

                      <div className="min-w-0 flex-1 rounded-lg border border-black-10 p-3 dark:border-black-75/40">
                        <h3 className="text-sm font-semibold text-black-100 dark:text-white">
                          Source provenance
                        </h3>

                        <dl className="mt-3 space-y-2.5">
                          <div>
                            <dt className="text-xs font-medium text-black-50 dark:text-black-50">
                              Source
                            </dt>
                            <dd className="mt-0.5 text-sm leading-6 text-black-75 dark:text-black-25">
                              <a
                                href={frontmatter.source}
                                target="_blank"
                                rel="noreferrer"
                                title={frontmatter.source}
                                className="inline-flex max-w-full items-center gap-1.5 font-medium hover:text-blue-100 dark:hover:text-blue-50"
                              >
                                <span className="truncate">
                                  {formatExternalLinkLabel(frontmatter.source)}
                                </span>
                                <FontAwesomeIcon
                                  icon={faArrowUpRightFromSquare}
                                  className="size-3 shrink-0 text-black-50 dark:text-black-50"
                                />
                              </a>
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs font-medium text-black-50 dark:text-black-50">
                              License
                            </dt>
                            <dd className="mt-0.5 text-sm leading-6 text-black-75 dark:text-black-25">
                              {licenseDisplay ?? "Unknown"}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs font-medium text-black-50 dark:text-black-50">
                              Build script
                            </dt>
                            <dd className="mt-0.5 text-sm leading-6 text-black-75 dark:text-black-25">
                              <a
                                href={`https://github.com/netsci-rwth/ahorn/blob/main/scripts/${buildScriptSlug}.py`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex max-w-full items-center gap-1.5 font-medium hover:text-blue-100 dark:hover:text-blue-50"
                              >
                                <span className="truncate">
                                  Converter script
                                </span>
                                <FontAwesomeIcon
                                  icon={faArrowUpRightFromSquare}
                                  className="size-3 shrink-0 text-black-50 dark:text-black-50"
                                />
                              </a>
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </li>
                  )}
                </ol>
              </SidebarSection>
            )}

            {relatedDatasetSlugs.length > 0 && (
              <SidebarSection title="Related Datasets" data-pagefind-ignore>
                <DatasetCardList slugs={relatedDatasetSlugs} columns="single" />
              </SidebarSection>
            )}
            {frontmatter.citation && (
              <section id="citation">
                <div className="mb-3 flex items-center justify-between gap-4">
                  <h2 className="text-xs font-semibold tracking-wide text-black-50 uppercase dark:text-black-50">
                    Citation
                  </h2>
                  <CitationCopyButton bibtex={bibtex} />
                </div>
                <div>
                  <ul className="space-y-4">
                    {apaCitations.map((citation) => (
                      <li
                        key={citation[0]}
                        className="prose max-w-none text-sm leading-6 prose-slate dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: citation[1] }}
                      />
                    ))}
                  </ul>
                  <div className="mt-4 border-t border-black-10 pt-3 text-xs leading-5 text-black-50 dark:border-black-75/40 dark:text-black-50">
                    If you use this dataset, please ensure you cite it
                    appropriately in your work.
                  </div>
                </div>
              </section>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
