export const timeUnits = [
  "hour",
  "day",
  "week",
  "month",
  "quarter",
  "year",
] as const;

export type TimeUnit = (typeof timeUnits)[number];

export type ChartJsSpec =
  | {
      kind: "degree-distribution";
      histogram: Record<string | number, number>;
      logScale: boolean;
    }
  | {
      kind: "label-distribution";
      labels: Record<string, number>;
    }
  | {
      kind: "hyperedges-over-time";
      data: Record<string, number>;
      minUnit: TimeUnit;
      maxUnit: TimeUnit;
    }
  | {
      kind: "network-type";
      data: Record<string, number>;
    }
  | {
      kind: "shape";
      shape: number[];
    }
  | {
      kind: "temporal-shape";
      shape: Record<string, number[]>;
      minUnit: TimeUnit;
      maxUnit: TimeUnit;
    };
