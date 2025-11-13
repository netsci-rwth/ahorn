"use client";

import React from "react";
import { useState, useEffect } from "react";

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

interface AggregatedData {
  [key: string]: number[];
}

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

  const chart_options = {
    responsive: true,
    scales: {
      x: {
        type: "time" as const,
        time: {
          unit: timeUnit,
        },
        stacked: true,
      },
      y: {
        stacked: true,
      },
    },
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Dataset Shape",
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
    <>
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

      <Bar options={chart_options} data={chart_data} />
    </>
  );
};

export default TemporalShapeChart;
