"""
Script to process the pubmed-cocitation dataset and update the corresponding datasheet.

The PubMed cocitation dataset is a hypergraph where nodes are scientific papers and
hyperedges are sets of papers that are cocited together (i.e., cited together by
another paper). Each node has a label indicating the paper's research topic.

References
----------
Original dataset from hypergraph learning benchmarks (DHGNN, HyperGCN, etc.)
"""

import gzip
import pickle
from collections import Counter, defaultdict
from pathlib import Path

from rich.progress import track
from toponetx.classes.simplex import Simplex

from .utils.write import (
    update_frontmatter,
    write_dataset_metadata,
    write_edge,
    write_node,
)
from .utils.yaml import patch_dumper

patch_dumper()

root_dir = Path(__file__).parent.parent
data_dir = root_dir / "data" / "cocitation_pubmed"
dataset_file = root_dir / "public" / "datasets" / "pubmed-cocitation.txt.gz"
datasheet_file = root_dir / "src" / "datasets" / "pubmed-cocitation.mdx"

# Load dataset from pickle files
with (data_dir / "hypergraph.pickle").open("rb") as f:
    hypergraph_dict = pickle.load(f)  # noqa: S301

with (data_dir / "labels.pickle").open("rb") as f:
    node_labels = pickle.load(f)  # noqa: S301

# Label names for PubMed dataset (diabetes research topics)
label_names = [
    "Diabetes_Mellitus_Experimental",
    "Diabetes_Mellitus_Type_1",
    "Diabetes_Mellitus_Type_2",
]

# Create nodes (papers) with labels
num_nodes = len(node_labels)
nodes = [Simplex([i + 1]) for i in range(num_nodes)]  # Node IDs start from 1
for i, node in enumerate(nodes):
    node["label"] = label_names[int(node_labels[i])]

# Create hyperedges (cocitation sets)
# The hypergraph dict maps citing paper IDs to sets of cited paper IDs
hyperedges = []
for cited_papers in hypergraph_dict.values():
    # Convert to regular Python ints and add 1 to match 1-indexed nodes
    cited_paper_list = sorted([int(paper_id) + 1 for paper_id in cited_papers])
    hyperedges.append(Simplex(cited_paper_list))

node_degrees = defaultdict(int)
edge_degree_counts = defaultdict(int)

# Write dataset file
with gzip.open(dataset_file, "wt") as f:
    write_dataset_metadata(f, datasheet_file.stem, revision=1)

    for i, node in track(
        enumerate(nodes), description="Writing nodes", total=len(nodes)
    ):
        write_node(f, i + 1, category=node["label"])

    for hyperedge in track(hyperedges, description="Writing hyperedges"):
        write_edge(f, hyperedge)

        for node_id in hyperedge.elements:
            node_degrees[node_id] += 1

        edge_degree_counts[len(hyperedge.elements)] += 1

# Calculate statistics
node_degree_counts = defaultdict(int)
for d in node_degrees.values():
    node_degree_counts[d] += 1
node_degree_histogram = dict(sorted(node_degree_counts.items()))

edge_degree_histogram = dict(sorted(edge_degree_counts.items()))

label_counts = Counter(node["label"] for node in nodes)

# Write dataset metadata into existing frontmatter
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
        "label-count": dict(sorted(label_counts.items())),
    },
)
