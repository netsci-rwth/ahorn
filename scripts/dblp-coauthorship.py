"""
Script to process the dblp-coauthorship dataset and update the corresponding datasheet.

The DBLP coauthorship dataset is a hypergraph where nodes are authors and
hyperedges are papers (representing sets of authors who collaborated on a publication).
Each author has a label indicating their primary research area, inferred from the
majority research area of their publications.

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
data_dir = root_dir / "data" / "coauthorship_dblp"
dataset_file = root_dir / "public" / "datasets" / "dblp-coauthorship.txt.gz"
datasheet_file = root_dir / "src" / "datasets" / "dblp-coauthorship.mdx"

# Load dataset from pickle files
with (data_dir / "hypergraph.pickle").open("rb") as f:
    hypergraph_dict = pickle.load(f)

with (data_dir / "labels.pickle").open("rb") as f:
    paper_labels = pickle.load(f)

# Label names for DBLP dataset (research areas)
label_names = [
    "Database",
    "Data_Mining",
    "AI",
    "Information_Retrieval",
    "Computer_Vision",
    "Machine_Learning",
]

# Create author name to ID mapping
author_names = list(hypergraph_dict.keys())
num_authors = len(author_names)

# Infer author labels from their papers (majority vote)
author_labels = []
for author_name in author_names:
    paper_ids = hypergraph_dict[author_name]
    # Get labels of all papers by this author
    author_paper_labels = [paper_labels[pid] for pid in paper_ids]
    # Majority vote
    if author_paper_labels:
        majority_label = Counter(author_paper_labels).most_common(1)[0][0]
        author_labels.append(majority_label)
    else:
        author_labels.append(0)  # Default

# Create nodes (authors) with labels
nodes = [Simplex([i + 1]) for i in range(num_authors)]  # Node IDs start from 1
for i, node in enumerate(nodes):
    node["label"] = label_names[author_labels[i]]
    node["name"] = author_names[i]

# Create hyperedges (papers with their author sets)
# Invert: map paper IDs to lists of author IDs
papers_to_authors = defaultdict(list)
for author_idx, author_name in enumerate(author_names):
    paper_ids = hypergraph_dict[author_name]
    for paper_id in paper_ids:
        papers_to_authors[paper_id].append(author_idx + 1)  # 1-indexed

# Create hyperedges from papers
hyperedges = []
for paper_id in sorted(papers_to_authors.keys()):
    author_list = sorted(set(papers_to_authors[paper_id]))  # Remove duplicates if any
    hyperedges.append(Simplex(author_list))

node_degrees = defaultdict(int)
edge_degree_counts = defaultdict(int)

# Write dataset file
with gzip.open(dataset_file, "wt") as f:
    write_dataset_metadata(f, datasheet_file.stem, revision=1)

    for i, node in track(
        enumerate(nodes), description="Writing nodes", total=len(nodes)
    ):
        write_node(f, i + 1, category=node["label"], name=node["name"])

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
