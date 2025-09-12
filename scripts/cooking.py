"""
Script to process the COOKING dataset and update the corresponding datasheet.

References
----------
https://www.cs.cornell.edu/~arb/data/cat-edge-Cooking/
"""

import json
import re
from collections import Counter
from pathlib import Path

import toponetx as tnx
import yaml
from more_itertools import first
from rich.progress import track

from .utils.yaml import patch_dumper

patch_dumper()

root_dir = Path(__file__).parent.parent
dataset_file = root_dir / "public" / "datasets" / "cooking.txt"
datasheet_file = root_dir / "src" / "datasets" / "cooking.mdx"

nodes, hyperedges = tnx.datasets.benson.load_benson_hyperedges(
    root_dir / "data" / "cat-edge-Cooking"
)

# write dataset file
with dataset_file.open("w") as f:
    f.write(json.dumps({"_format_version": "0.1"}) + "\n")
    for node in track(nodes, description="Writing nodes"):
        f.write(str(first(node)) + ' {"ingredient": "' + node["name"] + '"}\n')
    for hyperedge in track(hyperedges, description="Writing hyperedges"):
        f.write(
            ",".join(map(str, hyperedge.elements))
            + ' {"cuisine": "'
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
