import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

export default function TaxCaseStudyTest({ user, onSubmit }) {
  const [questions, setQuestions]   = useState([]);
  const [answers, setAnswers]       = useState({});   // { id: "typed text" }
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading]       = useState(true);
  const [submitted, setSubmitted]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [cameraError, setCameraError] = useState(false);

  const videoRef  = useRef(null);
  const streamRef = useRef(null);
  const navigate  = useNavigate();

  useEffect(() => {
    fetch("/api/tax-casestudy")
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

  const handleSubmit = useCallback(async () => {
    if (submitted || submitting) return;
    setSubmitting(true);
    streamRef.current?.getTracks().forEach(t => t.stop());
    try {
      await fetch("/api/tax-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user?.email, answers }),
      });
      setSubmitted(true);
      onSubmit();
      navigate("/done");
    } catch {
      setSubmitting(false);
    }
  }, [submitted, submitting, answers, user, onSubmit, navigate]);

  const answeredCount = Object.keys(answers).filter(k => answers[k]?.trim()).length;
  const current       = questions[currentIndex];
  const isLast        = currentIndex === questions.length - 1;
  const pct           = questions.length ? (answeredCount / questions.length) * 100 : 0;

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
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Leave warning */}
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-semibold text-gray-900 text-sm whitespace-nowrap">Tax Case Study</span>
            <span className="text-gray-300 hidden sm:inline">|</span>
            <div className="hidden sm:flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                title={user?.email}>
                {user?.email?.[0]?.toUpperCase()}
              </div>
              <span className="text-gray-400 text-xs truncate">{user?.email}</span>
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

            {/* Submit */}
            <button
              onClick={() => {
                if (window.confirm(`Submit now? You've answered ${answeredCount} of ${questions.length} questions.`))
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
          <div className="h-full bg-gray-800 transition-all duration-500 ease-out" style={{ width: `${pct}%` }} />
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 flex gap-6">

        {/* Question area */}
        <div className="flex-1 min-w-0">
          {current && (
            <>
              {/* Topic badge + position */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">
                  {current.topic}
                </span>
                <span className="text-xs text-gray-400">Question {currentIndex + 1} of {questions.length}</span>
              </div>

              {/* Scenario box */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5">
                <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-widest mb-2">Scenario</p>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{current.scenario}</p>
              </div>

              {/* Question */}
              <div className="mb-4">
                <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-widest mb-2">Question</p>
                <p className="text-base font-semibold text-gray-900 leading-snug">{current.question}</p>
              </div>

              {/* Answer textarea */}
              <div>
                <label className="block text-[11px] text-gray-400 font-semibold uppercase tracking-widest mb-2">
                  Your Answer
                </label>
                <textarea
                  value={answers[current.id] || ""}
                  onChange={e => setAnswers(prev => ({ ...prev, [current.id]: e.target.value }))}
                  placeholder="Type your answer here. Show all steps and working clearly…"
                  rows={10}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm text-gray-800 bg-white leading-relaxed resize-y focus:ring-2 focus:ring-gray-300 focus:border-gray-400 outline-none transition placeholder-gray-300"
                />
                <p className="text-[11px] text-gray-400 mt-1.5 text-right">
                  {(answers[current.id] || "").length} characters
                </p>
              </div>

              {/* Prev / Next */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
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
                    onClick={() => setCurrentIndex(i => i + 1)}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (window.confirm(`Submit the assessment? You've answered ${answeredCount} of ${questions.length} questions.`))
                        handleSubmit();
                    }}
                    disabled={submitting}
                    className="flex items-center gap-1.5 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 disabled:opacity-50 px-4 py-2 rounded-lg transition-colors"
                  >
                    {submitting ? "Submitting…" : "Submit Assessment →"}
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-48 flex-shrink-0 hidden lg:block">
          <div className="sticky top-20 space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Answered</span>
                <span className="font-semibold text-gray-900">{answeredCount}/{questions.length}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div className="bg-gray-800 h-1.5 rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
              </div>
            </div>

            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-2">Questions</p>
              <div className="space-y-1.5">
                {questions.map((q, i) => {
                  const hasAnswer = !!(answers[q.id]?.trim());
                  const isCurrent = i === currentIndex;
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(i)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                        isCurrent
                          ? "bg-gray-900 text-white font-semibold"
                          : hasAnswer
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-white text-gray-400 border border-gray-100 hover:bg-gray-50"
                      }`}
                    >
                      <span className="font-semibold">Q{i + 1}</span>
                      <span className="ml-1 truncate block text-[10px] opacity-70">{q.topic.split("—")[0].trim()}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
