from __future__ import annotations

from fastapi.testclient import TestClient

from app.main import app
from monitoring.update_metrics import main as update_metrics


def main() -> None:
    with TestClient(app) as client:
        options = client.get('/options')
        options.raise_for_status()
        data = options.json()
        first_symptom = data['symptoms'][0]['symptom']
        first_doctor = data['doctors'][0]['id'] if data['doctors'] else ''

        predict_payload = {
            'treatmentSymptoms': [first_symptom],
            'toothNumbers': ['16'],
            'timeOfDay': 'morning',
            'doctorId': first_doctor,
            'isFirstCase': False,
            'notes': 'smoke test',
            'request_time': '2026-04-21T00:00:00Z',
        }
        pred = client.post('/predict', json=predict_payload)
        pred.raise_for_status()
        pred_json = pred.json()
        print('predict:', pred_json)

        actual_payload = {
            'request_id': pred_json['request_id'],
            'actual_duration': pred_json['predicted_duration_class'],
            'unit': 'minutes',
            'completed_at': '2026-04-21T01:00:00Z',
        }
        actual = client.post('/actual', json=actual_payload)
        actual.raise_for_status()
        print('actual:', actual.json())

        update_metrics()
        metrics = client.get('/metrics')
        metrics.raise_for_status()
        body = metrics.text
        required = [
            'denttime_prediction_requests_total',
            'denttime_logged_predictions_total',
            'denttime_macro_f1',
            'denttime_feature_psi',
        ]
        for token in required:
            assert token in body, f'missing metric: {token}'
        print('metrics: ok')


if __name__ == '__main__':
    main()
