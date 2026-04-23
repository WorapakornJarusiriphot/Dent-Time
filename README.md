# DentTime – ML-Enabled Dental Appointment Duration Prediction with Monitoring & Alerting

DentTime is a machine learning–enabled software system for predicting dental appointment duration and monitoring model behavior in production.

This repository integrates:
- a **FastAPI** prediction service
- a **React + Vite** frontend
- **SQLite** for prediction logging
- **Prometheus** for metrics collection and alert evaluation
- **Grafana** for monitoring dashboards
- a **metrics updater** job that computes drift and performance signals from persisted predictions

The system is designed as an end-to-end ML software system, covering **inference, logging, monitoring, alerting, and basic post-deployment evaluation**.

---

## 1) Problem Statement

Dental clinics need a practical way to estimate appointment duration so they can:
- reduce over-booking and under-booking
- improve patient wait time
- support safer scheduling decisions
- monitor whether model quality degrades after deployment

DentTime predicts appointment duration in minutes and then monitors:
- **input data quality**
- **feature drift**
- **prediction distribution**
- **performance degradation**
- **under-estimation risk**

---

## 2) Main Features

### Prediction Service
- Predict appointment duration from treatment-related inputs
- Return predicted duration in **minutes**
- Return model metadata and inference confidence

### Frontend
- Landing page and prediction UI
- Sends live requests to the FastAPI backend
- Displays prediction result to the user

### Monitoring
- Prometheus scrapes `/metrics`
- Grafana visualizes:
  - MAE (minutes)
  - Input Missing Rate
  - Logged Predictions (Persisted)
  - Feature Drift (PSI)
  - Prediction Class Ratio
  - Macro F1 vs Baseline
  - Under-estimation Rate vs Baseline

### Alerting
Prometheus alert rules are defined for:
- `DentTimeFeatureDriftHigh`
- `DentTimeMacroF1Drop`
- `DentTimeUnderEstimationHigh`
- `DentTimeMissingRateHigh`

### Persistence
- Predictions are stored in SQLite (`data/denttime.db`)
- Actual outcomes can be logged back through `/actual`
- Monitoring metrics are recomputed from persisted data

---

## 3) Tech Stack

### Backend
- FastAPI
- Pydantic
- pandas
- NumPy
- scikit-learn
- XGBoost
- joblib
- SQLite
- prometheus-client

### Frontend
- React
- TypeScript
- Vite
- Chakra UI

### Monitoring / Deployment
- Docker Compose
- Prometheus
- Grafana

---

## 4) Project Structure

```text
Final-term-project-main/
├─ app/
│  ├─ db.py
│  ├─ main.py
│  └─ schemas.py
├─ artifacts/
│  ├─ baseline_metrics.json
│  ├─ feature_columns.json
│  ├─ feature_stats.json
│  ├─ model.joblib
│  └─ smoke_test_inputs.json
├─ data/
│  ├─ denttime.db
│  └─ reference/
│     └─ reference_features.parquet
├─ frontend/
│  ├─ Dockerfile
│  ├─ package.json
│  └─ src/
├─ grafana/
│  ├─ dashboards/
│  │  └─ denttime-monitoring.json
│  └─ provisioning/
├─ monitoring/
│  ├─ state.json
│  └─ update_metrics.py
├─ prometheus/
│  ├─ alerts.yml
│  └─ prometheus.yml
├─ src/features/
│  ├─ build_profiles.py
│  ├─ feature_transformer.py
│  ├─ tooth_parser.py
│  └─ treatment_mapper.py
├─ docker-compose.yml
├─ requirements.txt
├─ run_metrics_loop.py
└─ smoke_test_integration.py