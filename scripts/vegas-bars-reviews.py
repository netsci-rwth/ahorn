"""
Script to process the vegas-bars-reviews dataset and update the corresponding datasheet.

References
----------
https://www.cs.cornell.edu/~arb/data/cat-edge-vegas-bars-reviews/
"""

import json
import re
import sys
from collections import Counter
from itertools import chain
from pathlib import Path

sys.path.append("..")

import yaml
from more_itertools import first
from rich.progress import track

from .benson import load_benson_hyperedges
from .utils.yaml import patch_dumper

patch_dumper()

root_dir = Path(__file__).parent.parent
dataset_file = root_dir / "public" / "datasets" / "vegas-bars-reviews.txt"
datasheet_file = root_dir / "src" / "datasets" / "vegas-bars-reviews.mdx"

nodes, hyperedges = load_benson_hyperedges(
    root_dir / "data" / "cat-edge-vegas-bars-reviews"
)

# write dataset file
covered_nodes = set(chain.from_iterable(hyperedge.elements for hyperedge in hyperedges))
with dataset_file.open("w") as f:
    f.write(json.dumps({"_format_version": "0.1"}) + "\n")
    for node in track(map(first, nodes), description="Writing nodes"):
        if node in covered_nodes:
            continue
        f.write(f"{node}\n")
    for hyperedge in track(hyperedges, description="Writing hyperedges"):
        f.write(
            ",".join(map(str, hyperedge.elements))
            + ' {"genre": "'
            + hyperedge["label"]
            + '"}\n'
        )

edge_label_counts = Counter(x["label"] for x in hyperedges)

# write shape into existing frontmatter
with datasheet_file.open() as f:
    content = f.read()

frontmatter_match = re.match(r"---\n(.*?)\n---\n(.*)", content, re.DOTALL)
if frontmatter_match:
    frontmatter = yaml.safe_load(frontmatter_match.group(1))
    body = frontmatter_match.group(2)

    if not isinstance(body, str):
        body = ""
else:
    frontmatter = {}
    body = content

frontmatter["attachments"] = {
    "dataset": {
        "url": dataset_file.name,
        "size": dataset_file.stat().st_size,
    }
}

frontmatter["statistics"] = {
    "num-nodes": len(nodes),
}

frontmatter["shape"] = {
    "nodes": len(nodes),
    "hyperedges": len(hyperedges),
}
frontmatter["edge-label-count"] = dict(edge_label_counts)

with datasheet_file.open("w") as f:
    f.write("---\n")
    yaml.dump(frontmatter, f, sort_keys=False)
    f.write("---\n")
    f.write(body)
