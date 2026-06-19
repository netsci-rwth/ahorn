"""
Script to process the Florentine families graph via clique lifting and update the datasheet.

References
----------
Ronald L. Breiger and Philippa E. Pattison. Cumulated social roles: The duality
of persons and their algebras. Social Networks, 8(3):215-256, 1986.
"""

from itertools import islice
from pathlib import Path

import networkx as nx
import toponetx as tnx
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
dataset_file = root_dir / "public" / "datasets" / "florentine-families.txt"
datasheet_file = root_dir / "src" / "datasets" / "florentine-families.mdx"
revision = 1

G = nx.florentine_families_graph()
node_degree_histogram = {
    d: count for d, count in enumerate(nx.degree_histogram(G)) if count > 0
}

clique_complex = tnx.graph_to_clique_complex(G)

# write dataset file
with dataset_file.open("w") as f:
    write_dataset_metadata(f, datasheet_file.stem, revision)

    for node, data in track(G.nodes(data=True), description="Writing nodes"):
        write_node(f, node, **data)

    simplices = sorted(
        clique_complex.simplices,
        key=lambda s: (len(s), tuple(sorted(s))),
    )
    for simplex in track(simplices, description="Writing cliques"):
        simplex = tuple(sorted(simplex))
        if len(simplex) == 1:
            continue
        write_edge(f, simplex)

update_frontmatter(
    datasheet_file,
    {
        "statistics": {
            "num-nodes": G.number_of_nodes(),
            "num-edges": sum(islice(clique_complex.shape, 1, None)),
            "node-degrees": node_degree_histogram,
        },
        "shape": list(clique_complex.shape),
        "attachments": {
            f"revision-{revision}": {"ahorn": dataset_file.name},
        },
    },
)
