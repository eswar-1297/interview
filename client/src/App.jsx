import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Aptitude round
import AptitudeRegistration from "./components/AptitudeRegistration";
import AptitudeTest         from "./components/AptitudeTest";
import Results              from "./components/Results";

// Hackathon round
import HackathonRegistration from "./components/HackathonRegistration";
import HackathonBuild        from "./components/HackathonBuild";
import HackathonQA           from "./components/HackathonQA";
import HackathonResults      from "./components/HackathonResults";

export default function App() {
  // ── Aptitude state ────────────────────────────────────
  const [aptUser, setAptUser]   = useState(null);
  const [aptDone, setAptDone]   = useState(false);

  // ── Hackathon state ───────────────────────────────────
  const [hackUser, setHackUser]           = useState(null);
  const [hackBuildDone, setHackBuildDone] = useState(false);
  const [hackDone, setHackDone]           = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>

          {/* ── Aptitude Round ──────────────────────────── */}
          <Route path="/"
            element={aptUser ? <Navigate to="/aptitude" replace /> : <AptitudeRegistration onSubmit={setAptUser} />}
          />
          <Route path="/aptitude"
            element={
              !aptUser  ? <Navigate to="/" replace /> :
              aptDone   ? <Navigate to="/results" replace /> :
              <AptitudeTest user={aptUser} onSubmit={() => setAptDone(true)} />
            }
          />
          <Route path="/results"
            element={aptUser ? <Results user={aptUser} /> : <Navigate to="/" replace />}
          />

          {/* ── Hackathon Round ─────────────────────────── */}
          <Route path="/hackathon"
            element={
              hackUser
                ? <Navigate to="/hackathon/build" replace />
                : <HackathonRegistration onSubmit={setHackUser} />
            }
          />
          <Route path="/hackathon/build"
            element={
              !hackUser      ? <Navigate to="/hackathon" replace /> :
              hackBuildDone  ? <Navigate to="/hackathon/qa" replace /> :
              <HackathonBuild user={hackUser} onBuildDone={() => setHackBuildDone(true)} />
            }
          />
          <Route path="/hackathon/qa"
            element={
              !hackUser     ? <Navigate to="/hackathon" replace /> :
              !hackBuildDone? <Navigate to="/hackathon/build" replace /> :
              hackDone      ? <Navigate to="/hackathon/done" replace /> :
              <HackathonQA user={hackUser} onSubmit={() => setHackDone(true)} />
            }
          />
          <Route path="/hackathon/done"
            element={hackUser ? <HackathonResults user={hackUser} /> : <Navigate to="/hackathon" replace />}
          />

          {/* ── Catch-all ───────────────────────────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </div>
    </Router>
  );
}
