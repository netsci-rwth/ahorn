"""
Script to process the COOKING dataset and update the corresponding datasheet.

References
----------
https://www.cs.cornell.edu/~arb/data/cat-edge-Cooking/
"""

import gzip
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

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
target_dir = root_dir / "public" / "datasets"
dataset_file = target_dir / "cooking.txt.gz"
datasheet_file = root_dir / "src" / "datasets" / "cooking.mdx"
revision = 2

nodes, raw_hyperedges = load_benson_hyperedges(root_dir / "data" / "cat-edge-Cooking")
singleton_edge_label_counts = Counter(
    hyperedge["label"] for hyperedge in raw_hyperedges if len(hyperedge.elements) == 1
)
hyperedges = [hyperedge for hyperedge in raw_hyperedges if len(hyperedge.elements) > 1]


if singleton_edge_label_counts:
    affected_subdatasets = ", ".join(
        f"{f'cooking-{label.replace("_", "-")}'} ({count})"
        for label, count in sorted(singleton_edge_label_counts.items())
    )
    print(f"Single-node hyperedge filter affects sub-datasets: {affected_subdatasets}")
else:
    print("Single-node hyperedge filter affects no sub-datasets.")


def build_statistics(
    filtered_hyperedges: list[Any],
) -> tuple[dict[int, int], dict[int, int], set[int | str]]:
    """Build statistics from filtered hyperedges.

    Parameters
    ----------
    filtered_hyperedges : list[Any]
        List of hyperedges to analyze.

    Returns
    -------
    node_degree_counts : dict[int, int]
        Mapping of degree to count of nodes.
    edge_degree_counts : dict[int, int]
        Mapping of degree to count of edges.
    participating_nodes : set[int | str]
        Set of node IDs that participate in the hyperedges.
    """
    node_degrees = defaultdict(int)
    edge_degree_counts = defaultdict(int)
    participating_nodes: set[int | str] = set()

    for hyperedge in filtered_hyperedges:
        edge_degree_counts[len(hyperedge.elements)] += 1
        for node in hyperedge.elements:
            participating_nodes.add(node)
            node_degrees[node] += 1

    node_degree_counts = defaultdict(int)
    for degree in node_degrees.values():
        node_degree_counts[degree] += 1

    return (
        dict(sorted(node_degree_counts.items())),
        dict(sorted(edge_degree_counts.items())),
        participating_nodes,
    )


def write_dataset(
    output_file: Path,
    slug: str,
    filtered_hyperedges: list[Any],
    participating_nodes: set[int | str],
    *,
    include_cuisine_label: bool,
) -> None:
    """Write a dataset file in the project's gzip text format.

    Parameters
    ----------
    output_file : Path
        Path to the output .txt.gz file to write.
    slug : str
        Dataset slug used in metadata and descriptions.
    filtered_hyperedges : list[Any]
        List of hyperedge objects to write as edges.
    participating_nodes : set[int | str]
        Set of node identifiers that should be included as nodes.
    include_cuisine_label : bool
        If True, include the hyperedge "label" as a cuisine field when
        writing edges; otherwise omit cuisine information.
    """
    with gzip.open(output_file, "wt") as file:
        write_dataset_metadata(file, slug, revision)
        for node in track(nodes, description=f"Writing {slug} nodes"):
            node_id = first(node)
            if node_id in participating_nodes:
                write_node(file, node_id, ingredient=node["name"])

        for hyperedge in track(
            filtered_hyperedges, description=f"Writing {slug} edges"
        ):
            if include_cuisine_label:
                write_edge(file, hyperedge, cuisine=hyperedge["label"])
            else:
                write_edge(file, hyperedge)


node_degree_histogram, edge_degree_histogram, participating_nodes = build_statistics(
    hyperedges
)
write_dataset(
    dataset_file,
    datasheet_file.stem,
    hyperedges,
    participating_nodes,
    include_cuisine_label=True,
)
edge_label_counts = Counter(hyperedge["label"] for hyperedge in hyperedges)

update_frontmatter(
    datasheet_file,
    {
        "attachments": {
            f"revision-{revision}": {
                "ahorn": dataset_file.name,
                "hif": "cooking.hif.json.gz",
                "changelog": [
                    "Dropped hyperedges with only a single distinct ingredient.",
                    "Updated the format version to `0.3`.",
                ],
            },
        },
        "statistics": {
            "num-nodes": len(participating_nodes),
            "num-edges": len(hyperedges),
            "node-degrees": node_degree_histogram,
            "edge-degrees": edge_degree_histogram,
        },
        "edge-label-count": dict(sorted(edge_label_counts.items())),
    },
)

for label in sorted(edge_label_counts):
    slug = f"cooking-{label.replace('_', '-')}"
    child_file = root_dir / "src" / "datasets" / f"{slug}.mdx"
    filtered_hyperedges = [
        hyperedge for hyperedge in hyperedges if hyperedge["label"] == label
    ]
    node_degree_histogram, edge_degree_histogram, participating_nodes = (
        build_statistics(filtered_hyperedges)
    )

    write_dataset(
        root_dir / "public" / "datasets" / f"{slug}.txt.gz",
        slug,
        filtered_hyperedges,
        participating_nodes,
        include_cuisine_label=False,
    )

    update_frontmatter(
        child_file,
        {
            "attachments": {
                f"revision-{revision}": {
                    "ahorn": f"{slug}.txt.gz",
                    "hif": f"{slug}.hif.json.gz",
                }
            },
            "statistics": {
                "num-nodes": len(participating_nodes),
                "num-edges": len(filtered_hyperedges),
                "node-degrees": node_degree_histogram,
                "edge-degrees": edge_degree_histogram,
            },
        },
    )
