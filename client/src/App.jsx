import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import HRLogin    from "./components/HRLogin";
import HRTest     from "./components/HRTest";
import HRDone     from "./components/HRDone";
import AdminPanel from "./components/AdminPanel";

export default function App() {
  const [user, setUser] = useState(null);
  const [done, setDone] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>

          {/* Login — the password decides the question bank:
              Neutara@2026    -> experienced (2-3 yrs)
              UniqueHire@2026 -> fresher
              Either way the candidate gets 10 questions out of that bank of 30. */}
          <Route path="/"
            element={
              user
                ? <Navigate to="/interview" replace />
                : <HRLogin onSubmit={setUser} />
            }
          />

          {/* The interview itself — one video answer per question */}
          <Route path="/interview"
            element={
              !user ? <Navigate to="/" replace /> :
              done  ? <Navigate to="/done" replace /> :
              <HRTest user={user} onSubmit={() => setDone(true)} />
            }
          />

          {/* Thank-you page */}
          <Route path="/done"
            element={user ? <HRDone /> : <Navigate to="/" replace />}
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
