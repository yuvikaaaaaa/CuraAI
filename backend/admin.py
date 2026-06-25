from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from collections import Counter

from database import get_db
from models import User, Prediction
from schemas import AdminStatsOut
from auth import get_admin_user

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/stats", response_model=AdminStatsOut)
def get_admin_stats(db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    total_users = db.query(User).count()
    total_predictions = db.query(Prediction).count()
    today = datetime.utcnow().date()
    active_users_today = (
        db.query(Prediction.user_id)
        .filter(func.date(Prediction.created_at) == today)
        .distinct().count()
    )
    predictions = db.query(Prediction).all()
    disease_counts = Counter(p.disease for p in predictions)
    top_diseases = [{"disease": d, "count": c} for d, c in disease_counts.most_common(10)]
    return AdminStatsOut(
        total_users=total_users,
        total_predictions=total_predictions,
        active_users_today=active_users_today,
        top_diseases=top_diseases,
    )


@router.get("/users")
def get_all_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    users = db.query(User).offset(skip).limit(limit).all()
    result = []
    for user in users:
        count = db.query(Prediction).filter(Prediction.user_id == user.id).count()
        result.append({
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "picture": user.picture,
            "is_admin": user.is_admin,
            "is_active": user.is_active,
            "created_at": user.created_at,
            "last_login": user.last_login,
            "prediction_count": count,
        })
    total = db.query(User).count()
    return {"users": result, "total": total}


@router.delete("/users/{user_id}")
def delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_admin_user),
):
    if user_id == current_admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"message": "User deleted"}


@router.get("/predictions")
def get_all_predictions(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    predictions = (
        db.query(Prediction)
        .order_by(Prediction.created_at.desc())
        .offset(skip).limit(limit).all()
    )
    total = db.query(Prediction).count()
    result = []
    for p in predictions:
        result.append({
            "id": p.id,
            "user_id": p.user_id,
            "disease": p.disease,
            "confidence": p.confidence,
            "risk_level": p.risk_level,
            "symptoms": p.symptoms,
            "created_at": p.created_at,
        })
    return {"predictions": result, "total": total}


@router.delete("/predictions/{prediction_id}")
def delete_prediction(
    prediction_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    pred = db.query(Prediction).filter(Prediction.id == prediction_id).first()
    if not pred:
        raise HTTPException(status_code=404, detail="Prediction not found")
    db.delete(pred)
    db.commit()
    return {"message": "Deleted"}