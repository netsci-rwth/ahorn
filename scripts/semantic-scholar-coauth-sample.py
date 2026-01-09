"""Script to process the Semantic Scholar Coauthorship dataset."""

import gzip
from collections import defaultdict
from pathlib import Path

import numpy as np
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

patch_dumper()

root_dir = Path(__file__).parent.parent

data_path = root_dir / "data" / "semantic-scholar-coauth-sample"
dataset_file = (
    root_dir / "public" / "datasets" / "semantic-scholar-coauth-sample.txt.gz"
)
datasheet_file = root_dir / "src" / "datasets" / "semantic-scholar-coauth-sample.mdx"

# Load dataset
dataset = tnx.SimplicialComplex()
simplices_data = np.load(data_path / "150250_simplices.npy", allow_pickle=True)
cochains_data = np.load(data_path / "150250_cochains.npy", allow_pickle=True)

for simplex_dim, cochain_dim in zip(simplices_data, cochains_data, strict=True):
    for simplex in simplex_dim:
        if simplex in cochain_dim:
            dataset.add_simplex(list(simplex), citations=cochain_dim[simplex])

# write dataset file
with gzip.open(dataset_file, "wt") as f:
    write_dataset_metadata(f, datasheet_file.stem, revision=1)

    for node in track(dataset.nodes, description="Writing nodes"):
        write_node(f, first(node), **dataset.nodes[node])

    simplices = sorted(
        dataset.simplices,
        key=lambda s: (len(s), tuple(sorted(s))),
    )

    degrees = defaultdict(int)

    for simplex in track(simplices, description="Writing simplices"):
        if len(simplex) < 2:
            continue

        write_edge(f, simplex, **dataset.simplices[simplex])

        for nid in simplex:
            degrees[nid] += 1

# Update frontmatter
num_nodes = len(dataset.nodes)
# Count only non-singleton simplices as edges for statistics to match loop above
num_edges = sum(1 for s in dataset.simplices if len(s) > 1)

degree_counts = defaultdict(int)
for d in degrees.values():
    degree_counts[d] += 1

degree_histogram = dict(sorted(degree_counts.items()))

maximal_simplex_size_hist = defaultdict(int)
for simplex in dataset.get_all_maximal_simplices():
    maximal_simplex_size_hist[len(simplex)] += 1

update_frontmatter(
    datasheet_file,
    {
        "statistics": {
            "num-nodes": num_nodes,
            "num-edges": num_edges,
            "node-degrees": degree_histogram,
            "maximal-simplex-sizes": dict(sorted(maximal_simplex_size_hist.items())),
        },
        "attachments": {
            "dataset": {
                "url": dataset_file.name,
                "size": dataset_file.stat().st_size,
            }
        },
    },
)
