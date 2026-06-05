import React from "react";

export default function JavaMCQResults({ user }) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Thank You{user?.name ? `, ${user.name.split(" ")[0]}` : ""}!
        </h1>
        <p className="text-gray-500 text-sm mb-1">
          Your responses have been submitted successfully.
        </p>
        {user?.email && (
          <p className="text-gray-400 text-xs mb-8">A confirmation email has been sent to <strong>{user.email}</strong></p>
        )}

        <p className="text-gray-500 text-sm leading-relaxed">
          We appreciate your time and effort. Our team will review your answers
          and get back to you shortly.
        </p>

        <div className="mt-10 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-400">You may now close this window.</p>
        </div>
      </div>
    </div>
  );
}
