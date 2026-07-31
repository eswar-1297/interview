import React, { useState, useEffect, useCallback } from "react";

const ADMIN_PASS = "Admin@Neutara2026";
const REFRESH_MS = 30000; // pick up new candidates without a manual refresh

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

export default function AdminPanel() {
  const [pass, setPass]           = useState("");
  const [authed, setAuthed]       = useState(false);
  const [authError, setAuthError] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [openEmail, setOpenEmail] = useState(null);

  const handleLogin = (e) => {
    e.preventDefault();
    if (pass === ADMIN_PASS) { setAuthed(true); setAuthError(""); }
    else setAuthError("Incorrect admin password.");
  };

  const load = useCallback((showSpinner = true) => {
    if (showSpinner) setLoading(true);
    fetch(`/api/admin-hr-videos?pass=${encodeURIComponent(ADMIN_PASS)}`)
      .then(r => r.json())
      .then(data => {
        setCandidates(Array.isArray(data) ? data.slice().reverse() : []);
        setError("");
        setLoading(false);
      })
      .catch(() => { setError("Failed to load recordings."); setLoading(false); });
  }, []);

  useEffect(() => {
    if (!authed) return;
    load();
    const id = setInterval(() => load(false), REFRESH_MS);
    return () => clearInterval(id);
  }, [authed, load]);

  const videoUrl = (filename) =>
    `/api/admin-hr-video/${encodeURIComponent(filename)}?pass=${encodeURIComponent(ADMIN_PASS)}`;

  const downloadUrl = (filename) => `${videoUrl(filename)}&download=1`;

  // ── Login screen ────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          <div className="mb-6">
            <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">HR Interview</p>
            <h2 className="text-xl font-bold text-gray-900">Admin Review</h2>
            <p className="text-sm text-gray-500 mt-1">Enter the admin password to view candidate recordings.</p>
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
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-bold text-gray-900">Admin — HR Interview Recordings</span>
            {!loading && (
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {candidates.length} {candidates.length === 1 ? "candidate" : "candidates"}
              </span>
            )}
          </div>
          <button
            onClick={() => load()}
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

        {!loading && !error && candidates.length === 0 && (
          <div className="text-center py-20">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-500">No recordings yet</p>
            <p className="text-xs text-gray-400 mt-1">Candidate answer videos appear here as they record them.</p>
          </div>
        )}

        {!loading && candidates.length > 0 && (
          <div className="space-y-3">
            {candidates.map((c) => {
              const isOpen = openEmail === c.email;
              return (
                <div key={c.email}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition-colors">

                  {/* Candidate row */}
                  <button
                    onClick={() => setOpenEmail(isOpen ? null : c.email)}
                    className="w-full p-5 flex items-center gap-5 text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-900 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                      {(c.name?.[0] || c.email?.[0] || "?").toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-gray-900 truncate">{c.name || c.email}</p>
                        <span className={`text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded ${
                          c.level === "experienced"
                            ? "bg-purple-50 text-purple-700"
                            : "bg-blue-50 text-blue-700"
                        }`}>
                          {c.level === "experienced" ? "Experienced" : "Fresher"}
                        </span>
                        {c.completed ? (
                          <span className="text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded bg-green-50 text-green-700">
                            Completed
                          </span>
                        ) : (
                          <span className="text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700">
                            In progress
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        <span className="text-xs text-gray-400 truncate">{c.email}</span>
                        <span className="text-gray-200">·</span>
                        <span className="text-xs text-gray-400">{c.answers.length} answers recorded</span>
                        <span className="text-gray-200">·</span>
                        <span className="text-xs text-gray-400">{formatDate(c.submittedAt || c.answers[c.answers.length - 1]?.recordedAt)}</span>
                      </div>
                    </div>

                    <span className="text-xs font-semibold text-gray-500 flex items-center gap-1.5 flex-shrink-0">
                      {isOpen ? "Hide" : "View"} answers
                      <svg className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </button>

                  {/* Answers */}
                  {isOpen && (
                    <div className="border-t border-gray-100 bg-gray-50 p-5 space-y-5">
                      {c.answers.map((a) => (
                        <div key={a.filename} className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                                Question {a.questionId}
                              </p>
                              <p className="text-sm text-gray-900 mt-1 leading-snug">{a.questionText}</p>
                            </div>
                            <a
                              href={downloadUrl(a.filename)}
                              className="text-xs font-semibold text-gray-500 hover:text-gray-900 whitespace-nowrap flex-shrink-0"
                            >
                              Download
                            </a>
                          </div>

                          <video
                            controls
                            preload="metadata"
                            src={videoUrl(a.filename)}
                            className="w-full max-w-xl rounded-lg bg-black"
                          />

                          <p className="text-[11px] text-gray-400 mt-2">
                            {formatDate(a.recordedAt)} · {a.sizeMB} MB
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Info box */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-600 leading-relaxed">
          <p className="font-semibold mb-1">How to review</p>
          <p>Click a candidate to expand their answers and play each recording inline. The list refreshes
          automatically every 30 seconds, so answers appear here while the candidate is still interviewing.
          &quot;In progress&quot; means they have recorded answers but not yet submitted.</p>
        </div>
      </div>
    </div>
  );
}
