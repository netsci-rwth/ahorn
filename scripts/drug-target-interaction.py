"""Build a drug-target interaction combinatorial complex dataset from Perlman .mat data.

This script loads drug/target identifiers, interaction and similarity matrices,
constructs 0/1/2-cells, writes the compressed dataset output, and updates the
datasheet frontmatter with attachment and statistics metadata.
"""

import gzip
from pathlib import Path

import numpy as np
import scipy.io
from rich.progress import track

from .utils.write import (
    update_frontmatter,
    write_dataset_metadata,
    write_edge,
    write_node,
)
from .utils.yaml import patch_dumper

patch_dumper()

root_dir = Path(__file__).parent.parent
data_dir = root_dir / "data" / "drug-target-interaction"
dataset_file = root_dir / "public" / "datasets" / "drug-target-interaction.txt.gz"
datasheet_file = root_dir / "src" / "datasets" / "drug-target-interaction.mdx"
revision = 1

# Load the .mat file
mat = scipy.io.loadmat(data_dir / "Perlman_Data.mat")

# Extract IDs
drug_ids = mat["ID_drugbank_drugs"].flatten()
target_ids = mat["ID_entrez_targets"].flatten()
interactions = mat["Interactions_Matrix"]

# Convert to proper types
drug_ids_list = [str(d) for d in drug_ids]
target_ids_list = [int(t) for t in target_ids]

# Create drug-target pairs with interaction labels
pairs = []
for i, d_id in track(
    enumerate(drug_ids), description="Creating drug-target pairs", total=len(drug_ids)
):
    for j, t_id in enumerate(target_ids):
        pairs.append(
            {
                "drug_id": str(d_id),
                "target_id": int(t_id),
                "interaction": int(interactions[i, j]),
            }
        )

# Grouping by similarity matrices

# Drug similarity matrices
drug_sims = {
    "ATCHier": mat["DrugSim_ATCHierDrugsCommonSimilarityMat"],
    "chemical": mat["DrugSim_chemicalDrugsCommonSimilarityMat"],
    "ligandJaccard": mat["DrugSim_ligandJaccardDrugsCommonSimilarityMat"],
    "newCMapJaccard": mat["DrugSim_newCMapJaccardDrugsCommonSimilarityMat"],
    "SideEffect": mat["DrugSim_pSideEffectDrugsCommonSimilarityMat"],
}

drug_groups = []
for sim_name, sim_mat in drug_sims.items():
    for i, d_id in track(
        enumerate(drug_ids),
        description=f"Processing drug similarity: {sim_name}",
        total=len(drug_ids),
    ):
        # Exclude self-similarity, get all drugs with similarity > 0
        sim_indices = np.where((sim_mat[i] > 0) & (np.arange(len(drug_ids)) != i))[0]
        similar_drugs = [str(drug_ids[idx]) for idx in sim_indices]
        drug_groups.append({"drug_id": str(d_id), "similar_drug_ids": similar_drugs})

# Target similarity matrices
target_sims = {
    "dist": mat["TargetSim_distTargetsCommonSimilarityMat"],
    "GO": mat["TargetSim_GOTargetsCommonSimilarityMat"],
    "seq": mat["TargetSim_seqTargetsCommonSimilarityMat"],
}

target_groups = []
for sim_name, sim_mat in target_sims.items():
    for i, t_id in track(
        enumerate(target_ids),
        description=f"Processing target similarity: {sim_name}",
        total=len(target_ids),
    ):
        # Exclude self-similarity, get all targets with similarity > 0
        sim_indices = np.where((sim_mat[i] > 0) & (np.arange(len(target_ids)) != i))[0]
        similar_targets = [int(target_ids[idx]) for idx in sim_indices]
        target_groups.append(
            {"target_id": int(t_id), "similar_target_ids": similar_targets}
        )


# Construct combinatorial complex from drug/target data

# 0-cells: union of drugs and targets
zero_cells = set(map(str, drug_ids_list)) | set(map(str, target_ids_list))

# 1-cells: all drug-target pairs
one_cells: set[tuple[str, ...]] = set()
for pair in track(pairs, description="Processing drug-target pairs"):
    a = str(pair["drug_id"])
    b = str(pair["target_id"])
    one_cells.add(tuple(sorted([a, b])))

# 2-cells: all groups from drug and target groups
two_cells: set[tuple[str, ...]] = set()
for group in drug_groups:
    cell = set([str(group["drug_id"])] + [str(d) for d in group["similar_drug_ids"]])
    if len(cell) > 1:
        two_cells.add(tuple(sorted(cell)))

for group in target_groups:
    cell = set(
        [str(group["target_id"])] + [str(t) for t in group["similar_target_ids"]]
    )
    if len(cell) > 1:
        two_cells.add(tuple(sorted(cell)))

with gzip.open(dataset_file, "wt") as f:
    write_dataset_metadata(f, datasheet_file.stem, revision)

    for node in track(zero_cells, description="Adding and writing 0-cells (nodes)"):
        # Check if it's a drug or target based on the ID type
        if node in drug_ids_list:
            write_node(f, node, type="drug")
        else:
            write_node(f, node, type="target")
    for edge in track(one_cells, description="Adding 1-cells (edges)"):
        write_edge(f, list(edge), rank=1)
    for face in track(two_cells, description="Adding 2-cells (faces)"):
        write_edge(f, list(face), rank=2)

update_frontmatter(
    datasheet_file,
    {
        "attachments": {
            f"revision-{revision}": {"ahorn": dataset_file.name},
        },
        "statistics": {
            "num-nodes": len(zero_cells),
            "num-interactions": len(one_cells) + len(two_cells),
            "num-faces": len(two_cells),
        },
    },
)
