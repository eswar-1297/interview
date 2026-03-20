import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Timer from "./Timer";
import CodeEditor from "./CodeEditor";
import CameraFeed from "./CameraFeed";

export default function CodingTest({ user, onSubmit }) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submissions, setSubmissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const navigate = useNavigate();
  const submissionsRef = useRef(submissions);
  const questionsRef = useRef(questions);

  submissionsRef.current = submissions;
  questionsRef.current = questions;

  useEffect(() => {
    fetch("/api/coding")
      .then((r) => r.json())
      .then((data) => {
        for (let i = data.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [data[i], data[j]] = [data[j], data[i]];
        }
        setQuestions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleCodeChange = (code, language) => {
    const qId = questions[currentIndex]?.id;
    if (qId !== undefined) {
      setSubmissions((prev) => ({ ...prev, [qId]: { code, language } }));
    }
  };

  const handleSubmit = useCallback(() => {
    if (submitted) return;
    setSubmitted(true);
    onSubmit({
      submissions: submissionsRef.current,
      attempted: Object.keys(submissionsRef.current).length,
      total: questionsRef.current.length,
    });
    navigate("/dashboard");
  }, [submitted, onSubmit, navigate]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!submitted) { e.preventDefault(); e.returnValue = ""; }
    };
    const handlePopState = () => {
      if (!submitted) {
        setShowWarning(true);
        window.history.pushState(null, "", window.location.href);
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [submitted]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1e1e1e]">
        <p className="text-sm text-gray-500">Loading problems...</p>
      </div>
    );
  }

  const current = questions[currentIndex];
  const attemptedCount = Object.keys(submissions).length;

  return (
    <div className="min-h-screen bg-[#1e1e1e] flex flex-col">
      {/* Warning modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-sm w-full p-6 shadow-lg">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Leave this page?</h3>
            <p className="text-sm text-gray-500 mb-5">
              Your code will be submitted for {attemptedCount}/{questions.length} problems. This cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowWarning(false)}
                className="flex-1 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Stay
              </button>
              <button
                onClick={() => { setShowWarning(false); handleSubmit(); }}
                className="flex-1 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
              >
                Submit & Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-[#333] sticky top-0 z-10 bg-[#1e1e1e]">
        <div className="px-4 h-11 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-300">Coding</span>
            <span className="text-gray-600">|</span>
            <div className="flex gap-1">
              {questions.map((q, i) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-7 h-7 rounded text-xs font-medium transition-colors ${
                    i === currentIndex
                      ? "bg-white text-gray-900"
                      : submissions[q.id]
                      ? "bg-[#333] text-gray-300"
                      : "bg-transparent text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <CameraFeed size="sm" />
            <Timer durationMinutes={60} onTimeUp={handleSubmit} />
            <button
              onClick={() => {
                if (window.confirm("Submit your coding test?")) handleSubmit();
              }}
              className="text-sm font-semibold text-gray-300 hover:text-white transition-colors"
            >
              Submit
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <div className="flex-1 flex min-h-0">
        {/* Problem */}
        <div className="w-[400px] flex-shrink-0 bg-white overflow-y-auto border-r border-gray-200">
          {current && (
            <div className="p-5">
              <p className="text-xs text-gray-400 mb-1">Problem {currentIndex + 1} of {questions.length}</p>
              <h2 className="text-base font-semibold text-gray-900 mb-4">{current.title}</h2>

              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line mb-5">
                {current.description}
              </p>

              <div className="space-y-3 mb-5">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-1">Input</p>
                  <pre className="bg-gray-50 border border-gray-100 rounded px-3 py-2 text-xs font-mono text-gray-700">{current.sampleInput}</pre>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-1">Output</p>
                  <pre className="bg-gray-50 border border-gray-100 rounded px-3 py-2 text-xs font-mono text-gray-700">{current.sampleOutput}</pre>
                </div>
                {current.constraints && (
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-1">Constraints</p>
                    <p className="text-xs text-gray-500">{current.constraints}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-sm">
                <button
                  onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                  disabled={currentIndex === 0}
                  className="text-gray-400 hover:text-gray-900 disabled:text-gray-200 disabled:cursor-not-allowed transition-colors"
                >
                  &larr; Prev
                </button>
                <button
                  onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
                  disabled={currentIndex === questions.length - 1}
                  className="text-gray-400 hover:text-gray-900 disabled:text-gray-200 disabled:cursor-not-allowed transition-colors"
                >
                  Next &rarr;
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Editor */}
        <div className="flex-1 flex flex-col min-h-0">
          {current && (
            <CodeEditor
              key={current.id}
              starterCode={current.starterCode}
              onCodeChange={handleCodeChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}
