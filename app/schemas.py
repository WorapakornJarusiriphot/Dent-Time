from __future__ import annotations

from datetime import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


class PredictRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    treatmentSymptoms: List[str] = Field(..., min_length=1)
    toothNumbers: Optional[List[str]] = None
    timeOfDay: str
    doctorId: str
    isFirstCase: bool
    notes: Optional[str] = None
    request_time: datetime

    @field_validator("treatmentSymptoms")
    @classmethod
    def validate_treatment_symptoms(cls, value: List[str]) -> List[str]:
        cleaned = [item.strip() for item in value if item and item.strip()]
        if not cleaned:
            raise ValueError("treatmentSymptoms is required")
        return cleaned

    @field_validator("toothNumbers")
    @classmethod
    def validate_tooth_numbers(cls, value: Optional[List[str]]) -> Optional[List[str]]:
        if value is None:
            return value
        cleaned: List[str] = []
        seen = set()
        for item in value:
            item = (item or "").strip()
            if not item:
                continue
            if item in seen:
                continue
            seen.add(item)
            cleaned.append(item)
        return cleaned

    @field_validator("timeOfDay")
    @classmethod
    def validate_time_of_day(cls, value: str) -> str:
        allowed = {"morning", "afternoon", "evening"}
        v = value.strip().lower()
        if v not in allowed:
            raise ValueError("timeOfDay must be one of: morning, afternoon, evening")
        return v

    @field_validator("doctorId")
    @classmethod
    def validate_doctor_id(cls, value: str) -> str:
        v = value.strip()
        if not v:
            raise ValueError("doctorId is required")
        return v


class PredictResponse(BaseModel):
    predicted_duration_class: int
    unit: str
    model_version: str
    timestamp: datetime
    request_id: str
    status: str
    processing_time_ms: float
    confidence: float = 0.0
    class_probabilities: Optional[Dict[str, float]] = None


class SymptomOption(BaseModel):
    id: str
    symptom: str


class DoctorOption(BaseModel):
    id: str
    doctor: str


class OptionsResponse(BaseModel):
    symptoms: List[SymptomOption]
    doctors: List[DoctorOption]


class ActualRequest(BaseModel):
    request_id: str
    actual_duration: int
    unit: str = "minutes"
    completed_at: Optional[datetime] = None

    @field_validator("actual_duration")
    @classmethod
    def validate_actual_duration(cls, value: int) -> int:
        if value <= 0:
            raise ValueError("actual_duration must be > 0")
        return value


class ActualResponse(BaseModel):
    request_id: str
    status: str
    logged_at: datetime
