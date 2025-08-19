"""Load Austin R. Benson's datasets.

This module provides functions to load the datasets by Austin R. Benson, published on
his website:

    https://www.cs.cornell.edu/~arb/data/

A dataset is stored in a folder with the following mandatory files:

- ``{name}-nverts.txt``: Line ``i`` contains the number of vertices in the ``i``-th simplex.

- ``{name}-simplices.txt``: Each line contains a vertex ID. Line 1 corresponds to the
  first vertex of the first simplex, line 2 to the second vertex of the first simplex,
  and so on.

Optionally, additional files can be present and are consumed by the functions in this
module:

- ``{name}-times.txt``: Line ``i`` contains the timestamp of the ``i``-th simplex.
"""

import warnings
from collections.abc import Callable, Iterable
from itertools import chain
from pathlib import Path
from typing import Any

from more_itertools import spy
from toponetx.classes import Atom
from toponetx.classes.simplex import Simplex

__all__ = ["load_benson_hyperedges", "load_benson_simplices"]


def _validate_folder(folder: Path) -> str:
    """Validate that the given folder contains a valid Benson dataset.

    Parameters
    ----------
    folder : Path
        Path to the folder containing the dataset.

    Returns
    -------
    str
        The name of the dataset (the folder name).

    Raises
    ------
    ValueError
        If the folder does not exist or is not in the expected format.
    """
    if not folder.exists() or not folder.is_dir():
        raise ValueError(f"Folder `{folder}` does not exist.")

    name = folder.name

    mandatory_files = [f"{name}-nverts.txt", f"{name}-simplices.txt"]
    if not all((folder / file).exists() for file in mandatory_files):
        raise ValueError(f"Folder `{folder}` is not in an expected format.")

    return name


def _infer_hyperedge_filenames(
    folder: Path,
) -> tuple[str | None, str | None, str | None, str, str | None, str | None]:
    """Infer the filenames for hyperedges in the Benson dataset format.

    Parameters
    ----------
    folder : Path
        Path to the folder containing the dataset.

    Returns
    -------
    node_names_file : str, optional
        The filename for the node names.
    node_labels_file : str
        The filename for the node labels.
    node_label_names_file : str, optional
        The filename for the node label names.
    hyperedges_file : str
        The filename for the hyperedges.
    hyperedge_labels_file : str
        The filename for the hyperedge labels.
    hyperedge_label_names_file : str, optional
        The filename for the hyperedge label names.

    Raises
    ------
    ValueError
        If the folder is not in the expected format or does not contain the required
        files.
    """
    name = folder.name

    if (folder / f"node-names-{name}.txt").exists():
        node_names_file = f"node-names-{name}.txt"
    elif (folder / "node-labels.txt").exists():
        # For the categorical edge datasets, the node names are stored in the
        # `node-labels.txt` file...
        node_names_file = "node-labels.txt"
    else:
        node_names_file = None

    if (folder / f"node-labels-{name}.txt").exists():
        node_labels_file = f"node-labels-{name}.txt"
    else:
        node_labels_file = None

    if (folder / f"label-names-{name}.txt").exists():
        node_label_names_file = f"label-names-{name}.txt"
    elif (folder / "label-names.txt").exists():
        node_label_names_file = "label-names.txt"
    else:
        node_label_names_file = None

    if (folder / f"hyperedges-{name}.txt").exists():
        hyperedges_file = f"hyperedges-{name}.txt"
    elif (folder / "hyperedges.txt").exists():
        hyperedges_file = "hyperedges.txt"
    else:
        raise ValueError(f"Folder `{folder}` does not contain hyperedges.")

    if (folder / f"hyperedge-labels-{name}.txt").exists():
        hyperedge_labels_file = f"hyperedge-labels-{name}.txt"
    elif (folder / "hyperedge-labels.txt").exists():
        hyperedge_labels_file = "hyperedge-labels.txt"
    else:
        hyperedge_labels_file = None

    if (folder / f"hyperedge-label-names-{name}.txt").exists():
        hyperedge_label_names_file = f"hyperedge-label-names-{name}.txt"
    elif (folder / "hyperedge-label-names.txt").exists():
        hyperedge_label_names_file = "hyperedge-label-names.txt"
    elif (folder / "hyperedge-label-identities.txt").exists():
        hyperedge_label_names_file = "hyperedge-label-identities.txt"
    else:
        hyperedge_label_names_file = None

    return (
        node_names_file,
        node_labels_file,
        node_label_names_file,
        hyperedges_file,
        hyperedge_labels_file,
        hyperedge_label_names_file,
    )


def _attach_labels(
    file: Iterable[str], atoms: Iterable[Atom], label_list: list[str] | None
) -> None:
    """Attach labels to atoms from a file.

    Parameters
    ----------
    file : Iterable[str]
        An iterable of lines from the labels file.
    atoms : dict[int, Atom]
        A dictionary mapping node IDs to `Atom` instances.
    label_list : list[str] | None
        A list of label names, if available. If `None`, labels are not mapped.
    """
    label_fn: Callable[[str], Any] = (
        (lambda x: label_list[int(x) - 1]) if label_list is not None else lambda x: x
    )

    first_lines, file_iter = spy(file, 10)
    is_multilabel = any("," in line for line in first_lines)

    if is_multilabel:
        for atom, line in zip(atoms, file_iter, strict=True):
            atom["label"] = [label_fn(label) for label in line.strip().split(",")]
    else:
        for atom, line in zip(atoms, file_iter, strict=True):
            atom["label"] = label_fn(line.strip())


def load_benson_hyperedges(folder: Path | str) -> tuple[list[Simplex], list[Simplex]]:
    """Load hyperedge data from the Benson dataset format.

    Parameters
    ----------
    folder : Path | str
        Path to the folder containing the dataset.

    Returns
    -------
    nodes : list[Simplex]
        List of nodes in the dataset, each represented as a `Simplex` with a single
        vertex and associated name and label.
    simplices : list[Simplex]
        List of hyperedges in the dataset.

    Raises
    ------
    ValueError
        If the folder does not exist or is not in the expected format.
    """
    if not isinstance(folder, Path):
        folder = Path(folder)

    if not folder.exists() or not folder.is_dir():
        raise ValueError(f"Folder `{folder}` does not exist.")

    (
        node_names_file,
        node_labels_file,
        node_label_names_file,
        hyperedges_file,
        hyperedge_labels_file,
        hyperedge_label_names_file,
    ) = _infer_hyperedge_filenames(folder)

    # The initialization of the `nodes` list is rather complicated because the nodes
    # can only be inferred indirectly from different places, depending on the dataset:
    # 1. If a `node_names_file` is present, it contains the node names and IDs.
    # 2. If a `node_labels_file` is present, it contains the node labels, which are
    #    attached to the nodes. The nodes [1..n] can be inferred by the number of
    #    labels.
    # 3. If neither is the case, the nodes are inferred from the hyperedges. In this
    #    case, there cannot be a non-connected node.
    nodes: list[Simplex] = []

    if node_names_file is not None:
        with (folder / node_names_file).open() as file:
            # Read first line to check for a header line. In that case node ids are not
            # consecutive.
            first_lines, file = spy(file, 1)
            if first_lines[0].strip() == "node_id\tname":
                next(file)
                nodes = [
                    Simplex(
                        [int(line.split()[0])], name=line.strip().split(maxsplit=1)[1]
                    )
                    for line in file
                ]
            else:
                nodes = [
                    Simplex([i], name=line.strip())
                    for i, line in enumerate(file, start=1)
                ]

    if node_label_names_file is not None:
        with (folder / node_label_names_file).open() as file:
            node_label_list = [line.strip() for line in file]
    else:
        node_label_list = None
    if node_labels_file is not None:
        with (folder / node_labels_file).open() as file:
            node_labels = file.readlines()
            if node_names_file is None:
                nodes = [Simplex([i]) for i in range(1, len(node_labels) + 1)]
            _attach_labels(node_labels, nodes, node_label_list)

    simplices = []
    with (folder / hyperedges_file).open() as file:
        for line in file:
            elements = [
                int(vertex)
                for vertex in line.strip()
                .replace("\t", ",")
                .replace(" ", ",")
                .split(",")
            ]

            seen = set()
            duplicates = {x for x in elements if x in seen or seen.add(x)}
            if duplicates:
                warnings.warn(
                    f"Hyperedge contains duplicate nodes: {duplicates}. TopoNetX ignores them.",
                    UserWarning,
                    stacklevel=2,
                )

            simplices.append(Simplex(seen))
    if hyperedge_label_names_file is not None:
        with (folder / hyperedge_label_names_file).open() as file:
            hyperedge_label_list = [line.strip() for line in file]
    else:
        hyperedge_label_list = None
    if hyperedge_labels_file is not None:
        with (folder / hyperedge_labels_file).open() as file:
            _attach_labels(file, simplices, hyperedge_label_list)

    if node_names_file is None and node_labels_file is None:
        nodes = [Simplex([i]) for i in set(chain.from_iterable(simplices))]

    return nodes, simplices


def load_benson_simplices(folder: Path | str) -> list[Simplex]:
    """Load simplicial complex data from the Benson dataset format.

    If the dataset is temporal (indicated by the presence of a ``{name}-times.txt``
    file), the simplices are guaranteed to be in chronological order.

    Parameters
    ----------
    folder : Path | str
        Path to the folder containing the dataset.

    Returns
    -------
    list[Simplex]
        List of simplices in the dataset.

    Raises
    ------
    ValueError
        If the folder does not exist or is not in the expected format.

    Notes
    -----
    - If the dataset has node labels, simplices have a ``label`` attribute.
    - If the dataset is temporal, simplices have a ``time`` attribute.
    """
    if not isinstance(folder, Path):
        folder = Path(folder)

    name = _validate_folder(folder)

    with (
        (folder / f"{name}-nverts.txt").open() as num_vertices_file,
        (folder / f"{name}-simplices.txt").open() as simplices_file,
    ):
        simplices = [
            Simplex([int(simplices_file.readline()) for _ in range(simplex_size)])
            for simplex_size in map(int, num_vertices_file)
        ]

    if (folder / f"{name}-times.txt").exists():
        with (folder / f"{name}-times.txt").open() as times_file:
            simplex_times = [int(line) for line in times_file]
        for time, simplex in zip(simplex_times, simplices, strict=True):
            simplex["time"] = time
        simplices = sorted(simplices, key=lambda simplex: simplex["time"])

    return simplices
