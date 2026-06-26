import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import AptitudeRegistration from "./components/AptitudeRegistration";
import AptitudeTest         from "./components/AptitudeTest";
import AptitudeDone         from "./components/AptitudeDone";
import AdminPanel           from "./components/AdminPanel";

export default function App() {
  const [user, setUser] = useState(null);
  const [done, setDone] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>

          {/* Registration */}
          <Route path="/"
            element={
              user ? <Navigate to="/aptitude" replace /> : <AptitudeRegistration onSubmit={setUser} />
            }
          />

          {/* Test */}
          <Route path="/aptitude"
            element={
              !user ? <Navigate to="/" replace /> :
              done  ? <Navigate to="/done" replace /> :
              <AptitudeTest user={user} onSubmit={() => setDone(true)} />
            }
          />

          {/* Thank you */}
          <Route path="/done"
            element={user ? <AptitudeDone /> : <Navigate to="/" replace />}
          />

          {/* Admin */}
          <Route path="/admin" element={<AdminPanel />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </div>
    </Router>
  );
}
