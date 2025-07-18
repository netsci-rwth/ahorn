import fs from "fs";
import path from "path";
import { Metadata } from "next";

import DatasetTable from "@/components/dataset-table";

export const metadata: Metadata = {
  title: "Dataset List",
  description: "A list of all datasets available in the repository.",
};

export default async function DatasetList() {
  const datasetsDir = path.join(process.cwd(), "src", "datasets");
  const filenames = await fs.promises.readdir(datasetsDir);
  const datasets = await Promise.all(
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
          tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
        };
      }),
  );

  return (
    <>
      <h1 className="mb-6 text-3xl font-bold text-gray-900">Dataset List</h1>
      <DatasetTable datasets={datasets} />
    </>
  );
}
