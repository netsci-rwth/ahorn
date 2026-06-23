"""
Script to process the music-blues-reviews dataset and update the corresponding datasheet.

References
----------
https://www.cs.cornell.edu/~arb/data/cat-edge-music-blues-reviews/
"""

from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

from more_itertools import first
from rich.progress import track
from slugify import slugify

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
dataset_file = root_dir / "public" / "datasets" / "music-blues-reviews.txt"
datasheet_file = root_dir / "src" / "datasets" / "music-blues-reviews.mdx"
revision = 3

nodes, hyperedges = load_benson_hyperedges(
    root_dir / "data" / "cat-edge-music-blues-reviews"
)


def build_statistics(
    filtered_hyperedges: list[Any],
) -> tuple[dict[int, int], dict[int, int], set[int | str]]:
    """Build statistics from filtered hyperedges."""
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
    include_genre_label: bool,
    include_isolated_nodes: bool,
) -> None:
    """Write an AHORN dataset artifact for the parent or a genre subset."""
    with output_file.open("w") as file:
        write_dataset_metadata(file, slug, revision)
        if include_isolated_nodes:
            for node in track(nodes, description=f"Writing {slug} nodes"):
                node_id = first(node)
                if node_id in participating_nodes:
                    continue
                write_node(file, node_id)

        for hyperedge in track(
            filtered_hyperedges, description=f"Writing {slug} hyperedges"
        ):
            if include_genre_label:
                write_edge(file, hyperedge, genre=hyperedge["label"])
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
    include_genre_label=True,
    include_isolated_nodes=True,
)
edge_label_counts = Counter(hyperedge["label"] for hyperedge in hyperedges)

update_frontmatter(
    datasheet_file,
    {
        "attachments": {
            f"revision-{revision}": {"ahorn": dataset_file.name},
        },
        "statistics": {
            "num-nodes": len(nodes),
            "num-interactions": len(hyperedges),
            "node-degrees": node_degree_histogram,
            "edge-degrees": edge_degree_histogram,
        },
        "edge-label-count": dict(edge_label_counts),
    },
)

for label in sorted(edge_label_counts):
    slug = f"music-blues-reviews-{slugify(label)}"
    filtered_hyperedges = [
        hyperedge for hyperedge in hyperedges if hyperedge["label"] == label
    ]
    node_degree_histogram, edge_degree_histogram, participating_nodes = (
        build_statistics(filtered_hyperedges)
    )

    write_dataset(
        root_dir / "public" / "datasets" / f"{slug}.txt",
        slug,
        filtered_hyperedges,
        participating_nodes,
        include_genre_label=False,
        include_isolated_nodes=False,
    )

    update_frontmatter(
        root_dir / "src" / "datasets" / f"{slug}.mdx",
        {
            "attachments": {
                f"revision-{revision}": {"ahorn": f"{slug}.txt"},
            },
            "statistics": {
                "num-nodes": len(participating_nodes),
                "num-interactions": len(filtered_hyperedges),
                "node-degrees": node_degree_histogram,
                "edge-degrees": edge_degree_histogram,
            },
        },
    )
