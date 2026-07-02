export type DatasetIndexItem = {
  slug: string;
  title: string;
  isSubDataset: boolean;
  networkType: string[];
  tags: string[];
  license: unknown;
  statistics: { numNodes: number };
};
