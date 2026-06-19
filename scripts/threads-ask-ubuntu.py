"""Process the threads-ask-ubuntu dataset from its original ScHoLP source files."""

from __future__ import annotations

import gzip
from collections import Counter
from datetime import UTC, datetime, timedelta
from pathlib import Path

from rich.progress import track

from .benson import load_benson_simplices
from .utils.boxplot import compute_boxplot_stats_from_histogram
from .utils.write import (
    update_frontmatter,
    write_dataset_metadata,
    write_edge,
)
from .utils.yaml import patch_dumper

patch_dumper()

root_dir = Path(__file__).parent.parent
slug = "threads-ask-ubuntu"
source_folder_name = "threads-ask-ubuntu"
revision = 1

folder = root_dir / "data" / source_folder_name
dataset_file = root_dir / "public" / "datasets" / f"{slug}.txt.gz"
datasheet_file = root_dir / "src" / "datasets" / f"{slug}.mdx"

simplices = load_benson_simplices(folder)

node_degrees: Counter[int] = Counter()
edge_degrees: Counter[int] = Counter()
nodes: set[int] = set()
written_edges = 0

with gzip.open(dataset_file, "wt") as file:
    write_dataset_metadata(file, slug, revision)
    for simplex in track(simplices, description="Writing hyperedges"):
        nodes.update(simplex.elements)
        if len(simplex.elements) < 2:
            continue

        write_edge(
            file,
            simplex,
            thread_id=simplex["label"],
            time=datetime(1, 1, 1, tzinfo=UTC)
            + timedelta(milliseconds=simplex["time"]),
        )
        node_degrees.update(simplex.elements)
        edge_degrees[len(simplex.elements)] += 1
        written_edges += 1

node_degree_histogram = Counter(node_degrees.values())

update_frontmatter(
    datasheet_file,
    {
        "attachments": {
            f"revision-{revision}": {"ahorn": dataset_file.name},
        },
        "statistics": {
            "num-nodes": len(nodes),
            "num-edges": written_edges,
            "node-degree-boxplot": compute_boxplot_stats_from_histogram(
                node_degree_histogram
            ),
            "edge-degree-boxplot": compute_boxplot_stats_from_histogram(edge_degrees),
        },
    },
)
