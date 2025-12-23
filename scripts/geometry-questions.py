"""
Script to process the geometry-questions dataset and update the corresponding datasheet.

References
----------
https://www.cs.cornell.edu/~arb/data/cat-edge-geometry-questions/
"""

from collections import Counter
from itertools import chain
from pathlib import Path

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
dataset_file = root_dir / "public" / "datasets" / "geometry-questions.txt"
datasheet_file = root_dir / "src" / "datasets" / "geometry-questions.mdx"

nodes, hyperedges = load_benson_hyperedges(
    root_dir / "data" / "cat-edge-geometry-questions"
)

# write dataset file
covered_nodes = set(chain.from_iterable(hyperedge.elements for hyperedge in hyperedges))
with dataset_file.open("w") as f:
    write_dataset_metadata(f, datasheet_file.stem)
    for node in track(map(first, nodes), description="Writing nodes"):
        if node in covered_nodes:
            continue
        write_node(f, node)
    for hyperedge in track(hyperedges, description="Writing hyperedges"):
        write_edge(f, hyperedge, genre=hyperedge["label"])

edge_label_counts = Counter(x["label"] for x in hyperedges)

# write shape into existing frontmatter
update_frontmatter(
    datasheet_file,
    {
        "attachments": {
            "dataset": {
                "url": dataset_file.name,
                "size": dataset_file.stat().st_size,
            }
        },
        "statistics": {
            "num-nodes": len(nodes),
        },
        "shape": {
            "nodes": len(nodes),
            "hyperedges": len(hyperedges),
        },
        "edge-label-count": dict(edge_label_counts),
    },
)
