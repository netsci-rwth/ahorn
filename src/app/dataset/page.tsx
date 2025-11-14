import fs from "fs";
import path from "path";
import { Metadata } from "next";

import DatasetTable from "@/components/dataset-table";

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
          tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
          statistics: {
            numNodes: frontmatter.statistics?.["num-nodes"] ?? 0,
          },
        };
      }),
  );

  // filter out disabled datasets
  datasets = datasets.filter((d) => !d.disable);

  // sort datasets by case-insensitive title
  datasets = datasets.sort((a, b) =>
    a.title.toLowerCase().localeCompare(b.title.toLowerCase()),
  );

  return (
    <>
      <h1 className="mb-6 text-3xl font-bold text-gray-900">Datasets</h1>
      <DatasetTable datasets={datasets} />
    </>
  );
}
