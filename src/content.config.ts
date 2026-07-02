import { defineCollection, reference } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const licenseSchema = z.union([
  z.object({
    spdx: z.string(),
    link: z.string(),
  }),
  z.literal("unprovided-reuse-encouraged"),
]);

const attachmentSchema = z
  .object({
    ahorn: z.string(),
    changelog: z.array(z.string()).optional(),
  })
  .catchall(z.union([z.string(), z.array(z.string())]));

const datasets = defineCollection({
  loader: glob({
    base: "src/datasets",
    pattern: "*.mdx",
    generateId: ({ entry }) => entry.replace(/\.mdx$/, ""),
  }),
  schema: z.object({
    title: z.string(),
    disable: z.boolean().default(false),
    source: z.string().optional(),
    license: licenseSchema.optional(),
    citation: z.array(z.string()).optional(),
    "network-type": z
      .array(
        z.enum([
          "graph",
          "simplicial-complex",
          "cell-complex",
          "combinatorial-complex",
          "hypergraph",
        ]),
      )
      .default([]),
    tags: z.array(z.string()).default([]),
    parent: reference("datasets").optional(),
    related: z.array(reference("datasets")).optional(),
    attachments: z.record(z.string(), attachmentSchema).optional(),
    statistics: z.record(z.string(), z.unknown()).optional(),
    shape: z.unknown().optional(),
    "simplicial-complex": z.unknown().optional(),
    "label-count": z.record(z.string(), z.number()).optional(),
    "edge-label-count": z.record(z.string(), z.number()).optional(),
  }),
});

const tools = defineCollection({
  loader: glob({
    base: "src/tools",
    pattern: "*.mdx",
  }),
  schema: z.object({
    name: z.string(),
    description: z.string(),
    href: z.string(),
    section: z.enum(["start", "integration", "hif", "ecosystem"]),
    logo: z.string().optional(),
    label: z.string().optional(),
    icon: z.enum(["download"]).optional(),
    actionLabel: z.string().default("Open"),
    external: z.boolean().default(true),
  }),
});

export type Dataset = z.infer<typeof datasets.schema>;

export const collections = {
  datasets,
  tools,
};
