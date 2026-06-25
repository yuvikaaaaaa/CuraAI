from pydantic import BaseModel, EmailStr
from typing import List, Optional, Any
from datetime import datetime


class UserBase(BaseModel):
    name: str
    email: str
    picture: Optional[str] = None


class UserCreate(UserBase):
    google_id: str


class UserOut(UserBase):
    id: str
    is_admin: bool
    is_active: bool
    created_at: datetime
    last_login: datetime

    class Config:
        from_attributes = True


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class PredictionRequest(BaseModel):
    symptoms: List[str]


class PredictionOut(BaseModel):
    id: str
    user_id: str
    symptoms: List[str]
    disease: str
    confidence: float
    severity_score: Optional[float]
    risk_level: Optional[str]
    health_score: Optional[float]
    description: Optional[str]
    medications: Optional[List[str]]
    diet: Optional[List[str]]
    precautions: Optional[List[str]]
    workout: Optional[List[str]]
    created_at: datetime

    class Config:
        from_attributes = True


class HistoryOut(BaseModel):
    predictions: List[PredictionOut]
    total: int


class AnalyticsOut(BaseModel):
    total_predictions: int
    most_frequent_disease: Optional[str]
    disease_distribution: List[dict]
    prediction_trend: List[dict]
    avg_confidence: float
    avg_health_score: float
    most_common_risk: str | None = None

class AdminUserOut(UserOut):
    prediction_count: int


class AdminStatsOut(BaseModel):
    total_users: int
    total_predictions: int
    active_users_today: int
    top_diseases: List[dict]


class SymptomListOut(BaseModel):
    symptoms: List[str]


class HealthScoreOut(BaseModel):
    score: float
    label: str
    color: str