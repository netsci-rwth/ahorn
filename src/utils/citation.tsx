import { Cite } from "@citation-js/core";
import "@citation-js/plugin-bibtex";
import "@citation-js/plugin-csl";

export function bibtexToApa(bibtex: string): [string, string][] {
  const citations = new Cite(bibtex);
  return citations.format("bibliography", {
    template: "apa",
    lang: "en-US",
    asEntryArray: true,
  });
}
