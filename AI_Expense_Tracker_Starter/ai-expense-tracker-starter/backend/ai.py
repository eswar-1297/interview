"""
AI layer for the Expense Tracker.

The starter uses a lightweight keyword classifier so the endpoints work immediately.
Upgrade paths (pick one and explain it in your Q&A):

  1. scikit-learn  — train a TfidfVectorizer + MultinomialNB on labelled descriptions.
  2. LLM API       — send the description to Claude/OpenAI and ask for a category + insight.

Keep the same function signatures so the routers don't change.
"""
from collections import defaultdict

CATEGORIES = ["Food", "Travel", "Shopping", "Bills", "Other"]

# Seed keyword table — replace with a trained model or an LLM prompt.
_KEYWORDS = {
    "Food":     ["restaurant", "coffee", "pizza", "lunch", "dinner", "grocery",
                 "swiggy", "zomato", "cafe", "snack", "food"],
    "Travel":   ["uber", "ola", "flight", "train", "bus", "cab", "fuel", "petrol",
                 "hotel", "trip", "travel"],
    "Shopping": ["amazon", "flipkart", "clothes", "shoes", "electronics", "mall",
                 "shopping", "myntra"],
    "Bills":    ["electricity", "water", "rent", "wifi", "internet", "phone",
                 "recharge", "bill", "insurance", "subscription"],
}


def categorize(description: str):
    """Return (category, confidence) for a free-text description."""
    text = (description or "").lower()
    scores = {cat: sum(1 for kw in kws if kw in text) for cat, kws in _KEYWORDS.items()}
    best = max(scores, key=scores.get)
    hits = scores[best]
    if hits == 0:
        return "Other", 0.30
    total = sum(scores.values()) or 1
    return best, round(0.5 + 0.5 * hits / total, 2)


def insights(expenses):
    """
    Build a short natural-language summary + one saving tip from a list of
    expense-like objects (each with .amount and .category).
    """
    if not expenses:
        return "No expenses recorded yet — add a few to see AI insights.", "Start by logging your daily spends."

    total = sum(e.amount for e in expenses)
    by_cat = defaultdict(float)
    for e in expenses:
        by_cat[e.category] += e.amount

    top_cat = max(by_cat, key=by_cat.get)
    top_amt = by_cat[top_cat]
    share = round(100 * top_amt / total) if total else 0

    summary = (
        f"You've spent {total:.2f} across {len(expenses)} expenses. "
        f"Your biggest category is {top_cat} at {top_amt:.2f} ({share}% of total)."
    )
    tip = (
        f"{top_cat} is your largest spend — setting a monthly cap on it could free up cash."
        if share >= 40
        else "Your spending is fairly balanced. Keep tracking to spot trends early."
    )
    return summary, tip
