// Central API helper. Change BASE if your backend runs elsewhere.
const BASE = "http://localhost:8000";

async function json(res) {
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.status === 204 ? null : res.json();
}

export const api = {
  listExpenses: (category) =>
    fetch(`${BASE}/api/expenses${category ? `?category=${encodeURIComponent(category)}` : ""}`).then(json),

  createExpense: (data) =>
    fetch(`${BASE}/api/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(json),

  updateExpense: (id, data) =>
    fetch(`${BASE}/api/expenses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(json),

  deleteExpense: (id) =>
    fetch(`${BASE}/api/expenses/${id}`, { method: "DELETE" }).then(json),

  summary: () => fetch(`${BASE}/api/expenses/summary`).then(json),

  // AI
  categorize: (description) =>
    fetch(`${BASE}/api/ai/categorize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description }),
    }).then(json),

  insights: () => fetch(`${BASE}/api/ai/insights`).then(json),
};
