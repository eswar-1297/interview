import React, { useState } from "react";
import { api } from "../api";

// Calls the AI insights endpoint and shows the summary + saving tip.
export default function Insights() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      setData(await api.insights());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "#f5f3ff", padding: 12, borderRadius: 8, margin: "12px 0" }}>
      <button onClick={run} disabled={loading}>
        {loading ? "Thinking…" : "🤖 Get AI Insights"}
      </button>
      {data && (
        <div style={{ marginTop: 8 }}>
          <p><strong>Summary:</strong> {data.summary}</p>
          <p><strong>Tip:</strong> {data.tip}</p>
        </div>
      )}
    </div>
  );
}
