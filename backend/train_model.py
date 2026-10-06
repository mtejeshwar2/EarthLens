"""Command-line entry point for training and comparing EarthLens regressors."""
from __future__ import annotations

import argparse
import json
from pathlib import Path

from app.core.config import BACKEND_DIR
from app.ml.training import train_and_save


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("csv", type=Path, help="CSV with spectral bands and lab-measured N/P/K targets")
    parser.add_argument("--output", type=Path, default=BACKEND_DIR / "models" / "npk_model.joblib")
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--trees", type=int, default=100, help="Tree count for random forest and ExtraTrees models")
    args = parser.parse_args()
    report = train_and_save(args.csv, args.output, seed=args.seed, trees=args.trees)
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
