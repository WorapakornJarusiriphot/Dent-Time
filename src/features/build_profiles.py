import json
from pathlib import Path
import pandas as pd

COLD_START_THRESHOLD = 30


def build_doctor_profile(train_df: pd.DataFrame) -> dict:
    profile = {}

    dentist_rows = train_df[train_df["has_dentist_id"] == 1]
    for dentist_id, group in dentist_rows.groupby("dentist_pseudo_id")["scheduled_duration_min"]:
        if len(group) >= COLD_START_THRESHOLD:
            profile[dentist_id] = {
                "doctor_median_duration": float(group.median()),
                "doctor_pct_long": float((group >= 60).mean()),
                "case_count": int(len(group)),
            }

    all_dur = train_df["scheduled_duration_min"]
    profile["__global__"] = {
        "doctor_median_duration": float(all_dur.median()),
        "doctor_pct_long": float((all_dur >= 60).mean()),
        "case_count": int(len(all_dur)),
    }
    return profile


def build_clinic_profile(train_df: pd.DataFrame) -> dict:
    profile = {}

    for clinic_id, group in train_df.groupby("clinic_pseudo_id")["scheduled_duration_min"]:
        if len(group) >= COLD_START_THRESHOLD:
            profile[clinic_id] = {
                "clinic_median_duration": float(group.median()),
                "clinic_pct_long": float((group >= 60).mean()),
                "case_count": int(len(group)),
            }

    all_dur = train_df["scheduled_duration_min"]
    profile["__global__"] = {
        "clinic_median_duration": float(all_dur.median()),
        "clinic_pct_long": float((all_dur >= 60).mean()),
        "case_count": int(len(all_dur)),
    }
    return profile


def build_and_save(train_df: pd.DataFrame, output_dir: Path) -> None:
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    doctor_profile = build_doctor_profile(train_df)
    clinic_profile = build_clinic_profile(train_df)

    with open(output_dir / "doctor_profile.json", "w", encoding="utf-8") as f:
        json.dump(doctor_profile, f, indent=2, ensure_ascii=False)

    with open(output_dir / "clinic_profile.json", "w", encoding="utf-8") as f:
        json.dump(clinic_profile, f, indent=2, ensure_ascii=False)
