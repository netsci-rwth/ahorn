"""
Script to process the contact-primary-school dataset and update the corresponding datasheet.

References
----------
https://www.cs.cornell.edu/~arb/data/contact-primary-school/
"""

import json
import re
from collections import defaultdict
from datetime import UTC, datetime
from pathlib import Path

import toponetx as tnx
import yaml
from rich.progress import track

from .utils.yaml import patch_dumper

patch_dumper()

root_dir = Path(__file__).parent.parent
dataset_file = root_dir / "public" / "datasets" / "contact-primary-school.txt"
datasheet_file = root_dir / "src" / "datasets" / "contact-primary-school.mdx"

simplices = tnx.datasets.load_benson_simplices(
    root_dir / "data" / "contact-primary-school"
)

# write dataset file
with dataset_file.open("w") as f:
    f.write(json.dumps({"_format_version": "0.1"}) + "\n")
    for simplex in track(simplices, description="Writing simplices"):
        f.write(
            ",".join(map(str, simplex.elements))
            + ' {"time": "'
            + str(datetime.fromtimestamp(simplex["time"], tz=UTC))
            + '"}\n'
        )

# aggregate temporal simplices by hour
hourly_simplices = defaultdict(list)
for simplex in track(simplices, description="Aggregating Simplices"):
    hour = datetime.fromtimestamp(simplex["time"], tz=UTC).strftime("%Y-%m-%d %H")
    hourly_simplices[hour].append(simplex)

# create a SimplicialComplex for each hour
hourly_complexes = {}
for hour, hour_simplices in track(
    hourly_simplices.items(), description="Creating Complexes"
):
    hourly_complexes[hour] = tnx.SimplicialComplex(hour_simplices)

# calculate shapes for each hour
shapes = {}
for hour, simplicial_complex in hourly_complexes.items():
    shapes[hour] = simplicial_complex.shape

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
    datetime.strptime(hour, "%Y-%m-%d %H")
    .replace(tzinfo=UTC)
    .strftime("%Y-%m-%d %H:%M:%S"): list(shape)
    for hour, shape in shapes.items()
}


with datasheet_file.open("w") as f:
    f.write("---\n")
    yaml.dump(frontmatter, f, sort_keys=False)
    f.write("---\n")
    f.write(body)
