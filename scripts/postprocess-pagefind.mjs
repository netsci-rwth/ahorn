import fs from "node:fs/promises";
import path from "node:path";
import zlib from "node:zlib";

const pagefindDir = path.resolve("public", "_pagefind");
const fragmentDir = path.join(pagefindDir, "fragment");
const pagefindPrefix = "pagefind_dcd";

function canonicalUrl(url) {
  if (!url.startsWith("/")) {
    return url;
  }

  const [pathAndQuery, hash = ""] = url.split("#", 2);
  const [pathname, query = ""] = pathAndQuery.split("?", 2);
  const canonicalPathname =
    pathname === "/index.html"
      ? "/"
      : pathname.endsWith("/index.html")
        ? pathname.slice(0, -"index.html".length)
        : pathname.replace(/\.html$/, "");

  return `${canonicalPathname}${query ? `?${query}` : ""}${hash ? `#${hash}` : ""}`;
}

function canonicalizeUrls(value) {
  if (Array.isArray(value)) {
    return value.map(canonicalizeUrls);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        key === "url" && typeof entry === "string"
          ? canonicalUrl(entry)
          : canonicalizeUrls(entry),
      ]),
    );
  }

  return value;
}

async function main() {
  const fragments = await fs.readdir(fragmentDir);
  let updatedFragments = 0;

  for (const filename of fragments) {
    if (!filename.endsWith(".pf_fragment")) {
      continue;
    }

    const filepath = path.join(fragmentDir, filename);
    const compressed = await fs.readFile(filepath);
    const decompressed = zlib.gunzipSync(compressed).toString("utf8");

    if (!decompressed.startsWith(pagefindPrefix)) {
      throw new Error(`Unexpected Pagefind fragment format: ${filepath}`);
    }

    const payload = JSON.parse(decompressed.slice(pagefindPrefix.length));
    const canonicalPayload = canonicalizeUrls(payload);
    const nextDecompressed = `${pagefindPrefix}${JSON.stringify(canonicalPayload)}`;

    if (nextDecompressed !== decompressed) {
      await fs.writeFile(filepath, zlib.gzipSync(nextDecompressed));
      updatedFragments += 1;
    }
  }

  console.log(`Canonicalized ${updatedFragments} Pagefind fragments.`);
}

await main();
