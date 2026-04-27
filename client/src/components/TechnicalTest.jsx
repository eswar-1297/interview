import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const TOTAL_SECONDS = 30 * 60;
const OPTION_LETTERS = ["A", "B", "C", "D"];

function formatTime(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function TechnicalTest({ user, onSubmit }) {
  const [questions, setQuestions]       = useState([]);
  const [answers, setAnswers]           = useState({});
  const [current, setCurrent]           = useState(0);
  const [timeLeft, setTimeLeft]         = useState(TOTAL_SECONDS);
  const [loading, setLoading]           = useState(true);
  const [submitted, setSubmitted]       = useState(false);
  const [cameraError, setCameraError]   = useState(false);
  const [cameraReady, setCameraReady]   = useState(false);

  const videoRef  = useRef(null);
  const streamRef = useRef(null);
  const timerRef  = useRef(null);
  const navigate  = useNavigate();

  // Block back navigation
  useEffect(() => {
    const prevent = e => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", prevent);
    window.history.pushState(null, "", window.location.href);
    const popHandler = () => window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", popHandler);
    return () => {
      window.removeEventListener("beforeunload", prevent);
      window.removeEventListener("popstate", popHandler);
    };
  }, []);

  // Acquire camera
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: { width: 640, height: 480 }, audio: false })
      .then(stream => {
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setCameraReady(true);
      })
      .catch(() => setCameraError(true));

    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      clearInterval(timerRef.current);
    };
  }, []);

  // Load questions
  useEffect(() => {
    fetch("/api/technical")
      .then(r => r.json())
      .then(data => { setQuestions(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Countdown timer — starts only when camera and questions are ready
  const handleSubmit = useCallback(() => {
    if (submitted) return;
    setSubmitted(true);
    clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    onSubmit();
    navigate("/results");
  }, [submitted, onSubmit, navigate]);

  useEffect(() => {
    if (loading || !cameraReady) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { handleSubmit(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [loading, cameraReady, handleSubmit]);

  // Camera blocked screen
  if (cameraError) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="max-w-sm text-center px-6">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Camera Access Required</h2>
          <p className="text-sm text-gray-500 leading-relaxed mb-4">
            Camera access is mandatory throughout the test. Please allow camera permissions in your browser settings and refresh the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded hover:bg-gray-800 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 text-sm">Loading questions…</p>
      </div>
    );
  }

  const q            = questions[current];
  const answered     = Object.keys(answers).length;
  const isLast       = current === questions.length - 1;
  const isUrgent     = timeLeft < 300;
  const isVeryUrgent = timeLeft < 60;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Top bar */}
      <div className="bg-gray-900 text-white px-6 py-3 flex items-center justify-between sticky top-0 z-10 shadow">
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold">Technical Round</span>
          <span className="text-gray-400 text-xs hidden sm:inline">{user.email}</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-400">{answered}/{questions.length} answered</span>
          <div className={`font-mono text-base font-bold px-3 py-1 rounded ${
            isVeryUrgent ? "bg-red-600 text-white animate-pulse"
              : isUrgent  ? "bg-yellow-500 text-gray-900"
              : "bg-gray-700 text-white"
          }`}>
            {formatTime(timeLeft)}
          </div>
          <button
            onClick={() => { if (window.confirm("Submit the test now?")) handleSubmit(); }}
            disabled={submitted}
            className="text-xs px-3 py-1.5 bg-white text-gray-900 rounded font-semibold hover:bg-gray-100 transition disabled:opacity-50"
          >
            Submit
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* Left — question navigator */}
        <div className="hidden lg:flex w-52 flex-shrink-0 bg-white border-r border-gray-200 flex-col overflow-y-auto p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Questions</p>
          <div className="grid grid-cols-5 gap-1.5">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-8 h-8 text-xs font-semibold rounded transition ${
                  i === current
                    ? "bg-gray-900 text-white"
                    : answers[i] !== undefined
                    ? "bg-green-100 text-green-800 border border-green-300"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <div className="mt-5 space-y-2 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-green-100 border border-green-300 inline-block flex-shrink-0" />
              Answered
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-gray-100 inline-block flex-shrink-0" />
              Unanswered
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-gray-900 inline-block flex-shrink-0" />
              Current
            </div>
          </div>
        </div>

        {/* Centre — question */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">

            {/* Progress bar */}
            <div className="mb-5">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                <span>Question {current + 1} of {questions.length}</span>
                <span className={`font-semibold px-2 py-0.5 rounded text-xs ${
                  q.category === "Tax"  ? "bg-amber-50 text-amber-700"
                  : q.category === "SAP" ? "bg-blue-50 text-blue-700"
                  : "bg-purple-50 text-purple-700"
                }`}>
                  {q.category} · {q.topic}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-gray-900 h-1.5 rounded-full transition-all"
                  style={{ width: `${((current + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question card */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-5">
              <p className="text-sm font-semibold text-gray-800 leading-relaxed mb-4">
                {current + 1}. {q.question}
              </p>

              {q.code && (
                <pre className="bg-gray-900 text-green-300 text-xs font-mono rounded-md p-4 mb-5 overflow-x-auto leading-relaxed whitespace-pre">
                  {q.code}
                </pre>
              )}

              <div className="space-y-2.5 mt-2">
                {q.options.map((opt, i) => {
                  const selected = answers[current] === i;
                  return (
                    <button
                      key={i}
                      onClick={() => setAnswers(prev => ({ ...prev, [current]: i }))}
                      className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all ${
                        selected
                          ? "border-gray-900 bg-gray-900 text-white font-medium"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                      }`}
                    >
                      <span className={`font-semibold mr-3 ${selected ? "text-gray-300" : "text-gray-400"}`}>
                        {OPTION_LETTERS[i]}.
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrent(c => Math.max(0, c - 1))}
                disabled={current === 0}
                className="px-4 py-2 text-sm border border-gray-300 rounded text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                ← Previous
              </button>

              <span className="text-xs text-gray-400">{answered} of {questions.length} answered</span>

              {isLast ? (
                <button
                  onClick={() => { if (window.confirm("Submit the test? You cannot change answers after submission.")) handleSubmit(); }}
                  disabled={submitted}
                  className="px-5 py-2 text-sm bg-gray-900 text-white rounded font-semibold hover:bg-gray-800 disabled:opacity-50 transition"
                >
                  Submit Test
                </button>
              ) : (
                <button
                  onClick={() => setCurrent(c => Math.min(questions.length - 1, c + 1))}
                  className="px-4 py-2 text-sm bg-gray-900 text-white rounded font-semibold hover:bg-gray-800 transition"
                >
                  Next →
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Right — live camera feed */}
        <div className="hidden lg:flex w-56 flex-shrink-0 bg-white border-l border-gray-200 flex-col p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Live Camera</p>

          <div className="relative rounded-lg overflow-hidden bg-black" style={{ aspectRatio: "4/3" }}>
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            {/* Live indicator */}
            {cameraReady && (
              <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-full px-2 py-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-white text-[10px] font-semibold">LIVE</span>
              </div>
            )}
          </div>

          <div className="mt-3 text-[11px] text-gray-400 leading-relaxed space-y-1">
            <p className="text-gray-500 font-semibold text-[10px] uppercase tracking-wider">Instructions</p>
            <p>&#8250; Camera must remain on throughout.</p>
            <p>&#8250; Ensure good lighting and stay visible.</p>
            <p>&#8250; Do not cover or disable the camera.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
