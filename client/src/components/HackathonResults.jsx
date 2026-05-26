import React from "react";

export default function HackathonResults({ user }) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">

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
          Well Done!
        </h1>

        <p className="text-sm text-gray-500 leading-relaxed mb-8 max-w-sm mx-auto">
          Your Expense Tracker project and video Q&A responses have been successfully submitted
          {user?.email ? ` for ${user.email}` : ""}.
          Our technical team will review your build and responses and{" "}
          <strong className="text-gray-700">get back to you shortly</strong>.
        </p>

        {/* What's next */}
        <div className="border border-gray-100 rounded-xl p-5 text-left space-y-3 mb-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">What Happens Next</p>
          <div className="space-y-3">
            {[
              { step: 1, text: "Our team reviews your Expense Tracker project code and architecture." },
              { step: 2, text: "Your video Q&A responses are evaluated for depth and clarity." },
              { step: 3, text: "You will be contacted via email or phone within 3–5 business days." },
              { step: 4, text: "If selected, you will receive an offer or final discussion call." },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {step}
                </span>
                <p className="text-sm text-gray-600 leading-snug">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            ["React +", "Spring Boot"],
            ["5", "Q&A Recorded"],
            ["✓", "Submitted"],
          ].map(([val, lbl]) => (
            <div key={lbl} className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-base font-bold text-gray-900">{val}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{lbl}</p>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-400 leading-relaxed">
          You may now safely close this window.
          For any queries, contact the hiring team at{" "}
          <a href="mailto:hr@cloudfuze.com" className="text-gray-600 underline">hr@cloudfuze.com</a>.
        </div>

      </div>
    </div>
  );
}
