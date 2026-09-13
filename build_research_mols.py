#!/usr/bin/env python3
"""build_research_mols.py · the molecules drawn on the research page.

Three molecules, one per thing I actually work on, with their real 2D
coordinates and the descriptors RDKit computes for them. The page draws the
molecule bond by bond and then shows the numbers, so the panel beside the
project list is cheminformatics rather than decoration.

Coordinates come from the same `depict()` the homepage game uses, so both
pages draw molecules the same way. The site never needs RDKit, it reads the
baked JSON.

    python build_research_mols.py      (needs rdkit, use the .venv-dd python)
"""

import json
from pathlib import Path

from rdkit import Chem
from rdkit.Chem import Crippen, Descriptors, rdMolDescriptors

from build_molecules import depict

OUT = Path(__file__).resolve().parent / "data" / "research-mols.json"

# name, SMILES, the line under it. Every line is a fact about the molecule or
# about a paper of mine, nothing about what a model would predict for it.
DECK = [
    ("Erlotinib", "COCCOc1cc2ncnc(Nc3cccc(C#C)c3)c2cc1OCCOC",
     "EGFR inhibitor. The docking and the molecular dynamics I run here use this "
     "one in the 1M17 pocket, where it is the ligand in the crystal structure."),
    ("Quercetin", "O=c1c(O)c(-c2ccc(O)c(O)c2)oc2cc(O)cc(O)c12",
     "A flavonoid known to form colloidal aggregates at screening concentrations. "
     "The BAD Molecule Filter exists to flag molecules that do this before they "
     "cost a screen."),
    ("Metformin", "CN(C)C(=N)NC(=N)N",
     "First line in type 2 diabetes, and on more interaction checklists than "
     "almost any other drug. Predicting those pairs is what the AutoML framework "
     "paper is about."),
]


def numbers(smiles: str) -> list[list[str]]:
    mol = Chem.MolFromSmiles(smiles)
    return [
        ["Formula", rdMolDescriptors.CalcMolFormula(mol)],
        ["MW", f"{Descriptors.MolWt(mol):.1f}"],
        ["cLogP", f"{Crippen.MolLogP(mol):.2f}"],
        ["TPSA", f"{rdMolDescriptors.CalcTPSA(mol):.0f}"],
        ["HBD / HBA", f"{rdMolDescriptors.CalcNumHBD(mol)} / {rdMolDescriptors.CalcNumHBA(mol)}"],
        ["Rotatable", str(rdMolDescriptors.CalcNumRotatableBonds(mol))],
        ["Rings", str(rdMolDescriptors.CalcNumRings(mol))],
    ]


def main() -> None:
    deck = []
    for name, smiles, note in DECK:
        atoms, bonds, order = depict(smiles)
        deck.append({
            "name": name, "smiles": smiles, "note": note,
            "atoms": atoms, "bonds": bonds, "order": order,
            "numbers": numbers(smiles),
        })
        print(f"  {name:<12} {len(atoms):>2} atoms  {len(bonds):>2} bonds")
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({"version": Chem.rdBase.rdkitVersion, "molecules": deck},
                              separators=(",", ":")), encoding="utf-8")
    print(f"wrote {OUT.name}  {len(deck)} molecules  {OUT.stat().st_size / 1024:.1f} KB  "
          f"(RDKit {Chem.rdBase.rdkitVersion})")


if __name__ == "__main__":
    main()
