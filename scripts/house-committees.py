"""
Script to process the house-committees dataset and update the corresponding datasheet.

References
----------
https://www.cs.cornell.edu/~arb/data/house-committees/
"""

from collections import Counter
from pathlib import Path

from more_itertools import first
from rich.progress import track

from .benson import load_benson_hyperedges
from .utils.write import (
    update_frontmatter,
    write_edge,
    write_network_metadata,
    write_node,
)
from .utils.yaml import patch_dumper

patch_dumper()

root_dir = Path(__file__).parent.parent
dataset_file = root_dir / "public" / "datasets" / "house-committees.txt"
datasheet_file = root_dir / "src" / "datasets" / "house-committees.mdx"

nodes, hyperedges = load_benson_hyperedges(root_dir / "data" / "house-committees")

# write dataset file
with dataset_file.open("w") as f:
    write_network_metadata(f, datasheet_file.stem)
    for node in track(nodes, description="Writing nodes"):
        write_node(f, first(node), party=node["label"])
    for hyperedge in track(hyperedges, description="Writing hyperedges"):
        write_edge(f, hyperedge)

label_counts = Counter(x["label"] for x in nodes)

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
