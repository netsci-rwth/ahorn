export const tooltipClassName =
  "pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden w-48 -translate-x-1/2 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-normal text-slate-700 normal-case shadow-lg group-hover:block dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200";

export const tooltipArrowClassName =
  "absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white dark:border-t-slate-900";

export function getChartTooltipOptions(isDark: boolean) {
  return {
    backgroundColor: isDark ? "#111827" : "#ffffff",
    titleColor: isDark ? "#f8fafc" : "#0f172a",
    bodyColor: isDark ? "#e2e8f0" : "#334155",
    borderColor: isDark ? "rgba(148,163,184,0.25)" : "rgba(148,163,184,0.35)",
    borderWidth: 1,
  };
}
