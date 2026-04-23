import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function LandingPage({ onSubmit }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [cameraStatus, setCameraStatus] = useState("idle");
  const videoRef  = useRef(null);
  const streamRef = useRef(null);
  const navigate  = useNavigate();

  useEffect(() => {
    return () => streamRef.current?.getTracks().forEach(t => t.stop());
  }, []);

  const requestCamera = async () => {
    setCameraStatus("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240 },
        audio: false,
      });
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

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }
    if (cameraStatus !== "granted") {
      setError("Camera access is required to start the interview.");
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
        streamRef.current?.getTracks().forEach(t => t.stop());
        onSubmit({ email: data.user.email });
        navigate("/hr");
      } else {
        setError("Incorrect password. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (hasError) =>
    `w-full px-4 py-2.5 rounded border text-sm ${
      hasError ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"
    } focus:ring-1 focus:ring-gray-400 focus:border-gray-400 outline-none transition`;

  return (
    <div className="min-h-screen bg-white flex">

      {/* Left panel */}
      <div className="hidden lg:flex w-[420px] flex-shrink-0 bg-gray-900 flex-col justify-between p-10 text-white">
        <div>
          <p className="text-gray-400 text-sm">Java / Python Developer — HR Round</p>
        </div>

        <div className="space-y-6">
          <div>
            <p className="font-semibold text-sm">Video Interview</p>
            <p className="text-gray-400 text-xs mt-1.5 leading-relaxed">
              10 questions covering HR, technical concepts, and your project
              experience. Record a short video response for each question.
              You have 2 minutes per answer.
            </p>
            <p className="text-gray-500 text-xs mt-2">Duration: ~20 minutes &nbsp;·&nbsp; 10 questions</p>
          </div>

          <div className="space-y-2.5 text-xs">
            <p className="text-gray-500 font-semibold uppercase tracking-widest text-[10px]">What to Expect</p>
            {[
              "HR & behavioural questions",
              "Core Java / Python concepts",
              "Project & framework experience",
              "Self-learning & career goals",
            ].map(t => (
              <div key={t} className="flex items-start gap-2 text-gray-400">
                <span className="mt-0.5 text-gray-600">&#8250;</span>
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-gray-600">
          <p>Ensure a quiet environment and good lighting.</p>
          <p className="mt-1">Camera and microphone must remain on throughout.</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Welcome</h2>
            <p className="text-sm text-gray-500 mt-1">Enter your name and the interview password to begin.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
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
                autoFocus
              />
            </div>

            {/* Password */}
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

            {/* Camera */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                Camera &amp; Mic <span className="text-red-500">*</span>
              </label>
              {cameraStatus === "granted" ? (
                <div className="flex items-center gap-3 p-3 border border-gray-200 rounded bg-gray-50">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-24 rounded object-cover bg-black flex-shrink-0"
                    style={{ height: "4.5rem" }}
                  />
                  <div>
                    <p className="text-xs text-gray-700 font-medium">Camera active</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Ready to record</p>
                  </div>
                </div>
              ) : cameraStatus === "denied" ? (
                <div className="p-3 border border-red-200 rounded bg-red-50">
                  <p className="text-xs text-red-700 font-medium">Camera access denied</p>
                  <p className="text-[11px] text-red-500 mt-0.5 mb-2">Allow camera &amp; mic in browser settings, then retry.</p>
                  <button type="button" onClick={requestCamera} className="text-xs font-semibold text-red-700 underline">
                    Retry
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={requestCamera}
                  disabled={cameraStatus === "requesting"}
                  className={`flex items-center gap-2 w-full px-4 py-3 rounded border text-sm transition ${
                    error && cameraStatus !== "granted"
                      ? "border-red-400 bg-red-50 text-red-700"
                      : "border-gray-300 bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  {cameraStatus === "requesting" ? "Requesting access..." : "Enable Camera & Mic"}
                </button>
              )}
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-semibold rounded transition-colors"
              >
                {loading ? "Verifying..." : "Start Interview"}
              </button>
            </div>
          </form>

          {/* Mobile info */}
          <div className="lg:hidden mt-8 pt-6 border-t border-gray-200">
            <div className="bg-gray-50 rounded p-3 text-center">
              <p className="text-lg font-bold text-gray-900">10</p>
              <p className="text-xs text-gray-500">Video Interview Questions</p>
              <p className="text-xs text-gray-400">~20 min · HR + Technical + Project</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
