"use client";

import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export type NodeLabelsProps = {
  labels: Record<string, number>;
};

export default function NodeLabelsChart({ labels }: NodeLabelsProps) {
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

  return <Pie data={data} />;
}
