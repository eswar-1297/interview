import React from "react";

export default function Results({ user }) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">

        {/* Check icon */}
        <div className="w-14 h-14 rounded-full bg-gray-900 flex items-center justify-center mx-auto mb-6">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Test Submitted!
        </h1>

        <p className="text-sm text-gray-500 leading-relaxed mb-8">
          Thank you,{" "}
          <span className="font-semibold text-gray-800">
            {user?.name || user?.email}
          </span>
          . Your aptitude test has been successfully submitted.{" "}
          Our hiring team will carefully review your responses and{" "}
          <strong className="text-gray-700">get back to you shortly</strong>.
        </p>

        <div className="border border-gray-100 rounded-xl p-5 text-left space-y-3 mb-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">What's next?</p>
          <div className="space-y-2.5">
            {[
              "Your responses are being reviewed by our team.",
              "We will reach out via email or phone within 3–5 business days.",
              "If selected, you will be invited for the next round.",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-gray-600 leading-snug">{step}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-400 leading-relaxed">
          You may now safely close this window.{" "}
          For any queries, please contact the hiring team at{" "}
          <a href="mailto:hr@cloudfuze.com" className="text-gray-600 underline">hr@cloudfuze.com</a>.
        </div>

      </div>
    </div>
  );
}
