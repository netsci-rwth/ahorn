"""Utilities for computing box-plot five-number summaries."""

from statistics import median
from typing import TYPE_CHECKING, TypedDict

if TYPE_CHECKING:
    from collections.abc import Iterable, Mapping


class BoxPlotStats(TypedDict):
    """Five-number summary for rendering a box plot."""

    min: int | float
    q1: int | float
    median: int | float
    q3: int | float
    max: int | float


def _clean(value: int | float) -> int | float:
    """Represent integral floating-point values as integers."""
    return int(value) if float(value).is_integer() else float(value)


def compute_boxplot_stats(values: Iterable[int | float]) -> BoxPlotStats:
    """Compute box-plot statistics from numeric observations."""
    sorted_values = sorted(values)
    if not sorted_values:
        raise ValueError("Cannot compute box-plot statistics from no values.")

    midpoint = len(sorted_values) // 2
    lower = sorted_values[:midpoint]
    upper = (
        sorted_values[midpoint:]
        if len(sorted_values) % 2 == 0
        else sorted_values[midpoint + 1 :]
    )
    median_value = median(sorted_values)

    return {
        "min": _clean(sorted_values[0]),
        "q1": _clean(median(lower) if lower else median_value),
        "median": _clean(median_value),
        "q3": _clean(median(upper) if upper else median_value),
        "max": _clean(sorted_values[-1]),
    }


def compute_boxplot_stats_from_histogram(
    histogram: Mapping[int, int],
) -> BoxPlotStats:
    """Compute box-plot statistics from a value-frequency histogram."""
    entries = sorted((value, count) for value, count in histogram.items() if count > 0)
    total_count = sum(count for _, count in entries)
    if total_count == 0:
        raise ValueError("Cannot compute box-plot statistics from no values.")

    def value_at_rank(rank: int) -> int:
        current_count = 0
        for value, count in entries:
            current_count += count
            if current_count > rank:
                return value
        return entries[-1][0]

    midpoint = total_count // 2
    median_value = (
        (value_at_rank(midpoint - 1) + value_at_rank(midpoint)) / 2
        if total_count % 2 == 0
        else value_at_rank(midpoint)
    )

    lower_length = midpoint
    if lower_length:
        lower_midpoint = lower_length // 2
        q1 = (
            (value_at_rank(lower_midpoint - 1) + value_at_rank(lower_midpoint)) / 2
            if lower_length % 2 == 0
            else value_at_rank(lower_midpoint)
        )
    else:
        q1 = median_value

    upper_start = midpoint + total_count % 2
    upper_length = total_count - upper_start
    if upper_length:
        upper_midpoint = upper_length // 2
        q3 = (
            (
                value_at_rank(upper_start + upper_midpoint - 1)
                + value_at_rank(upper_start + upper_midpoint)
            )
            / 2
            if upper_length % 2 == 0
            else value_at_rank(upper_start + upper_midpoint)
        )
    else:
        q3 = median_value

    return {
        "min": entries[0][0],
        "q1": _clean(q1),
        "median": _clean(median_value),
        "q3": _clean(q3),
        "max": entries[-1][0],
    }
