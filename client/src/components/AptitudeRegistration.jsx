import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AptitudeRegistration({ onSubmit }) {
  const [name, setName]           = useState("");
  const [email, setEmail]         = useState("");
  const [contact, setContact]     = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [cameraStatus, setCameraStatus] = useState("idle"); // idle | requesting | granted | denied
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);

  const videoRef  = useRef(null);
  const streamRef = useRef(null);
  const fileRef   = useRef(null);
  const navigate  = useNavigate();

  useEffect(() => {
    return () => streamRef.current?.getTracks().forEach(t => t.stop());
  }, []);

  const requestCamera = async () => {
    setCameraStatus("requesting");
    setError("");
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ["application/pdf", "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowed.includes(file.type)) {
      setError("Please upload a PDF or Word (.doc/.docx) file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be under 10 MB.");
      return;
    }
    setError("");
    setResumeFile(file);
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
    if (!resumeFile)     return setError("Please upload your resume.");
    if (cameraStatus !== "granted")
      return setError("Camera access is required to start the test.");

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("email", email.trim());
      formData.append("contact", contact.trim());
      formData.append("resume", resumeFile);

      const res  = await fetch("/api/aptitude-register", { method: "POST", body: formData });
      const data = await res.json();

      if (data.success) {
        streamRef.current?.getTracks().forEach(t => t.stop());
        onSubmit({ name: data.user.name, email: data.user.email });
        navigate("/aptitude");
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

      {/* ── Left panel ──────────────────────────────────────── */}
      <div className="hidden lg:flex w-[420px] flex-shrink-0 bg-gray-900 flex-col justify-between p-10 text-white">
        <div>
          <p className="text-gray-400 text-sm">CloudFuze — Aptitude Assessment</p>
        </div>

        <div className="space-y-6">
          <div>
            <p className="font-semibold text-sm">General Aptitude Test</p>
            <p className="text-gray-400 text-xs mt-1.5 leading-relaxed">
              40 multiple-choice questions covering quantitative aptitude,
              logical reasoning, verbal ability, and data interpretation.
            </p>
            <p className="text-gray-500 text-xs mt-2">Duration: 30 minutes &nbsp;·&nbsp; 40 questions</p>
          </div>

          <div className="space-y-2.5 text-xs">
            <p className="text-gray-500 font-semibold uppercase tracking-widest text-[10px]">Topics Covered</p>
            {[
              "Quantitative Aptitude — Q1 to Q12",
              "Logical Reasoning — Q13 to Q24",
              "Verbal Ability — Q25 to Q34",
              "Data Interpretation — Q35 to Q40",
            ].map(t => (
              <div key={t} className="flex items-start gap-2 text-gray-400">
                <span className="mt-0.5 text-gray-600">&#8250;</span>
                <span>{t}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            {[["40", "Questions"], ["30", "Minutes"], ["MCQ", "Format"]].map(([val, lbl]) => (
              <div key={lbl} className="bg-gray-800 rounded-lg p-3">
                <p className="text-lg font-bold text-white">{val}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{lbl}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-gray-600">
          <p>Ensure a stable internet connection.</p>
          <p className="mt-1">Camera must remain on throughout the test.</p>
          <p className="mt-1">Do not refresh or navigate away during the test.</p>
        </div>
      </div>

      {/* ── Right panel ─────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Register to Begin</h2>
            <p className="text-sm text-gray-500 mt-1">
              Fill in your details and enable your camera to start the test.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => { setName(e.target.value); setError(""); }}
                className={inputClass(error && !name.trim())}
                placeholder="John Smith"
                autoFocus
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                Email Address <span className="text-red-500">*</span>
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

            {/* Contact Number */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                Contact Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={contact}
                onChange={e => { setContact(e.target.value); setError(""); }}
                className={inputClass(error && !contact.trim())}
                placeholder="+91 98765 43210"
                autoComplete="tel"
              />
            </div>

            {/* Resume Upload */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                Resume <span className="text-red-500">*</span>
                <span className="normal-case font-normal text-gray-400 ml-1">(PDF or Word, max 10 MB)</span>
              </label>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileChange}
                className="hidden"
              />
              {resumeFile ? (
                <div className="flex items-center gap-3 p-3 border border-green-200 rounded bg-green-50">
                  <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-green-800 font-medium truncate">{resumeFile.name}</p>
                    <p className="text-[11px] text-green-600">{(resumeFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setResumeFile(null); if (fileRef.current) fileRef.current.value = ""; }}
                    className="text-xs text-green-700 underline flex-shrink-0"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className={`flex items-center gap-2 w-full px-4 py-3 rounded border text-sm transition ${
                    error && !resumeFile
                      ? "border-red-400 bg-red-50 text-red-700"
                      : "border-gray-300 bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Upload Resume
                </button>
              )}
            </div>

            {/* Camera */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                Camera <span className="text-red-500">*</span>
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
                    <p className="text-[11px] text-gray-400 mt-0.5">You are ready to start</p>
                  </div>
                </div>
              ) : cameraStatus === "denied" ? (
                <div className="p-3 border border-red-200 rounded bg-red-50">
                  <p className="text-xs text-red-700 font-medium">Camera access denied</p>
                  <p className="text-[11px] text-red-500 mt-0.5 mb-2">
                    Allow camera in your browser settings, then retry.
                  </p>
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
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-semibold rounded transition-colors"
              >
                {loading ? "Registering..." : "Start Aptitude Test →"}
              </button>
            </div>

          </form>

          {/* Mobile info */}
          <div className="lg:hidden mt-8 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-2 text-center">
              {[["40", "Questions"], ["30 min", "Duration"], ["MCQ", "Format"]].map(([v, l]) => (
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
