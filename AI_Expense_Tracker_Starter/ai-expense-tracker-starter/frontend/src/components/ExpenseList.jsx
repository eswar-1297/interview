import React from "react";
import { api } from "../api";

// TODO for candidate: add inline edit + a category/date filter bar.
export default function ExpenseList({ expenses, onChanged }) {
  const total = expenses.reduce((s, e) => s + e.amount, 0);

  const remove = async (id) => {
    await api.deleteExpense(id);
    onChanged?.();
  };

  if (!expenses.length) return <p>No expenses yet.</p>;

  return (
    <table width="100%" cellPadding="6" style={{ borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>
          <th>Date</th><th>Category</th><th>Description</th>
          <th style={{ textAlign: "right" }}>Amount</th><th></th>
        </tr>
      </thead>
      <tbody>
        {expenses.map((e) => (
          <tr key={e.id} style={{ borderBottom: "1px solid #eee" }}>
            <td>{e.date}</td>
            <td>{e.category}</td>
            <td>{e.description}</td>
            <td style={{ textAlign: "right" }}>{e.amount.toFixed(2)}</td>
            <td><button onClick={() => remove(e.id)}>Delete</button></td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr style={{ fontWeight: "bold" }}>
          <td colSpan={3}>Total</td>
          <td style={{ textAlign: "right" }}>{total.toFixed(2)}</td>
          <td></td>
        </tr>
      </tfoot>
    </table>
  );
}
