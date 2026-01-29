"""
Script to process the mathoverflow-answers dataset and update the corresponding datasheet.

References
----------
https://www.cs.cornell.edu/~arb/data/mathoverflow-answers/
"""

import gzip
from collections import Counter, defaultdict
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
dataset_file = root_dir / "public" / "datasets" / "mathoverflow-answers.txt.gz"
datasheet_file = root_dir / "src" / "datasets" / "mathoverflow-answers.mdx"

nodes, hyperedges = load_benson_hyperedges(root_dir / "data" / "mathoverflow-answers")

node_degrees = defaultdict(int)
edge_degree_counts = defaultdict(int)

# write dataset file
with gzip.open(dataset_file, "wt") as f:
    write_dataset_metadata(f, datasheet_file.stem, revision=1)
    for node in track(nodes, description="Writing nodes"):
        write_node(f, first(node), tags=node["label"])

    for hyperedge in track(hyperedges, description="Writing hyperedges"):
        write_edge(f, hyperedge)

        for node in hyperedge.elements:
            node_degrees[node] += 1

        edge_degree_counts[len(hyperedge.elements)] += 1

node_degree_counts = defaultdict(int)
for d in node_degrees.values():
    node_degree_counts[d] += 1
node_degree_histogram = dict(sorted(node_degree_counts.items()))

label_counts = Counter(chain.from_iterable(x["label"] for x in nodes))

edge_degree_histogram = dict(sorted(edge_degree_counts.items()))

# write dataset metadata into existing frontmatter
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
            "num-edges": len(hyperedges),
            "node-degrees": node_degree_histogram,
            "edge-degrees": edge_degree_histogram,
        },
        "label-count": dict(label_counts),
    },
)
