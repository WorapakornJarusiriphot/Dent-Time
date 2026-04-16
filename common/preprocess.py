# common/preprocess.py
from __future__ import annotations
import pandas as pd

FEATURE_COLUMNS = [
    "treatment_class",
    "tooth_count",
    "time_of_day",
    "is_first_case",
    "doctor_speed_ratio",
]

def transform_features(df: pd.DataFrame) -> pd.DataFrame:
    # ใช้ logic เดียวกับตอน train
    # ใส่ mapping / cleaning / feature engineering จริงของทีมคุณในไฟล์นี้
    out = df.copy()

    # ตัวอย่างเท่านั้น
    out["tooth_count"] = out["tooth_count"].fillna(1).astype(int)
    out["is_first_case"] = out["is_first_case"].fillna(0).astype(int)
    out["doctor_speed_ratio"] = out["doctor_speed_ratio"].fillna(1.0).astype(float)

    # แปลง time_of_day ให้เป็นตัวเลขหรือ one-hot ตามที่ model train ใช้จริง
    out["time_of_day"] = out["time_of_day"].fillna("unknown")
    out["treatment_class"] = out["treatment_class"].fillna("unknown")

    return out