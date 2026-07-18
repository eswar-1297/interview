import React, { useState, useEffect } from "react";

const ADMIN_PASS = "Admin@Neutara2026";

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

export default function AdminPanel() {
  const [pass, setPass]           = useState("");
  const [authed, setAuthed]       = useState(false);
  const [authError, setAuthError] = useState("");
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    if (pass === ADMIN_PASS) { setAuthed(true); setAuthError(""); }
    else setAuthError("Incorrect admin password.");
  };

  useEffect(() => {
    if (!authed) return;
    setLoading(true);
    fetch(`/api/admin-submissions?pass=${encodeURIComponent(ADMIN_PASS)}`)
      .then(r => r.json())
      .then(data => { setSubmissions(data.reverse()); setLoading(false); })
      .catch(() => { setError("Failed to load submissions."); setLoading(false); });
  }, [authed]);

  const downloadUrl = (filename) =>
    `/api/admin-download/${encodeURIComponent(filename)}?pass=${encodeURIComponent(ADMIN_PASS)}`;

  // ── Login screen ────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          <div className="mb-6">
            <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">Hackathon</p>
            <h2 className="text-xl font-bold text-gray-900">Admin Review</h2>
            <p className="text-sm text-gray-500 mt-1">Enter the admin password to view submissions.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                Admin Password
              </label>
              <input
                type="password"
                value={pass}
                onChange={e => { setPass(e.target.value); setAuthError(""); }}
                className="w-full px-4 py-2.5 rounded border border-gray-300 text-sm focus:ring-1 focus:ring-gray-400 focus:border-gray-400 outline-none transition"
                placeholder="••••••••••••"
                autoFocus
              />
            </div>
            {authError && <p className="text-sm text-red-500">{authError}</p>}
            <button type="submit"
              className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded transition-colors">
              Enter Admin Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Admin dashboard ─────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-bold text-gray-900">Admin — Hackathon Submissions</span>
            {!loading && (
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {submissions.length} {submissions.length === 1 ? "submission" : "submissions"}
              </span>
            )}
          </div>
          <button
            onClick={() => {
              setLoading(true);
              fetch(`/api/admin-submissions?pass=${encodeURIComponent(ADMIN_PASS)}`)
                .then(r => r.json())
                .then(data => { setSubmissions(data.reverse()); setLoading(false); })
                .catch(() => setLoading(false));
            }}
            className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1.5 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="max-w-5xl mx-auto px-6 py-8">

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-7 h-7 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>
        )}

        {!loading && !error && submissions.length === 0 && (
          <div className="text-center py-20">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-500">No submissions yet</p>
            <p className="text-xs text-gray-400 mt-1">Candidates' code uploads will appear here.</p>
          </div>
        )}

        {!loading && submissions.length > 0 && (
          <div className="space-y-3">
            {submissions.map((s, i) => (
              <div key={s.filename || i}
                className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-5 hover:border-gray-300 transition-colors">

                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gray-900 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                  {(s.email?.[0] || "?").toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{s.email}</p>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <span className="text-xs text-gray-400">{formatDate(s.submittedAt)}</span>
                    <span className="text-gray-200">·</span>
                    <span className="text-xs text-gray-400">{s.sizeMB} MB</span>
                    <span className="text-gray-200">·</span>
                    <span className="text-xs text-gray-400 truncate max-w-xs">{s.originalName}</span>
                  </div>
                </div>

                {/* Download */}
                <a
                  href={downloadUrl(s.filename)}
                  download={s.originalName}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold rounded-lg transition-colors flex-shrink-0"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Code
                </a>
              </div>
            ))}
          </div>
        )}

        {/* Info box */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-600 leading-relaxed">
          <p className="font-semibold mb-1">How to review</p>
          <p>Click <strong>Download Code</strong> to get the candidate's project zip. Extract it, open in your IDE,
          and run it locally to evaluate the code quality, API design, FastAPI structure, and the AI feature.</p>
        </div>
      </div>
    </div>
  );
}
