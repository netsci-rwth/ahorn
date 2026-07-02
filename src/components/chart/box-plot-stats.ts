export type BoxPlotStats = {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
};

export function computeBox(values: number[]): BoxPlotStats | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const medianOf = (items: number[]) => {
    const mid = Math.floor(items.length / 2);
    return items.length % 2 === 0
      ? (items[mid - 1] + items[mid]) / 2
      : items[mid];
  };
  const mid = Math.floor(sorted.length / 2);
  const median = medianOf(sorted);
  const lower = sorted.slice(0, mid);
  const upper =
    sorted.length % 2 === 0 ? sorted.slice(mid) : sorted.slice(mid + 1);
  return {
    min: sorted[0],
    q1: lower.length ? medianOf(lower) : median,
    median,
    q3: upper.length ? medianOf(upper) : median,
    max: sorted.at(-1)!,
  };
}

export function computeBoxFromHistogram(
  histogram: Record<string | number, number>,
): BoxPlotStats | null {
  const entries = Object.entries(histogram)
    .map(([key, count]) => [Number(key), Number(count)] as [number, number])
    .filter(([key, count]) => Number.isFinite(key) && count > 0)
    .sort((a, b) => a[0] - b[0]);
  if (entries.length === 0) return null;
  const total = entries.reduce((sum, [, count]) => sum + count, 0);
  const atRank = (rank: number) => {
    let seen = 0;
    for (const [value, count] of entries) {
      seen += count;
      if (seen > rank) return value;
    }
    return entries.at(-1)![0];
  };
  const mid = Math.floor(total / 2);
  const median =
    total % 2 === 0 ? (atRank(mid - 1) + atRank(mid)) / 2 : atRank(mid);
  const lowerLength = mid;
  const upperStart = mid + (total % 2);
  const upperLength = total - upperStart;
  const lowerMid = Math.floor(lowerLength / 2);
  const upperMid = Math.floor(upperLength / 2);
  const q1 =
    lowerLength === 0
      ? median
      : lowerLength % 2 === 0
        ? (atRank(lowerMid - 1) + atRank(lowerMid)) / 2
        : atRank(lowerMid);
  const q3 =
    upperLength === 0
      ? median
      : upperLength % 2 === 0
        ? (atRank(upperStart + upperMid - 1) + atRank(upperStart + upperMid)) /
          2
        : atRank(upperStart + upperMid);
  return { min: entries[0][0], q1, median, q3, max: entries.at(-1)![0] };
}
