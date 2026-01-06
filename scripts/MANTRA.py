"""
Script to process the MANTRA dataset and update the corresponding datasheets.

The MANTRA dataset contains triangulations of 2-manifolds and 3-manifolds,
with topological properties like Betti numbers and torsion coefficients.

References
----------
https://github.com/machawk1/MANTRA
"""

import gzip
import json
from collections import defaultdict
from pathlib import Path
from statistics import median
from typing import Any

from rich.progress import track

from .utils.write import (
    write_dataset_metadata,
    write_edge,
    write_markdown,
    write_network_metadata,
    write_node,
)
from .utils.yaml import patch_dumper, read_frontmatter

patch_dumper()

root_dir = Path(__file__).parent.parent
data_dir = root_dir / "data" / "MANTRA"


def boxplot_stats(values: list[float | int]) -> dict[str, float | int]:
    """Return five-number summary for a list of numeric values."""

    def _clean(value: float) -> float | int:
        return int(value) if float(value).is_integer() else float(value)

    sorted_vals = sorted(values)
    n = len(sorted_vals)
    mid = n // 2
    lower = sorted_vals[:mid]
    upper = sorted_vals[mid:] if n % 2 == 0 else sorted_vals[mid + 1 :]

    return {
        "min": _clean(sorted_vals[0]),
        "q1": _clean(median(lower)),
        "median": _clean(median(sorted_vals)),
        "q3": _clean(median(upper)),
        "max": _clean(sorted_vals[-1]),
    }


def extract_manifold_metadata(manifold: dict[str, Any]) -> dict[str, Any]:
    """Return a sanitized subset of manifold-level metadata for the network header."""
    allowed_keys = {
        "id",
        "name",
        "betti_numbers",
        "torsion_coefficients",
        "genus",
        "orientable",
        "vertex_transitive",
    }

    return {k: v for k, v in manifold.items() if k in allowed_keys}


# Process both 2-manifolds and 3-manifolds
for dimension in [2, 3]:
    json_file = data_dir / f"{dimension}_manifolds.json"
    dataset_file = (
        root_dir / "public" / "datasets" / f"MANTRA-{dimension}-manifolds.txt.gz"
    )
    datasheet_file = root_dir / "src" / "datasets" / f"MANTRA-{dimension}-manifolds.mdx"

    # Load manifolds from JSON
    with json_file.open() as f:
        manifolds: list[dict[str, Any]] = json.load(f)

    # Process dataset
    num_total_simplices = 0
    node_counts: list[float | int] = []
    simplex_counts: list[float | int] = []

    dataset_file.parent.mkdir(parents=True, exist_ok=True)

    avg_degrees: list[float] = []
    degrees_total: defaultdict[int, int] = defaultdict(int)

    with gzip.open(dataset_file, "wt") as f:
        write_dataset_metadata(
            f,
            f"MANTRA-{dimension}-manifolds",
            revision=1,
            dataset_version="0.0.16",
            _num_networks=len(manifolds),
        )

        # Write nodes (vertices)
        for manifold in track(
            manifolds, description=f"Processing {dimension}-manifolds"
        ):
            write_network_metadata(f, **extract_manifold_metadata(manifold))

            degrees: defaultdict[int, int] = defaultdict(int)

            # Extract unique vertices per manifold
            vertices: set[int] = set()
            triangulation: list[list[int]] = []
            for simplex in manifold["triangulation"]:
                simplex_vertices = [int(v) for v in simplex]
                triangulation.append(simplex_vertices)
                vertices.update(simplex_vertices)

            node_counts.append(manifold["n_vertices"])
            simplex_counts.append(len(triangulation))

            # Write vertices that do not appear in any simplex
            for vertex_id in range(1, manifold["n_vertices"] + 1):
                if vertex_id not in vertices:
                    write_node(f, vertex_id)

            # Write simplices (triangles or tetrahedra)
            for simplex in triangulation:
                num_total_simplices += 1
                # Update degrees
                for vertex_id in simplex:
                    degrees[vertex_id] += 1
                    degrees_total[vertex_id] += 1
                write_edge(f, simplex, manifold_id=manifold["id"])

            avg_degrees.append(sum(degrees.values()) / len(degrees))

    # Calculate statistics for this dimension
    num_nodes = len(degrees_total)
    num_manifolds = len(manifolds)
    nodes_box = boxplot_stats(node_counts)
    simplices_box = boxplot_stats(simplex_counts)

    # Prepare datasheet frontmatter/body
    with datasheet_file.open() as f:
        datasheet_frontmatter_raw, datasheet_body = read_frontmatter(f.read())
    datasheet_frontmatter: dict[str, Any] = datasheet_frontmatter_raw

    datasheet_frontmatter.update(
        {
            "statistics": {
                "num-manifolds": num_manifolds,
                "num-nodes": num_nodes,
                "num-simplices": num_total_simplices,
                "nodes-boxplot": nodes_box,
                "simplices-boxplot": simplices_box,
                "avg-degree": avg_degrees,
            },
            "attachments": {
                "dataset": {
                    "url": dataset_file.name,
                    "size": dataset_file.stat().st_size,
                }
            },
        }
    )

    write_markdown(datasheet_file, datasheet_frontmatter, datasheet_body)
