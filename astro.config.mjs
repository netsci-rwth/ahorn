import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import { satteri } from "@astrojs/markdown-satteri";
import tailwindcss from "@tailwindcss/vite";
import satteriGithubAlerts from "./src/utils/satteri-github-alerts.mjs";

export default defineConfig({
  output: "static",
  markdown: {
    processor: satteri({
      hastPlugins: [satteriGithubAlerts],
    }),
  },
  integrations: [mdx()],
  vite: {
    plugins: [tailwindcss()],
  },
});
