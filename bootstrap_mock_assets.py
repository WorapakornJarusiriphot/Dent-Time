from pathlib import Path
import json
import numpy as np
import pandas as pd
import joblib

from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import f1_score, mean_absolute_error

RANDOM_SEED = 42
np.random.seed(RANDOM_SEED)

ARTIFACTS_DIR = Path("artifacts")
REFERENCE_DIR = Path("data/reference")

ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
REFERENCE_DIR.mkdir(parents=True, exist_ok=True)

N = 500

treatment_classes = ["scaling", "filling", "extraction", "root_canal", "consult"]
time_of_day_values = ["morning", "afternoon", "evening"]
slot_labels = np.array([15, 30, 45, 60, 75, 90, 105])

df = pd.DataFrame({
    "treatment_class": np.random.choice(treatment_classes, size=N, p=[0.22, 0.28, 0.15, 0.12, 0.23]),
    "tooth_count": np.random.randint(1, 5, size=N),
    "time_of_day": np.random.choice(time_of_day_values, size=N, p=[0.45, 0.4, 0.15]),
    "is_first_case": np.random.choice([0, 1], size=N, p=[0.7, 0.3]),
    "doctor_speed_ratio": np.round(np.random.normal(loc=1.0, scale=0.15, size=N), 2),
})

df["doctor_speed_ratio"] = df["doctor_speed_ratio"].clip(0.6, 1.4)

# heuristic target เพื่อให้มี 7 class จริง
score = (
    df["tooth_count"] * 8
    + df["is_first_case"] * 10
    + (df["doctor_speed_ratio"] < 0.9).astype(int) * 12
    + (df["doctor_speed_ratio"] > 1.1).astype(int) * (-6)
    + df["treatment_class"].map({
        "consult": -8,
        "scaling": 0,
        "filling": 10,
        "extraction": 18,
        "root_canal": 28,
    })
    + df["time_of_day"].map({
        "morning": 0,
        "afternoon": 4,
        "evening": 8,
    })
)

bins = [-999, 5, 12, 20, 28, 36, 44, 999]
df["target_slot"] = pd.cut(score, bins=bins, labels=slot_labels).astype(int)

X = df[["treatment_class", "tooth_count", "time_of_day", "is_first_case", "doctor_speed_ratio"]]
y = df["target_slot"]

X_train, X_val, y_train, y_val = train_test_split(
    X, y, test_size=0.2, random_state=RANDOM_SEED, stratify=y
)

categorical_features = ["treatment_class", "time_of_day"]
numeric_features = ["tooth_count", "is_first_case", "doctor_speed_ratio"]

preprocessor = ColumnTransformer(
    transformers=[
        ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_features),
        ("num", "passthrough", numeric_features),
    ]
)

model = Pipeline(
    steps=[
        ("preprocessor", preprocessor),
        ("classifier", RandomForestClassifier(
            n_estimators=120,
            random_state=RANDOM_SEED
        )),
    ]
)

model.fit(X_train, y_train)
pred_val = model.predict(X_val)

macro_f1 = float(f1_score(y_val, pred_val, average="macro"))
mae_minutes = float(mean_absolute_error(y_val, pred_val))
under_rate = float((pred_val < y_val).mean())

joblib.dump(model, ARTIFACTS_DIR / "model.joblib")
X_train.to_parquet(REFERENCE_DIR / "reference_features.parquet", index=False)

baseline = {
    "macro_f1": round(macro_f1, 4),
    "underestimation_rate": round(under_rate, 4)
}
(Path("artifacts") / "baseline_metrics.json").write_text(
    json.dumps(baseline, indent=2),
    encoding="utf-8"
)

print("Mock assets created successfully")
print(f"model.joblib -> {ARTIFACTS_DIR / 'model.joblib'}")
print(f"reference_features.parquet -> {REFERENCE_DIR / 'reference_features.parquet'}")
print(f"baseline_metrics.json -> {ARTIFACTS_DIR / 'baseline_metrics.json'}")
print(f"macro_f1={macro_f1:.4f}, mae_minutes={mae_minutes:.4f}, under_rate={under_rate:.4f}")