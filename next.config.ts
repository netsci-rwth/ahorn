import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  basePath: "",
  images: {
    unoptimized: true,
  },
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [
      ["remark-frontmatter"],
      ["remark-mdx-frontmatter"],
      ["remark-gfm"],
    ],
    rehypePlugins: [["rehype-highlight"]],
  },
});

export default withMDX(nextConfig);
