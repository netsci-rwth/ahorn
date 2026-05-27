"""Convert AHORN line-format datasets to HIF JSON.

The converter intentionally supports only the AHORN datasets that can be represented
without loss in the current HIF schema: hypergraphs and abstract simplicial complexes.
Multi-network files and cell/combinatorial-complex-only datasets are unsupported.
"""

import argparse
import gzip
import json
import urllib.request
from dataclasses import dataclass
from functools import cache
from pathlib import Path
from typing import Any

from ahorn_loader.model import DatasetMetadata, Edge, Node
from ahorn_loader.validator import Validator


class HifConversionError(ValueError):
    """Raised when an AHORN dataset cannot be converted to HIF."""


@dataclass(frozen=True)
class AhornEntry:
    """One parsed AHORN node or interaction entry."""

    elements: tuple[str, ...]
    attrs: dict[str, Any]


@dataclass(frozen=True)
class AhornDataset:
    """Parsed AHORN dataset pieces needed for HIF conversion."""

    metadata: dict[str, Any]
    nodes: list[AhornEntry]
    edges: list[AhornEntry]


def _open_text(path: Path, mode: str):
    if path.name.endswith(".gz"):
        return gzip.open(path, mode, encoding="utf-8")
    return path.open(mode, encoding="utf-8")


@cache
def _hif_schema() -> dict[str, Any]:
    url = "https://raw.githubusercontent.com/pszufe/HIF-standard/main/schemas/hif_schema.json"
    with urllib.request.urlopen(url) as response:  # noqa: S310
        return json.loads(response.read().decode("utf-8"))


def _load_json_object(raw: str, *, line_number: int) -> dict[str, Any]:
    try:
        value = json.loads(raw)
    except json.JSONDecodeError as error:
        raise HifConversionError(
            f"Line {line_number}: expected JSON metadata, got invalid JSON."
        ) from error

    if not isinstance(value, dict):
        raise HifConversionError(f"Line {line_number}: metadata must be a JSON object.")

    return value


def _validate_metadata(metadata: dict[str, Any], *, line_number: int) -> None:
    try:
        DatasetMetadata.model_validate(metadata)
    except ValueError as error:
        raise HifConversionError(
            f"Line {line_number}: invalid AHORN dataset metadata."
        ) from error


def _validate_entry(
    elements: tuple[str, ...],
    attrs: dict[str, Any],
    *,
    is_node: bool,
    line_number: int,
) -> None:
    model = Node if is_node else Edge
    value = (
        {"id": elements[0], "metadata": attrs}
        if is_node
        else {"elements": list(elements), "metadata": attrs}
    )
    try:
        model.model_validate(value)
    except ValueError as error:
        entry_type = "node" if is_node else "edge"
        raise HifConversionError(
            f"Line {line_number}: invalid AHORN {entry_type} entry."
        ) from error


def _parse_entry(raw: str, *, line_number: int, is_node: bool) -> AhornEntry:
    parts = raw.strip().split(maxsplit=1)
    if len(parts) != 2:
        raise HifConversionError(
            f"Line {line_number}: expected '<elements> <json-metadata>'."
        )

    elements_raw = parts[0]
    attrs = _load_json_object(parts[1], line_number=line_number)
    elements = tuple(element.strip() for element in elements_raw.split(","))
    if any(not element for element in elements):
        raise HifConversionError(
            f"Line {line_number}: empty node identifiers are invalid."
        )
    _validate_entry(elements, attrs, is_node=is_node, line_number=line_number)

    return AhornEntry(elements=elements, attrs=attrs)


def _network_type(network_types: list[str] | tuple[str, ...]) -> str:
    values = set(network_types)
    if "hypergraph" in values:
        return "undirected"
    if "simplicial-complex" in values:
        return "asc"
    raise HifConversionError(
        "HIF export is only supported for hypergraph or simplicial-complex datasets."
    )


def _split_weight(attrs: dict[str, Any]) -> tuple[float | int | None, dict[str, Any]]:
    copied = dict(attrs)
    weight = copied.pop("weight", None)
    if isinstance(weight, bool):
        copied["weight"] = weight
        return None, copied
    if isinstance(weight, int | float):
        return weight, copied
    if weight is not None:
        copied["weight"] = weight
    return None, copied


def _with_attrs(target: dict[str, Any], attrs: dict[str, Any]) -> dict[str, Any]:
    weight, remaining_attrs = _split_weight(attrs)
    if weight is not None:
        target["weight"] = weight
    if remaining_attrs:
        target["attrs"] = remaining_attrs
    return target


def _load_ahorn_dataset(path: Path) -> AhornDataset:
    validator = Validator()
    line_iterator = validator._iter_lines(path)
    try:
        try:
            first_line = next(line_iterator).strip()
        except StopIteration as error:
            raise HifConversionError("AHORN dataset is empty.") from error

        metadata = _load_json_object(first_line, line_number=1)
        _validate_metadata(metadata, line_number=1)
        if int(metadata.get("num-networks", 1)) != 1:
            raise HifConversionError(
                "HIF export does not support AHORN multi-network files."
            )

        nodes: list[AhornEntry] = []
        edges: list[AhornEntry] = []
        has_seen_edge = False
        for line_number, line in enumerate(line_iterator, start=2):
            stripped = line.strip()
            if not stripped:
                continue
            if stripped.startswith("{"):
                raise HifConversionError(
                    "HIF export does not support AHORN multi-network files."
                )
            is_node = "," not in stripped.split(maxsplit=1)[0]
            if is_node and has_seen_edge:
                raise HifConversionError(
                    f"Line {line_number}: node entries must appear before edge entries."
                )
            has_seen_edge = has_seen_edge or not is_node
            entry = _parse_entry(stripped, line_number=line_number, is_node=is_node)
            if is_node:
                nodes.append(entry)
            else:
                edges.append(entry)
    except OSError as error:
        raise HifConversionError(f"Could not read AHORN dataset {path}.") from error
    finally:
        line_iterator.close()

    return AhornDataset(metadata=metadata, nodes=nodes, edges=edges)


def convert_ahorn_to_hif(
    input_path: Path | str,
    *,
    network_types: list[str] | tuple[str, ...],
) -> dict[str, Any]:
    """Convert an AHORN dataset to a HIF document."""
    if isinstance(input_path, str):
        input_path = Path(input_path)

    hif_network_type = _network_type(network_types)
    dataset = _load_ahorn_dataset(input_path)

    explicit_nodes: dict[str, dict[str, Any]] = {}
    implicit_nodes: list[str] = []
    seen_nodes: set[str] = set()
    edges: list[dict[str, Any]] = []
    incidences: list[dict[str, Any]] = []

    for entry in dataset.nodes:
        node = entry.elements[0]
        explicit_nodes[node] = entry.attrs
        seen_nodes.add(node)

    for entry in dataset.edges:
        edge_id = len(edges) + 1
        edges.append(_with_attrs({"edge": edge_id}, entry.attrs))
        for node in entry.elements:
            if node not in seen_nodes:
                seen_nodes.add(node)
                implicit_nodes.append(node)
            incidences.append({"edge": edge_id, "node": node})

    node_entries = [
        _with_attrs({"node": node}, attrs) for node, attrs in explicit_nodes.items()
    ]
    node_entries.extend(
        {"node": node} for node in implicit_nodes if node not in explicit_nodes
    )

    hif = {
        "network-type": hif_network_type,
        "metadata": {"ahorn": dataset.metadata},
        "nodes": node_entries,
        "edges": edges,
        "incidences": incidences,
    }
    validate_hif_document(hif)
    return hif


def validate_hif_document(hif: dict[str, Any]) -> None:
    """Validate the generated subset against the vendored HIF schema shape."""
    schema = _hif_schema()
    allowed_top_level = set(schema["properties"])
    required_top_level = set(schema.get("required", []))
    extra_top_level = set(hif) - allowed_top_level
    if extra_top_level:
        raise HifConversionError(
            f"Invalid HIF top-level keys: {sorted(extra_top_level)}"
        )
    missing_top_level = required_top_level - set(hif)
    if missing_top_level:
        raise HifConversionError(
            f"Missing HIF top-level keys: {sorted(missing_top_level)}"
        )

    network_type_schema = schema["properties"]["network-type"]
    if hif.get("network-type") not in network_type_schema["enum"]:
        raise HifConversionError(
            "HIF network-type must be undirected, directed, or asc."
        )
    if "metadata" in hif and not isinstance(hif["metadata"], dict):
        raise HifConversionError("HIF metadata must be an object.")

    for field in ("nodes", "edges", "incidences"):
        if field in hif and not isinstance(hif[field], list):
            raise HifConversionError(f"HIF {field} must be an array.")

    _validate_items("nodes", hif.get("nodes", []))
    _validate_items("edges", hif.get("edges", []))
    _validate_items("incidences", hif["incidences"])


def _validate_items(key: str, items: list[Any]) -> None:
    item_schema = _hif_schema()["properties"][key]["items"]
    allowed = set(item_schema["properties"])
    required_keys = tuple(item_schema.get("required", []))
    for item in items:
        if not isinstance(item, dict):
            raise HifConversionError("HIF array entries must be objects.")
        missing = [key for key in required_keys if key not in item]
        if missing:
            raise HifConversionError(f"HIF entry missing required keys: {missing}")
        extra = set(item) - allowed
        if extra:
            raise HifConversionError(
                f"HIF entry contains invalid keys: {sorted(extra)}"
            )
        if "attrs" in item and not isinstance(item["attrs"], dict):
            raise HifConversionError("HIF attrs values must be objects.")
        if "weight" in item and not isinstance(item["weight"], int | float):
            raise HifConversionError("HIF weight values must be numeric.")


def write_hif_document(hif: dict[str, Any], output_path: Path | str) -> None:
    """Write HIF JSON, using gzip when the output path ends in ``.gz``."""
    if isinstance(output_path, str):
        output_path = Path(output_path)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with _open_text(output_path, "wt") as handle:
        json.dump(hif, handle, sort_keys=True, separators=(",", ":"))
        handle.write("\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument(
        "--network-type",
        action="append",
        required=True,
        dest="network_types",
        help="AHORN network type from dataset frontmatter. Repeat for multiple types.",
    )
    args = parser.parse_args()

    hif = convert_ahorn_to_hif(args.input, network_types=args.network_types)
    write_hif_document(hif, args.output)
