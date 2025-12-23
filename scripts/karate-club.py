"""
Script to process the karate club graph via clique lifting and update the datasheet.

References
----------
W. W. Zachary. An Information Flow Model for Conflict and Fission in Small Groups.
Journal of Anthropological Research, 33(4):452-473, 1977. doi:10.1016/0378-8733(77)90002-6.
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
dataset_file = root_dir / "public" / "datasets" / "karate-club.txt"
datasheet_file = root_dir / "src" / "datasets" / "karate-club.mdx"

G = nx.karate_club_graph()
clique_complex = tnx.graph_to_clique_complex(G)

# write dataset file
with dataset_file.open("w") as f:
    write_dataset_metadata(f, datasheet_file.stem)

    for node, data in track(G.nodes(data=True), description="Writing nodes"):
        write_node(f, node, **data)

    simplices = sorted(
        clique_complex.simplices,
        key=lambda s: (len(s), tuple(sorted(s))),
    )
    for simplex in track(simplices, description="Writing cliques"):
        if len(simplex) == 1:
            continue
        elif len(simplex) == 2:
            u, v = tuple(simplex)
            write_edge(f, simplex, weight=G[u][v]["weight"])
        else:
            write_edge(f, simplex)

update_frontmatter(
    datasheet_file,
    {
        "statistics": {
            "num-nodes": G.number_of_nodes(),
            "num-edges": sum(islice(clique_complex.shape, 1, None)),
        },
        "shape": list(clique_complex.shape),
        "attachments": {
            "dataset": {
                "url": dataset_file.name,
                "size": dataset_file.stat().st_size,
            }
        },
    },
)
