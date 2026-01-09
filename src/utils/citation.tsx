import { Cite, util, version } from "@citation-js/core";
import "@citation-js/plugin-bibtex";
import "@citation-js/plugin-csl";
import "@citation-js/plugin-doi";

util.setUserAgent(
  `Aachen Higher-Order Repository of Networks (mailto:teaching-netsci@cs.rwth-aachen.de) Citation.js/${version} Node.js/${process.versions.node}`,
);

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

  // add <a> tags to links
  for (const citation of formattedCitations) {
    citation[1] = citation[1].replace(
      /(https?:\/\/[^\s<]+)/g,
      '<a href="$1" target="_blank">$1</a>',
    );
  }

  return formattedCitations;
}
