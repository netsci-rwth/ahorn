"""
Script to process the congress-bills dataset and update the corresponding datasheet.

References
----------
https://www.cs.cornell.edu/~arb/data/congress-bills/
"""

import gzip
from collections import defaultdict
from datetime import UTC, datetime
from pathlib import Path

import toponetx as tnx
from rich.progress import track

from .utils.write import update_frontmatter, write_dataset_metadata, write_edge
from .utils.yaml import patch_dumper

# TODO: Dataset is too big.
raise RuntimeError

patch_dumper()

root_dir = Path(__file__).parent.parent
dataset_file = root_dir / "public" / "datasets" / "congress-bills.txt.gz"
datasheet_file = root_dir / "src" / "datasets" / "congress-bills.mdx"

simplices = tnx.datasets.load_benson_simplices(root_dir / "data" / "congress-bills")

# write dataset file
with gzip.open(dataset_file, "wt") as f:
    write_dataset_metadata(f, datasheet_file.stem)
    for simplex in simplices:
        write_edge(f, simplex, time=datetime.fromtimestamp(simplex["time"], tz=UTC))

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

update_frontmatter(
    datasheet_file,
    {
        "attachments": {
            "dataset": {
                "url": dataset_file.name,
                "size": dataset_file.stat().st_size,
            }
        },
        "shape": {
            datetime.strptime(hour, "%Y-%m-%d %H")
            .replace(tzinfo=UTC)
            .strftime("%Y-%m-%d %H:%M:%S"): list(shape)
            for hour, shape in shapes.items()
        },
    },
)
