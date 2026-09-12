#!/usr/bin/env python3
"""
build_molecules.py · the deck for the homepage game.

Turns a short list of famous molecules into data/molecules.json: real 2D
coordinates from RDKit, bonds, which side of a ring each double bond's
second line belongs on, the order the molecule draws itself in, and one
short true fact.

Run once whenever the list changes. The site never needs RDKit, it only
reads the JSON.

    python build_molecules.py          (needs rdkit)
"""

import json
import math
import re
from collections import deque
from pathlib import Path

from rdkit import Chem
from rdkit.Chem import rdDepictor

rdDepictor.SetPreferCoordGen(True)

OUT = Path(__file__).resolve().parent / "data" / "molecules.json"

# name, SMILES, look-alike group, fact. Facts are short and checkable.
DECK = [
    ("Caffeine", "Cn1cnc2c1c(=O)n(C)c(=O)n2C", "purine",
     "Blocks adenosine receptors, which is why it keeps you awake."),
    ("Theobromine", "Cn1cnc2c1c(=O)[nH]c(=O)n2C", "purine",
     "The main stimulant in chocolate. One methyl group away from caffeine."),
    ("Adenine", "Nc1ncnc2[nH]cnc12", "purine",
     "The A in DNA."),
    ("Aspirin", "CC(=O)Oc1ccccc1C(=O)O", "painkiller",
     "Its ancestor, salicin, comes from willow bark."),
    ("Paracetamol", "CC(=O)Nc1ccc(O)cc1", "painkiller",
     "Called acetaminophen in the US. Same molecule, two names."),
    ("Ibuprofen", "CC(C)Cc1ccc(cc1)C(C)C(=O)O", "painkiller",
     "Sold as a mix of two mirror-image forms. One of them does most of the work."),
    ("Dopamine", "NCCc1ccc(O)c(O)c1", "amine",
     "A messenger in the brain for reward and movement."),
    ("Adrenaline", "CNCC(O)c1ccc(O)c(O)c1", "amine",
     "The fight-or-flight hormone. Epinephrine in the US."),
    ("Serotonin", "NCCc1c[nH]c2ccc(O)cc12", "indole",
     "Most of the serotonin in your body is made in the gut."),
    ("Melatonin", "CC(=O)NCCc1c[nH]c2ccc(OC)cc12", "indole",
     "Made from serotonin. Your body releases it when it gets dark."),
    ("Histamine", "NCCc1cnc[nH]1", "amine",
     "The molecule antihistamines block when hay fever hits."),
    ("Nicotine", "CN1CCCC1c1cccnc1", "alkaloid",
     "Named after Jean Nicot, who brought tobacco to the French court."),
    ("Quinine", "COc1ccc2nccc(C(O)C3CC4CCN3CC4C=C)c2c1", "alkaloid",
     "The bitter taste in tonic water, and an old malaria medicine."),
    ("Morphine", "CN1CCC23c4c5ccc(O)c4OC2C(O)C=CC3C1C5", "alkaloid",
     "Named after Morpheus, the Greek god of dreams."),
    ("Capsaicin", "COc1cc(CNC(=O)CCCCC=CC(C)C)ccc1O", "flavour",
     "Why chilli burns. It sets off the same receptor as heat."),
    ("Vanillin", "COc1cc(C=O)ccc1O", "flavour",
     "The main flavour molecule in vanilla."),
    ("Cinnamaldehyde", "O=CC=Cc1ccccc1", "flavour",
     "Gives cinnamon its taste and smell."),
    ("Menthol", "CC(C)C1CCC(C)CC1O", "scent",
     "Sets off your cold receptors, which is why mint feels cool."),
    ("Limonene", "CC1=CCC(CC1)C(=C)C", "scent",
     "The smell of orange peel."),
    ("Glucose", "OCC1OC(O)C(O)C(O)C1O", "sugar",
     "Drawn as a ring, the shape it mostly takes in water."),
    ("Vitamin C", "OCC(O)C1OC(=O)C(O)=C1O", "sugar",
     "Humans cannot make it. Most other mammals can."),
    ("Citric acid", "OC(=O)CC(O)(CC(O)=O)C(O)=O", "sugar",
     "The sour in lemons and limes."),
    ("Penicillin G", "CC1(C)SC2C(NC(=O)Cc3ccccc3)C(=O)N2C1C(=O)O", "drug",
     "Found by Alexander Fleming in 1928 on a mouldy dish."),
    ("Fluoxetine", "CNCCC(Oc1ccc(cc1)C(F)(F)F)c1ccccc1", "drug",
     "Better known as Prozac."),
    ("Metformin", "CN(C)C(=N)N=C(N)N", "drug",
     "A first-line medicine for type 2 diabetes, traced back to French lilac."),
    ("Testosterone", "CC12CCC3C(CCC4=CC(=O)CCC34C)C1CCC2O", "steroid",
     "A steroid: three six-membered rings and one five-membered ring."),
    ("Cholesterol", "CC(C)CCCC(C)C1CCC2C3CC=C4CC(O)CCC4(C)C3CCC12C", "steroid",
     "Every animal cell membrane needs it."),
    ("Retinol", "CC1=C(C(C)(C)CCC1)C=CC(C)=CC=CC(C)=CCO", "steroid",
     "Vitamin A. Your eyes use a close relative of it to detect light."),
]


def depict(smiles):
    mol = Chem.MolFromSmiles(smiles)
    assert mol is not None, smiles
    Chem.Kekulize(mol, clearAromaticFlags=True)
    rdDepictor.Compute2DCoords(mol)
    conf = mol.GetConformer()
    pts = [(conf.GetAtomPosition(i).x, conf.GetAtomPosition(i).y) for i in range(mol.GetNumAtoms())]

    # scale so the median bond is exactly one unit, centre on the origin
    lengths = sorted(math.dist(pts[b.GetBeginAtomIdx()], pts[b.GetEndAtomIdx()]) for b in mol.GetBonds())
    unit = lengths[len(lengths) // 2] or 1.0
    cx = sum(p[0] for p in pts) / len(pts)
    cy = sum(p[1] for p in pts) / len(pts)
    pts = [((x - cx) / unit, -(y - cy) / unit) for x, y in pts]   # SVG y grows downward

    rings = [list(r) for r in mol.GetRingInfo().AtomRings()]

    atoms = []
    for a in mol.GetAtoms():
        x, y = pts[a.GetIdx()]
        atoms.append([a.GetSymbol(), round(x, 3), round(y, 3), a.GetTotalNumHs()])

    bonds = []
    for b in mol.GetBonds():
        i, j = b.GetBeginAtomIdx(), b.GetEndAtomIdx()
        order = int(round(b.GetBondTypeAsDouble()))
        side = 0
        if order == 2:
            # in a ring, the second line sits inside the ring, like a textbook
            ring = min((r for r in rings if i in r and j in r), key=len, default=None)
            if ring:
                rx = sum(pts[k][0] for k in ring) / len(ring)
                ry = sum(pts[k][1] for k in ring) / len(ring)
                (ax, ay), (bx, by) = pts[i], pts[j]
                cross = (bx - ax) * (ry - ay) - (by - ay) * (rx - ax)
                side = 1 if cross > 0 else -1
        bonds.append([i, j, order, side])

    # draw order: breadth first from the left-most atom with the fewest neighbours
    adj = {a.GetIdx(): [n.GetIdx() for n in a.GetNeighbors()] for a in mol.GetAtoms()}
    start = min(adj, key=lambda k: (len(adj[k]), pts[k][0]))
    seen, order, queue = {start}, [], deque([start])
    while queue:
        k = queue.popleft()
        order.append(k)
        for n in sorted(adj[k], key=lambda n: pts[n][0]):
            if n not in seen:
                seen.add(n)
                queue.append(n)
    assert len(order) == len(atoms), "disconnected molecule"
    return atoms, bonds, order


def main():
    deck = []
    names = set()
    for name, smiles, group, fact in DECK:
        assert name not in names, name
        names.add(name)
        for text in (name, fact):
            assert not re.search("[\\u2013\\u2014]", text), f"dash in: {text}"
        atoms, bonds, order = depict(smiles)
        assert len(atoms) >= 6, name
        deck.append({"name": name, "group": group, "fact": fact, "smiles": smiles,
                     "atoms": atoms, "bonds": bonds, "order": order})
        print(f"  {name:<15} {len(atoms):>2} atoms  {len(bonds):>2} bonds")

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({"molecules": deck}, separators=(",", ":")), encoding="utf-8")
    print(f"wrote {OUT.relative_to(OUT.parent.parent)}  {len(deck)} molecules  {OUT.stat().st_size / 1024:.1f} KB")


if __name__ == "__main__":
    main()
