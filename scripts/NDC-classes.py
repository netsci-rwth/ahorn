"""
Script to process the NDC-classes dataset and update the corresponding datasheet.

References
----------
https://www.cs.cornell.edu/~arb/data/NDC-classes/
"""

import gzip
from collections import Counter, defaultdict
from datetime import date, timedelta
from pathlib import Path

from more_itertools import first
from rich.progress import track

from .benson import load_benson_sc_nodes, load_benson_simplices
from .utils.write import (
    update_frontmatter,
    write_dataset_metadata,
    write_edge,
    write_node,
)
from .utils.yaml import patch_dumper

patch_dumper()

root_dir = Path(__file__).parent.parent
dataset_file = root_dir / "public" / "datasets" / "NDC-classes.txt.gz"
datasheet_file = root_dir / "src" / "datasets" / "NDC-classes.mdx"

nodes = load_benson_sc_nodes(root_dir / "data" / "NDC-classes-full")
hyperedges = load_benson_simplices(root_dir / "data" / "NDC-classes-full")

# write dataset file
daily_hyperedges = defaultdict(list)
degrees = defaultdict(int)
with gzip.open(dataset_file, "wt") as f:
    write_dataset_metadata(f, datasheet_file.stem, revision=1)

    for node in track(nodes, description="Writing nodes"):
        write_node(f, first(node.elements), category=node["label"])

    for hyperedge in track(hyperedges, description="Writing simplices"):
        # TODO: The timestamp format is not clear to me. ChatGPT suggested that it
        # could be .NET like timestamp in milliseconds since year 1.
        ms = int(hyperedge["time"])
        day = date(1, 1, 1) + timedelta(milliseconds=ms)
        daily_hyperedges[day].append(hyperedge)
        # update node degrees
        for nid in hyperedge.elements:
            degrees[nid] += 1
        write_edge(f, hyperedge, **hyperedge._attributes)

# calculate shapes for each day
num_hyperedges = {}
for day, hyperedges_on_day in daily_hyperedges.items():
    num_hyperedges[day] = len(hyperedges_on_day)

# write shape into existing frontmatter
degree_histogram = Counter(degrees.values())
update_frontmatter(
    datasheet_file,
    {
        "statistics": {
            "num-nodes": len(nodes),
            "num-edges": len(hyperedges),
            "node-degrees": dict(sorted(degree_histogram.items())),
        },
        "attachments": {
            "dataset": {
                "url": dataset_file.name,
                "size": dataset_file.stat().st_size,
            }
        },
        "shape": {str(day): shape for day, shape in num_hyperedges.items()},
    },
)
