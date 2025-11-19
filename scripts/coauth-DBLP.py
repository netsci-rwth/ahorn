"""
Script to process the coauth-DBLP dataset and update the corresponding datasheet.

References
----------
https://www.cs.cornell.edu/~arb/data/coauth-DBLP/
"""

import gzip
from collections import Counter, defaultdict
from pathlib import Path

from more_itertools import first
from rich.progress import track

from .benson import load_benson_sc_nodes, load_benson_simplices
from .utils.write import (
    update_frontmatter,
    write_edge,
    write_network_metadata,
    write_node,
)
from .utils.yaml import patch_dumper

patch_dumper()

root_dir = Path(__file__).parent.parent
dataset_file = root_dir / "public" / "datasets" / "coauth-DBLP.txt.gz"
datasheet_file = root_dir / "src" / "datasets" / "coauth-DBLP.mdx"

nodes = load_benson_sc_nodes(root_dir / "data" / "coauth-DBLP-full")
hyperedges = load_benson_simplices(root_dir / "data" / "coauth-DBLP-full")

# write dataset file
yearly_hyperedges = defaultdict(list)
degrees = defaultdict(int)
with gzip.open(dataset_file, "wt") as f:
    write_network_metadata(f, datasheet_file.stem)

    for node in track(nodes, description="Writing nodes"):
        write_node(f, first(node.elements), substance=node["label"])

    for hyperedge in track(hyperedges, description="Writing simplices"):
        yearly_hyperedges[hyperedge["time"]].append(hyperedge)
        # update node degrees
        for nid in hyperedge.elements:
            degrees[nid] += 1
        write_edge(f, hyperedge, year=hyperedge["time"])

# calculate shapes for each year
num_hyperedges = {}
for year, hyperedges_in_year in yearly_hyperedges.items():
    num_hyperedges[year] = len(hyperedges_in_year)

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
        "shape": {str(year): shape for year, shape in num_hyperedges.items()},
    },
)
