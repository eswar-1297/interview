import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const RECORD_SECONDS = 120;

const CATEGORY_STYLE = {
  HR:        "bg-blue-50 text-blue-700",
  Technical: "bg-purple-50 text-purple-700",
  Project:   "bg-amber-50 text-amber-700",
  Study:     "bg-green-50 text-green-700",
};

function formatTime(s) {
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export default function HRTest({ user, onSubmit }) {
  const [questions, setQuestions]   = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recordings, setRecordings] = useState({});
  const [phase, setPhase]           = useState("idle"); // idle | recording | saving | saved
  const [timeLeft, setTimeLeft]     = useState(RECORD_SECONDS);
  const [loading, setLoading]       = useState(true);
  const [cameraError, setCameraError] = useState(false);
  const [submitted, setSubmitted]   = useState(false);

  const videoRef         = useRef(null);
  const streamRef        = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef        = useRef([]);
  const timerRef         = useRef(null);
  const navigate         = useNavigate();

  useEffect(() => {
    fetch("/api/hr-questions")
      .then(r => r.json())
      .then(data => { setQuestions(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: { width: 640, height: 480 }, audio: true })
      .then(stream => {
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => setCameraError(true));

    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Block back navigation
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    const onPop = () => window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Reset controls on question change
  useEffect(() => {
    setPhase("idle");
    setTimeLeft(RECORD_SECONDS);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [currentIndex]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase("saving");
  }, []);

  const startRecording = () => {
    if (!streamRef.current || phase !== "idle") return;
    chunksRef.current = [];

    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : "video/webm";

    const mr = new MediaRecorder(streamRef.current, { mimeType });
    mediaRecorderRef.current = mr;

    mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      const url  = URL.createObjectURL(blob);
      const qId  = questions[currentIndex]?.id;
      setRecordings(prev => ({ ...prev, [qId]: { blob, url } }));
      setPhase("saved");
    };

    mr.start(250);
    setPhase("recording");

    let t = RECORD_SECONDS;
    timerRef.current = setInterval(() => {
      t -= 1;
      setTimeLeft(t);
      if (t <= 0) {
        clearInterval(timerRef.current);
        if (mediaRecorderRef.current?.state === "recording") {
          mediaRecorderRef.current.stop();
          setPhase("saving");
        }
      }
    }, 1000);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex(i => i + 1);
  };

  const handleSubmit = () => {
    if (submitted) return;
    setSubmitted(true);
    streamRef.current?.getTracks().forEach(t => t.stop());
    onSubmit({ attempted: Object.keys(recordings).length, total: questions.length });
    navigate("/results");
  };

  const isLast    = currentIndex === questions.length - 1;
  const current   = questions[currentIndex];
  const answered  = Object.keys(recordings).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-sm text-gray-400">Loading questions...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-100 sticky top-0 z-10 bg-white">
        <div className="max-w-4xl mx-auto px-6 h-12 flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm">
            <span className="font-semibold text-gray-900">HR Interview</span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-400">Question {currentIndex + 1} of {questions.length}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-400">{answered} of {questions.length} recorded</span>
            {phase === "recording" && (
              <span className={`text-sm font-mono font-semibold ${timeLeft <= 30 ? "text-red-500" : "text-gray-700"}`}>
                {formatTime(timeLeft)}
              </span>
            )}
          </div>
        </div>
        <div className="h-0.5 bg-gray-100">
          <div
            className="h-full bg-gray-900 transition-all duration-500"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-8 flex flex-col gap-6">

        {/* Question */}
        {current && (
          <div>
            <span className={`inline-block text-[10px] font-semibold uppercase tracking-widest px-2.5 py-0.5 rounded mb-3 ${CATEGORY_STYLE[current.category] || "bg-gray-100 text-gray-600"}`}>
              {current.category}
            </span>
            <h2 className="text-xl font-semibold text-gray-900 leading-snug max-w-2xl">
              {current.question}
            </h2>
          </div>
        )}

        {/* Video + Sidebar */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* Video feed */}
          <div className="flex-1 w-full">
            <div className="relative rounded-xl overflow-hidden bg-black" style={{ aspectRatio: "16/9" }}>
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />

              {/* REC badge */}
              {phase === "recording" && (
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-full px-2.5 py-1">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-white text-xs font-semibold">REC</span>
                </div>
              )}

              {/* Timer overlay */}
              {phase === "recording" && (
                <div className={`absolute top-3 right-3 font-mono text-sm font-bold px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm ${timeLeft <= 30 ? "text-red-400" : "text-white"}`}>
                  {formatTime(timeLeft)}
                </div>
              )}

              {cameraError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                  <p className="text-gray-400 text-sm">Camera / microphone unavailable</p>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="mt-4 flex items-center gap-3">
              {phase === "idle" && (
                <button
                  onClick={startRecording}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  Start Recording
                </button>
              )}

              {phase === "recording" && (
                <button
                  onClick={stopRecording}
                  className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors"
                >
                  <span className="w-2.5 h-2.5 rounded bg-white" />
                  Stop Recording
                </button>
              )}

              {phase === "saving" && (
                <span className="text-sm text-gray-400">Saving response...</span>
              )}

              {phase === "saved" && (
                <div className="flex items-center gap-2 text-green-700 text-sm font-medium">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Response saved
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-52 flex-shrink-0 space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 text-xs text-gray-500 space-y-2 leading-relaxed">
              <p className="font-semibold text-gray-700 text-[11px] uppercase tracking-widest">Instructions</p>
              <p>&#8250; Click <strong>Start Recording</strong> when ready.</p>
              <p>&#8250; You have <strong>2 minutes</strong> — recording auto-stops.</p>
              <p>&#8250; Click <strong>Next</strong> after saving — you cannot go back.</p>
              <p>&#8250; Speak clearly and look at the camera.</p>
            </div>

            <div>
              <p className="text-[10px] text-gray-400 mb-2 uppercase tracking-widest font-semibold">Progress</p>
              <div className="flex flex-wrap gap-1.5">
                {questions.map((q, i) => (
                  <div
                    key={q.id}
                    className={`w-7 h-7 rounded text-xs flex items-center justify-center font-medium select-none ${
                      i === currentIndex
                        ? "bg-gray-900 text-white"
                        : recordings[q.id]
                        ? "bg-gray-200 text-gray-600"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Next / Submit */}
        <div className="flex justify-end border-t border-gray-100 pt-4">
          {!isLast ? (
            <button
              onClick={handleNext}
              disabled={phase !== "saved"}
              className="px-6 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Next Question &rarr;
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={phase !== "saved" || submitted}
              className="px-6 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Submit Interview
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
