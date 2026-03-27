import fs from "fs";
import path from "path";
import { Metadata } from "next";

import DatasetTable from "@/components/dataset-table";
import PageHeader from "@/components/page-header";

export const metadata: Metadata = {
  title: "Datasets | AHORN - Aachen Higher-Order Repository of Networks",
  description: "A list of all datasets available in the repository.",
};

export default async function DatasetList() {
  const datasetsDir = path.join(process.cwd(), "src", "datasets");
  const filenames = await fs.promises.readdir(datasetsDir);

  let datasets = await Promise.all(
    filenames
      .filter((f) => f.endsWith(".mdx"))
      .map(async (filename) => {
        const { frontmatter } = await import(`@/datasets/${filename}`);
        return {
          slug: path.parse(filename).name,
          title:
            typeof frontmatter.title === "string"
              ? frontmatter.title
              : path.parse(filename).name,
          disable: frontmatter.disable === true,
          networkType: frontmatter["network-type"],
          tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
          statistics: {
            numNodes: frontmatter.statistics?.["num-nodes"] ?? 0,
          },
        };
      }),
  );

  datasets = datasets.filter((d) => !d.disable);

  return (
    <>
      <PageHeader
        eyebrow="Repository"
        title="Datasets"
        description="Browse the current AHORN collection, filter by topology and topic, and jump directly to dataset pages with citations, attachments, and source information."
        className="mb-8"
      />
      <DatasetTable datasets={datasets} />
    </>
  );
}
