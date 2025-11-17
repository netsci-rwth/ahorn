"""
Script to process the coauth-MAG-History dataset and update the corresponding datasheet.

References
----------
https://www.cs.cornell.edu/~arb/data/coauth-MAG-History/
"""

import gzip
import json
import re
from collections import Counter, defaultdict
from pathlib import Path

import yaml
from more_itertools import first
from rich.progress import track

from .benson import load_benson_sc_nodes, load_benson_simplices
from .utils.yaml import patch_dumper

patch_dumper()

root_dir = Path(__file__).parent.parent
dataset_file = root_dir / "public" / "datasets" / "coauth-MAG-History.txt.gz"
datasheet_file = root_dir / "src" / "datasets" / "coauth-MAG-History.mdx"

nodes = load_benson_sc_nodes(root_dir / "data" / "coauth-MAG-History-full")
hyperedges = load_benson_simplices(root_dir / "data" / "coauth-MAG-History-full")

# write dataset file
yearly_hyperedges = defaultdict(list)
degrees = defaultdict(int)
with gzip.open(dataset_file, "wt") as f:
    f.write(json.dumps({"_format_version": "0.1"}) + "\n")

    for node in track(nodes, description="Writing nodes"):
        f.write(f"{first(node.elements)} {json.dumps({'substance': node['label']})}\n")

    for hyperedge in track(hyperedges, description="Writing simplices"):
        yearly_hyperedges[hyperedge["time"]].append(hyperedge)
        # update node degrees
        for nid in hyperedge.elements:
            degrees[nid] += 1
        f.write(
            f"{','.join(map(str, hyperedge.elements))} {json.dumps({'year': hyperedge['time']})}\n"
        )

# calculate shapes for each year
num_hyperedges = {}
for year, hyperedges_in_year in yearly_hyperedges.items():
    num_hyperedges[year] = len(hyperedges_in_year)

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

degree_histogram = Counter(degrees.values())
frontmatter["statistics"] = {
    "num-nodes": len(nodes),
    "num-edges": len(hyperedges),
    "node-degrees": dict(sorted(degree_histogram.items())),
}

frontmatter["attachments"] = {
    "dataset": {
        "url": dataset_file.name,
        "size": dataset_file.stat().st_size,
    }
}

frontmatter["shape"] = {str(year): shape for year, shape in num_hyperedges.items()}

with datasheet_file.open("w") as f:
    f.write("---\n")
    yaml.dump(frontmatter, f, sort_keys=False)
    f.write("---\n")
    f.write(body)
