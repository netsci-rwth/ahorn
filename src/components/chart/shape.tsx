"use client";

import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export type ShapeChartProps = {
  /**
   * Shape array where each index represents the dimension and the value is the count of simplices at that dimension.
   * For example: [34, 78, 45, 11, 2] means:
   * - 34 vertices (0-simplices)
   * - 78 edges (1-simplices)
   * - 45 triangles (2-simplices)
   * - 11 tetrahedra (3-simplices)
   * - 2 4-simplices
   */
  shape: number[];
};

export default function ShapeChart({ shape }: ShapeChartProps) {
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
  const gridColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";

  // Create dimension labels
  const dimensionLabels = shape.map((_, i) => {
    const names = ["Vertices", "Edges", "Triangles", "Tetrahedra"];
    if (i < names.length) {
      return `${names[i]} (${i}D)`;
    }
    return `${i}-Simplices`;
  });

  const data = {
    labels: dimensionLabels,
    datasets: [
      {
        label: "Count",
        data: shape,
        backgroundColor: "#60a5fa",
        borderColor: "#1e40af",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    indexAxis: "x" as const,
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        labels: { color: tickColor },
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        ticks: { color: tickColor },
        grid: { color: gridColor },
      },
      x: {
        ticks: { color: tickColor },
        grid: { color: gridColor },
      },
    },
  } as const;

  return (
    <div style={{ height: 320 }}>
      <Bar data={data} options={options} />
    </div>
  );
}
