# AI-Powered Expense Tracker — Starter

Full-stack hackathon project: **React** frontend + **Python (FastAPI)** backend + a small **AI layer**.

This starter gives you a working skeleton. Your job is to complete the features, wire the
frontend to the API, and make the AI feature genuinely useful.

## What you must build

Core (required):
1. **Add Expense** — amount, category, description, date
2. **View Expenses** — list with a running total
3. **Edit & Delete**
4. **Filter** — by category and/or date range
5. **Dashboard Summary** — total spent + breakdown by category

AI (required — this is what makes it an *AI* expense tracker):
6. **AI Auto-Categorize** — `POST /api/ai/categorize` predicts a category from the description
7. **AI Spending Insights** — `GET /api/ai/insights` returns a short natural-language summary + one saving tip

> The starter ships a simple keyword classifier so the endpoints work out of the box.
> Upgrade it: train a `scikit-learn` model on the seed data, OR call an LLM API
> (e.g. Claude / OpenAI) with the expense text. Either approach is accepted — explain
> your choice in the video Q&A.

## Run the backend

```bash
cd backend
python -m venv venv
# Windows:  venv\Scripts\activate
# macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API docs (Swagger) will be at http://localhost:8000/docs

## Run the frontend

```bash
cd frontend
npm install
npm run dev      # or npm start, depending on your setup
```

Set the API base URL in `frontend/src/api.js` (defaults to http://localhost:8000).

## Before you zip and submit

Exclude `venv/`, `__pycache__/`, and `node_modules/`.
