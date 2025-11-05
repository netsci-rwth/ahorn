import { Cite } from "@citation-js/core";
import "@citation-js/plugin-bibtex";
import "@citation-js/plugin-csl";
import "@citation-js/plugin-doi";

export async function toApa(bibtex: string): Promise<[string, string][]> {
  const citations = await Cite.async(bibtex);
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

  // add <a> tag to DOIs
  for (const citation of formattedCitations) {
    citation[1] = citation[1].replace(
      /(https?:\/\/doi\.org\/[^\s]+)/g,
      '<a href="$1" target="_blank">$1</a>',
    );
  }

  return formattedCitations;
}
