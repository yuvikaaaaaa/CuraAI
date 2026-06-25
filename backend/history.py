from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import User, Prediction
from schemas import PredictionOut, HistoryOut, AnalyticsOut
from auth import get_current_user
from sqlalchemy import func
from collections import Counter
from datetime import datetime, timedelta, timezone

router = APIRouter(prefix="/history", tags=["history"])


@router.get("/", response_model=HistoryOut)
def get_history(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Prediction).filter(Prediction.user_id == current_user.id)
    total = query.count()
    predictions = query.order_by(Prediction.created_at.desc()).offset(skip).limit(limit).all()
    return HistoryOut(predictions=predictions, total=total)


@router.delete("/{prediction_id}")
def delete_prediction(
    prediction_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    prediction = db.query(Prediction).filter(
        Prediction.id == prediction_id,
        Prediction.user_id == current_user.id,
    ).first()
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction not found")
    db.delete(prediction)
    db.commit()
    return {"message": "Deleted successfully"}


@router.get("/analytics", response_model=AnalyticsOut)
def get_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    predictions = db.query(Prediction).filter(Prediction.user_id == current_user.id).all()
    total = len(predictions)

    if total == 0:
        return AnalyticsOut(
            total_predictions=0,
            most_frequent_disease=None,
            disease_distribution=[],
            prediction_trend=[],
            avg_confidence=0.0,
            avg_health_score=0.0,
        )

    diseases = [p.disease for p in predictions]
    disease_counts = Counter(diseases)
    most_frequent = disease_counts.most_common(1)[0][0]
    diseases = [p.disease for p in predictions]
    disease_counts = Counter(diseases)
    most_frequent = disease_counts.most_common(1)[0][0]

    risk_counts = Counter(
        [p.risk_level for p in predictions if p.risk_level]
    )

    most_common_risk = (
        risk_counts.most_common(1)[0][0]
        if risk_counts
        else "N/A"
    )

    disease_distribution = [
        {"disease": d, "count": c} for d, c in disease_counts.most_common(10)
    ]

    # Trend: last 30 days by day
    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
    print("created_at =", predictions[0].created_at)
    print("thirty_days_ago =", thirty_days_ago)
    recent = [p for p in predictions if p.created_at >= thirty_days_ago]
    trend_map = {}
    for p in recent:
        day = p.created_at.strftime("%Y-%m-%d")
        trend_map[day] = trend_map.get(day, 0) + 1
    prediction_trend = [{"date": d, "count": c} for d, c in sorted(trend_map.items())]

    avg_confidence = sum(p.confidence for p in predictions) / total
    health_scores = [p.health_score for p in predictions if p.health_score is not None]
    avg_health_score = sum(health_scores) / len(health_scores) if health_scores else 0.0

    return AnalyticsOut(
        total_predictions=total,
        most_frequent_disease=most_frequent,
        most_common_risk=most_common_risk,
        disease_distribution=disease_distribution,
        prediction_trend=prediction_trend,
        avg_confidence=round(avg_confidence, 2),
        avg_health_score=round(avg_health_score, 2),
    )