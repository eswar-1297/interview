import React from "react";

export default function HackathonResults({ user }) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">

        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          Hackathon Completed
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Thank You!
        </h1>

        <p className="text-sm text-gray-500 leading-relaxed max-w-sm mx-auto">
          Your AI Expense Tracker project and video Q&amp;A responses have been submitted successfully.
          You may now close this window.
        </p>

      </div>
    </div>
  );
}
