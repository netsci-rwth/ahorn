"use client";

import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LinearScale,
  LogarithmicScale,
  CategoryScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Colors,
} from "chart.js";
import StatisticsBlock from "@/components/statistics-block";
import { getChartTooltipOptions } from "@/utils/tooltip";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Colors,
);

export type DegreeLineChartProps = {
  histogram: Record<string | number, number>;
  title?: string;
  logScale?: boolean;
};

export default function DegreeLineChart({
  histogram,
  title = "Node Degree Distribution",
  logScale = false,
}: DegreeLineChartProps) {
  const [useLogScale, setUseLogScale] = useState<boolean>(logScale);
  const [isDark, setIsDark] = useState<boolean>(false);

  // Detect dark mode via prefers-color-scheme only
  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setIsDark(mql.matches);
    update();
    try {
      mql.addEventListener("change", update);
    } catch {
      // Safari
      mql.addListener(update);
    }
    return () => {
      try {
        mql.removeEventListener("change", update);
      } catch {
        mql.removeListener(update);
      }
    };
  }, []);
  const entries = Object.entries(histogram).map(([k, v]) => [
    Number(k),
    v as number,
  ]) as [number, number][];
  const sorted = entries
    .filter(([k]) => !Number.isNaN(k))
    .sort((a, b) => a[0] - b[0]);

  const labels = sorted.map(([k]) => String(k));
  const values = sorted.map(([, v]) => v);

  const data = {
    labels,
    datasets: [
      {
        label: "Nodes per degree",
        data: values,
        tension: 0.2,
        borderColor: isDark ? "#60a5fa" : "#3b82f6",
        backgroundColor: isDark ? "#60a5fa" : "#3b82f6",
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  };

  const yType: "linear" | "logarithmic" = useLogScale
    ? "logarithmic"
    : "linear";

  const gridColor = isDark
    ? "rgba(148,163,184,0.10)"
    : "rgba(148,163,184,0.14)";
  const tickColor = isDark ? "rgba(255,255,255,0.78)" : "rgba(51,65,85,0.82)";
  const borderColor = "rgba(148,163,184,0)";

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: "category" as const,
        title: { display: true, text: "Degree", color: tickColor },
        ticks: { color: tickColor, padding: 8 },
        grid: { color: gridColor, borderColor },
      },
      y: {
        type: yType,
        title: { display: true, text: "Count", color: tickColor },
        suggestedMin: useLogScale ? 1 : undefined,
        ticks: useLogScale
          ? {
              color: tickColor,
              padding: 8,
              callback: (value: unknown) => String(value),
            }
          : { color: tickColor, padding: 8 },
        grid: { color: gridColor, borderColor },
      },
    },
    plugins: {
      legend: { display: false },
      title: { display: false, text: title, color: tickColor },
      tooltip: {
        ...getChartTooltipOptions(isDark),
      },
      datalabels: {
        display: false,
      },
    },
  };

  return (
    <StatisticsBlock title={title}>
      <div className="mb-4">
        <label className="inline-flex items-center gap-2 text-sm font-medium text-black-75 dark:text-black-25">
          <input
            type="checkbox"
            checked={useLogScale}
            onChange={(e) => setUseLogScale(e.target.checked)}
            className="rounded bg-white text-blue-100 focus:ring-blue-100/30 dark:bg-black-100/35"
          />
          Use log scale (y-axis)
        </label>
      </div>
      <div className="h-80">
        <Line data={data} options={options} />
      </div>
    </StatisticsBlock>
  );
}
