"""
Script to process the DAWN dataset and update the corresponding datasheet.

References
----------
https://www.cs.cornell.edu/~arb/data/cat-edge-DAWN/
"""

from collections import Counter
from pathlib import Path

import toponetx as tnx
from more_itertools import first
from rich.progress import track

from .utils.write import (
    update_frontmatter,
    write_dataset_metadata,
    write_edge,
    write_node,
)
from .utils.yaml import patch_dumper

# TODO: The dataset we downloaded from Benson's repository seems to be broken.
# The hyperedge label file contains 2272 lines, but it should only contain 10
# categories (none of which fit the names given there).
raise RuntimeError

patch_dumper()

root_dir = Path(__file__).parent.parent
dataset_file = root_dir / "public" / "datasets" / "DAWN.txt"
datasheet_file = root_dir / "src" / "datasets" / "DAWN.mdx"

nodes, hyperedges = tnx.datasets.benson.load_benson_hyperedges(
    root_dir / "data" / "cat-edge-DAWN"
)

edge_label_counts = Counter(x["label"] for x in hyperedges)

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

# write dataset file
with dataset_file.open("w") as f:
    write_dataset_metadata(f, datasheet_file.stem)
    for node in track(nodes, description="Writing nodes"):
        write_node(f, first(node), party=node["label"])
    for hyperedge in track(hyperedges, description="Writing hyperedges"):
        write_edge(f, hyperedge, label=hyperedge["label"])
