"""Tests for reusable box-plot statistics utilities."""

from __future__ import annotations

import unittest

from scripts.utils.boxplot import (
    compute_boxplot_stats,
    compute_boxplot_stats_from_histogram,
)


class BoxPlotStatisticsTests(unittest.TestCase):
    """Exercise raw-value and histogram box-plot calculations."""

    def test_compute_boxplot_stats_for_even_values(self) -> None:
        """Use median-of-halves quartiles for an even number of values."""
        self.assertEqual(
            compute_boxplot_stats([1, 2, 3, 4, 5, 6]),
            {"min": 1, "q1": 2, "median": 3.5, "q3": 5, "max": 6},
        )

    def test_compute_boxplot_stats_for_odd_values(self) -> None:
        """Exclude the median from both halves for odd-length data."""
        self.assertEqual(
            compute_boxplot_stats([1, 2, 3, 4, 5]),
            {"min": 1, "q1": 1.5, "median": 3, "q3": 4.5, "max": 5},
        )

    def test_histogram_matches_expanded_values(self) -> None:
        """Produce the same summary without expanding frequency counts."""
        values = [1, 1, 2, 4, 4, 4, 9]
        histogram = {1: 2, 2: 1, 4: 3, 9: 1}

        self.assertEqual(
            compute_boxplot_stats_from_histogram(histogram),
            compute_boxplot_stats(values),
        )

    def test_single_value_uses_same_statistic_everywhere(self) -> None:
        """Handle a single observation without empty-half failures."""
        expected = {"min": 7, "q1": 7, "median": 7, "q3": 7, "max": 7}

        self.assertEqual(compute_boxplot_stats([7]), expected)
        self.assertEqual(compute_boxplot_stats_from_histogram({7: 1}), expected)

    def test_empty_inputs_are_rejected(self) -> None:
        """Reject summaries with no positive-frequency observations."""
        with self.assertRaisesRegex(ValueError, "no values"):
            compute_boxplot_stats([])
        with self.assertRaisesRegex(ValueError, "no values"):
            compute_boxplot_stats_from_histogram({1: 0})


if __name__ == "__main__":
    unittest.main()
