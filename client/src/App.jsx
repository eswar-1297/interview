import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import JavaMCQLogin from "./components/JavaMCQLogin";
import JavaMCQTest  from "./components/JavaMCQTest";
import JavaMCQDone  from "./components/JavaMCQDone";
import AdminPanel   from "./components/AdminPanel";

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
              user ? <Navigate to="/test" replace /> : <JavaMCQLogin onSubmit={setUser} />
            }
          />

          {/* Test */}
          <Route path="/test"
            element={
              !user ? <Navigate to="/" replace /> :
              done  ? <Navigate to="/done" replace /> :
              <JavaMCQTest user={user} onSubmit={() => setDone(true)} />
            }
          />

          {/* Thank you */}
          <Route path="/done"
            element={user ? <JavaMCQDone /> : <Navigate to="/" replace />}
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
