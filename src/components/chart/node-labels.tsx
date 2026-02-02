"use client";

import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export type NodeLabelsProps = {
  labels: Record<string, number>;
};

export default function NodeLabelsChart({ labels }: NodeLabelsProps) {
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

  const tickColor = isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.7)";

  const data = {
    labels: Object.keys(labels),
    datasets: [
      {
        data: Object.values(labels),
        backgroundColor: [
          "#60a5fa",
          "#fbbf24",
          "#34d399",
          "#f87171",
          "#a78bfa",
          "#f472b6",
          "#facc15",
          "#38bdf8",
          "#4ade80",
          "#f87171",
        ],
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        labels: { color: tickColor },
      },
      datalabels: {
        display: false,
      },
    },
    maintainAspectRatio: false,
  } as const;

  return (
    <div style={{ height: 320 }}>
      <Pie data={data} options={options} />
    </div>
  );
}
