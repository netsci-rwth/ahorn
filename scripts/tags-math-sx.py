"""Process the tags-math-sx dataset from its original ScHoLP source files."""

from __future__ import annotations

import gzip
from collections import Counter
from datetime import UTC, datetime, timedelta
from pathlib import Path

from more_itertools import first
from rich.progress import track

from .benson import load_benson_sc_nodes, load_benson_simplices
from .utils.boxplot import compute_boxplot_stats_from_histogram
from .utils.write import (
    update_frontmatter,
    write_dataset_metadata,
    write_edge,
    write_node,
)
from .utils.yaml import patch_dumper

patch_dumper()

root_dir = Path(__file__).parent.parent
slug = "tags-math-sx"
source_folder_name = "tags-math-sx"
revision = 1

folder = root_dir / "data" / source_folder_name
dataset_file = root_dir / "public" / "datasets" / f"{slug}.txt.gz"
datasheet_file = root_dir / "src" / "datasets" / f"{slug}.mdx"

nodes = load_benson_sc_nodes(folder)
simplices = load_benson_simplices(folder)

node_degrees: Counter[int] = Counter()
edge_degrees: Counter[int] = Counter()
written_edges = 0

with gzip.open(dataset_file, "wt") as file:
    write_dataset_metadata(file, slug, revision)
    for node in track(nodes, description="Writing nodes"):
        write_node(file, first(node.elements), name=node["label"])

    for simplex in track(simplices, description="Writing hyperedges"):
        if len(simplex.elements) < 2:
            continue

        write_edge(
            file,
            simplex,
            post_id=simplex["label"],
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
            "num-interactions": written_edges,
            "node-degree-boxplot": compute_boxplot_stats_from_histogram(
                node_degree_histogram
            ),
            "edge-degree-boxplot": compute_boxplot_stats_from_histogram(edge_degrees),
        },
    },
)
