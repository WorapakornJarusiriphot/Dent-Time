from pydantic import BaseModel, field_validator
from typing import List, Optional
from datetime import datetime


class PredictRequest(BaseModel):
    treatmentSymptoms: List[str]
    toothNumbers: Optional[List[str]] = None
    timeOfDay: str
    doctorId: str
    isFirstCase: bool
    notes: Optional[str] = None
    request_time: datetime

    @field_validator("treatmentSymptoms")
    @classmethod
    def validate_treatment_symptoms(cls, v):
        if not v or len(v) == 0:
            raise ValueError("treatmentSymptoms is required")
        return v

    @field_validator("timeOfDay")
    @classmethod
    def validate_time_of_day(cls, v):
        if not v or not v.strip():
            raise ValueError("timeOfDay is required")
        return v

    @field_validator("doctorId")
    @classmethod
    def validate_doctor_id(cls, v):
        if not v or not v.strip():
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


class ActualResponse(BaseModel):
    request_id: str
    status: str
    logged_at: datetime