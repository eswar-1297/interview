import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const RECORD_SECONDS = 180; // 3 minutes per question

function pad(n) { return String(n).padStart(2, "0"); }
function formatTime(s) { return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`; }

const TOPIC_COLORS = {
  "System Architecture":     { bg: "bg-blue-50",   text: "text-blue-700"   },
  "Java Spring Boot & API Design": { bg: "bg-orange-50", text: "text-orange-700" },
  "React Frontend":          { bg: "bg-cyan-50",   text: "text-cyan-700"   },
  "Problem Solving":         { bg: "bg-purple-50", text: "text-purple-700" },
  "Security & Authentication":{ bg: "bg-red-50",   text: "text-red-700"    },
};

export default function HackathonQA({ user, onSubmit }) {
  const [questions, setQuestions]     = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recordings, setRecordings]   = useState({});
  const [phase, setPhase]             = useState("idle"); // idle | recording | saving | saved
  const [timeLeft, setTimeLeft]       = useState(RECORD_SECONDS);
  const [loading, setLoading]         = useState(true);
  const [cameraError, setCameraError] = useState(false);
  const [submitted, setSubmitted]     = useState(false);

  const videoRef         = useRef(null);
  const streamRef        = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef        = useRef([]);
  const timerRef         = useRef(null);
  const navigate         = useNavigate();

  // Load questions
  useEffect(() => {
    fetch("/api/hackathon-qa")
      .then(r => r.json())
      .then(data => { setQuestions(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Camera + mic
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: { width: 640, height: 480 }, audio: true })
      .then(stream => {
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => setCameraError(true));
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Block back navigation
  useEffect(() => {
    const push = () => window.history.pushState(null, "", window.location.href);
    push();
    const onPop = () => push();
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Reset phase when question changes
  useEffect(() => {
    setPhase("idle");
    setTimeLeft(RECORD_SECONDS);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [currentIndex]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase("saving");
  }, []);

  const startRecording = () => {
    if (!streamRef.current || phase !== "idle") return;
    chunksRef.current = [];

    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9" : "video/webm";

    const mr = new MediaRecorder(streamRef.current, { mimeType });
    mediaRecorderRef.current = mr;

    mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      const url  = URL.createObjectURL(blob);
      const qId  = questions[currentIndex]?.id;
      setRecordings(prev => ({ ...prev, [qId]: { blob, url } }));
      setPhase("saved");
    };

    mr.start(250);
    setPhase("recording");

    let t = RECORD_SECONDS;
    timerRef.current = setInterval(() => {
      t -= 1;
      setTimeLeft(t);
      if (t <= 0) {
        clearInterval(timerRef.current);
        if (mediaRecorderRef.current?.state === "recording") {
          mediaRecorderRef.current.stop();
          setPhase("saving");
        }
      }
    }, 1000);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex(i => i + 1);
  };

  const handleSubmit = () => {
    if (submitted) return;
    setSubmitted(true);
    streamRef.current?.getTracks().forEach(t => t.stop());
    onSubmit({ attempted: Object.keys(recordings).length, total: questions.length });
    navigate("/hackathon/done");
  };

  const isLast   = currentIndex === questions.length - 1;
  const current  = questions[currentIndex];
  const answered = Object.keys(recordings).length;
  const topicStyle = current ? (TOPIC_COLORS[current.topic] || { bg: "bg-gray-100", text: "text-gray-700" }) : {};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400">Loading Q&A questions…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* ── Header ──────────────────────────────────────── */}
      <header className="border-b border-gray-100 sticky top-0 z-10 bg-white">
        <div className="max-w-4xl mx-auto px-6 h-12 flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm min-w-0">
            <span className="font-semibold text-gray-900 whitespace-nowrap">Hackathon — Video Q&A</span>
            <span className="text-gray-300 hidden sm:inline">|</span>
            <span className="text-gray-400 text-xs hidden sm:inline">Question {currentIndex + 1} of {questions.length}</span>
            <span className="text-gray-300 hidden md:inline">|</span>
            <span className="text-gray-400 text-xs hidden md:inline truncate">{user?.email}</span>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            <span className="text-xs text-gray-400">{answered}/{questions.length} recorded</span>
            {phase === "recording" && (
              <span className={`text-sm font-mono font-semibold ${timeLeft <= 30 ? "text-red-500" : "text-gray-700"}`}>
                {formatTime(timeLeft)}
              </span>
            )}
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-0.5 bg-gray-100">
          <div className="h-full bg-gray-900 transition-all duration-500"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
        </div>
      </header>

      {/* ── Body ────────────────────────────────────────── */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-8 flex flex-col gap-6">

        {current && (
          <>
            {/* Badges + question */}
            <div>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${topicStyle.bg} ${topicStyle.text}`}>
                  {current.topic}
                </span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  current.difficulty === "Hard" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-700"
                }`}>
                  {current.difficulty}
                </span>
                <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                  {current.category}
                </span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 leading-snug max-w-2xl">
                {current.question}
              </h2>
            </div>

            {/* Video + Sidebar */}
            <div className="flex flex-col lg:flex-row gap-6 items-start">

              {/* Video */}
              <div className="flex-1 w-full">
                <div className="relative rounded-xl overflow-hidden bg-black" style={{ aspectRatio: "16/9" }}>
                  <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />

                  {phase === "recording" && (
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-full px-2.5 py-1">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-white text-xs font-semibold">REC</span>
                    </div>
                  )}

                  {phase === "recording" && (
                    <div className={`absolute top-3 right-3 font-mono text-sm font-bold px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm ${timeLeft <= 30 ? "text-red-400" : "text-white"}`}>
                      {formatTime(timeLeft)}
                    </div>
                  )}

                  {cameraError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                      <p className="text-gray-400 text-sm">Camera / microphone unavailable</p>
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div className="mt-4 flex items-center gap-3 flex-wrap">
                  {phase === "idle" && (
                    <button onClick={startRecording}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                      Start Recording
                    </button>
                  )}
                  {phase === "recording" && (
                    <button onClick={stopRecording}
                      className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors">
                      <span className="w-2.5 h-2.5 rounded bg-white" />
                      Stop Recording
                    </button>
                  )}
                  {phase === "saving" && (
                    <span className="text-sm text-gray-400">Saving response…</span>
                  )}
                  {phase === "saved" && (
                    <div className="flex items-center gap-2 text-green-700 text-sm font-medium">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      Response saved
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:w-56 flex-shrink-0 space-y-4">
                {/* Instructions */}
                <div className="bg-gray-50 rounded-lg p-4 text-xs text-gray-500 space-y-2 leading-relaxed">
                  <p className="font-semibold text-gray-700 text-[11px] uppercase tracking-widest">Instructions</p>
                  <p>› Click <strong>Start Recording</strong> when ready.</p>
                  <p>› You have up to <strong>3 minutes</strong> per question.</p>
                  <p>› Recording auto-stops at the limit.</p>
                  <p>› You may re-record before moving to Next.</p>
                  <p>› Click <strong>Next</strong> after saving.</p>
                  <p>› Speak clearly — reference your actual code.</p>
                </div>

                {/* Progress grid */}
                <div>
                  <p className="text-[10px] text-gray-400 mb-2 uppercase tracking-widest font-semibold">Progress</p>
                  <div className="flex flex-wrap gap-2">
                    {questions.map((q, i) => (
                      <div key={q.id}
                        className={`w-8 h-8 rounded-lg text-xs flex items-center justify-center font-semibold select-none ${
                          i === currentIndex
                            ? "bg-gray-900 text-white"
                            : recordings[q.id]
                            ? "bg-green-100 text-green-700 border border-green-300"
                            : "bg-gray-100 text-gray-400"
                        }`}>
                        {i + 1}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 space-y-1.5 text-[10px] text-gray-400">
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded bg-green-100 border border-green-300 inline-block" />
                      Recorded ({answered})
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded bg-gray-900 inline-block" />
                      Current
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded bg-gray-100 inline-block" />
                      Pending ({questions.length - answered})
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Next / Submit */}
        <div className="flex justify-end border-t border-gray-100 pt-4">
          {!isLast ? (
            <button onClick={handleNext} disabled={phase !== "saved"}
              className="px-6 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              Next Question →
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={phase !== "saved" || submitted}
              className="px-6 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              Submit Hackathon →
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
