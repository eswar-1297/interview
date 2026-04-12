import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function LandingPage({ onSubmit }) {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [cameraStatus, setCameraStatus] = useState("idle"); // idle | requesting | granted | denied
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

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = "Name is required";
    if (!dob) errs.dob = "Date of birth is required";
    if (!email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = "Enter a valid email address";
    if (!resumeFile) errs.resume = "Please upload your resume (PDF)";
    else if (resumeFile.type !== "application/pdf")
      errs.resume = "Only PDF files are accepted";
    else if (resumeFile.size > 5 * 1024 * 1024)
      errs.resume = "File size must be under 5 MB";
    if (cameraStatus !== "granted") errs.camera = "Camera access is required";
    return errs;
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setResumeFile(file);
    setErrors((p) => ({ ...p, resume: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    onSubmit({
      name: name.trim(),
      dob,
      email: email.trim(),
      resumeName: resumeFile.name,
    });
    navigate("/aptitude");
  };

  const inputClass = (field) =>
    `w-full px-4 py-2.5 rounded border text-sm ${
      errors[field]
        ? "border-red-400 bg-red-50"
        : "border-gray-300 bg-white"
    } focus:ring-1 focus:ring-gray-400 focus:border-gray-400 outline-none transition`;

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-[420px] flex-shrink-0 bg-gray-900 flex-col justify-between p-10 text-white">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Candidate Assessment</h1>
          <p className="text-gray-400 text-sm mt-1">Java Developer - 1 Year Experience</p>
        </div>

        <div className="space-y-8">
          <div className="flex items-start gap-4">
            <div className="w-9 h-9 rounded bg-gray-800 flex items-center justify-center flex-shrink-0 text-sm font-bold text-gray-300">1</div>
            <div>
              <p className="font-semibold text-sm">Aptitude Round</p>
              <p className="text-gray-400 text-xs mt-0.5">40 MCQs covering quantitative, logical, verbal & data interpretation</p>
              <p className="text-gray-500 text-xs mt-1">Duration: 30 minutes</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-9 h-9 rounded bg-gray-800 flex items-center justify-center flex-shrink-0 text-sm font-bold text-gray-300">2</div>
            <div>
              <p className="font-semibold text-sm">Coding Round</p>
              <p className="text-gray-400 text-xs mt-0.5">4 coding problems with built-in Java & Python compiler</p>
              <p className="text-gray-500 text-xs mt-1">Duration: 60 minutes</p>
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-600">
          <p>Ensure a stable internet connection before starting.</p>
          <p className="mt-1">Camera must remain on throughout the assessment.</p>
        </div>
      </div>

      {/* Right panel - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Step 1 of 3</p>
            <h2 className="text-2xl font-bold text-gray-900">Candidate Details</h2>
            <p className="text-sm text-gray-500 mt-1">Fill in your information to proceed to the assessment.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: "" })); }}
                className={inputClass("name")}
                placeholder="Enter your full name"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Date of Birth</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => { setDob(e.target.value); setErrors((p) => ({ ...p, dob: "" })); }}
                className={inputClass("dob")}
              />
              {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }}
                className={inputClass("email")}
                placeholder="you@company.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Resume</label>
              <label
                className={`flex items-center gap-3 w-full px-4 py-3 rounded border cursor-pointer transition ${
                  errors.resume
                    ? "border-red-400 bg-red-50"
                    : resumeFile
                    ? "border-green-500 bg-green-50"
                    : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                }`}
              >
                {resumeFile ? (
                  <>
                    <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                    </svg>
                    <span className="text-sm text-green-800 font-medium truncate">{resumeFile.name}</span>
                    <span className="text-xs text-green-600 ml-auto flex-shrink-0">
                      {(resumeFile.size / 1024).toFixed(0)} KB
                    </span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <span className="text-sm text-gray-500">Attach resume (PDF, max 5 MB)</span>
                  </>
                )}
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {errors.resume && <p className="text-red-500 text-xs mt-1">{errors.resume}</p>}
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
                    <p className="text-[11px] text-gray-400 mt-0.5">Your camera will stay on during the test</p>
                  </div>
                </div>
              ) : cameraStatus === "denied" ? (
                <div className="p-3 border border-red-200 rounded bg-red-50">
                  <p className="text-xs text-red-700 font-medium">Camera access denied</p>
                  <p className="text-[11px] text-red-500 mt-0.5 mb-2">Allow camera in browser settings, then try again.</p>
                  <button
                    type="button"
                    onClick={requestCamera}
                    className="text-xs font-semibold text-red-700 underline"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={requestCamera}
                  disabled={cameraStatus === "requesting"}
                  className={`flex items-center gap-2 w-full px-4 py-3 rounded border text-sm transition ${
                    errors.camera
                      ? "border-red-400 bg-red-50 text-red-700"
                      : "border-gray-300 bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  {cameraStatus === "requesting" ? "Requesting access..." : "Enable Camera"}
                </button>
              )}
              {errors.camera && cameraStatus !== "denied" && (
                <p className="text-red-500 text-xs mt-1">{errors.camera}</p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded transition-colors"
              >
                Proceed to Assessment
              </button>
            </div>
          </form>

          {/* Mobile-only info */}
          <div className="lg:hidden mt-8 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-gray-50 rounded p-3">
                <p className="text-lg font-bold text-gray-900">40</p>
                <p className="text-xs text-gray-500">Aptitude Questions</p>
                <p className="text-xs text-gray-400">30 min</p>
              </div>
              <div className="bg-gray-50 rounded p-3">
                <p className="text-lg font-bold text-gray-900">4</p>
                <p className="text-xs text-gray-500">Coding Problems</p>
                <p className="text-xs text-gray-400">60 min</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
