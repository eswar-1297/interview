import React from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard({ user, aptitudeDone, codingDone }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-900 tracking-tight">Candidate Assessment</p>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-500">{user.name}</span>
            <span className="w-px h-4 bg-gray-200"></span>
            <span className="text-gray-400">{user.email}</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        {/* Progress */}
        <div className="flex items-center gap-0 mb-10 text-xs font-medium">
          <div className={`flex items-center gap-1.5 ${aptitudeDone ? "text-gray-900" : "text-gray-900"}`}>
            <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold ${
              aptitudeDone ? "bg-gray-900 text-white" : "border-2 border-gray-900 text-gray-900"
            }`}>
              {aptitudeDone ? "\u2713" : "1"}
            </span>
            Aptitude
          </div>
          <div className={`w-12 h-px mx-2 ${aptitudeDone ? "bg-gray-900" : "bg-gray-200"}`}></div>
          <div className={`flex items-center gap-1.5 ${codingDone ? "text-gray-900" : aptitudeDone ? "text-gray-900" : "text-gray-300"}`}>
            <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold ${
              codingDone ? "bg-gray-900 text-white" : aptitudeDone ? "border-2 border-gray-900 text-gray-900" : "border-2 border-gray-200 text-gray-300"
            }`}>
              {codingDone ? "\u2713" : "2"}
            </span>
            Coding
          </div>
          <div className={`w-12 h-px mx-2 ${codingDone ? "bg-gray-900" : "bg-gray-200"}`}></div>
          <div className={`flex items-center gap-1.5 ${aptitudeDone && codingDone ? "text-gray-900" : "text-gray-300"}`}>
            <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold ${
              aptitudeDone && codingDone ? "bg-gray-900 text-white" : "border-2 border-gray-200 text-gray-300"
            }`}>
              {aptitudeDone && codingDone ? "\u2713" : "3"}
            </span>
            Done
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {/* Aptitude */}
          <div className={`border rounded-lg p-5 ${aptitudeDone ? "border-gray-200 bg-gray-50" : "border-gray-200"}`}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-gray-900">Aptitude Test</h3>
                  {aptitudeDone && (
                    <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded">Done</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  40 multiple-choice questions &middot; quantitative, logical, verbal & data interpretation
                </p>
                <p className="text-xs text-gray-400 mt-1.5">Duration: 30 minutes</p>
              </div>
              {!aptitudeDone && (
                <button
                  onClick={() => navigate("/aptitude")}
                  className="text-sm font-semibold text-gray-900 border border-gray-900 px-4 py-1.5 rounded hover:bg-gray-900 hover:text-white transition-colors flex-shrink-0"
                >
                  Start
                </button>
              )}
            </div>
          </div>

          {/* Coding */}
          <div className={`border rounded-lg p-5 ${
            !aptitudeDone ? "border-gray-100 opacity-40" : codingDone ? "border-gray-200 bg-gray-50" : "border-gray-200"
          }`}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-gray-900">Coding Test</h3>
                  {codingDone && (
                    <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded">Done</span>
                  )}
                  {!aptitudeDone && (
                    <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Locked</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  4 coding problems &middot; built-in Java & Python compiler
                </p>
                <p className="text-xs text-gray-400 mt-1.5">Duration: 60 minutes</p>
              </div>
              {aptitudeDone && !codingDone && (
                <button
                  onClick={() => navigate("/coding")}
                  className="text-sm font-semibold text-gray-900 border border-gray-900 px-4 py-1.5 rounded hover:bg-gray-900 hover:text-white transition-colors flex-shrink-0"
                >
                  Start
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Finish */}
        {aptitudeDone && codingDone && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => navigate("/results")}
              className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded transition-colors"
            >
              Finish Assessment
            </button>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-10 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-400 leading-relaxed">
            Complete each section in order. You cannot return to a section after submission. 
            If you navigate away or close the browser during a test, your answers will be auto-submitted. 
            Ensure a stable internet connection throughout.
          </p>
        </div>
      </main>
    </div>
  );
}
