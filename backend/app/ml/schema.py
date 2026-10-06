from __future__ import annotations

import re

TARGETS = ("N", "P", "K")
TARGET_ALIASES = {
    "n": "N", "nitrogen": "N", "available_nitrogen_mgkg": "N",
    "p": "P", "phosphorus": "P", "available_phosphorus_mgkg": "P",
    "k": "K", "potassium": "K", "available_potassium_mgkg": "K",
}
TARGET_LABEL_COLUMNS = {
    "N": {"n", "nitrogen", "available_nitrogen_mgkg"},
    "P": {"p", "phosphorus", "available_phosphorus_mgkg"},
    "K": {"k", "potassium", "available_potassium_mgkg"},
}
GROUP_COLUMNS = {"field_zone", "site", "site_id", "field", "field_id", "farm_id"}
METADATA_COLUMNS = {
    "sample_id", "id", "latitude", "longitude", "gps_latitude", "gps_longitude",
    "elevation", "elevation_m", "field_zone", "soil_type", "dominant_nutrient_name",
    "soil_nutrient_status", "site", "site_id", "field", "field_id", "farm_id",
}
SPECTRAL_PATTERN = re.compile(r"^(reflectance_.*|band[_ -]?\d+|b\d+|\d+(?:\.\d+)?\s*nm)$", re.I)


def canonical_target_columns(columns: list[str]) -> dict[str, str]:
    found: dict[str, str] = {}
    for column in columns:
        target = TARGET_ALIASES.get(str(column).strip().lower())
        if target:
            if target in found:
                raise ValueError(f"Multiple columns map to target {target}: {found[target]!r} and {column!r}.")
            found[target] = str(column)
    return found


def is_spectral_column(column: str) -> bool:
    return bool(SPECTRAL_PATTERN.match(str(column).strip()))

