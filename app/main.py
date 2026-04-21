from __future__ import annotations

import json
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from prometheus_client import CONTENT_TYPE_LATEST, Counter, Gauge, Histogram, generate_latest

from app.db import get_conn, init_db
from app.schemas import ActualRequest, ActualResponse, OptionsResponse, PredictRequest, PredictResponse
from src.features.feature_transformer import FEATURE_COLUMNS, FeatureTransformer

app = FastAPI(title="DentTime Monitoring API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ARTIFACTS_DIR = Path("artifacts")
RUNTIME_ARTIFACTS_DIR = Path("src/features/artifacts")
MODEL_PATH = ARTIFACTS_DIR / "model.joblib"
BASELINE_PATH = ARTIFACTS_DIR / "baseline_metrics.json"
FEATURE_STATS_PATH = ARTIFACTS_DIR / "feature_stats.json"
STATE_PATH = Path("monitoring/state.json")

REQUEST_COUNT = Counter("denttime_prediction_requests_total", "Total prediction requests")
REQUEST_LATENCY = Histogram("denttime_prediction_latency_seconds", "Prediction latency in seconds")
FEATURE_PSI = Gauge("denttime_feature_psi", "PSI by monitored feature", ["feature"])
OUTPUT_RATIO = Gauge("denttime_prediction_class_ratio", "Prediction ratio per class", ["slot_minutes"])
LOGGED_PREDICTIONS_TOTAL = Gauge("denttime_logged_predictions_total", "Total prediction records stored in SQLite")
LABELED_PREDICTIONS_TOTAL = Gauge("denttime_labeled_predictions_total", "Total predictions that already have actual outcomes")
MACRO_F1 = Gauge("denttime_macro_f1", "Current rolling macro F1")
MAE_MIN = Gauge("denttime_mae_minutes", "Current rolling MAE in minutes")
UNDER_RATE = Gauge("denttime_underestimation_rate", "Current under-estimation rate")
BASELINE_F1 = Gauge("denttime_macro_f1_baseline", "Offline baseline macro F1")
BASELINE_UNDER = Gauge("denttime_underestimation_rate_baseline", "Offline baseline under-estimation rate")
MISSING_RATE = Gauge("denttime_input_missing_rate", "Recent input missing rate")

TIME_OF_DAY_TO_BUCKET = {
    "morning": 8,
    "afternoon": 12,
    "evening": 16,
}


class ModelBundle(dict):
    @property
    def model(self):
        return self["model"]

    @property
    def label_encoder(self):
        return self.get("label_encoder")

    @property
    def feature_cols(self) -> List[str]:
        return self.get("feature_cols", FEATURE_COLUMNS)

    @property
    def index_to_class(self) -> Dict[int, int]:
        raw = self.get("index_to_class", {})
        return {int(k): int(v) for k, v in raw.items()}

    @property
    def model_version(self) -> str:
        return self.get("model_version", "denttime_model_unknown")



def load_json(path: Path) -> dict:
    if not path.exists():
        return {}
    text = path.read_text(encoding="utf-8").strip()
    if not text:
        return {}
    return json.loads(text)



def load_model_bundle() -> ModelBundle:
    if not MODEL_PATH.exists():
        raise RuntimeError("model.joblib not found in artifacts/")
    loaded = joblib.load(MODEL_PATH)
    if isinstance(loaded, dict) and "model" in loaded:
        bundle = ModelBundle(loaded)
    else:
        bundle = ModelBundle({"model": loaded})

    baseline = load_json(BASELINE_PATH)
    if baseline.get("model_version"):
        bundle["model_version"] = baseline["model_version"]
    if not bundle.get("feature_cols"):
        bundle["feature_cols"] = FEATURE_COLUMNS
    return bundle



def load_transformer() -> FeatureTransformer:
    return FeatureTransformer(
        doctor_profile_path=str(RUNTIME_ARTIFACTS_DIR / "doctor_profile.json"),
        clinic_profile_path=str(RUNTIME_ARTIFACTS_DIR / "clinic_profile.json"),
        treatment_dict_path=str(RUNTIME_ARTIFACTS_DIR / "treatment_dict.json"),
        treatment_encoding_path=str(RUNTIME_ARTIFACTS_DIR / "treatment_encoding.json"),
    )



def _load_runtime_artifacts() -> None:
    app.state.transformer = load_transformer()
    app.state.model_bundle = load_model_bundle()
    app.state.baseline = load_json(BASELINE_PATH)
    app.state.feature_stats = load_json(FEATURE_STATS_PATH)
    app.state.treatment_dict = load_json(RUNTIME_ARTIFACTS_DIR / "treatment_dict.json")
    with open(RUNTIME_ARTIFACTS_DIR / "doctor_profile.json", encoding="utf-8") as fh:
        app.state.doctor_profile = json.load(fh)



def _adapt_ui_request(req: PredictRequest) -> Dict[str, Any]:
    request_dt = req.request_time.astimezone(timezone.utc)
    treatment = req.treatmentSymptoms[0]
    tooth_no = ",".join(req.toothNumbers) if req.toothNumbers else None
    dentist_id = req.doctorId.strip() or None

    # Adapter layer from current P4 UI contract to Sun's P2 feature-engineering contract.
    # These defaults are deterministic PoC defaults for fields that the current UI does not collect yet.
    return {
        "clinic_pseudo_id": "__global__",
        "dentist_pseudo_id": dentist_id,
        "has_dentist_id": 1 if dentist_id else 0,
        "treatment": treatment,
        "tooth_no": tooth_no,
        "surfaces": None,
        "total_amount": 990.0,
        "has_notes": 1 if req.notes and req.notes.strip() else 0,
        "appt_day_of_week": request_dt.weekday(),
        "appt_hour_bucket": TIME_OF_DAY_TO_BUCKET.get(req.timeOfDay, 0),
        "is_first_case": 1 if req.isFirstCase else 0,
        "appointment_rank_in_day": None,
        "scheduled_duration_min": 30,
    }



def _decode_prediction(bundle: ModelBundle, raw_prediction: Any) -> int:
    if bundle.index_to_class:
        return int(bundle.index_to_class.get(int(raw_prediction), raw_prediction))
    if bundle.label_encoder is not None:
        decoded = bundle.label_encoder.inverse_transform([int(raw_prediction)])[0]
        return int(decoded)
    return int(raw_prediction)



def _build_options() -> Dict[str, Any]:
    treatment_dict: Dict[str, List[str]] = app.state.treatment_dict
    symptoms = []
    for class_name in sorted(treatment_dict.keys()):
        aliases = treatment_dict[class_name]
        if not aliases:
            continue
        symptoms.append({"id": class_name, "symptom": aliases[0]})

    doctor_keys = [key for key in sorted(app.state.doctor_profile.keys()) if key != "__global__"]
    doctors = [{"id": key, "doctor": key} for key in doctor_keys[:20]]
    return {"symptoms": symptoms, "doctors": doctors}


@app.on_event("startup")
def startup() -> None:
    init_db()
    _load_runtime_artifacts()


@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    REQUEST_COUNT.inc()
    started = time.perf_counter()

    try:
        bundle: ModelBundle = app.state.model_bundle
        transformer: FeatureTransformer = app.state.transformer
    except Exception as exc:  # pragma: no cover - fatal startup state issue
        raise HTTPException(status_code=503, detail=f"runtime not initialized: {exc}")

    adapted_row = _adapt_ui_request(req)
    raw_df = pd.DataFrame([adapted_row])

    try:
        features_df = transformer.transform(raw_df)
    except Exception as exc:
        raise HTTPException(status_code=422, detail=str(exc))

    model_input = features_df.drop(columns=["scheduled_duration_min", "duration_class"], errors="ignore")
    model_input = model_input.reindex(columns=bundle.feature_cols)

    with REQUEST_LATENCY.time():
        raw_prediction = bundle.model.predict(model_input)[0]
        duration_minutes = _decode_prediction(bundle, raw_prediction)
        class_probabilities: Optional[Dict[str, float]] = None
        confidence = 0.0
        if hasattr(bundle.model, "predict_proba"):
            proba = bundle.model.predict_proba(model_input)[0]
            confidence = float(max(proba) * 100.0)
            if bundle.index_to_class:
                class_probabilities = {
                    str(bundle.index_to_class.get(idx, idx)): float(prob)
                    for idx, prob in enumerate(proba)
                }
            elif bundle.label_encoder is not None:
                decoded_labels = bundle.label_encoder.inverse_transform(list(range(len(proba))))
                class_probabilities = {str(int(label)): float(prob) for label, prob in zip(decoded_labels, proba)}
            else:
                class_probabilities = {str(idx): float(prob) for idx, prob in enumerate(proba)}

    request_id = str(uuid.uuid4())
    transformed_features = model_input.iloc[0].to_dict()
    doctor_ratio = 1.0
    clinic_median = float(transformed_features.get("clinic_median_duration", 0.0) or 0.0)
    doctor_median = float(transformed_features.get("doctor_median_duration", 0.0) or 0.0)
    if clinic_median > 0:
        doctor_ratio = round(doctor_median / clinic_median, 6)

    conn = get_conn()
    conn.execute(
        """
        INSERT INTO predictions (
            request_id, request_ts, treatment_class, tooth_count,
            time_of_day, doctor_id, is_first_case,
            doctor_speed_ratio, notes, predicted_slot, actual_slot,
            input_payload_json, transformed_features_json, prediction_confidence, model_version
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            request_id,
            req.request_time.isoformat(),
            adapted_row["treatment"],
            len(req.toothNumbers) if req.toothNumbers else 0,
            req.timeOfDay,
            adapted_row["dentist_pseudo_id"],
            adapted_row["is_first_case"],
            doctor_ratio,
            req.notes,
            duration_minutes,
            None,
            json.dumps(req.model_dump(mode="json"), ensure_ascii=False),
            json.dumps(transformed_features, ensure_ascii=False),
            confidence,
            bundle.model_version,
        ),
    )
    conn.commit()
    conn.close()

    ended = datetime.now(timezone.utc)
    processing_time_ms = (time.perf_counter() - started) * 1000.0
    return {
        "predicted_duration_class": duration_minutes,
        "unit": "minutes",
        "model_version": bundle.model_version,
        "timestamp": ended,
        "request_id": request_id,
        "status": "success",
        "processing_time_ms": processing_time_ms,
        "confidence": round(confidence, 2),
        "class_probabilities": class_probabilities,
    }


@app.post("/actual", response_model=ActualResponse)
def submit_actual(req: ActualRequest):
    conn = get_conn()
    cur = conn.execute(
        """
        UPDATE predictions
        SET actual_slot = ?
        WHERE request_id = ?
        """,
        (req.actual_duration, req.request_id),
    )
    conn.commit()
    updated = cur.rowcount
    conn.close()
    if updated == 0:
        raise HTTPException(status_code=404, detail="request_id not found")
    return {
        "request_id": req.request_id,
        "status": "logged",
        "logged_at": datetime.now(timezone.utc),
    }


@app.get("/metrics")
def metrics():
    baseline = load_json(BASELINE_PATH)
    state = load_json(STATE_PATH)

    if "macro_f1" in baseline:
        BASELINE_F1.set(float(baseline["macro_f1"]))
    under_baseline = baseline.get("under_estimation_rate", baseline.get("underestimation_rate"))
    if under_baseline is not None:
        BASELINE_UNDER.set(float(under_baseline))

    for feature, value in state.get("feature_psi", {}).items():
        FEATURE_PSI.labels(feature=feature).set(float(value))
    for slot, value in state.get("prediction_ratio", {}).items():
        OUTPUT_RATIO.labels(slot_minutes=str(slot)).set(float(value))

    if "macro_f1" in state:
        MACRO_F1.set(float(state["macro_f1"]))
    if "mae_minutes" in state:
        MAE_MIN.set(float(state["mae_minutes"]))
    under_rate = state.get("under_estimation_rate", state.get("underestimation_rate"))
    if under_rate is not None:
        UNDER_RATE.set(float(under_rate))
    if "input_missing_rate" in state:
        MISSING_RATE.set(float(state["input_missing_rate"]))

    conn = get_conn()
    total_predictions = conn.execute("SELECT COUNT(*) FROM predictions").fetchone()[0]
    total_labeled = conn.execute("SELECT COUNT(*) FROM predictions WHERE actual_slot IS NOT NULL").fetchone()[0]
    conn.close()
    LOGGED_PREDICTIONS_TOTAL.set(float(total_predictions))
    LABELED_PREDICTIONS_TOTAL.set(float(total_labeled))

    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)


@app.get("/options", response_model=OptionsResponse)
def get_options():
    return _build_options()
