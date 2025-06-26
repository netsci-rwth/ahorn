"""
Script to process the house-committees dataset and update the corresponding datasheet.

References
----------
https://www.cs.cornell.edu/~arb/data/house-committees/
"""

import re
from collections import Counter
from pathlib import Path

import toponetx as tnx
import yaml
from rich.progress import track

from .utils.yaml import patch_dumper

patch_dumper()

root_dir = Path(__file__).parent.parent
dataset_file = root_dir / "public" / "datasets" / "house-committees.txt"
datasheet_file = root_dir / "src" / "datasets" / "house-committees.mdx"

nodes, hyperedges = tnx.datasets.benson.load_benson_hyperedges(
    root_dir / "data" / "house-committees"
)

# write dataset file
with dataset_file.open("w") as f:
    for node in track(nodes, description="Writing nodes"):
        f.write(
            ",".join(map(str, node.elements)) + ' {"party": "' + node["label"] + '"}\n'
        )
    for hyperedge in track(hyperedges, description="Writing hyperedges"):
        f.write(",".join(map(str, hyperedge.elements)) + "\n")

label_counts = Counter(x["label"] for x in nodes)

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

frontmatter["attachments"] = [
    {
        "file": dataset_file.name,
        "size": dataset_file.stat().st_size,
    }
]

frontmatter["shape"] = {
    "nodes": len(nodes),
    "hyperedges": len(hyperedges),
}
frontmatter["label-count"] = dict(label_counts)

with datasheet_file.open("w") as f:
    f.write("---\n")
    yaml.dump(frontmatter, f, sort_keys=False)
    f.write("---\n")
    f.write(body)
