import React, { useState, useEffect } from "react";

export default function Timer({ durationMinutes, onTimeUp }) {
  const [secondsLeft, setSecondsLeft] = useState(durationMinutes * 60);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onTimeUp();
      return;
    }
    const id = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [secondsLeft, onTimeUp]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const isLow = secondsLeft < 300;

  return (
    <span className={`font-mono text-sm tabular-nums tracking-wide ${
      isLow ? "text-red-600 font-bold" : "text-gray-500"
    }`}>
      {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
    </span>
  );
}
