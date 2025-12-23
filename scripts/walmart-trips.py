"""
Script to process the walmart-trips dataset and update the corresponding datasheet.

References
----------
https://www.cs.cornell.edu/~arb/data/walmart-trips/
"""

import gzip
from collections import Counter
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
dataset_file = root_dir / "public" / "datasets" / "walmart-trips.txt.gz"
datasheet_file = root_dir / "src" / "datasets" / "walmart-trips.mdx"

nodes, hyperedges = load_benson_hyperedges(root_dir / "data" / "walmart-trips")

# write dataset file
with gzip.open(dataset_file, "wt") as f:
    write_dataset_metadata(f, datasheet_file.stem)
    for node in track(nodes, description="Writing nodes"):
        write_node(f, first(node), department=node["label"])
    for hyperedge in track(hyperedges, description="Writing hyperedges"):
        write_edge(f, hyperedge)

label_counts = Counter(x["label"] for x in nodes)

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
        "label-count": dict(label_counts),
    },
)
