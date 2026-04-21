from __future__ import annotations

import json
import sqlite3
from pathlib import Path
from typing import Any, Dict, List

import numpy as np
import pandas as pd
from sklearn.metrics import f1_score, mean_absolute_error

DB_PATH = Path("data/denttime.db")
REFERENCE_PATH = Path("data/reference/reference_features.parquet")
FEATURE_STATS_PATH = Path("artifacts/feature_stats.json")
STATE_PATH = Path("monitoring/state.json")
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


def load_json(path: Path) -> dict:
    if not path.exists():
        return {}
    text = path.read_text(encoding="utf-8").strip()
    return json.loads(text) if text else {}



def psi_series(expected: pd.Series, actual: pd.Series, bins: int = 10) -> float:
    expected = expected.dropna()
    actual = actual.dropna()
    if expected.empty or actual.empty:
        return 0.0

    expected = pd.to_numeric(expected, errors="coerce").dropna()
    actual = pd.to_numeric(actual, errors="coerce").dropna()
    if expected.empty or actual.empty:
        return 0.0

    unique = sorted(set(expected.unique()) | set(actual.unique()))
    if len(unique) <= 10:
        expected_ratio = expected.value_counts(normalize=True)
        actual_ratio = actual.value_counts(normalize=True)
        psi = 0.0
        for value in unique:
            e = float(expected_ratio.get(value, 0.0)) or 1e-6
            a = float(actual_ratio.get(value, 0.0)) or 1e-6
            psi += (a - e) * np.log(a / e)
        return float(psi)

    quantiles = np.linspace(0, 1, bins + 1)
    breaks = np.quantile(expected, quantiles)
    breaks = np.unique(breaks)
    if len(breaks) < 3:
        return 0.0
    expected_counts, _ = np.histogram(expected, bins=breaks)
    actual_counts, _ = np.histogram(actual, bins=breaks)
    expected_ratio = np.where(expected_counts == 0, 1e-6, expected_counts / expected_counts.sum())
    actual_ratio = np.where(actual_counts == 0, 1e-6, actual_counts / actual_counts.sum())
    return float(np.sum((actual_ratio - expected_ratio) * np.log(actual_ratio / expected_ratio)))



def build_live_features(live: pd.DataFrame) -> pd.DataFrame:
    rows: List[Dict[str, Any]] = []
    if "transformed_features_json" not in live.columns:
        return pd.DataFrame(columns=FEATURE_COLUMNS)

    for raw in live["transformed_features_json"].fillna(""):
        if not raw:
            continue
        try:
            obj = json.loads(raw)
        except json.JSONDecodeError:
            continue
        rows.append({col: obj.get(col) for col in FEATURE_COLUMNS})

    if not rows:
        return pd.DataFrame(columns=FEATURE_COLUMNS)
    return pd.DataFrame(rows)



def compute_input_missing_rate(live: pd.DataFrame) -> float:
    if "input_payload_json" not in live.columns:
        return 0.0
    total = 0
    missing = 0
    watched = ["treatmentSymptoms", "timeOfDay", "doctorId", "toothNumbers", "notes"]
    for raw in live["input_payload_json"].fillna(""):
        if not raw:
            continue
        try:
            obj = json.loads(raw)
        except json.JSONDecodeError:
            continue
        for key in watched:
            total += 1
            value = obj.get(key)
            if value is None or value == "" or value == []:
                missing += 1
    return float(missing / total) if total else 0.0



def main() -> None:
    state: Dict[str, Any] = {"feature_psi": {}, "prediction_ratio": {}, "input_missing_rate": 0.0}
    reference = pd.read_parquet(REFERENCE_PATH) if REFERENCE_PATH.exists() else pd.DataFrame(columns=FEATURE_COLUMNS)
    baseline_stats = load_json(FEATURE_STATS_PATH)

    conn = sqlite3.connect(DB_PATH)
    live = pd.read_sql_query("SELECT * FROM predictions", conn)
    conn.close()

    if live.empty:
        STATE_PATH.parent.mkdir(parents=True, exist_ok=True)
        STATE_PATH.write_text(json.dumps(state, indent=2), encoding="utf-8")
        return

    live_features = build_live_features(live)
    state["input_missing_rate"] = compute_input_missing_rate(live)

    if not reference.empty and not live_features.empty:
        for col in FEATURE_COLUMNS:
            if col in reference.columns and col in live_features.columns:
                state["feature_psi"][col] = psi_series(reference[col], live_features[col])

    class_ratio = live["predicted_slot"].value_counts(normalize=True).sort_index()
    for slot, ratio in class_ratio.items():
        state["prediction_ratio"][int(slot)] = float(ratio)

    # Helpful monitoring summaries from Sun's feature_stats baseline.
    if baseline_stats and not live_features.empty:
        treatment_unknown_rate = float((live_features["treatment_class"] == 20).mean())
        state["treatment_unknown_rate"] = treatment_unknown_rate
        state["treatment_unknown_rate_baseline"] = float(
            baseline_stats.get("treatment_class", {}).get("unknown_rate", 0.0)
        )
        state["appt_hour_bucket_sentinel_rate"] = float((live_features["appt_hour_bucket"] == -1).mean())
        state["appt_hour_bucket_sentinel_rate_baseline"] = float(
            baseline_stats.get("appt_hour_bucket", {}).get("pct_sentinel", 0.0)
        )

    labeled = live.dropna(subset=["actual_slot"]).copy()
    if not labeled.empty:
        y_true = labeled["actual_slot"].astype(int)
        y_pred = labeled["predicted_slot"].astype(int)
        state["macro_f1"] = float(f1_score(y_true, y_pred, average="macro"))
        state["mae_minutes"] = float(mean_absolute_error(y_true, y_pred))
        state["under_estimation_rate"] = float((y_pred < y_true).mean())

    STATE_PATH.parent.mkdir(parents=True, exist_ok=True)
    STATE_PATH.write_text(json.dumps(state, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
