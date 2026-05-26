import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function HackathonRegistration({ onSubmit }) {
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [contact, setContact] = useState("");
  const [cameraStatus, setCameraStatus] = useState("idle");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const videoRef  = useRef(null);
  const streamRef = useRef(null);
  const navigate  = useNavigate();

  useEffect(() => () => streamRef.current?.getTracks().forEach(t => t.stop()), []);

  const requestCamera = async () => {
    setCameraStatus("requesting");
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraStatus("granted");
    } catch {
      setCameraStatus("denied");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim())    return setError("Please enter your full name.");
    if (!email.trim())   return setError("Please enter your email address.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return setError("Please enter a valid email address.");
    if (!contact.trim()) return setError("Please enter your contact number.");
    if (!/^\+?[\d\s\-()]{7,15}$/.test(contact.trim()))
      return setError("Please enter a valid contact number.");
    if (cameraStatus !== "granted")
      return setError("Camera access is required to proceed.");

    setLoading(true);
    try {
      const res  = await fetch("/api/hackathon-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), contact: contact.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        streamRef.current?.getTracks().forEach(t => t.stop());
        onSubmit({ name: data.user.name, email: data.user.email });
        navigate("/hackathon/build");
      } else {
        setError(data.error || "Registration failed. Please try again.");
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
          <p className="text-white font-bold text-lg mt-1">Full Stack Hackathon</p>
        </div>

        <div className="space-y-7">
          <div>
            <p className="font-semibold text-sm">Expense Tracker — Build & Explain</p>
            <p className="text-gray-400 text-xs mt-1.5 leading-relaxed">
              Build a complete Expense Tracker application using React and Java Spring Boot,
              then record video answers to 5 questions about your implementation.
            </p>
          </div>

          {/* Phase cards */}
          <div className="space-y-3">
            {[
              { phase: "Phase 1", title: "Build the Project", time: "2 hrs 30 min", icon: "⚙️",
                desc: "React frontend + Java Spring Boot backend + Database of your choice." },
              { phase: "Phase 2", title: "Video Q&A", time: "~25 minutes", icon: "🎥",
                desc: "5 questions about your project — 2–3 min recording each." },
            ].map(p => (
              <div key={p.phase} className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">{p.phase}</span>
                  <span className="text-xs text-gray-500">{p.time}</span>
                </div>
                <p className="text-sm font-semibold text-white">{p.icon} {p.title}</p>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            {[["Java", "Spring Boot"], ["React", "Frontend"], ["5 Q&A", "Video"]].map(([v, l]) => (
              <div key={l} className="bg-gray-800 rounded-lg p-3">
                <p className="text-sm font-bold text-white">{v}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-gray-600 space-y-1">
          <p>Camera must remain on throughout the session.</p>
          <p>Do not refresh or navigate away during the test.</p>
          <p>Ensure your development environment is ready.</p>
        </div>
      </div>

      {/* ── Right panel ─────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Final Round — Hackathon
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Register to Begin</h2>
            <p className="text-sm text-gray-500 mt-1">Fill in your details and enable your camera to start.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input type="text" value={name}
                onChange={e => { setName(e.target.value); setError(""); }}
                className={inputClass(error && !name.trim())}
                placeholder="John Smith" autoFocus />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input type="email" value={email}
                onChange={e => { setEmail(e.target.value); setError(""); }}
                className={inputClass(error && !email.trim())}
                placeholder="you@example.com" autoComplete="email" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                Contact Number <span className="text-red-500">*</span>
              </label>
              <input type="tel" value={contact}
                onChange={e => { setContact(e.target.value); setError(""); }}
                className={inputClass(error && !contact.trim())}
                placeholder="+91 98765 43210" autoComplete="tel" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                Camera <span className="text-red-500">*</span>
              </label>
              {cameraStatus === "granted" ? (
                <div className="flex items-center gap-3 p-3 border border-gray-200 rounded bg-gray-50">
                  <video ref={videoRef} autoPlay muted playsInline
                    className="w-24 rounded object-cover bg-black flex-shrink-0" style={{ height: "4.5rem" }} />
                  <div>
                    <p className="text-xs text-gray-700 font-medium">Camera active</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Ready to start</p>
                  </div>
                </div>
              ) : cameraStatus === "denied" ? (
                <div className="p-3 border border-red-200 rounded bg-red-50">
                  <p className="text-xs text-red-700 font-medium">Camera access denied</p>
                  <p className="text-[11px] text-red-500 mt-0.5 mb-2">Allow camera in browser settings, then retry.</p>
                  <button type="button" onClick={requestCamera} className="text-xs font-semibold text-red-700 underline">Retry</button>
                </div>
              ) : (
                <button type="button" onClick={requestCamera} disabled={cameraStatus === "requesting"}
                  className={`flex items-center gap-2 w-full px-4 py-3 rounded border text-sm transition ${
                    error && cameraStatus !== "granted"
                      ? "border-red-400 bg-red-50 text-red-700"
                      : "border-gray-300 bg-gray-50 text-gray-600 hover:bg-gray-100"}`}>
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  {cameraStatus === "requesting" ? "Requesting access..." : "Enable Camera"}
                </button>
              )}
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
              <button type="submit" disabled={loading}
                className="w-full py-2.5 px-4 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-semibold rounded transition-colors">
                {loading ? "Registering..." : "Start Hackathon →"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
