import json
import logging
import math
from typing import Optional

import pandas as pd

from .treatment_mapper import build_reverse_map, load_treatment_dict, map_treatment
from .tooth_parser import parse_tooth_no


def build_treatment_encoding(treatment_dict: dict) -> dict:
    """Deterministic str→int encoding: sorted dict keys → 0…N-1."""
    return {cls: i for i, cls in enumerate(sorted(treatment_dict.keys()))}


LEAKAGE_COLUMNS = {"checkin_delay_min", "tx_record_offset_min", "receipt_offset_min"}

FEATURE_COLUMNS = [
    "treatment_class",
    "composite_treatment_flag",
    "has_tooth_no",
    "tooth_count",
    "is_area_treatment",
    "surface_count",
    "total_amount",
    "has_notes",
    "appt_day_of_week",
    "appt_hour_bucket",
    "is_first_case",
    "has_dentist_id",
    "appointment_rank_in_day",
    "clinic_median_duration",
    "clinic_pct_long",
    "doctor_median_duration",
    "doctor_pct_long",
]

_DURATION_CLASSES = [15, 30, 45, 60, 90, 105]


def _bin_duration(minutes: int) -> int:
    for cls in _DURATION_CLASSES:
        if minutes <= cls:
            return cls
    return _DURATION_CLASSES[-1]


class FeatureTransformer:
    def __init__(
        self,
        doctor_profile_path: str,
        clinic_profile_path: str,
        treatment_dict_path: str,
        treatment_encoding_path: str,
    ):
        with open(doctor_profile_path, encoding="utf-8") as f:
            self._doctor_profile = json.load(f)
        with open(clinic_profile_path, encoding="utf-8") as f:
            self._clinic_profile = json.load(f)
        self._treatment_dict = load_treatment_dict(treatment_dict_path)
        self._reverse_map = build_reverse_map(self._treatment_dict)
        with open(treatment_encoding_path, encoding="utf-8") as f:
            self._treatment_encoding: dict = json.load(f)

    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        # Step 1: Leakage guard
        present = LEAKAGE_COLUMNS & set(df.columns)
        if present:
            raise ValueError(f"Post-visit leakage columns present in input: {present}")

        out = pd.DataFrame(index=df.index)

        # Step 2: appt_hour_bucket sentinel remap
        out["appt_hour_bucket"] = df["appt_hour_bucket"].replace(0, -1)

        # Step 3: Treatment mapper
        out["treatment_class"] = df["treatment"].apply(
            lambda x: map_treatment(x, self._treatment_dict, self._reverse_map)
        )
        unknown_rate = (out["treatment_class"] == "UNKNOWN").mean()
        if unknown_rate > 0.10:
            logging.warning(
                f"UNKNOWN treatment_class rate is {unknown_rate:.1%} — "
                "consider expanding treatment_dict.json"
            )
        out["composite_treatment_flag"] = (out["treatment_class"] == "COMPOSITE_FILL").astype(int)

        # Step 4: Tooth parser
        tooth_parsed = df["tooth_no"].apply(parse_tooth_no).apply(pd.Series)
        out["has_tooth_no"] = tooth_parsed["has_tooth_no"]
        out["tooth_count"] = tooth_parsed["tooth_count"]
        out["is_area_treatment"] = tooth_parsed["is_area_treatment"]

        # Step 5: Surface count (null = non-restorative = 0, not missing)
        out["surface_count"] = df["surfaces"].apply(
            lambda x: len(str(x).split(",")) if pd.notna(x) else 0
        )

        # Step 6: Doctor lookup
        def _doctor_lookup(row):
            if row["has_dentist_id"] == 0:
                stats = self._doctor_profile["__global__"]
            else:
                entry = self._doctor_profile.get(row.get("dentist_pseudo_id"))
                if entry and entry["case_count"] >= 30:
                    stats = entry
                else:
                    stats = self._doctor_profile["__global__"]
            return stats["doctor_median_duration"], stats["doctor_pct_long"]

        doctor_stats = df.apply(_doctor_lookup, axis=1, result_type="expand")
        out["doctor_median_duration"] = doctor_stats[0]
        out["doctor_pct_long"] = doctor_stats[1]

        # appointment_rank_in_day: 0 for has_dentist_id=0 rows (avoids extra missingness)
        rank_col = df.get("appointment_rank_in_day", pd.Series(0, index=df.index))
        out["appointment_rank_in_day"] = (
            rank_col.where(df["has_dentist_id"] == 1, 0).fillna(0).astype(int)
        )

        # Step 7: Clinic lookup
        def _clinic_lookup(clinic_id):
            entry = self._clinic_profile.get(clinic_id)
            if entry and entry["case_count"] >= 30:
                stats = entry
            else:
                stats = self._clinic_profile["__global__"]
            return stats["clinic_median_duration"], stats["clinic_pct_long"]

        clinic_stats = df["clinic_pseudo_id"].apply(
            lambda x: pd.Series(_clinic_lookup(x))
        )
        out["clinic_median_duration"] = clinic_stats[0]
        out["clinic_pct_long"] = clinic_stats[1]

        # Pass-through columns
        for col in ["total_amount", "has_notes", "appt_day_of_week", "is_first_case", "has_dentist_id"]:
            out[col] = df[col].values

        # Step 8: Target binning (ceiling strategy — never under-estimate)
        out["duration_class"] = df["scheduled_duration_min"].apply(_bin_duration)
        out["scheduled_duration_min"] = df["scheduled_duration_min"].values

        # Step 9: Enforce exact column allowlist
        final_cols = FEATURE_COLUMNS + ["scheduled_duration_min", "duration_class"]
        missing = set(final_cols) - set(out.columns)
        if missing:
            raise ValueError(f"BUG: transformer failed to produce columns: {missing}")

        # Step 10: Encode treatment_class string → integer (tree-model ready)
        out["treatment_class"] = out["treatment_class"].map(self._treatment_encoding)
        assert out["treatment_class"].notna().all(), (
            "BUG: treatment_class encoding produced NaN — "
            "treatment_encoding.json must cover all classes output by treatment_mapper"
        )

        return out[final_cols]
