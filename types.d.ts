declare module '@citation-js/core' {
  export class Cite {
    constructor(input: string | object);
    format(
      type: string,
      options?: {
        template?: string;
        lang?: string;
        asEntryArray?: boolean;
      }
    ): [string, string][];
  }
}
