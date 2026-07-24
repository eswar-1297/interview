"""AI routes — auto-categorization and spending insights."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import ai
import models
import schemas
from database import get_db

router = APIRouter(prefix="/api/ai", tags=["ai"])


@router.post("/categorize", response_model=schemas.CategorizeOut)
def categorize(payload: schemas.CategorizeIn):
    category, confidence = ai.categorize(payload.description)
    return {"category": category, "confidence": confidence}


@router.get("/insights", response_model=schemas.InsightsOut)
def insights(db: Session = Depends(get_db)):
    expenses = db.query(models.Expense).all()
    summary, tip = ai.insights(expenses)
    return {"summary": summary, "tip": tip}
