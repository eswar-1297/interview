import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import CodingLogin from "./components/CodingLogin";
import CodingTest  from "./components/CodingTest";
import CodingDone  from "./components/CodingDone";
import AdminPanel  from "./components/AdminPanel";

export default function App() {
  const [user, setUser] = useState(null);
  const [done, setDone] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>

          {/* Login */}
          <Route path="/"
            element={
              user ? <Navigate to="/test" replace /> : <CodingLogin onSubmit={setUser} />
            }
          />

          {/* Test */}
          <Route path="/test"
            element={
              !user ? <Navigate to="/" replace /> :
              done  ? <Navigate to="/done" replace /> :
              <CodingTest user={user} onSubmit={() => setDone(true)} />
            }
          />

          {/* Thank you */}
          <Route path="/done"
            element={user ? <CodingDone /> : <Navigate to="/" replace />}
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
