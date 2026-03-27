import { Cite, util, version } from "@citation-js/core";
import "@citation-js/plugin-bibtex";
import "@citation-js/plugin-csl";
import "@citation-js/plugin-doi";

util.setUserAgent(
  `Aachen Higher-Order Repository of Networks (mailto:teaching-netsci@cs.rwth-aachen.de) Citation.js/${version} Node.js/${process.versions.node}`,
);

/**
 * Converts a citation string into a `Cite` instance.
 *
 * If DOI resolution is necessary, the function retries up to `maxRetries` times when a rate-limit
 * response is detected. If a `retry-after` header is present, it is used (in seconds) to delay the
 * next attempt; otherwise, a default delay of 1000 ms is applied.
 *
 * @param citation - The citation content to parse.
 * @param maxRetries - Maximum number of retry attempts for rate-limited requests. Defaults to `3`.
 * @returns A promise that resolves to a parsed `Cite` object.
 *
 * @throws Rethrows non-rate-limit errors from `Cite.async`.
 * @throws {Error} If all retry attempts are exhausted due to rate limiting.
 */
export async function toCite(
  citation: string,
  maxRetries: number = 3,
): Promise<Cite> {
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      return await Cite.async(citation);
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "status" in error &&
        error.status === 429
      ) {
        retryCount++;

        const err = error as {
          status: number;
          headers?: Record<string, string>;
        };

        let retryAfter = err.headers?.["retry-after"]
          ? parseInt(err.headers["retry-after"], 10) * 1000
          : 1000;
        retryAfter = isNaN(retryAfter) ? 1000 : retryAfter;

        console.log(
          `Rate limited. Retry ${retryCount}/${maxRetries} after ${retryAfter}ms...`,
        );
        await new Promise((resolve) => setTimeout(resolve, retryAfter));
      } else {
        throw error;
      }
    }
  }

  throw new Error(
    `Failed to fetch citation after ${maxRetries} retries due to rate limiting.`,
  );
}

/**
 * Formats a parsed citation collection into APA-formatted bibliography entries as HTML.
 *
 * @param citations - Parsed citations.
 * @returns An array of `[id, html]` tuples.
 */
export function citeToApa(citations: Cite): [string, string][] {
  const formattedCitations = citations.format("bibliography", {
    template: "apa",
    lang: "en-US",
    format: "html",
    asEntryArray: true,
  });

  // remove outer <div> from each citation
  for (const citation of formattedCitations) {
    citation[1] = citation[1].replace(/<div[^>]*>(.*?)<\/div>/, "$1");
  }

  // add <a> tags to links
  for (const citation of formattedCitations) {
    citation[1] = citation[1].replace(
      /(https?:\/\/[^\s<]+)/g,
      '<a href="$1" target="_blank">$1</a>',
    );
  }

  return formattedCitations;
}

/**
 * Formats a parsed citation collection as BibTeX.
 *
 * @param citations - Parsed citations.
 * @returns BibTeX representation of the citations.
 */
export function citeToBibtex(citations: Cite): string {
  return citations.format("bibtex");
}

/**
 * Converts a citation string into APA-formatted bibliography entries as HTML.
 *
 * The function:
 * - parses the provided citation source into citation objects,
 * - formats them using the APA template as an entry array,
 * - and wraps plain HTTP(S) URLs in clickable `<a>` tags.
 *
 * Citations can be provided in BibTeX format or as DOI identifiers, which are automatically
 * resolved to their corresponding metadata.
 *
 * @param citation - Raw citation content containing one or more entries.
 * @returns A promise resolving to an array of `[id, html]` tuples, where:
 * - `id` is the citation key/identifier,
 * - `html` is the processed APA-formatted citation markup.
 */
export async function toApa(citation: string): Promise<[string, string][]> {
  const citations = await toCite(citation);
  return citeToApa(citations);
}

/**
 * Converts a citation string into BibTeX.
 *
 * Citations can be provided in BibTeX format or as DOI identifiers, which are automatically
 * resolved to their corresponding metadata.
 *
 * @param citation - Raw citation content containing one or more entries.
 * @returns A promise resolving to the BibTeX representation.
 */
export async function toBibtex(citation: string): Promise<string> {
  const citations = await toCite(citation);
  return citeToBibtex(citations);
}
