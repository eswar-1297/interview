import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const BUILD_SECONDS = 2.5 * 60 * 60; // 2 hours 30 minutes

function pad(n) { return String(n).padStart(2, "0"); }
function formatTime(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

const STACK = [
  { label: "Frontend",   value: "React.js",         color: "text-blue-600 bg-blue-50"   },
  { label: "Backend",    value: "Java — Spring Boot",color: "text-orange-600 bg-orange-50"},
  { label: "Database",   value: "H2 / MySQL / PostgreSQL", color: "text-green-600 bg-green-50"},
  { label: "Build Tool", value: "Maven or Gradle",   color: "text-purple-600 bg-purple-50"},
];

const FEATURES = [
  { num: 1, title: "Add Expense",        desc: "Form with Amount, Category (Food / Travel / Shopping / Bills / Other), Description, and Date fields." },
  { num: 2, title: "View Expenses",      desc: "Paginated table or list showing all expenses with category color tags and total at the bottom." },
  { num: 3, title: "Edit & Delete",      desc: "Ability to update any expense via a modal or inline form, and delete with confirmation." },
  { num: 4, title: "Filter Expenses",    desc: "Filter by category and/or date range. Results update dynamically without page reload." },
  { num: 5, title: "Dashboard Summary",  desc: "Total amount spent + breakdown by category. Simple text display or a chart (bonus)." },
];

const ENDPOINTS = [
  { method: "GET",    path: "/api/expenses",         desc: "Fetch all expenses"              },
  { method: "POST",   path: "/api/expenses",         desc: "Create a new expense"            },
  { method: "PUT",    path: "/api/expenses/{id}",    desc: "Update an existing expense"      },
  { method: "DELETE", path: "/api/expenses/{id}",    desc: "Delete an expense"               },
  { method: "GET",    path: "/api/expenses/summary", desc: "Category-wise totals"            },
];

const METHOD_COLORS = {
  GET:    "bg-green-100 text-green-700",
  POST:   "bg-blue-100 text-blue-700",
  PUT:    "bg-amber-100 text-amber-700",
  DELETE: "bg-red-100 text-red-700",
};

export default function HackathonBuild({ user, onBuildDone }) {
  const [timeLeft, setTimeLeft]   = useState(BUILD_SECONDS);
  const [confirmed, setConfirmed] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [activeTab, setActiveTab] = useState("features"); // features | api | tips

  const videoRef  = useRef(null);
  const streamRef = useRef(null);
  const navigate  = useNavigate();

  // Camera
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: { width: 320, height: 240 }, audio: false })
      .then(stream => {
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => setCameraError(true));
    return () => streamRef.current?.getTracks().forEach(t => t.stop());
  }, []);

  // Block back navigation
  useEffect(() => {
    const push = () => window.history.pushState(null, "", window.location.href);
    push();
    const onPop = () => push();
    window.addEventListener("popstate", onPop);
    const onUnload = (e) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", onUnload);
    return () => {
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("beforeunload", onUnload);
    };
  }, []);

  const goToQA = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    onBuildDone();
    navigate("/hackathon/qa");
  }, [onBuildDone, navigate]);

  // Countdown
  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(id); goToQA(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [goToQA]);

  const handleDone = () => {
    if (!confirmed) { setConfirmed(true); return; }
    goToQA();
  };

  const danger  = timeLeft <= 900; // red at ≤ 15 min
  const warning = timeLeft <= 1800 && timeLeft > 900; // amber at ≤ 30 min
  const timerClass = danger
    ? "text-red-600 bg-red-50 border-red-200"
    : warning
    ? "text-amber-600 bg-amber-50 border-amber-200"
    : "text-gray-700 bg-gray-50 border-gray-200";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ── Header ──────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-gray-900 text-sm">Hackathon — Build Phase</span>
            <span className="text-gray-300 hidden sm:inline">|</span>
            <span className="text-gray-400 text-xs hidden sm:inline">{user?.email}</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Camera */}
            <div className="relative w-14 h-9 rounded overflow-hidden bg-black border border-gray-200 flex-shrink-0">
              {cameraError ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                  <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
              ) : (
                <>
                  <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                  <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                </>
              )}
            </div>

            {/* Timer */}
            <div className={`font-mono text-sm font-bold px-3 py-1.5 rounded-lg border transition-colors ${timerClass}`}>
              {formatTime(timeLeft)}
            </div>

            {/* Done button */}
            {!confirmed ? (
              <button onClick={handleDone}
                className="text-xs font-semibold bg-gray-900 hover:bg-gray-800 text-white px-3 py-1.5 rounded-lg transition-colors">
                Done Building →
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Are you sure?</span>
                <button onClick={goToQA}
                  className="text-xs font-semibold bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition-colors">
                  Yes, Proceed to Q&A
                </button>
                <button onClick={() => setConfirmed(false)}
                  className="text-xs font-semibold text-gray-500 hover:text-gray-800 px-2 py-1.5 transition-colors">
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Body ────────────────────────────────────────── */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex gap-6">

        {/* ── Left: Project spec ──────────────────────── */}
        <div className="flex-1 min-w-0 space-y-5">

          {/* Title */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">Project Assignment</p>
                <h1 className="text-xl font-bold text-gray-900">Expense Tracker Application</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Build a full-stack Expense Tracker that allows users to add, view, edit, delete,
                  and filter personal expenses with a summary dashboard.
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-gray-400">Build Time</p>
                <p className="text-2xl font-bold text-gray-900 font-mono">{formatTime(timeLeft)}</p>
                <p className="text-xs text-gray-400">remaining</p>
              </div>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-3">Tech Stack (Required)</p>
            <div className="grid grid-cols-2 gap-3">
              {STACK.map(s => (
                <div key={s.label} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${s.color}`}>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide opacity-60">{s.label}</p>
                    <p className="text-sm font-semibold">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-lg">
              <p className="text-xs text-amber-700 font-medium">
                💡 Use H2 in-memory database for quickest setup — just add the Spring Boot dependency, no installation needed.
              </p>
            </div>
          </div>

          {/* Tabs: Features / API / Tips */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex border-b border-gray-200">
              {[["features", "Features to Build"], ["api", "API Endpoints"], ["tips", "Tips & Evaluation"]].map(([key, lbl]) => (
                <button key={key} onClick={() => setActiveTab(key)}
                  className={`flex-1 py-3 text-xs font-semibold transition-colors ${
                    activeTab === key
                      ? "bg-gray-900 text-white"
                      : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                  }`}>
                  {lbl}
                </button>
              ))}
            </div>

            <div className="p-5">
              {activeTab === "features" && (
                <div className="space-y-4">
                  {FEATURES.map(f => (
                    <div key={f.num} className="flex gap-3">
                      <div className="w-7 h-7 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {f.num}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{f.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "api" && (
                <div className="space-y-2.5">
                  <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                    Your Spring Boot application must expose these REST endpoints.
                    Use <code className="bg-gray-100 px-1 rounded text-xs">@RestController</code> with proper
                    Service and Repository layers.
                  </p>
                  {ENDPOINTS.map(ep => (
                    <div key={ep.path + ep.method} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded flex-shrink-0 ${METHOD_COLORS[ep.method]}`}>
                        {ep.method}
                      </span>
                      <code className="text-xs text-gray-700 font-mono flex-1">{ep.path}</code>
                      <span className="text-xs text-gray-400 hidden sm:block">{ep.desc}</span>
                    </div>
                  ))}
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                    <p className="text-xs text-blue-700 font-semibold mb-1">Spring Boot Model Example</p>
                    <pre className="text-[11px] text-blue-800 font-mono leading-relaxed whitespace-pre-wrap">{`@Entity
public class Expense {
  @Id @GeneratedValue
  private Long id;
  private String category;
  private Double amount;
  private String description;
  private LocalDate date;
}`}</pre>
                  </div>
                </div>
              )}

              {activeTab === "tips" && (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-700 uppercase tracking-widest mb-2">Evaluation Criteria</p>
                    <div className="space-y-2">
                      {[
                        ["Working CRUD via REST API",           "Core requirement"],
                        ["Spring Boot layering (Controller → Service → Repository)", "Architecture"],
                        ["React state management & component structure", "Frontend"],
                        ["Code readability & naming conventions","Clean code"],
                        ["Input validation & error handling",    "Bonus"],
                        ["Responsive UI & category charts",      "Bonus"],
                      ].map(([item, tag]) => (
                        <div key={item} className="flex items-start gap-2">
                          <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                          <div>
                            <span className="text-xs text-gray-700">{item}</span>
                            <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded ${
                              tag === "Bonus" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500"
                            }`}>{tag}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-700 uppercase tracking-widest mb-2">Suggested Time Breakdown</p>
                    <div className="space-y-1.5 text-xs text-gray-500">
                      {[
                        ["0:00 – 0:20", "Spring Boot project setup, dependencies (pom.xml), H2 config"],
                        ["0:20 – 1:00", "Expense entity, repository (JPA), service, REST controller"],
                        ["1:00 – 1:30", "React project setup, Expense list, Add Expense form"],
                        ["1:30 – 2:00", "Edit, Delete, Filter by category/date"],
                        ["2:00 – 2:30", "Dashboard summary, polish UI, test all endpoints"],
                      ].map(([time, task]) => (
                        <div key={time} className="flex gap-2">
                          <span className="font-mono text-gray-400 flex-shrink-0 w-28">{time}</span>
                          <span>{task}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Right: Status sidebar ────────────────────── */}
        <div className="w-60 flex-shrink-0 hidden xl:block space-y-4">
          <div className="sticky top-20 space-y-4">

            {/* Timer card */}
            <div className={`rounded-xl p-5 border text-center transition-colors ${
              danger ? "bg-red-50 border-red-200" : warning ? "bg-amber-50 border-amber-200" : "bg-white border-gray-200"
            }`}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">Time Remaining</p>
              <p className={`text-3xl font-bold font-mono ${danger ? "text-red-600" : warning ? "text-amber-600" : "text-gray-900"}`}>
                {formatTime(timeLeft)}
              </p>
              {danger  && <p className="text-xs text-red-500 mt-1 font-medium">Wrap up your build!</p>}
              {warning && <p className="text-xs text-amber-600 mt-1 font-medium">30 minutes left</p>}
            </div>

            {/* Phase status */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Session Progress</p>
              {[
                { label: "Registration", done: true },
                { label: "Build Phase",  done: false, active: true },
                { label: "Video Q&A",    done: false },
                { label: "Submit",       done: false },
              ].map(step => (
                <div key={step.label} className="flex items-center gap-2.5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                    step.done   ? "bg-gray-900"  :
                    step.active ? "bg-gray-900 ring-2 ring-gray-300" :
                    "bg-gray-100"
                  }`}>
                    {step.done ? (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <div className={`w-2 h-2 rounded-full ${step.active ? "bg-white" : "bg-gray-300"}`} />
                    )}
                  </div>
                  <span className={`text-xs ${step.active ? "font-semibold text-gray-900" : step.done ? "text-gray-400 line-through" : "text-gray-400"}`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Done button */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">When You're Ready</p>
              <p className="text-xs text-gray-500 leading-relaxed">
                Click when your Expense Tracker is complete and running. You'll move to the 5-question video Q&A.
              </p>
              {!confirmed ? (
                <button onClick={handleDone}
                  className="w-full py-2 text-sm font-semibold bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors">
                  I've Completed the Build →
                </button>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-amber-700 font-medium">Confirm — this will end the build phase.</p>
                  <button onClick={goToQA}
                    className="w-full py-2 text-sm font-semibold bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                    Yes, Go to Q&A
                  </button>
                  <button onClick={() => setConfirmed(false)}
                    className="w-full py-2 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors">
                    Go back to building
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
