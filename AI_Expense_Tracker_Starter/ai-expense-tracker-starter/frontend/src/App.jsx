import React, { useEffect, useState } from "react";
import { api } from "./api";
import ExpenseForm from "./components/ExpenseForm";
import ExpenseList from "./components/ExpenseList";
import Insights from "./components/Insights";

// Minimal working shell — extend the styling and add Edit/Filter/Dashboard.
export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setExpenses(await api.listExpenses());
    } catch (e) {
      setError("Could not load expenses. Is the backend running on :8000?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div style={{ maxWidth: 760, margin: "40px auto", fontFamily: "system-ui" }}>
      <h1>AI Expense Tracker</h1>

      <ExpenseForm onCreated={load} />
      <Insights />

      {loading && <p>Loading…</p>}
      {error && <p style={{ color: "crimson" }}>{error}</p>}
      {!loading && !error && (
        <ExpenseList expenses={expenses} onChanged={load} />
      )}
    </div>
  );
}
