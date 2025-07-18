"""Validation script to ensure that a dataset is correctly formatted."""

import gzip
import json
import logging
from argparse import ArgumentParser
from pathlib import Path

parser = ArgumentParser(description="Dataset validation script")
parser.add_argument("dataset", type=Path, help="Path to the dataset file")
args = parser.parse_args()

dataset: Path = args.dataset

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger()

# dataset must be a txt or gzipped txt file
if not (dataset.suffix == ".txt" or dataset.name.endswith(".txt.gz")):
    logger.error("Dataset must be a .txt or .txt.gz file.")
    exit(1)

if dataset.name.endswith(".txt.gz"):
    file = gzip.open(dataset, mode="rt")  # noqa: SIM115
else:
    file = dataset.open(mode="r")
lines = file.readlines()

# first line must be network-level metadata
try:
    json.loads(lines[0])
except json.JSONDecodeError:
    logger.error("First line of the dataset must be valid JSON metadata.")
    exit(1)
