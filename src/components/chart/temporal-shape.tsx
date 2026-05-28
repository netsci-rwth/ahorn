"use client";

import React, { useEffect, useState } from "react";

import {
  Chart as ChartJS,
  TimeScale,
  LinearScale,
  CategoryScale,
  Colors,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { Bar } from "react-chartjs-2";
import StatisticsBlock from "@/components/statistics-block";

import {
  parse,
  format,
  startOfDay,
  startOfWeek,
  startOfMonth,
  startOfQuarter,
  startOfYear,
  startOfHour,
} from "date-fns";
import { getChartTooltipOptions } from "@/utils/tooltip";

ChartJS.register(
  TimeScale,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Colors,
);

const allowedTimeUnits = [
  "hour",
  "day",
  "week",
  "month",
  "quarter",
  "year",
] as const;
type TimeUnit = (typeof allowedTimeUnits)[number];

/**
 * Props for the TemporalShapeChart component.
 */
interface TemporalShapeChartProps {
  /**
   * JSON string of dataset statistics, where each key is a date string and each value is an array of numbers (e.g., counts per rank).
   */
  shape: Record<string, number[]>;

  /**
   * Optional minimum time unit for aggregation (inclusive). Defaults to "hour".
   */
  minUnit?: TimeUnit;

  /**
   * Optional maximum time unit for aggregation (inclusive). Defaults to "year".
   */
  maxUnit?: TimeUnit;
}

const TemporalShapeChart = ({
  shape,
  minUnit: minUnit = "hour",
  maxUnit: maxUnit = "year",
}: TemporalShapeChartProps) => {
  const [timeUnit, setTimeUnit] = useState<TimeUnit>(minUnit);
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

  const maxRanks = Math.max(...Object.values(shape).map((arr) => arr.length));

  // Compute allowed units based on min_unit and max_unit
  const minIdx = allowedTimeUnits.indexOf(minUnit);
  const maxIdx = allowedTimeUnits.indexOf(maxUnit);
  const selectableUnits = allowedTimeUnits.slice(minIdx, maxIdx + 1);

  // aggregate data based on timeUnit
  const aggregatedData: { [key: string]: number[] } = {};
  Object.entries(shape).forEach(([dateStr, values]) => {
    const date = parse(dateStr, "yyyy-MM-dd HH:mm:ss", new Date());

    // Get the start of the period based on selected time unit
    let periodStart;
    switch (timeUnit) {
      case "hour":
        periodStart = startOfHour(date);
        break;
      case "day":
        periodStart = startOfDay(date);
        break;
      case "week":
        periodStart = startOfWeek(date);
        break;
      case "month":
        periodStart = startOfMonth(date);
        break;
      case "quarter":
        periodStart = startOfQuarter(date);
        break;
      case "year":
        periodStart = startOfYear(date);
        break;
      default:
        periodStart = startOfMonth(date);
    }

    // Format key based on time unit
    let periodKey;
    if (timeUnit === "hour") {
      periodKey = format(periodStart, "yyyy-MM-dd HH:00");
    } else {
      periodKey = format(periodStart, "yyyy-MM-dd");
    }

    if (!aggregatedData[periodKey]) {
      aggregatedData[periodKey] = Array(maxRanks).fill(0);
    }

    for (let i = 0; i < maxRanks; i++) {
      aggregatedData[periodKey][i] += values[i] || 0;
    }
  });

  const gridColor = isDark
    ? "rgba(148,163,184,0.10)"
    : "rgba(148,163,184,0.14)";
  const tickColor = isDark ? "rgba(255,255,255,0.78)" : "rgba(51,65,85,0.82)";
  const borderColor = "rgba(148,163,184,0)";

  const chart_options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: "time" as const,
        time: {
          unit: timeUnit,
        },
        stacked: true,
        ticks: { color: tickColor, padding: 8 },
        grid: { color: gridColor, borderColor },
      },
      y: {
        stacked: true,
        ticks: { color: tickColor, padding: 8 },
        grid: { color: gridColor, borderColor },
      },
    },
    plugins: {
      legend: {
        position: "top" as const,
        labels: { color: tickColor },
      },
      title: {
        display: false,
        text: "Dataset Shape Over Time",
        color: tickColor,
      },
      tooltip: {
        ...getChartTooltipOptions(isDark),
      },
      datalabels: {
        display: false,
      },
    },
  };

  const chart_data = {
    labels: Object.keys(aggregatedData),
    datasets: Array.from({ length: maxRanks }, (_, rankIdx) => ({
      label: `Rank ${rankIdx}`,
      data: Object.keys(aggregatedData).map((date) => ({
        x: date,
        y: aggregatedData[date][rankIdx] || 0,
      })),
    })),
  };

  return (
    <StatisticsBlock title="Dataset Shape Over Time">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label
          htmlFor="time-unit"
          className="text-sm font-medium text-slate-600 dark:text-slate-300"
        >
          Aggregate by:
        </label>
        <select
          id="time-unit"
          value={timeUnit}
          onChange={(e) => setTimeUnit(e.target.value as TimeUnit)}
          className="rounded-lg bg-white/85 px-3 py-1.5 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-primary/25 dark:bg-slate-950/35 dark:text-slate-100"
        >
          {selectableUnits.map((unit) => (
            <option key={unit} value={unit}>
              {unit.charAt(0).toUpperCase() + unit.slice(1)}
            </option>
          ))}
        </select>
      </div>
      <div className="h-80">
        <Bar options={chart_options} data={chart_data} />
      </div>
    </StatisticsBlock>
  );
};

export default TemporalShapeChart;
