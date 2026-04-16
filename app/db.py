from __future__ import annotations
import sqlite3
from pathlib import Path

DB_PATH = Path("data/denttime.db")

def get_conn() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db() -> None:
    conn = get_conn()
    conn.execute("""
    CREATE TABLE IF NOT EXISTS predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        request_id TEXT UNIQUE,
        request_ts TEXT,
        treatment_class TEXT,
        tooth_count INTEGER,
        time_of_day TEXT,
        doctor_id TEXT,
        is_first_case INTEGER,
        doctor_speed_ratio REAL,
        notes TEXT,
        predicted_slot INTEGER,
        actual_slot INTEGER
    )
    """)
    conn.commit()
    conn.close()