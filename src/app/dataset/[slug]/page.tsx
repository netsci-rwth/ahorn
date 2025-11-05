import fs from "fs";
import path from "path";
import Link from "next/link";

import { createLowlight } from "lowlight";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import bash from "highlight.js/lib/languages/bash";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperclip } from "@fortawesome/free-solid-svg-icons";

import Tag from "@/components/tag";
import Card from "@/components/card";

import { toApa } from "@/utils/citation";
import { formatFileSize } from "@/utils/format";

const lowlight = createLowlight({ bash });

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

export const dynamicParams = false;

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

  const attachments: Record<string, { url: string; size: number }> =
    frontmatter.attachments || {};

  return (
    <div
      className="lg:flex lg:items-start lg:justify-between"
      data-pagefind-body
    >
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl/7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          {frontmatter.title}
        </h1>
        {frontmatter.tags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-2">
            {frontmatter.tags.map((tag: string, index: number) => (
              <Tag key={index} name={tag} />
            ))}
          </div>
        )}

        <div className="prose mt-6 max-w-none">
          <Dataset />
        </div>
      </div>

      <aside className="lg:w-sm mt-8 flex w-full flex-shrink-0 flex-col gap-y-7 lg:ml-8 lg:mt-0">
        <section>
          <h2 className="mb-4 text-2xl font-bold text-gray-900 sm:hidden">
            Usage
          </h2>
          <pre className="overflow-x-auto rounded bg-gray-900 p-4 text-sm text-gray-100">
            <code>
              {toJsxRuntime(
                lowlight.highlight("bash", `uvx ahorn-loader download ${slug}`),
                { Fragment, jsx, jsxs },
              )}
            </code>
          </pre>
        </section>

        <Card title="Source Information">
          <dl className="divide-y divide-gray-200">
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-900">Source</dt>
              <dd className="mt-1 text-sm text-gray-700 sm:col-span-2 sm:mt-0">
                <a href={frontmatter.source} target="_blank">
                  {frontmatter.source}
                </a>
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-900">License</dt>
              <dd className="mt-1 text-sm text-gray-700 sm:col-span-2 sm:mt-0">
                {frontmatter.license}
              </dd>
            </div>
            {attachments && (
              <div className="px-4 py-6 sm:grid sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-900">
                  Attachments
                </dt>
                <dd className="mt-2 text-sm text-gray-900 sm:mt-0">
                  <ul
                    role="list"
                    className="border-1 divide-y divide-gray-100 rounded-md border-gray-200"
                  >
                    {Object.entries(attachments).map(([key, attachment]) => {
                      const url = new URL(
                        attachment.url,
                        "https://ahorn.rwth-aachen.de/",
                      );
                      const name = url.pathname.split("/").pop() || key;
                      return (
                        <li key={key} className="flex text-sm">
                          <a
                            href={url.href}
                            download
                            className="flex w-0 flex-1 items-center p-4 hover:bg-gray-50"
                          >
                            <FontAwesomeIcon
                              icon={faPaperclip}
                              className="size-5 shrink-0 text-gray-400"
                            />
                            <div className="ml-4 flex min-w-0 flex-1 gap-2">
                              <span className="truncate font-medium">
                                {name}
                              </span>
                              <span className="shrink-0 text-gray-400">
                                {formatFileSize(attachment.size)}
                              </span>
                            </div>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </dd>
              </div>
            )}
          </dl>
        </Card>

        {frontmatter.related &&
          Array.isArray(frontmatter.related) &&
          frontmatter.related.length > 0 && (
            <Card title="Related Datasets" data-pagefind-ignore>
              <ul className="divide-y divide-gray-200">
                {related_datasets.map(({ slug, title }) => (
                  <li key={slug} className="px-6 py-3">
                    <Link
                      href={`/dataset/${slug}`}
                      className="text-primary hover:underline"
                    >
                      {title}
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}

        {frontmatter.citation && (
          <Card title="Citation">
            <ul className="divide-y divide-gray-200">
              {(await toApa(frontmatter.citation || "")).map((citation) => (
                <li
                  key={citation[0]}
                  className="prose px-6 py-4"
                  dangerouslySetInnerHTML={{ __html: citation[1] }}
                />
              ))}
            </ul>
            <div className="rounded-b-md border-t border-gray-200 bg-gray-50 px-6 py-3 text-xs text-gray-500">
              If you use this dataset, please ensure you cite it appropriately
              in your work.
            </div>
          </Card>
        )}
      </aside>
    </div>
  );
}
