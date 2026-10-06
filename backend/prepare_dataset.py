"""Reduce a labeled soil CSV to numeric reflectance bands plus canonical N/P/K targets."""
from __future__ import annotations

import argparse
from pathlib import Path

import pandas as pd

TARGET_ALIASES = {
    "n": "N", "nitrogen": "N", "available_nitrogen_mgkg": "N",
    "p": "P", "phosphorus": "P", "available_phosphorus_mgkg": "P",
    "k": "K", "potassium": "K", "available_potassium_mgkg": "K",
}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("csv", type=Path, help="Original dataset CSV")
    parser.add_argument("--output", type=Path, default=Path("soil_spectra_npk.csv"))
    args = parser.parse_args()

    frame = pd.read_csv(args.csv)
    source_targets = {TARGET_ALIASES[c.strip().lower()]: c for c in frame.columns if c.strip().lower() in TARGET_ALIASES}
    absent = [target for target in ("N", "P", "K") if target not in source_targets]
    if absent:
        raise SystemExit(f"Missing measured target column(s): {', '.join(absent)}")
    spectra = [c for c in frame.columns if c.strip().lower().startswith("reflectance_")]
    if not spectra:
        raise SystemExit("No Reflectance_* spectral columns found. This dataset needs an explicit band-column mapping.")

    group_col = next((c for c in frame.columns if c.strip().lower() in {"field_zone", "site", "field"}), None)
    selected = spectra + [source_targets[t] for t in ("N", "P", "K")]
    if group_col:
        selected.append(group_col)
    clean = frame[selected].copy()
    clean.columns = spectra + ["N", "P", "K"] + (["Field_Zone"] if group_col else [])
    for column in spectra + ["N", "P", "K"]:
        clean[column] = pd.to_numeric(clean[column], errors="coerce")
    before = len(clean)
    clean = clean.dropna()
    if clean.empty:
        raise SystemExit("No complete numeric spectra + N/P/K rows remain after cleaning.")
    args.output.parent.mkdir(parents=True, exist_ok=True)
    clean.to_csv(args.output, index=False)
    print(f"Kept {len(clean):,}/{before:,} complete rows; selected {len(spectra)} reflectance bands and N/P/K targets.")
    print(f"Wrote model-ready CSV: {args.output}")
    print("Units are inherited from the source CSV; verify they are consistent before training.")


if __name__ == "__main__":
    main()
