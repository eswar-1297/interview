import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import HackathonLogin   from "./components/HackathonLogin";
import HackathonBuild   from "./components/HackathonBuild";
import HackathonQA      from "./components/HackathonQA";
import HackathonResults from "./components/HackathonResults";
import AdminPanel       from "./components/AdminPanel";

export default function App() {
  const [user, setUser]           = useState(null);
  const [buildDone, setBuildDone] = useState(false);
  const [hackDone, setHackDone]   = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>

          {/* Login — password UniqueHire@2026 */}
          <Route path="/"
            element={
              user
                ? <Navigate to="/hackathon/build" replace />
                : <HackathonLogin onSubmit={setUser} />
            }
          />

          {/* Build phase — paste/upload project zip */}
          <Route path="/hackathon/build"
            element={
              !user      ? <Navigate to="/" replace /> :
              buildDone  ? <Navigate to="/hackathon/qa" replace /> :
              <HackathonBuild user={user} onBuildDone={() => setBuildDone(true)} />
            }
          />

          {/* Video Q&A — questions after the hackathon */}
          <Route path="/hackathon/qa"
            element={
              !user      ? <Navigate to="/" replace /> :
              !buildDone ? <Navigate to="/hackathon/build" replace /> :
              hackDone   ? <Navigate to="/hackathon/done" replace /> :
              <HackathonQA user={user} onSubmit={() => setHackDone(true)} />
            }
          />

          {/* Simple thank-you page */}
          <Route path="/hackathon/done"
            element={user ? <HackathonResults user={user} /> : <Navigate to="/" replace />}
          />

          {/* Admin review panel */}
          <Route path="/admin" element={<AdminPanel />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </div>
    </Router>
  );
}
