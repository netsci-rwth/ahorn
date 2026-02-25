"""
Script to process the music-blues-reviews dataset and update the corresponding datasheet.

References
----------
https://www.cs.cornell.edu/~arb/data/cat-edge-madison-restaurant-reviews/
"""

import gzip
import sys
from collections import Counter, defaultdict
from itertools import chain
from pathlib import Path

sys.path.append("..")

from more_itertools import first
from rich.progress import track

from .benson import load_benson_hyperedges
from .utils.write import (
    update_frontmatter,
    write_dataset_metadata,
    write_edge,
    write_node,
)
from .utils.yaml import patch_dumper

patch_dumper()

root_dir = Path(__file__).parent.parent
dataset_file = root_dir / "public" / "datasets" / "madison-restaurant-reviews.txt.gz"
datasheet_file = root_dir / "src" / "datasets" / "madison-restaurant-reviews.mdx"
revision = 2

nodes, hyperedges = load_benson_hyperedges(
    root_dir / "data" / "cat-edge-madison-restaurant-reviews"
)

node_degrees = defaultdict(int)
edge_degree_counts = defaultdict(int)

# write dataset file
covered_nodes = set(chain.from_iterable(hyperedge.elements for hyperedge in hyperedges))
with gzip.open(dataset_file, "wt") as f:
    write_dataset_metadata(f, datasheet_file.stem, revision=revision)
    for node in track(map(first, nodes), description="Writing nodes"):
        if node in covered_nodes:
            continue
        write_node(f, node)

    for hyperedge in track(hyperedges, description="Writing hyperedges"):
        write_edge(f, hyperedge, cuisine=hyperedge["label"])

        for node in hyperedge.elements:
            node_degrees[node] += 1

        edge_degree_counts[len(hyperedge.elements)] += 1

node_degree_counts = defaultdict(int)
for d in node_degrees.values():
    node_degree_counts[d] += 1
node_degree_histogram = dict(sorted(node_degree_counts.items()))

edge_degree_histogram = dict(sorted(edge_degree_counts.items()))

edge_label_counts = Counter(x["label"] for x in hyperedges)

update_frontmatter(
    datasheet_file,
    {
        "attachments": {
            f"revision-{revision}": {
                "url": dataset_file.name,
                "size": dataset_file.stat().st_size,
            }
        },
        "statistics": {
            "num-nodes": len(nodes),
            "num-edges": len(hyperedges),
            "node-degrees": node_degree_histogram,
            "edge-degrees": edge_degree_histogram,
        },
        "edge-label-count": dict(edge_label_counts),
    },
)
