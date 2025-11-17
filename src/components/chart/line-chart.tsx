"use client";

import React, { useEffect, useState } from "react";

import {
  Chart as ChartJS,
  TimeScale,
  LinearScale,
  CategoryScale,
  Colors,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { Line } from "react-chartjs-2";

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

ChartJS.register(
  TimeScale,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  Colors,
  PointElement,
  LineElement,
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
interface LineChartProps {
  /**
   * JSON string of dataset statistics, where each key is a date string and each value is an array of numbers (e.g., counts per rank).
   */
  data: Record<string, number>;

  /**
   * Optional minimum time unit for aggregation (inclusive). Defaults to "hour".
   */
  minUnit?: TimeUnit;

  /**
   * Optional maximum time unit for aggregation (inclusive). Defaults to "year".
   */
  maxUnit?: TimeUnit;
}

export default function LineChart({
  data,
  minUnit = "hour",
  maxUnit = "year",
}: LineChartProps) {
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

  // Compute allowed units based on min_unit and max_unit
  const minIdx = allowedTimeUnits.indexOf(minUnit);
  const maxIdx = allowedTimeUnits.indexOf(maxUnit);
  const selectableUnits = allowedTimeUnits.slice(minIdx, maxIdx + 1);

  // aggregate data based on timeUnit
  let aggregatedData: { [key: string]: number } = {};

  if (selectableUnits.length > 1) {
    Object.entries(data).forEach(([dateStr, values]) => {
      let date;
      if (dateStr.length == 4) {
        date = parse(dateStr, "yyyy", new Date());
      } else {
        date = parse(dateStr, "yyyy-MM-dd", new Date());
      }

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
        aggregatedData[periodKey] = 0;
      }

      aggregatedData[periodKey] += values;
    });
  } else {
    aggregatedData = data;
  }

  const gridColor = isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)";
  const tickColor = isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.7)";
  const borderColor = isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.25)";

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
        ticks: { color: tickColor },
        grid: { color: gridColor, borderColor },
      },
      y: {
        stacked: true,
        ticks: { color: tickColor },
        grid: { color: gridColor, borderColor },
      },
    },
    plugins: {
      legend: {
        position: "top" as const,
        labels: { color: tickColor },
      },
      title: {
        display: true,
        text: "Dataset Shape",
        color: tickColor,
      },
    },
  };

  const chart_data = {
    labels: ["Hyperedges"],
    datasets: [
      {
        label: "Hyperedges",
        data: Object.keys(aggregatedData).map((date) => ({
          x: date,
          y: aggregatedData[date],
        })),
      },
    ],
  };

  return (
    <div style={{ height: 360 }}>
      {selectableUnits.length > 1 && (
        <div style={{ marginBottom: "20px" }}>
          <label htmlFor="time-unit">Aggregate by: </label>
          <select
            id="time-unit"
            value={timeUnit}
            onChange={(e) => setTimeUnit(e.target.value as TimeUnit)}
            style={{ padding: "5px", marginLeft: "10px" }}
          >
            {selectableUnits.map((unit) => (
              <option key={unit} value={unit}>
                {unit.charAt(0).toUpperCase() + unit.slice(1)}
              </option>
            ))}
          </select>
        </div>
      )}

      <Line options={chart_options} data={chart_data} />
    </div>
  );
}
