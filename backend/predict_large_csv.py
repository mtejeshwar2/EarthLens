"""Predict N/P/K from a large local spectral CSV without loading it all into RAM.

The EarthLens model was trained on 15 named reflectance bands. This runner also
maps dense source bands such as SPC.450 to Reflectance_450nm and reads only the
required bands plus an optional sample identifier in each pandas chunk.
"""
from __future__ import annotations

import argparse
from pathlib import Path

import joblib
import pandas as pd

from app.core.config import MODEL_PATH
from app.ml.spectral_mapping import resolve_spectral_mapping, transform_spectral_chunk


def run(input_path: Path, output_path: Path, chunksize: int, overwrite: bool) -> dict:
    if not input_path.is_file():
        raise FileNotFoundError(f"Input CSV not found: {input_path}")
    if output_path.exists() and not overwrite:
        raise FileExistsError(f"Output already exists: {output_path}. Choose another path or pass --overwrite.")
    artifact = joblib.load(MODEL_PATH)
    feature_names = artifact["feature_names"]

    header = pd.read_csv(input_path, nrows=0, encoding="utf-8-sig").columns.astype(str).tolist()
    feature_mapping = resolve_spectral_mapping(header, feature_names)
    id_column = next((c for c in ("SAMPLE_TDR_ID", "Sample_ID", "sample_id", "ID", "id") if c in header), None)
    spectral_columns = [source for value in feature_mapping.values() for source in (value.lower, value.upper) if source]
    usecols = list(dict.fromkeys(([id_column] if id_column else []) + spectral_columns))

    output_path.parent.mkdir(parents=True, exist_ok=True)
    partial_path = output_path.with_suffix(output_path.suffix + ".partial")
    partial_path.unlink(missing_ok=True)
    total_rows = 0
    output_header_written = False
    try:
        reader = pd.read_csv(input_path, usecols=usecols, chunksize=chunksize, encoding="utf-8-sig", low_memory=False)
        for chunk_number, chunk in enumerate(reader, start=1):
            x = transform_spectral_chunk(chunk, feature_mapping)
            prediction = artifact["model"].predict(x)
            sample_ids = chunk[id_column].astype("string") if id_column else pd.Series(
                [str(total_rows + i + 1) for i in range(len(chunk))], dtype="string")
            result = pd.DataFrame({
                "sample_id": sample_ids.fillna(pd.Series([str(total_rows + i + 1) for i in range(len(chunk))], index=chunk.index)),
                "N_predicted_mgkg": prediction[:, 0],
                "P_predicted_mgkg": prediction[:, 1],
                "K_predicted_mgkg": prediction[:, 2],
            })
            result.to_csv(partial_path, mode="a", index=False, header=not output_header_written)
            output_header_written = True
            total_rows += len(chunk)
            print(f"Processed chunk {chunk_number}: {total_rows:,} samples", flush=True)
        if total_rows == 0:
            raise ValueError("The input CSV contains no data rows.")
        partial_path.replace(output_path)
    except Exception:
        partial_path.unlink(missing_ok=True)
        raise
    return {"input": str(input_path), "output": str(output_path), "rows": total_rows,
            "chunk_size": chunksize, "chunks": (total_rows + chunksize - 1) // chunksize,
            "model_version": artifact.get("version"), "model_features": feature_names,
            "mapped_source_bands": {feature: {"lower": band.lower, "upper": band.upper,
                                                "upper_weight": band.upper_weight}
                                    for feature, band in feature_mapping.items()}}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path, help="Large source CSV with reflectance or SPC.<wavelength> columns")
    parser.add_argument("--output", type=Path, default=Path("outputs/npk_predictions.csv"))
    parser.add_argument("--chunksize", type=int, default=2048, help="Rows processed per chunk")
    parser.add_argument("--overwrite", action="store_true", help="Replace an existing output file")
    args = parser.parse_args()
    if args.chunksize < 1:
        parser.error("--chunksize must be at least 1")
    report = run(args.input, args.output, args.chunksize, args.overwrite)
    print(f"Finished: {report['rows']:,} predictions written to {report['output']}")


if __name__ == "__main__":
    main()
