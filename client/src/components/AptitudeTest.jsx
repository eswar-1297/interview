import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Timer from "./Timer";
import QuestionCard from "./QuestionCard";
import CameraFeed from "./CameraFeed";

export default function VlsiTest({ user, onSubmit }) {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/vlsi")
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

  const handleSubmit = useCallback(() => {
    if (submitted) return;
    setSubmitted(true);
    onSubmit();
    navigate("/coding");
  }, [submitted, onSubmit, navigate]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!submitted) {
        e.preventDefault();
        e.returnValue = "";
      }
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-sm text-gray-400">Loading questions...</p>
      </div>
    );
  }

  const current = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-white">
      {showWarning && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-sm w-full p-6 shadow-lg">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Leave this page?</h3>
            <p className="text-sm text-gray-500 mb-5">
              Your test will be submitted with {answeredCount}/{questions.length} answers. This cannot be undone.
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

      <header className="border-b border-gray-200 sticky top-0 z-10 bg-white">
        <div className="max-w-5xl mx-auto px-6 h-12 flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm">
            <span className="font-semibold text-gray-900">VLSI / Physical Design</span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-400">{answeredCount} of {questions.length} answered</span>
          </div>
          <div className="flex items-center gap-4">
            <CameraFeed size="sm" />
            <Timer durationMinutes={30} onTimeUp={handleSubmit} />
            <button
              onClick={() => {
                if (window.confirm("Submit your test?")) handleSubmit();
              }}
              className="text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors"
            >
              Submit
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 flex gap-10">
        <div className="flex-1 max-w-xl">
          {current && (
            <QuestionCard
              question={current}
              index={currentIndex}
              selectedOption={answers[current.id]}
              onSelect={(optIndex) =>
                setAnswers((prev) => ({ ...prev, [current.id]: optIndex }))
              }
            />
          )}

          <div className="flex items-center justify-between mt-8">
            <button
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
              className="text-sm text-gray-500 hover:text-gray-900 disabled:text-gray-200 disabled:cursor-not-allowed transition-colors"
            >
              &larr; Prev
            </button>
            <span className="text-xs text-gray-300">{currentIndex + 1} / {questions.length}</span>
            <button
              onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
              disabled={currentIndex === questions.length - 1}
              className="text-sm text-gray-500 hover:text-gray-900 disabled:text-gray-200 disabled:cursor-not-allowed transition-colors"
            >
              Next &rarr;
            </button>
          </div>
        </div>

        <div className="w-52 flex-shrink-0 hidden lg:block">
          <div className="sticky top-16">
            <p className="text-xs text-gray-400 mb-3">Questions</p>
            <div className="grid grid-cols-5 gap-1.5">
              {questions.map((q, i) => {
                const isAnswered = answers[q.id] !== undefined;
                const isCurrent = i === currentIndex;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(i)}
                    className={`w-8 h-8 rounded text-xs transition-colors ${
                      isCurrent
                        ? "bg-gray-900 text-white font-bold"
                        : isAnswered
                        ? "bg-gray-200 text-gray-700 font-medium"
                        : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 space-y-1.5 text-[11px] text-gray-400">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-gray-200 inline-block"></span>
                Answered ({answeredCount})
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-gray-50 border border-gray-100 inline-block"></span>
                Unanswered ({questions.length - answeredCount})
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
