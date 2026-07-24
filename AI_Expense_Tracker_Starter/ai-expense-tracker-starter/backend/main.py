"""AI Expense Tracker — FastAPI entry point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import models
from database import Base, engine
from routers import expenses, ai_routes

# Create tables on startup (fine for a hackathon; use Alembic for real migrations).
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Expense Tracker API")

# Allow the React dev server to call the API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(expenses.router)
app.include_router(ai_routes.router)


@app.get("/")
def root():
    return {"status": "ok", "service": "AI Expense Tracker API"}
