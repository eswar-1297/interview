import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AptitudeRegistration from "./components/AptitudeRegistration";
import AptitudeTest         from "./components/AptitudeTest";
import Results              from "./components/Results";

export default function App() {
  const [user, setUser]         = useState(null);
  const [testDone, setTestDone] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Registration / landing */}
          <Route
            path="/"
            element={
              user
                ? <Navigate to="/aptitude" replace />
                : <AptitudeRegistration onSubmit={setUser} />
            }
          />

          {/* Aptitude test */}
          <Route
            path="/aptitude"
            element={
              !user        ? <Navigate to="/" replace /> :
              testDone     ? <Navigate to="/results" replace /> :
              <AptitudeTest user={user} onSubmit={() => setTestDone(true)} />
            }
          />

          {/* Results / thank-you */}
          <Route
            path="/results"
            element={
              user ? <Results user={user} /> : <Navigate to="/" replace />
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}
