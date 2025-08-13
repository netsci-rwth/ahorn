import fs from "fs";
import path from "path";

export interface Dataset {
    slug: string;
    title: string;
    tags: string[];
    attachments: string[];
}

export const dynamic = "force-static";

export async function GET() {
    const datasetsDir = path.join(process.cwd(), "src", "datasets");
    const filenames = await fs.promises.readdir(datasetsDir);

    const datasets = (await Promise.all(
        filenames
            .filter((f) => f.endsWith(".mdx"))
            .map(async (filename) => {
                const slug = path.parse(filename).name;
                const { frontmatter } = await import(`@/datasets/${filename}`);
                return {
                    slug: slug,
                    title:
                        typeof frontmatter.title === "string"
                            ? frontmatter.title
                            : slug,
                    tags: Array.isArray(frontmatter.tags)
                        ? frontmatter.tags
                        : [],
                    attachments: Array.isArray(frontmatter.attachments)
                        ? frontmatter.attachments
                        : [],
                };
            })
    )).reduce((acc, data) => {
        acc[data.slug] = data;
        return acc;
    }, {} as Record<string, Dataset>);

    return Response.json({
        time: new Date().toISOString(),
        datasets
    })
}
