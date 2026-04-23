import React from "react";

export default function Results({ user }) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="max-w-md mx-4 text-center">
        <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center mx-auto mb-6">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Assessment Complete
        </h1>

        <p className="text-sm text-gray-500 leading-relaxed mb-8">
          Thank you for completing all assessment rounds — VLSI / Physical Design and the Python Scripting round.
          Your responses have been recorded. We'll review your submission
          and reach out to you at {user.email}.
        </p>

        <div className="border border-gray-100 rounded p-4 text-xs text-gray-400 leading-relaxed">
          You may now close this window. If you have questions, contact the hiring team.
        </div>
      </div>
    </div>
  );
}
