"use client";

import React, { useEffect, useMemo, useState } from "react";
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

export default function DegreeLineChart({ histogram, title = "Node Degree Distribution", logScale = false }: DegreeLineChartProps) {
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
  const entries = Object.entries(histogram).map(([k, v]) => [Number(k), v as number]) as [number, number][];
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
      },
    ],
  };

  const yType: "linear" | "logarithmic" = useLogScale ? "logarithmic" : "linear";

  const gridColor = isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)";
  const tickColor = isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.7)";
  const borderColor = isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.25)";

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: "category" as const,
        title: { display: true, text: "Degree" },
        ticks: { color: tickColor },
        grid: { color: gridColor, borderColor },
      },
      y: {
        type: yType,
        title: { display: true, text: "Count" },
        suggestedMin: useLogScale ? 1 : undefined,
        ticks: useLogScale
          ? {
              color: tickColor,
              callback: (value: unknown) => String(value),
            }
          : { color: tickColor },
        grid: { color: gridColor, borderColor },
      },
    },
    plugins: {
      legend: { position: "top" as const, labels: { color: tickColor } },
      title: { display: true, text: title, color: tickColor },
    },
  };

  return (
    <div style={{ height: 360 }}>
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={useLogScale}
            onChange={(e) => setUseLogScale(e.target.checked)}
          />
          Use log scale (y-axis)
        </label>
      </div>
      <Line data={data} options={options} />
    </div>
  );
}
