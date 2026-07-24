import React, { useState } from "react";
import { api } from "../api";

const CATEGORIES = ["Food", "Travel", "Shopping", "Bills", "Other"];

// Demonstrates the AI auto-categorize call: when the user finishes typing a
// description, we ask the backend to suggest a category.
export default function ExpenseForm({ onCreated }) {
  const [form, setForm] = useState({
    amount: "", category: "Other", description: "",
    date: new Date().toISOString().slice(0, 10),
  });
  const [suggesting, setSuggesting] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const suggestCategory = async () => {
    if (!form.description.trim()) return;
    setSuggesting(true);
    try {
      const { category } = await api.categorize(form.description);
      setForm((f) => ({ ...f, category }));
    } catch { /* ignore — keep manual choice */ } finally {
      setSuggesting(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    await api.createExpense({ ...form, amount: parseFloat(form.amount) });
    setForm((f) => ({ ...f, amount: "", description: "" }));
    onCreated?.();
  };

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 8, margin: "16px 0" }}>
      <input placeholder="Amount" type="number" step="0.01"
             value={form.amount} onChange={set("amount")} required />
      <input placeholder="Description (e.g. Uber to airport)"
             value={form.description} onChange={set("description")}
             onBlur={suggestCategory} required />
      <select value={form.category} onChange={set("category")}>
        {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
      </select>
      {suggesting && <small>🤖 AI is suggesting a category…</small>}
      <input type="date" value={form.date} onChange={set("date")} required />
      <button type="submit">Add Expense</button>
    </form>
  );
}
