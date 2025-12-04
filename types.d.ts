declare module "@citation-js/core" {
  export class Cite {
    constructor(input: string | object);

    static async async(input: string | object): Promise<Cite>;

    format(
      type: string,
      options?: {
        template?: string;
        lang?: string;
        format?: string;
        asEntryArray?: boolean;
      },
    ): [string, string][];
  }

  export const util: {
    setUserAgent: (ua: string) => void;
  };

  export const version: string;
}
