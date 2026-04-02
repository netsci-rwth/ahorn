import fs from "fs";
import path from "path";
import Link from "next/link";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperclip,
  faHexagonNodes,
  faTag,
} from "@fortawesome/free-solid-svg-icons";

import Tag from "@/components/tag";
import Badge from "@/components/badge";
import Button from "@/components/button";
import CitationCopyButton from "@/components/CitationCopyButton";
import CopyTextButton from "@/components/CopyTextButton";
import PageHeader from "@/components/page-header";
import UsageCommand from "@/components/usage-command";

import { citeToApa, citeToBibtex, toCite } from "@/utils/citation";
import { formatAttachmentTag, formatFileSize } from "@/utils/format";
import { tooltipArrowClassName, tooltipClassName } from "@/utils/tooltip";
import { resolveAttachmentSizes } from "@/utils/zenodo";

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
  return filenames.map((filename) => ({ slug: path.parse(filename).name }));
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

  // fetch related datasets
  let related_datasets;
  if (frontmatter.related && Array.isArray(frontmatter.related)) {
    related_datasets = await Promise.all(
      frontmatter.related.map(async (relatedSlug: string) => {
        try {
          const { frontmatter: relatedFrontmatter } = await import(
            `@/datasets/${relatedSlug}.mdx`
          );
          return {
            slug: relatedSlug,
            title: relatedFrontmatter.title || relatedSlug,
          };
        } catch {
          return {
            slug: relatedSlug,
            title: relatedSlug,
          };
        }
      }),
    );
  } else {
    related_datasets = [];
  }

  const attachments = await resolveAttachmentSizes(
    frontmatter.attachments || {},
  );
  const citations = frontmatter.citation
    ? await toCite(frontmatter.citation)
    : null;
  const apaCitations = citations ? citeToApa(citations) : [];
  const bibtex = citations ? citeToBibtex(citations) : "";
  const latestAttachment = (() => {
    const attachmentEntries = Object.entries(attachments);
    if (attachmentEntries.length === 0) {
      return null;
    }

    const byRevision = attachmentEntries
      .map(([key, attachment]) => {
        const match = key.match(/^revision-(\d+)$/);
        return {
          key,
          attachment,
          revision: match ? Number.parseInt(match[1], 10) : Number.NaN,
        };
      })
      .filter((entry) => !Number.isNaN(entry.revision))
      .sort((a, b) => b.revision - a.revision);

    return (
      byRevision[0] ?? {
        key: attachmentEntries[0][0],
        attachment: attachmentEntries[0][1],
      }
    ).attachment;
  })();

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
    <div
      className="lg:flex lg:items-start lg:justify-between lg:gap-8"
      data-pagefind-body
    >
      <div className="min-w-0 flex-1">
        <PageHeader
          eyebrow="Dataset"
          title={frontmatter.title}
          actions={
            <div className="flex w-full max-w-full items-stretch rounded-xl border border-slate-200 bg-white lg:max-w-120 dark:border-slate-700 dark:bg-slate-900">
              <CopyTextButton
                text={slug}
                label={
                  <span className="relative flex min-w-0 flex-col justify-center text-left">
                    <span className="flex items-center gap-2">
                      <span className="font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400">
                        Slug
                      </span>
                    </span>
                    <span className="mt-0.5 flex min-w-0 items-center">
                      <code className="min-w-0 truncate rounded-md bg-slate-100/90 px-2 py-0.5 font-medium text-slate-700 dark:bg-slate-800/90 dark:text-slate-100">
                        {slug}
                      </code>
                    </span>
                  </span>
                }
                successMessage="Slug copied to clipboard."
                errorMessage="Could not copy slug."
                className="min-w-0 text-xs flex-1 cursor-pointer justify-start px-3 py-2 hover:text-primary dark:hover:text-sky-300"
              />
              {latestAttachment && (
                <Button
                  as="a"
                  href={latestAttachment.url}
                  download
                  target="_blank"
                  className="px-3 py-2 text-xs shadow-none rounded-none"
                >
                  <span className="max-w-16 text-center">
                    Download Dataset
                  </span>
                </Button>
              )}
            </div>
          }
          className="border-b border-slate-200 dark:border-slate-700"
        >
          <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:flex-wrap sm:gap-8">
            <div className="group relative">
              <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                <FontAwesomeIcon icon={faHexagonNodes} className="size-4" />
                Network Type
                <span className={tooltipClassName}>
                  These network types are suggested interpretations and do not
                  claim to be complete.
                  <span className={tooltipArrowClassName}></span>
                </span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {frontmatter["network-type"].map(
                  (type: string, index: number) => (
                    <Badge
                      key={index}
                      href={`/dataset?types=${encodeURIComponent(type)}`}
                      color="info"
                    >
                      {type === "simplicial-complex"
                        ? "Simplicial Complex"
                        : type === "hypergraph"
                          ? "Hypergraph"
                          : type}
                    </Badge>
                  ),
                )}
              </div>
            </div>
            {frontmatter.tags.length > 0 && (
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                  <FontAwesomeIcon icon={faTag} className="size-4" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {frontmatter.tags.map((tag: string, index: number) => (
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

        <div className="prose mt-8 max-w-none dark:prose-invert">
          <Dataset />
        </div>
      </div>

      <aside className="mt-8 w-full shrink-0 lg:mt-0 lg:w-80">
        <div className="flex flex-col gap-y-7 lg:sticky lg:top-24">
          <section className="border-slate-200 max-lg:border-t max-lg:pt-5 dark:border-slate-700">
            <UsageCommand slug={slug} />
          </section>

          <section className="border-t border-slate-200 pt-5 dark:border-slate-700">
            <h2 className="mb-3 text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
              Source Information
            </h2>
            <dl>
              <div className="pt-0 pb-4">
                <dt className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  Source
                </dt>
                <dd className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  <a href={frontmatter.source} target="_blank">
                    {frontmatter.source}
                  </a>
                </dd>
              </div>
              <div className="pt-1">
                <dt className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  License
                </dt>
                <dd className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  {licenseDisplay ?? "Unknown"}
                </dd>
              </div>
            </dl>
          </section>

          {attachments && (
            <section className="border-t border-slate-200 pt-5 dark:border-slate-700">
              <h2 className="mb-3 text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                Attachments
              </h2>
              <ul className="space-y-2" role="list">
                {Object.entries(attachments).map(([key, attachment]) => {
                  const url = new URL(
                    attachment.url,
                    "https://ahorn.rwth-aachen.de/",
                  );
                  return (
                    <li key={key}>
                      <a
                        href={url.href}
                        download
                        className="group flex items-center py-2 text-sm text-slate-700 hover:text-primary dark:text-slate-300"
                      >
                        <FontAwesomeIcon
                          icon={faPaperclip}
                          className="size-4 shrink-0 text-slate-400 group-hover:text-primary dark:text-slate-500"
                        />
                        <div className="ml-3 flex min-w-0 flex-1 gap-2">
                          <span className="truncate font-semibold">
                            {formatAttachmentTag(key)}
                          </span>
                          {typeof attachment.size === "number" && (
                            <span className="shrink-0 text-slate-400 dark:text-slate-500">
                              {formatFileSize(attachment.size)}
                            </span>
                          )}
                        </div>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {frontmatter.related &&
            Array.isArray(frontmatter.related) &&
            frontmatter.related.length > 0 && (
              <section
                className="border-t border-slate-200 pt-5 dark:border-slate-700"
                data-pagefind-ignore
              >
                <h2 className="mb-3 text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                  Related Datasets
                </h2>
                <ul className="space-y-2">
                  {related_datasets.map(({ slug, title }) => (
                    <li key={slug}>
                      <Link
                        href={`/dataset/${slug}`}
                        className="group flex py-2 text-sm font-semibold text-slate-700 hover:text-primary dark:text-slate-300"
                      >
                        {title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

          {frontmatter.citation && (
            <section className="border-t border-slate-200 pt-5 dark:border-slate-700">
              <div className="mb-3 flex items-center justify-between gap-4">
                <h2 className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                  Citation
                </h2>
                <CitationCopyButton bibtex={bibtex} />
              </div>
              <div>
                <ul className="space-y-4">
                  {apaCitations.map((citation) => (
                    <li
                      key={citation[0]}
                      className="prose text-sm dark:prose-invert"
                      dangerouslySetInnerHTML={{ __html: citation[1] }}
                    />
                  ))}
                </ul>
                <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                  If you use this dataset, please ensure you cite it
                  appropriately in your work.
                </div>
              </div>
            </section>
          )}
        </div>
      </aside>
    </div>
  );
}
