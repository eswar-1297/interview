import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const DURATION_SECONDS = 30 * 60;

const CATEGORY_COLORS = {
  "Core Python":                 { bg: "bg-indigo-50",  text: "text-indigo-700"  },
  "Data Types":                  { bg: "bg-blue-50",    text: "text-blue-700"    },
  "Strings":                     { bg: "bg-sky-50",     text: "text-sky-700"     },
  "Lists & Tuples":              { bg: "bg-green-50",   text: "text-green-700"   },
  "Dictionaries & Sets":         { bg: "bg-teal-50",    text: "text-teal-700"    },
  "Functions & Scope":           { bg: "bg-amber-50",   text: "text-amber-700"   },
  "OOP":                         { bg: "bg-purple-50",  text: "text-purple-700"  },
  "Exception Handling":          { bg: "bg-red-50",     text: "text-red-700"     },
  "Comprehensions & Generators": { bg: "bg-cyan-50",    text: "text-cyan-700"    },
  "Decorators & Closures":       { bg: "bg-pink-50",    text: "text-pink-700"    },
};

function pad(n) { return String(n).padStart(2, "0"); }
function fmt(sec) { return `${pad(Math.floor(sec / 60))}:${pad(sec % 60)}`; }

export default function PythonMCQTest({ user, onSubmit }) {
  const [questions, setQuestions]     = useState([]);
  const [answers, setAnswers]         = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft]       = useState(DURATION_SECONDS);
  const [loading, setLoading]         = useState(true);
  const [submitted, setSubmitted]     = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [cameraError, setCameraError] = useState(false);

  const videoRef  = useRef(null);
  const streamRef = useRef(null);
  const navigate  = useNavigate();

  useEffect(() => {
    fetch("/api/python-mcq")
      .then(r => r.json())
      .then(data => { setQuestions(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: { width: 320, height: 240 }, audio: false })
      .then(stream => {
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => setCameraError(true));
    return () => streamRef.current?.getTracks().forEach(t => t.stop());
  }, []);

  const handleSubmit = useCallback(async () => {
    if (submitted || submitting) return;
    setSubmitting(true);
    streamRef.current?.getTracks().forEach(t => t.stop());

    try {
      const res  = await fetch("/api/python-mcq-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: user?.name, email: user?.email, answers }),
      });
      const data = await res.json();
      setSubmitted(true);
      onSubmit(data);
      navigate("/done");
    } catch {
      setSubmitting(false);
    }
  }, [submitted, submitting, answers, user, onSubmit, navigate]);

  useEffect(() => {
    if (submitted || submitting || loading) return;
    const id = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(id); handleSubmit(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [submitted, submitting, loading, handleSubmit]);

  useEffect(() => {
    const push = () => window.history.pushState(null, "", window.location.href);
    push();
    const onPop = () => { if (!submitted) { setShowWarning(true); push(); } };
    const onUnload = (e) => { if (!submitted) { e.preventDefault(); e.returnValue = ""; } };
    window.addEventListener("popstate", onPop);
    window.addEventListener("beforeunload", onUnload);
    return () => {
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("beforeunload", onUnload);
    };
  }, [submitted]);

  const answeredCount = Object.keys(answers).length;
  const current       = questions[currentIndex];
  const isLast        = currentIndex === questions.length - 1;
  const pct           = questions.length ? (answeredCount / questions.length) * 100 : 0;
  const catStyle      = current ? (CATEGORY_COLORS[current.category] || { bg: "bg-gray-100", text: "text-gray-700" }) : {};
  const danger        = timeLeft <= 120;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400">Loading questions…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* Leave warning modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Leave the test?</h3>
            <p className="text-sm text-gray-500 mb-5">
              Your progress ({answeredCount}/{questions.length} answered) will be submitted. This cannot be undone.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setShowWarning(false)}
                className="flex-1 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                Stay
              </button>
              <button onClick={() => { setShowWarning(false); handleSubmit(); }}
                className="flex-1 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition">
                Submit & Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-gray-200 sticky top-0 z-10 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-semibold text-gray-900 text-sm whitespace-nowrap">Python Technical MCQ — Round 2</span>
            <span className="text-gray-300 hidden sm:inline">|</span>
            <div className="hidden sm:flex items-center gap-2 min-w-0">
              <div
                className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                title={user?.name || user?.email}
              >
                {(user?.name || user?.email)?.[0]?.toUpperCase()}
              </div>
              <span className="text-gray-400 text-xs truncate">{user?.name || user?.email}</span>
              <span className="text-gray-300">·</span>
              <span className="text-gray-400 text-xs whitespace-nowrap">{answeredCount} of {questions.length} answered</span>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Camera */}
            <div className="relative w-14 h-10 rounded overflow-hidden bg-black border border-gray-200 flex-shrink-0">
              {cameraError ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
              ) : (
                <>
                  <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                  <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                </>
              )}
            </div>
            {/* Timer */}
            <div className={`font-mono text-sm font-bold px-3 py-1 rounded-lg border transition-colors ${
              danger ? "text-red-600 bg-red-50 border-red-200" : "text-gray-700 bg-gray-50 border-gray-200"
            }`}>
              {fmt(timeLeft)}
            </div>
            {/* Submit */}
            <button
              onClick={() => {
                if (window.confirm(`Submit now? ${answeredCount} of ${questions.length} answered.`))
                  handleSubmit();
              }}
              disabled={submitting}
              className="text-xs font-semibold text-white bg-gray-900 hover:bg-gray-800 disabled:opacity-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              {submitting ? "Submitting…" : "Submit"}
            </button>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-0.5 bg-gray-100">
          <div className="h-full bg-blue-600 transition-all duration-500 ease-out" style={{ width: `${pct}%` }} />
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 flex gap-8">

        {/* Question area */}
        <div className="flex-1 min-w-0">
          {current && (
            <>
              {/* Category + position */}
              <div className="flex items-center gap-2 mb-4">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${catStyle.bg} ${catStyle.text}`}>
                  {current.category}
                </span>
                <span className="text-xs text-gray-400">Q{currentIndex + 1} of {questions.length}</span>
              </div>

              {/* Question text */}
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 leading-snug mb-4">
                {current.question}
              </h2>

              {/* Code snippet (if any) */}
              {current.code && (
                <pre className="bg-[#1e1e1e] text-gray-100 rounded-lg p-4 mb-5 text-[13px] font-mono leading-relaxed overflow-x-auto">
                  <code>{current.code}</code>
                </pre>
              )}

              {/* Options */}
              <div className="space-y-3">
                {current.options.map((opt, i) => {
                  const selected = answers[current.id] === i;
                  return (
                    <button
                      key={i}
                      onClick={() => setAnswers(prev => ({ ...prev, [current.id]: i }))}
                      className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all ${
                        selected
                          ? "border-blue-600 bg-blue-600 text-white font-medium"
                          : "border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50"
                      }`}
                    >
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold mr-3 flex-shrink-0 ${
                        selected ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                      }`}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="font-mono whitespace-pre-wrap">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Prev / Next */}
              <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
                  disabled={currentIndex === 0}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 disabled:text-gray-200 disabled:cursor-not-allowed transition-colors"
                >
                  ← Previous
                </button>
                <span className="text-xs text-gray-300 font-mono">{currentIndex + 1} / {questions.length}</span>
                {!isLast ? (
                  <button
                    onClick={() => setCurrentIndex(i => Math.min(questions.length - 1, i + 1))}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (window.confirm(`Submit the test? You've answered ${answeredCount} of ${questions.length} questions.`))
                        handleSubmit();
                    }}
                    disabled={submitting}
                    className="flex items-center gap-1.5 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 disabled:opacity-50 px-4 py-2 rounded-lg transition-colors"
                  >
                    {submitting ? "Submitting…" : "Submit Test →"}
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-56 flex-shrink-0 hidden lg:block">
          <div className="sticky top-20 space-y-5">
            {/* Stats */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Answered</span>
                <span className="font-semibold text-gray-900">{answeredCount}/{questions.length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-gray-400">Remaining</span>
                <span className="text-gray-500">{questions.length - answeredCount}</span>
              </div>
            </div>

            {/* Grid */}
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-2">Questions</p>
              <div className="grid grid-cols-5 gap-1.5">
                {questions.map((q, i) => {
                  const isAnswered = answers[q.id] !== undefined;
                  const isCurrent  = i === currentIndex;
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(i)}
                      className={`w-8 h-8 rounded text-xs font-medium transition-colors ${
                        isCurrent
                          ? "bg-blue-600 text-white"
                          : isAnswered
                          ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                          : "bg-gray-50 text-gray-400 hover:bg-gray-100 border border-gray-100"
                      }`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 space-y-1.5 text-[11px] text-gray-400">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-blue-600 inline-block" /> Current
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-blue-100 inline-block" /> Answered ({answeredCount})
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-gray-50 border border-gray-100 inline-block" /> Unanswered ({questions.length - answeredCount})
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          className="text-sm text-gray-500 hover:text-gray-900 disabled:text-gray-200"
        >
          ← Prev
        </button>
        <span className="text-xs text-gray-400">{answeredCount}/{questions.length} answered</span>
        <button
          onClick={() => {
            if (!isLast) setCurrentIndex(i => i + 1);
            else if (window.confirm(`Submit with ${answeredCount}/${questions.length} answered?`)) handleSubmit();
          }}
          className="text-sm font-semibold text-gray-900 hover:text-gray-600"
        >
          {isLast ? "Submit →" : "Next →"}
        </button>
      </div>
    </div>
  );
}
