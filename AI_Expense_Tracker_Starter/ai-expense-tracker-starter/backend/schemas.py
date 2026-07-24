"""Pydantic request/response schemas."""
from datetime import date
from pydantic import BaseModel, ConfigDict


class ExpenseIn(BaseModel):
    category: str
    amount: float
    description: str
    date: date


class ExpenseOut(ExpenseIn):
    id: int
    model_config = ConfigDict(from_attributes=True)


class CategorizeIn(BaseModel):
    description: str


class CategorizeOut(BaseModel):
    category: str
    confidence: float


class InsightsOut(BaseModel):
    summary: str
    tip: str
