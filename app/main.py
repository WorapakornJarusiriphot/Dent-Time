# app/main.py
from __future__ import annotations
import json
import joblib
import sqlite3
from datetime import datetime
from pathlib import Path

import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
from prometheus_client import (
    Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST
)

from app.db import init_db, get_conn
from common.preprocess import transform_features

from fastapi.middleware.cors import CORSMiddleware

import time
import uuid
from datetime import datetime, timezone
from app.schemas import (
    PredictRequest,
    PredictResponse,
    ActualRequest,
    ActualResponse,
    OptionsResponse,
)

app = FastAPI(title="DentTime Monitoring API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = Path("artifacts/model.joblib")
BASELINE_PATH = Path("artifacts/baseline_metrics.json")
STATE_PATH = Path("monitoring/state.json")

REQUEST_COUNT = Counter(
    "denttime_prediction_requests_total",
    "Total prediction requests"
)
REQUEST_LATENCY = Histogram(
    "denttime_prediction_latency_seconds",
    "Prediction latency in seconds"
)

FEATURE_PSI = Gauge(
    "denttime_feature_psi",
    "PSI by monitored feature",
    ["feature"]
)
OUTPUT_RATIO = Gauge(
    "denttime_prediction_class_ratio",
    "Prediction ratio per class",
    ["slot_minutes"]
)
LOGGED_PREDICTIONS_TOTAL = Gauge(
    "denttime_logged_predictions_total",
    "Total prediction records stored in SQLite"
)

LABELED_PREDICTIONS_TOTAL = Gauge(
    "denttime_labeled_predictions_total",
    "Total predictions that already have actual outcomes"
)

MACRO_F1 = Gauge("denttime_macro_f1", "Current rolling macro F1")
MAE_MIN = Gauge("denttime_mae_minutes", "Current rolling MAE in minutes")
UNDER_RATE = Gauge("denttime_underestimation_rate", "Current under-estimation rate")
BASELINE_F1 = Gauge("denttime_macro_f1_baseline", "Offline baseline macro F1")
BASELINE_UNDER = Gauge("denttime_underestimation_rate_baseline", "Offline baseline under-estimation rate")
MISSING_RATE = Gauge("denttime_input_missing_rate", "Recent input missing rate")

class PredictRequest(BaseModel):
    appointment_id: str
    treatment_class: str
    tooth_count: int
    time_of_day: str
    is_first_case: int
    doctor_speed_ratio: float

class ActualRequest(BaseModel):
    appointment_id: str
    actual_slot: int

def load_model():
    if not MODEL_PATH.exists():
        raise RuntimeError("model.joblib not found in artifacts/")

    try:
        return joblib.load(MODEL_PATH)
    except Exception as e:
        raise RuntimeError(
            "model.joblib exists but is not a valid trained model artifact yet"
        ) from e

def load_json(path: Path) -> dict:
    if not path.exists():
        return {}

    text = path.read_text(encoding="utf-8").strip()
    if not text:
        return {}

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return {}
    
def map_doctor_speed_ratio(doctor_id: str) -> float:
    mapping = {
        "1": 0.95,
        "2": 1.00,
        "3": 1.05,
    }
    return mapping.get(doctor_id, 1.0)

@app.on_event("startup")
def startup() -> None:
    init_db()

@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    REQUEST_COUNT.inc()
    started = time.perf_counter()

    try:
        model = load_model()
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))

    request_id = str(uuid.uuid4())
    tooth_count = len(req.toothNumbers) if req.toothNumbers else 1
    treatment_class = ",".join(sorted(req.treatmentSymptoms))
    time_of_day = req.timeOfDay
    is_first_case = 1 if req.isFirstCase else 0
    doctor_speed_ratio = map_doctor_speed_ratio(req.doctorId)

    raw_df = pd.DataFrame([{
        "treatment_class": treatment_class,
        "tooth_count": tooth_count,
        "time_of_day": time_of_day,
        "is_first_case": is_first_case,
        "doctor_speed_ratio": doctor_speed_ratio,
    }])

    with REQUEST_LATENCY.time():
        x = transform_features(raw_df)
        pred = int(model.predict(x)[0])

    conn = get_conn()
    conn.execute("""
        INSERT INTO predictions (
            request_id, request_ts, treatment_class, tooth_count,
            time_of_day, doctor_id, is_first_case,
            doctor_speed_ratio, notes, predicted_slot, actual_slot
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        request_id,
        req.request_time.isoformat(),
        treatment_class,
        tooth_count,
        time_of_day,
        req.doctorId,
        is_first_case,
        doctor_speed_ratio,
        req.notes,
        pred,
        None,
    ))
    conn.commit()
    conn.close()

    ended = datetime.now(timezone.utc)
    processing_time_ms = (time.perf_counter() - started) * 1000

    return {
        "predicted_duration_class": pred,
        "unit": "minutes",
        "model_version": "DentTimeModel_mock_v1",
        "timestamp": ended,
        "request_id": request_id,
        "status": "success",
        "processing_time_ms": processing_time_ms,
    }

@app.post("/actual", response_model=ActualResponse)
def submit_actual(req: ActualRequest):
    conn = get_conn()
    cur = conn.execute("""
        UPDATE predictions
        SET actual_slot = ?
        WHERE request_id = ?
    """, (req.actual_duration, req.request_id))
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
    if "underestimation_rate" in baseline:
        BASELINE_UNDER.set(float(baseline["underestimation_rate"]))

    for feature, value in state.get("feature_psi", {}).items():
        FEATURE_PSI.labels(feature=feature).set(float(value))

    for slot, value in state.get("prediction_ratio", {}).items():
        OUTPUT_RATIO.labels(slot_minutes=str(slot)).set(float(value))

    if "macro_f1" in state:
        MACRO_F1.set(float(state["macro_f1"]))
    if "mae_minutes" in state:
        MAE_MIN.set(float(state["mae_minutes"]))
    if "underestimation_rate" in state:
        UNDER_RATE.set(float(state["underestimation_rate"]))
    if "input_missing_rate" in state:
        MISSING_RATE.set(float(state["input_missing_rate"]))

    conn = get_conn()
    total_predictions = conn.execute(
        "SELECT COUNT(*) FROM predictions"
    ).fetchone()[0]
    total_labeled = conn.execute(
        "SELECT COUNT(*) FROM predictions WHERE actual_slot IS NOT NULL"
    ).fetchone()[0]
    conn.close()

    LOGGED_PREDICTIONS_TOTAL.set(float(total_predictions))
    LABELED_PREDICTIONS_TOTAL.set(float(total_labeled))

    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)

@app.get("/options", response_model=OptionsResponse)
def get_options():
    return {
        "symptoms": [
            {"id": "1", "symptom": "Tooth pain"},
            {"id": "2", "symptom": "Swelling"},
            {"id": "3", "symptom": "Bleeding gums"},
        ],
        "doctors": [
            {"id": "1", "doctor": "Dr. Smith"},
            {"id": "2", "doctor": "Dr. John"},
            {"id": "3", "doctor": "Dr. Emily"},
        ],
    }