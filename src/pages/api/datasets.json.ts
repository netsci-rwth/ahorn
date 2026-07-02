import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { resolveAttachmentSizes, type AttachmentMap } from "@/utils/zenodo";

export const prerender = true;

export const GET: APIRoute = async () => {
  const collection = await getCollection("datasets");
  const entries = await Promise.all(
    collection.map(async ({ id: slug, data }) => {
      if (data.disable === true) return null;
      return [
        slug,
        {
          slug,
          title: data.title,
          tags: data.tags ?? [],
          "suggested-network-types": data["network-type"] ?? [],
          statistics: {
            "num-nodes": data.statistics?.["num-nodes"] ?? 0,
            "num-interactions": data.statistics?.["num-interactions"] ?? 0,
          },
          attachments: await resolveAttachmentSizes(
            (data.attachments ?? {}) as AttachmentMap,
          ),
        },
      ] as const;
    }),
  );
  const datasets = Object.fromEntries(
    entries.filter((entry) => entry !== null),
  );

  return new Response(
    JSON.stringify({ time: new Date().toISOString(), datasets }),
    {
      headers: { "Content-Type": "application/json; charset=utf-8" },
    },
  );
};
