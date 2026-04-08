import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const VALID_EMAIL = "vydyatej@gmail.com";
const VALID_PASSWORD = "Neutara@123";

export default function LandingPage({ onSubmit }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [cameraStatus, setCameraStatus] = useState("idle");
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Email and password are required");
      return;
    }
    if (cameraStatus !== "granted") {
      setError("Camera access is required to proceed");
      return;
    }
    if (email.trim().toLowerCase() !== VALID_EMAIL || password !== VALID_PASSWORD) {
      setError("Invalid email or password");
      return;
    }

    streamRef.current?.getTracks().forEach((t) => t.stop());
    onSubmit({ name: "Candidate", email: email.trim() });
    navigate("/hackathon");
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-[420px] flex-shrink-0 bg-gray-900 flex-col justify-between p-10 text-white">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hackathon Challenge</h1>
          <p className="text-gray-400 text-sm mt-1">Java Developer - 2 Years Experience</p>
        </div>

        <div className="space-y-6">
          <div>
            <p className="font-semibold text-sm">What to expect</p>
            <p className="text-gray-400 text-xs mt-1.5 leading-relaxed">
              You will be given two large coding problems. Build working
              console applications from scratch that demonstrate OOP design,
              proper data structures, and clean code.
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center flex-shrink-0 text-xs font-bold text-gray-400">2h</div>
              <p className="text-gray-400 text-xs">120 minutes to complete</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-gray-400">2</div>
              <p className="text-gray-400 text-xs">Two comprehensive problems</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center flex-shrink-0 text-gray-400">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
              </div>
              <p className="text-gray-400 text-xs">Java & Python compiler included</p>
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-600">
          <p>Ensure a stable internet connection before starting.</p>
          <p className="mt-1">Camera must remain on throughout the assessment.</p>
        </div>
      </div>

      {/* Right panel - Login */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Sign in</h2>
            <p className="text-sm text-gray-500 mt-1">Use your credentials to access the hackathon.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                className="w-full px-4 py-2.5 rounded border border-gray-300 bg-white text-sm focus:ring-1 focus:ring-gray-400 focus:border-gray-400 outline-none transition"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  className="w-full px-4 py-2.5 pr-10 rounded border border-gray-300 bg-white text-sm focus:ring-1 focus:ring-gray-400 focus:border-gray-400 outline-none transition"
                  placeholder="Enter password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" /></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
            </div>

            {/* Camera */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Camera</label>
              {cameraStatus === "granted" ? (
                <div className="flex items-center gap-3 p-3 border border-gray-200 rounded bg-gray-50">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-24 h-18 rounded object-cover bg-black flex-shrink-0"
                  />
                  <div>
                    <p className="text-xs text-gray-700 font-medium">Camera active</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Stays on during the test</p>
                  </div>
                </div>
              ) : cameraStatus === "denied" ? (
                <div className="p-3 border border-red-200 rounded bg-red-50">
                  <p className="text-xs text-red-700 font-medium">Camera access denied</p>
                  <p className="text-[11px] text-red-500 mt-0.5 mb-2">Allow camera in browser settings, then try again.</p>
                  <button type="button" onClick={requestCamera} className="text-xs font-semibold text-red-700 underline">Retry</button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={requestCamera}
                  disabled={cameraStatus === "requesting"}
                  className="flex items-center gap-2 w-full px-4 py-3 rounded border border-gray-300 bg-gray-50 text-sm text-gray-600 hover:bg-gray-100 transition"
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  {cameraStatus === "requesting" ? "Requesting access..." : "Enable Camera"}
                </button>
              )}
            </div>

            {error && (
              <p className="text-red-600 text-xs font-medium bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>
            )}

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded transition-colors"
              >
                Start Hackathon
              </button>
            </div>
          </form>

          {/* Mobile info */}
          <div className="lg:hidden mt-8 pt-6 border-t border-gray-200">
            <div className="bg-gray-50 rounded p-3 text-center">
              <p className="text-lg font-bold text-gray-900">2 Hours</p>
              <p className="text-xs text-gray-500">2 Hackathon Problems</p>
              <p className="text-xs text-gray-400">Java & Python compiler</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
