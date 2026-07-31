import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HRLogin({ onSubmit }) {
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim())     return setError("Please enter your full name.");
    if (!email.trim())    return setError("Please enter your email address.");
    if (!password.trim()) return setError("Please enter your password.");

    setLoading(true);
    try {
      const res  = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (data.success) {
        // The password decides the question bank: fresher or experienced.
        onSubmit({ name: name.trim(), email: data.user.email, level: data.user.level });
        navigate("/interview");
      } else {
        setError("Incorrect password. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (hasErr) =>
    `w-full px-4 py-2.5 rounded border text-sm ${
      hasErr ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"
    } focus:ring-1 focus:ring-gray-400 focus:border-gray-400 outline-none transition`;

  return (
    <div className="min-h-screen bg-white flex">

      {/* ── Left panel ──────────────────────────────────── */}
      <div className="hidden lg:flex w-[440px] flex-shrink-0 bg-gray-900 flex-col justify-between p-10 text-white">
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold">Final Round</p>
          <p className="text-white font-bold text-lg mt-1">HR Interview</p>
        </div>

        <div className="space-y-7">
          <div>
            <p className="font-semibold text-sm">Video Interview — 10 Questions</p>
            <p className="text-gray-400 text-xs mt-1.5 leading-relaxed">
              You will be asked 10 questions covering your background, your technical
              fundamentals, and the projects you have worked on. Each answer is recorded
              on video.
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Coverage</span>
              <span className="text-xs text-gray-500">~25 minutes</span>
            </div>
            <p className="text-sm font-semibold text-white">💬 What is asked</p>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              About you, Python / Java fundamentals, your projects, and how you keep learning.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            {[["10", "Questions"], ["2 min", "Per answer"], ["Video", "Recorded"]].map(([v, l]) => (
              <div key={l} className="bg-gray-800 rounded-lg p-3">
                <p className="text-sm font-bold text-white">{v}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-gray-600 space-y-1">
          <p>Camera and microphone must remain on throughout the session.</p>
          <p>Use the password shared by your interviewer.</p>
        </div>
      </div>

      {/* ── Right panel ─────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              HR Interview Round
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Welcome</h2>
            <p className="text-sm text-gray-500 mt-1">
              Enter your email and the interview password to begin.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => { setName(e.target.value); setError(""); }}
                className={inputClass(error && !name.trim())}
                placeholder="Your full name"
                autoComplete="name"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(""); }}
                className={inputClass(error && !email.trim())}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(""); }}
                className={inputClass(error && !password.trim())}
                placeholder="Provided by interviewer"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded">
                <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-semibold rounded transition-colors"
              >
                {loading ? "Verifying..." : "Start Interview →"}
              </button>
            </div>

          </form>

          {/* Mobile info */}
          <div className="lg:hidden mt-8 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-2 text-center">
              {[["10", "Questions"], ["2 min", "Per answer"], ["Video", "Recorded"]].map(([v, l]) => (
                <div key={l} className="bg-gray-50 rounded p-2.5">
                  <p className="text-base font-bold text-gray-900">{v}</p>
                  <p className="text-[11px] text-gray-500">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
