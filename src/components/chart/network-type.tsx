"use client";

import { useEffect, useState } from "react";
import classNames from "classnames";
import { useRouter } from "next/navigation";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Colors,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Colors,
  ChartDataLabels,
);

export default function NetworkTypeChart({
  data,
  className = "",
}: {
  data: Record<string, number>;
  className?: string;
}) {
  const [isDark, setIsDark] = useState<boolean>(false);
  const router = useRouter();

  // Detect dark mode via prefers-color-scheme
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

  const labels = Object.keys(data).sort();
  const values = labels.map((label) => data[label]);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Datasets",
        data: values,
        backgroundColor: isDark
          ? "rgba(59, 130, 246, 0.5)"
          : "rgba(59, 130, 246, 0.7)",
        borderColor: isDark ? "rgba(59, 130, 246, 1)" : "rgba(59, 130, 246, 1)",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    animation: false as const,
    layout: {
      padding: {
        top: 20,
      },
    },
    onClick: (_event: unknown, elements: { index: number }[]) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const networkType = labels[index];
        router.push(`/dataset?types=${encodeURIComponent(networkType)}`);
      }
    },
    onHover: (event: { native?: Event | null }) => {
      const target = event.native?.target as HTMLElement | undefined;
      if (target && "style" in target) {
        target.style.cursor = "pointer";
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
      datalabels: {
        anchor: "end" as const,
        align: "top" as const,
        color: isDark ? "#f3f4f6" : "#1f2937",
        font: {
          size: 11,
          weight: "bold" as const,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: isDark ? "#d1d5db" : "#6b7280",
          font: {
            size: 11,
          },
        },
        grid: {
          color: isDark ? "rgba(75, 85, 99, 0.2)" : "rgba(200, 200, 200, 0.2)",
        },
      },
      x: {
        ticks: {
          color: isDark ? "#d1d5db" : "#6b7280",
          font: {
            size: 11,
          },
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div
      className={classNames(
        "rounded-lg bg-white px-4 py-5 shadow sm:p-6 dark:bg-gray-900",
        className,
      )}
    >
      <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
        Datasets per Network Type
      </dt>
      <div className="mt-4">
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}
