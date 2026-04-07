import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Timer from "./Timer";
import CodeEditor from "./CodeEditor";
import CameraFeed from "./CameraFeed";

export default function CodingTest({ user, onSubmit }) {
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const navigate = useNavigate();
  const codeRef = useRef("");

  useEffect(() => {
    fetch("/api/coding")
      .then((r) => r.json())
      .then((data) => {
        setProblem(data[0]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleCodeChange = (code) => {
    codeRef.current = code;
  };

  const handleSubmit = useCallback(() => {
    if (submitted) return;
    setSubmitted(true);
    onSubmit();
    navigate("/results");
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
        <p className="text-sm text-gray-500">Loading problem...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1e1e1e] flex flex-col">
      {/* Warning modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-sm w-full p-6 shadow-lg">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Leave this page?</h3>
            <p className="text-sm text-gray-500 mb-5">
              Your code will be submitted as-is. This cannot be undone.
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
            <span className="text-sm font-semibold text-gray-300">Hackathon</span>
            <span className="text-gray-600">|</span>
            <span className="text-xs text-gray-500">{user.name}</span>
          </div>
          <div className="flex items-center gap-4">
            <CameraFeed size="sm" />
            <Timer durationMinutes={120} onTimeUp={handleSubmit} />
            <button
              onClick={() => {
                if (window.confirm("Submit your hackathon? You won't be able to make changes.")) handleSubmit();
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
        <div className="w-[440px] flex-shrink-0 bg-white overflow-y-auto border-r border-gray-200">
          {problem && (
            <div className="p-5">
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-1">Hackathon Challenge</p>
              <h2 className="text-base font-semibold text-gray-900 mb-4">{problem.title}</h2>

              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line mb-5">
                {problem.description}
              </p>

              <div className="space-y-3 mb-5">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-1">Sample Input</p>
                  <pre className="bg-gray-50 border border-gray-100 rounded px-3 py-2 text-xs font-mono text-gray-700 whitespace-pre-wrap">{problem.sampleInput}</pre>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-1">Sample Output</p>
                  <pre className="bg-gray-50 border border-gray-100 rounded px-3 py-2 text-xs font-mono text-gray-700 whitespace-pre-wrap">{problem.sampleOutput}</pre>
                </div>
                {problem.constraints && (
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-1">Constraints</p>
                    <p className="text-xs text-gray-500 whitespace-pre-line">{problem.constraints}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Editor */}
        <div className="flex-1 flex flex-col min-h-0">
          {problem && (
            <CodeEditor
              key={problem.id}
              starterCode={problem.starterCode}
              onCodeChange={handleCodeChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}
