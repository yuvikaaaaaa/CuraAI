from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import traceback

from database import get_db
from models import User, Prediction
from schemas import PredictionRequest, PredictionOut, SymptomListOut
from auth import get_current_user
from predictor import predict as ml_predict, get_all_symptoms

router = APIRouter(prefix="/predict", tags=["predict"])


@router.get("/symptoms", response_model=SymptomListOut)
def list_symptoms():
    symptoms = get_all_symptoms()
    return SymptomListOut(symptoms=symptoms)


@router.post("/", response_model=PredictionOut)
def make_prediction(
    request: PredictionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not request.symptoms:
        raise HTTPException(status_code=400, detail="At least one symptom is required")

    try:
        result = ml_predict(request.symptoms)
        print("FINAL RESULT =", result)
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

    prediction = Prediction(
        user_id=current_user.id,
        symptoms=request.symptoms,
        disease=result["disease"],
        confidence=result["confidence"],
        severity_score=result["severity_score"],
        risk_level=result["risk_level"],
        health_score=result["health_score"],
        description=result.get("description"),
        medications=result.get("medications", []),
        diet=result.get("diet", []),
        precautions=result.get("precautions", []),
        workout=result.get("workout", []),
    )
    db.add(prediction)
    db.commit()
    db.refresh(prediction)
    return prediction