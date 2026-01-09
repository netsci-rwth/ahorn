import classNames from "classnames";

import { formatNumber } from "@/utils/format";

export function computeBox(values: number[]): BoxPlotStats | null {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  const median =
    sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  const lower = sorted.slice(0, mid);
  const upper =
    sorted.length % 2 === 0 ? sorted.slice(mid) : sorted.slice(mid + 1);

  const q1 = lower.length
    ? lower.length % 2 === 0
      ? (lower[lower.length / 2 - 1] + lower[lower.length / 2]) / 2
      : lower[Math.floor(lower.length / 2)]
    : median;

  const q3 = upper.length
    ? upper.length % 2 === 0
      ? (upper[upper.length / 2 - 1] + upper[upper.length / 2]) / 2
      : upper[Math.floor(upper.length / 2)]
    : median;

  return {
    min: sorted[0],
    q1: q1,
    median,
    q3: q3,
    max: sorted[sorted.length - 1],
  };
}

export type BoxPlotStats = {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
};

export type BoxPlotProps = {
  title?: string;
  stats: BoxPlotStats;
  className?: string;
};

export default function BoxPlot({
  title,
  stats,
  className = "",
}: BoxPlotProps) {
  const { min, q1, median, q3, max } = stats;
  const span = max - min || 1;
  const toPercent = (value: number) => ((value - min) / span) * 100;

  const boxStart = toPercent(q1);
  const boxEnd = toPercent(q3);
  const boxWidth = Math.min(Math.max(boxEnd - boxStart, 0.5), 100 - boxStart);

  return (
    <div
      className={classNames(
        "rounded-lg border border-slate-200 bg-white/50 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70",
        className,
      )}
    >
      {title && (
        <div className="mb-2 truncate text-sm font-semibold text-gray-500 dark:text-gray-400">
          {title}
        </div>
      )}
      <div className="relative h-20">
        <div className="absolute top-1/2 right-0 left-0 h-px bg-slate-200 dark:bg-slate-700" />

        <div
          className="absolute top-[30%] h-[40%] bg-blue-200/70 dark:bg-blue-500/30"
          style={{ left: `${boxStart}%`, width: `${boxWidth}%` }}
        />

        <div
          className="absolute top-[26%] h-[48%] w-px bg-primary dark:bg-blue-300"
          style={{ left: `${toPercent(median)}%` }}
        />

        {[min, max].map((value) => (
          <div
            key={`whisker-${value}`}
            className="absolute top-[34%] h-[32%] w-px bg-slate-500 dark:bg-slate-400"
            style={{ left: `${toPercent(value)}%` }}
          />
        ))}

        {(["q1", "q3"] as const).map((label) => {
          const value = label === "q1" ? q1 : q3;
          return (
            <div
              key={`box-edge-${label}`}
              className="absolute top-[26%] h-[48%] w-px bg-blue-700/70 dark:bg-blue-300/70"
              style={{ left: `${toPercent(value)}%` }}
            />
          );
        })}
      </div>

      <div className="mt-3 grid grid-cols-5 gap-2 text-[11px] text-slate-700 dark:text-slate-200">
        <LabelValue label="Min" value={min} />
        <LabelValue label="Q1" value={q1} />
        <LabelValue label="Median" value={median} />
        <LabelValue label="Q3" value={q3} />
        <LabelValue label="Max" value={max} />
      </div>
    </div>
  );
}

function LabelValue({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] tracking-wide text-slate-500 uppercase dark:text-slate-400">
        {label}
      </span>
      <span className="font-semibold text-slate-900 dark:text-white">
        {formatNumber(value)}
      </span>
    </div>
  );
}

export function ComputedBoxPlot({
  values,
  title,
  className = "",
}: {
  values: number[];
  title?: string;
  className?: string;
}) {
  const stats = computeBox(values);

  if (!stats) {
    return (
      <div className="text-sm text-slate-600 dark:text-slate-300">
        No average degree data available.
      </div>
    );
  }

  return <BoxPlot title={title} stats={stats} className={className} />;
}
