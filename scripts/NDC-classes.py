"""
Script to process the NDC-classes dataset and update the corresponding datasheet.

References
----------
https://www.cs.cornell.edu/~arb/data/NDC-classes/
"""

import gzip
import json
import re
from collections import defaultdict
from datetime import date, timedelta
from pathlib import Path

import yaml
from more_itertools import first
from rich.progress import track

from .benson import load_benson_sc_nodes, load_benson_simplices
from .utils.yaml import patch_dumper

patch_dumper()

root_dir = Path(__file__).parent.parent
dataset_file = root_dir / "public" / "datasets" / "NDC-classes.txt.gz"
datasheet_file = root_dir / "src" / "datasets" / "NDC-classes.mdx"

nodes = load_benson_sc_nodes(root_dir / "data" / "NDC-classes-full")
hyperedges = load_benson_simplices(root_dir / "data" / "NDC-classes-full")

# write dataset file
daily_hyperedges = defaultdict(list)
with gzip.open(dataset_file, "wt") as f:
    f.write(json.dumps({"_format_version": "0.1"}) + "\n")

    for node in track(nodes, description="Writing nodes"):
        f.write(f"{first(node.elements)} {json.dumps({'category': node['label']})}\n")

    for hyperedge in track(hyperedges, description="Writing simplices"):
        # TODO: The timestamp format is not clear to me. ChatGPT suggested that it
        # could be .NET like timestamp in milliseconds since year 1.
        ms = int(hyperedge["time"])
        day = date(1, 1, 1) + timedelta(milliseconds=ms)
        daily_hyperedges[day].append(hyperedge)
        f.write(
            f"{','.join(map(str, hyperedge.elements))} {json.dumps(hyperedge._attributes)}\n"
        )

# calculate shapes for each day
num_hyperedges = {}
for day, hyperedges_on_day in daily_hyperedges.items():
    num_hyperedges[day] = len(hyperedges_on_day)

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

frontmatter["statistics"] = {
    "num-nodes": len(nodes),
    "num-edges": len(hyperedges),
}

frontmatter["attachments"] = {
    "dataset": {
        "url": dataset_file.name,
        "size": dataset_file.stat().st_size,
    }
}

frontmatter["shape"] = {str(day): shape for day, shape in num_hyperedges.items()}

with datasheet_file.open("w") as f:
    f.write("---\n")
    yaml.dump(frontmatter, f, sort_keys=False)
    f.write("---\n")
    f.write(body)
