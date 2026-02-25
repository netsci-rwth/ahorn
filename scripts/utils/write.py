"""Utility functions for writing network data to files.

This module provides functions to write network metadata and related
information in various formats.
"""

import json
from datetime import datetime
from pathlib import Path
from typing import TYPE_CHECKING, Any, TextIO

import yaml

from .yaml import Dumper, read_frontmatter

if TYPE_CHECKING:
    from collections.abc import Iterable


def _format_attributes(attributes: dict[Any, Any]) -> dict[Any, Any]:
    for key, value in attributes.items():
        if isinstance(value, datetime):
            attributes[key] = value.isoformat()
    return attributes


def update_frontmatter(path: Path | str, update: dict[Any, Any]) -> None:
    """Update the frontmatter of a markdown file.

    Parameters
    ----------
    path : Path | str
        Path to the markdown file.
    update : dict[Any, Any]
        Dictionary containing the updates to apply to the frontmatter.
    """
    if isinstance(path, str):
        path = Path(path)

    with path.open("r") as file:
        content = file.read()

    frontmatter, body = read_frontmatter(content)
    if "attachments" in update:
        existing_attachments = frontmatter.get("attachments", {})
        incoming_attachments = update.get("attachments")
        merged_attachments = {**existing_attachments, **incoming_attachments}
        frontmatter["attachments"] = merged_attachments

    merged_update = {
        key: value for key, value in update.items() if key != "attachments"
    }
    frontmatter.update(merged_update)

    write_markdown(path, frontmatter, body)


def write_edge(file: TextIO, elements: Iterable[int | str], **kwargs: Any) -> None:
    """Write an edge with metadata to a file in JSON format.

    Parameters
    ----------
    file : TextIO
        File object to write the edge to.
    elements : list[int | str]
        List of node identifiers that form the edge.
    **kwargs
        Additional metadata attributes for the edge.
    """
    file.write(
        f"{','.join(map(str, elements))} {json.dumps(_format_attributes(kwargs))}\n"
    )


def write_dataset_metadata(
    file: TextIO, name: str, revision: int, format_version: str = "0.2", **kwargs: Any
) -> None:
    """Write dataset metadata to a file in JSON format.

    Parameters
    ----------
    file : TextIO
        File object to write the metadata to.
    name : str
        Name of the network.
    revision : int
        Revision number of the dataset. Must be incremented by one for each published
        update.
    format_version : str, optional
        Format version string, by default "0.1".
    **kwargs
        Additional metadata attributes.
    """
    if any(key in kwargs for key in ["name", "_format-version", "_revision"]):
        raise ValueError("Used a reserved metadata key.")

    metadata = {
        "name": name,
        **kwargs,
        "_format-version": format_version,
        "_revision": revision,
    }
    file.write(json.dumps(_format_attributes(metadata)) + "\n")


def write_network_metadata(file: TextIO, **kwargs: Any) -> None:
    """Write network metadata to a file in JSON format.

    Notice to use this method if in a multi-network dataset context. Otherwise, network
    metadata should be part of the dataset metadata in ``write_dataset_metadata``.

    Parameters
    ----------
    file : TextIO
        File object to write the metadata to.
    **kwargs
        Additional metadata attributes.
    """
    file.write(json.dumps(_format_attributes(kwargs)) + "\n")


def write_markdown(path: Path | str, frontmatter: dict[Any, Any], body: str) -> None:
    """Write a markdown file with YAML frontmatter.

    Parameters
    ----------
    path : Path | str
        Path to the markdown file.
    frontmatter : dict[Any, Any]
        Frontmatter data as a dictionary.
    body : str
        Body content of the markdown file.
    """
    if isinstance(path, str):
        path = Path(path)

    with path.open("w") as file:
        file.write("---\n")
        yaml.dump(frontmatter, file, sort_keys=False, Dumper=Dumper)
        file.write("---\n")
        file.write(body)


def write_node(file: TextIO, node: int | str, **kwargs: Any) -> None:
    """Write a node with metadata to a file in JSON format.

    Parameters
    ----------
    file : TextIO
        File object to write the node to.
    node : int | str
        Node identifier.
    **kwargs
        Additional metadata attributes for the node.
    """
    file.write(f"{node} {json.dumps(_format_attributes(kwargs))}\n")
