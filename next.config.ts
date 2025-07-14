import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  basePath: "/ahorn",
  images: {
    unoptimized: true,
  }
};

const withMDX = createMDX({
  options: {
    // @ts-ignore wrong types
    remarkPlugins: [["remark-frontmatter"], ["remark-mdx-frontmatter"]],
    // @ts-ignore wrong types
    rehypePlugins: [["rehype-highlight"]],
  },
});

export default withMDX(nextConfig);
