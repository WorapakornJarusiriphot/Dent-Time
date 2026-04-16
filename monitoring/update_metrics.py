# monitoring/update_metrics.py
from __future__ import annotations
import json
import sqlite3
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.metrics import f1_score, mean_absolute_error

DB_PATH = Path("data/denttime.db")
REFERENCE_PATH = Path("data/reference/reference_features.parquet")
STATE_PATH = Path("monitoring/state.json")

MONITORED_FEATURES = [
    "tooth_count",
    "is_first_case",
    "doctor_speed_ratio",
]

def psi_numeric(expected: pd.Series, actual: pd.Series, bins: int = 10) -> float:
    expected = expected.dropna().astype(float)
    actual = actual.dropna().astype(float)

    if len(expected) == 0 or len(actual) == 0:
        return 0.0

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


def main() -> None:
    state: dict = {
        "feature_psi": {},
        "prediction_ratio": {},
        "input_missing_rate": 0.0
    }

    try:
        ref = pd.read_parquet(REFERENCE_PATH)
    except Exception:
        ref = pd.DataFrame()

    conn = sqlite3.connect(DB_PATH)
    live = pd.read_sql_query("SELECT * FROM predictions", conn)
    conn.close()

    if live.empty:
        STATE_PATH.write_text(json.dumps(state, indent=2), encoding="utf-8")
        return

    input_cols = ["treatment_class", "tooth_count", "time_of_day", "is_first_case", "doctor_speed_ratio"]
    state["input_missing_rate"] = float(live[input_cols].isna().mean().mean())

    if not ref.empty:
        for col in MONITORED_FEATURES:
            if col in ref.columns and col in live.columns:
                state["feature_psi"][col] = psi_numeric(ref[col], live[col])

    class_ratio = live["predicted_slot"].value_counts(normalize=True).sort_index()
    for slot, ratio in class_ratio.items():
        state["prediction_ratio"][int(slot)] = float(ratio)

    labeled = live.dropna(subset=["actual_slot"]).copy()
    if not labeled.empty:
        y_true = labeled["actual_slot"].astype(int)
        y_pred = labeled["predicted_slot"].astype(int)
        state["macro_f1"] = float(f1_score(y_true, y_pred, average="macro"))
        state["mae_minutes"] = float(mean_absolute_error(y_true, y_pred))
        state["underestimation_rate"] = float((y_pred < y_true).mean())

    STATE_PATH.parent.mkdir(parents=True, exist_ok=True)
    STATE_PATH.write_text(json.dumps(state, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()