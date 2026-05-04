"use client";

import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import StatisticsBlock from "@/components/statistics-block";
import imbalanceDegree from "@/utils/imbalance-degree";
import { getChartTooltipOptions } from "@/utils/tooltip";

ChartJS.register(ArcElement, Tooltip, Legend);

const imbalanceFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

export type LabelDistributionChartProps = {
  labels: Record<string, number>;
  title?: string;
};

export default function LabelDistributionChart({
  labels,
  title = "Label Distribution",
}: LabelDistributionChartProps) {
  const [isDark, setIsDark] = useState<boolean>(false);

  // Detect dark mode via prefers-color-scheme only
  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setIsDark(mql.matches);
    update();
    try {
      mql.addEventListener("change", update);
    } catch {
      // Safari fallback
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

  const tickColor = isDark ? "rgba(255,255,255,0.78)" : "rgba(51,65,85,0.82)";
  const uniqueLabelCount = Object.keys(labels).length;

  const sortedEntries = Object.entries(labels).sort((a, b) => b[1] - a[1]);

  const data = {
    labels: sortedEntries.map(([label]) => label),
    datasets: [
      {
        data: sortedEntries.map(([, count]) => count),
        backgroundColor: [
          "#3b82f6",
          "#f59e0b",
          "#10b981",
          "#ef4444",
          "#8b5cf6",
          "#ec4899",
          "#06b6d4",
          "#84cc16",
          "#f97316",
          "#14b8a6",
          "#6366f1",
          "#eab308",
          "#22c55e",
          "#f43f5e",
          "#a855f7",
          "#d946ef",
          "#0ea5e9",
          "#65a30d",
          "#fb7185",
          "#2dd4bf",
          "#2563eb",
          "#ca8a04",
          "#059669",
          "#dc2626",
          "#7c3aed",
          "#db2777",
          "#0284c7",
          "#4d7c0f",
          "#ea580c",
          "#0f766e",
        ],
        borderWidth: 0,
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "right" as const,
        align: "center" as const,
        labels: { color: tickColor },
      },
      tooltip: {
        ...getChartTooltipOptions(isDark),
      },
      datalabels: {
        display: false,
      },
    },
    maintainAspectRatio: false,
  } as const;

  return (
    <StatisticsBlock title={title}>
      <div style={{ height: 320 }}>
        <Pie data={data} options={options} />
      </div>
      <p className="mt-2 text-sm text-slate-500">
        {uniqueLabelCount} unique {uniqueLabelCount === 1 ? "label" : "labels"}{" "}
        · imbalance degree: {imbalanceFormatter.format(imbalanceDegree(labels))}
      </p>
    </StatisticsBlock>
  );
}
