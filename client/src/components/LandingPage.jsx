import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LandingPage({ onSubmit }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();

      if (data.success) {
        onSubmit({ email: data.user.email });
        navigate("/test");
      } else {
        setError("Invalid email or password.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-[420px] flex-shrink-0 bg-gray-900 flex-col justify-between p-10 text-white">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">UniqueHire</h1>
          <p className="text-gray-400 text-sm mt-1">VLSI / Physical Design Assessment</p>
        </div>

        <div className="space-y-6">
          <div>
            <p className="font-semibold text-sm">Technical Round</p>
            <p className="text-gray-400 text-xs mt-1.5 leading-relaxed">
              40 multiple-choice questions covering Physical Design concepts
              including floorplanning, placement, CTS, routing, STA, DRC/LVS,
              low power design, and signal integrity.
            </p>
            <p className="text-gray-500 text-xs mt-2">Duration: 30 minutes</p>
          </div>
        </div>

        <div className="text-xs text-gray-600">
          <p>Ensure a stable internet connection before starting.</p>
          <p className="mt-1">Do not navigate away during the assessment.</p>
        </div>
      </div>

      {/* Right panel - Login */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Sign In</h2>
            <p className="text-sm text-gray-500 mt-1">Enter your credentials to start the assessment.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                className={`w-full px-4 py-2.5 rounded border text-sm ${
                  error ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"
                } focus:ring-1 focus:ring-gray-400 focus:border-gray-400 outline-none transition`}
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
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                className={`w-full px-4 py-2.5 rounded border text-sm ${
                  error ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"
                } focus:ring-1 focus:ring-gray-400 focus:border-gray-400 outline-none transition`}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-semibold rounded transition-colors"
              >
                {loading ? "Signing in..." : "Sign In & Start Assessment"}
              </button>
            </div>
          </form>

          {/* Mobile-only info */}
          <div className="lg:hidden mt-8 pt-6 border-t border-gray-200">
            <div className="bg-gray-50 rounded p-3 text-center">
              <p className="text-lg font-bold text-gray-900">40</p>
              <p className="text-xs text-gray-500">VLSI / Physical Design Questions</p>
              <p className="text-xs text-gray-400">30 min</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
