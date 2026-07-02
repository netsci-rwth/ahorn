import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  Colors,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  LogarithmicScale,
  PieController,
  PointElement,
  TimeScale,
  Tooltip,
  type ActiveElement,
  type ChartConfiguration,
  type ChartEvent,
  type ChartType,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import "chartjs-adapter-date-fns";
import {
  format,
  parse,
  startOfDay,
  startOfHour,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
  startOfYear,
} from "date-fns";

import {
  timeUnits,
  type ChartJsSpec,
  type TimeUnit,
} from "@/components/chart/chart-js-config";

Chart.register(
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Colors,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  LogarithmicScale,
  PieController,
  PointElement,
  TimeScale,
  Tooltip,
  ChartDataLabels,
);

const chartInstances = new WeakMap<HTMLElement, Chart>();
const palette = [
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
];

let darkModeQuery: MediaQueryList | undefined;
let darkModeListenerAttached = false;

type TimePoint = { x: string; y: number };
type RuntimeChartConfiguration = ChartConfiguration<ChartType, any[], unknown>;

function theme(isDark: boolean) {
  return {
    blue: isDark ? "#60a5fa" : "#3b82f6",
    grid: isDark ? "rgba(148,163,184,0.10)" : "rgba(148,163,184,0.14)",
    tick: isDark ? "rgba(255,255,255,0.78)" : "rgba(51,65,85,0.82)",
    tooltip: {
      backgroundColor: isDark ? "#111827" : "#ffffff",
      titleColor: isDark ? "#f8fafc" : "#0f172a",
      bodyColor: isDark ? "#e2e8f0" : "#334155",
      borderColor: isDark ? "rgba(148,163,184,0.25)" : "rgba(148,163,184,0.35)",
      borderWidth: 1,
    },
  };
}

function selectedTimeUnit(element: HTMLElement, fallback: TimeUnit) {
  const select = element.querySelector<HTMLSelectElement>(
    "[data-chart-time-unit]",
  );
  return (select?.value as TimeUnit | undefined) ?? fallback;
}

function startOfPeriod(date: Date, unit: TimeUnit) {
  switch (unit) {
    case "hour":
      return startOfHour(date);
    case "day":
      return startOfDay(date);
    case "week":
      return startOfWeek(date);
    case "month":
      return startOfMonth(date);
    case "quarter":
      return startOfQuarter(date);
    case "year":
      return startOfYear(date);
  }
}

function periodKey(date: Date, unit: TimeUnit) {
  const start = startOfPeriod(date, unit);
  return unit === "hour"
    ? format(start, "yyyy-MM-dd HH:00")
    : format(start, "yyyy-MM-dd");
}

function lineConfiguration(
  element: HTMLElement,
  spec: Extract<ChartJsSpec, { kind: "hyperedges-over-time" }>,
  isDark: boolean,
): ChartConfiguration<"line", TimePoint[]> {
  const colors = theme(isDark);
  const unit = selectedTimeUnit(element, spec.minUnit);
  const selectableUnits = timeUnits.slice(
    timeUnits.indexOf(spec.minUnit),
    timeUnits.indexOf(spec.maxUnit) + 1,
  );
  let aggregated = spec.data;

  if (selectableUnits.length > 1) {
    aggregated = {};
    for (const [dateString, value] of Object.entries(spec.data)) {
      const date = parse(
        dateString,
        dateString.length === 4 ? "yyyy" : "yyyy-MM-dd",
        new Date(),
      );
      const key = periodKey(date, unit);
      aggregated[key] = (aggregated[key] ?? 0) + value;
    }
  }

  return {
    type: "line",
    data: {
      datasets: [
        {
          label: "Hyperedges",
          data: Object.entries(aggregated).map(([x, y]) => ({ x, y })),
          borderColor: colors.blue,
          backgroundColor: colors.blue,
          pointRadius: 0,
          borderWidth: 2,
          tension: 0.2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: "time",
          time: { unit },
          stacked: true,
          ticks: { color: colors.tick, padding: 8 },
          grid: { color: colors.grid },
          border: { display: false },
        },
        y: {
          stacked: true,
          ticks: { color: colors.tick, padding: 8 },
          grid: { color: colors.grid },
          border: { display: false },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: colors.tooltip,
        datalabels: { display: false },
      },
    },
  };
}

function temporalShapeConfiguration(
  element: HTMLElement,
  spec: Extract<ChartJsSpec, { kind: "temporal-shape" }>,
  isDark: boolean,
): ChartConfiguration<"bar", TimePoint[]> {
  const colors = theme(isDark);
  const unit = selectedTimeUnit(element, spec.minUnit);
  const maxRanks = Math.max(
    0,
    ...Object.values(spec.shape).map((row) => row.length),
  );
  const aggregated: Record<string, number[]> = {};

  for (const [dateString, values] of Object.entries(spec.shape)) {
    const date = parse(dateString, "yyyy-MM-dd HH:mm:ss", new Date());
    const key = periodKey(date, unit);
    aggregated[key] ??= Array(maxRanks).fill(0);
    for (let rank = 0; rank < maxRanks; rank += 1) {
      aggregated[key][rank] += values[rank] ?? 0;
    }
  }

  const dates = Object.keys(aggregated);
  return {
    type: "bar",
    data: {
      datasets: Array.from({ length: maxRanks }, (_, rank) => ({
        label: `Rank ${rank}`,
        data: dates.map((x) => ({ x, y: aggregated[x][rank] ?? 0 })),
      })),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: "time",
          time: { unit },
          stacked: true,
          ticks: { color: colors.tick, padding: 8 },
          grid: { color: colors.grid },
          border: { display: false },
        },
        y: {
          stacked: true,
          ticks: { color: colors.tick, padding: 8 },
          grid: { color: colors.grid },
          border: { display: false },
        },
      },
      plugins: {
        legend: { position: "top", labels: { color: colors.tick } },
        tooltip: colors.tooltip,
        datalabels: { display: false },
      },
    },
  };
}

function configuration(
  element: HTMLElement,
  spec: ChartJsSpec,
  isDark: boolean,
): RuntimeChartConfiguration {
  const colors = theme(isDark);

  switch (spec.kind) {
    case "degree-distribution": {
      const entries = Object.entries(spec.histogram)
        .map(([degree, count]) => [Number(degree), Number(count)] as const)
        .filter(
          ([degree, count]) =>
            Number.isFinite(degree) && Number.isFinite(count),
        )
        .sort(([left], [right]) => left - right);
      const logarithmic =
        element.querySelector<HTMLInputElement>("[data-chart-log-scale]")
          ?.checked ?? spec.logScale;

      return {
        type: "line",
        data: {
          labels: entries.map(([degree]) => String(degree)),
          datasets: [
            {
              label: "Nodes per degree",
              data: entries.map(([, count]) => count),
              tension: 0.2,
              borderColor: colors.blue,
              backgroundColor: colors.blue,
              pointRadius: 0,
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              type: "category",
              title: { display: true, text: "Degree", color: colors.tick },
              ticks: { color: colors.tick, padding: 8 },
              grid: { color: colors.grid },
              border: { display: false },
            },
            y: {
              type: logarithmic ? "logarithmic" : "linear",
              title: { display: true, text: "Count", color: colors.tick },
              suggestedMin: logarithmic ? 1 : undefined,
              ticks: { color: colors.tick, padding: 8 },
              grid: { color: colors.grid },
              border: { display: false },
            },
          },
          plugins: {
            legend: { display: false },
            tooltip: colors.tooltip,
            datalabels: { display: false },
          },
        },
      };
    }

    case "label-distribution": {
      const entries = Object.entries(spec.labels).sort(
        ([, left], [, right]) => right - left,
      );
      return {
        type: "pie",
        data: {
          labels: entries.map(([label]) => label),
          datasets: [
            {
              data: entries.map(([, count]) => count),
              backgroundColor: entries.map(
                (_, index) => palette[index % palette.length],
              ),
              borderWidth: 0,
              hoverOffset: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "right",
              align: "center",
              labels: {
                color: colors.tick,
                boxWidth: 10,
                boxHeight: 10,
                padding: 14,
                usePointStyle: true,
                pointStyle: "circle",
              },
            },
            tooltip: colors.tooltip,
            datalabels: { display: false },
          },
        },
      };
    }

    case "hyperedges-over-time":
      return lineConfiguration(element, spec, isDark);

    case "network-type": {
      const labels = Object.keys(spec.data).sort();
      return {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              label: "Datasets",
              data: labels.map((label) => spec.data[label]),
              backgroundColor: isDark
                ? "rgba(59,130,246,0.5)"
                : "rgba(59,130,246,0.7)",
              borderColor: "rgba(59,130,246,1)",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          animation: false,
          layout: { padding: { top: 20 } },
          onClick: (_event: ChartEvent, activeElements: ActiveElement[]) => {
            const index = activeElements[0]?.index;
            if (index === undefined) return;
            window.location.assign(
              `/dataset?types=${encodeURIComponent(labels[index])}`,
            );
          },
          onHover: (event: ChartEvent, activeElements: ActiveElement[]) => {
            const target = event.native?.target as HTMLElement | null;
            if (target)
              target.style.cursor = activeElements.length
                ? "pointer"
                : "default";
          },
          plugins: {
            legend: { display: false },
            tooltip: { enabled: false },
            datalabels: {
              anchor: "end",
              align: "top",
              color: isDark ? "#f3f4f6" : "#1f2937",
              font: { size: 11, weight: "bold" },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { stepSize: 1, color: isDark ? "#d1d5db" : "#6b7280" },
              grid: {
                color: isDark ? "rgba(75,85,99,0.2)" : "rgba(200,200,200,0.2)",
              },
            },
            x: {
              ticks: { color: isDark ? "#d1d5db" : "#6b7280" },
              grid: { display: false },
            },
          },
        },
      };
    }

    case "shape": {
      const names = ["Vertices", "Edges", "Triangles", "Tetrahedra"];
      return {
        type: "bar",
        data: {
          labels: spec.shape.map((_, index) =>
            index < names.length
              ? `${names[index]} (${index}D)`
              : `${index}-Simplices`,
          ),
          datasets: [
            {
              label: "Count",
              data: spec.shape,
              backgroundColor: "#3b82f6",
              borderColor: "#2563eb",
              borderWidth: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: colors.tooltip,
            datalabels: { display: false },
          },
          scales: {
            y: {
              ticks: { color: colors.tick, padding: 8 },
              grid: { color: colors.grid },
              border: { display: false },
            },
            x: {
              ticks: { color: colors.tick, padding: 8 },
              grid: { color: colors.grid },
              border: { display: false },
            },
          },
        },
      };
    }

    case "temporal-shape":
      return temporalShapeConfiguration(element, spec, isDark);
  }
}

function renderChart(element: HTMLElement) {
  const canvas = element.querySelector<HTMLCanvasElement>("canvas");
  const serialized = element.dataset.chartSpec;
  if (!canvas || !serialized) return;

  chartInstances.get(element)?.destroy();
  const spec = JSON.parse(serialized) as ChartJsSpec;
  const isDark = darkModeQuery?.matches ?? false;
  chartInstances.set(
    element,
    new Chart(canvas, configuration(element, spec, isDark)),
  );
}

function initializeElement(element: HTMLElement) {
  if (element.dataset.chartInitialized === "true") return;
  element.dataset.chartInitialized = "true";

  element.addEventListener("change", (event) => {
    const target = event.target as HTMLElement;
    if (target.matches("[data-chart-log-scale], [data-chart-time-unit]")) {
      renderChart(element);
    }
  });
  renderChart(element);
}

export function initializeChartJs() {
  darkModeQuery ??= window.matchMedia("(prefers-color-scheme: dark)");
  if (!darkModeListenerAttached) {
    darkModeListenerAttached = true;
    darkModeQuery.addEventListener("change", () => {
      document
        .querySelectorAll<HTMLElement>("[data-chart-js]")
        .forEach(renderChart);
    });
  }

  const initialize = () =>
    document
      .querySelectorAll<HTMLElement>("[data-chart-js]")
      .forEach(initializeElement);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
}
