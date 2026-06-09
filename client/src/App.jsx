import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import TaxCaseStudyLogin from "./components/TaxCaseStudyLogin";
import TaxCaseStudyTest  from "./components/TaxCaseStudyTest";
import TaxCaseStudyDone  from "./components/TaxCaseStudyDone";
import AdminPanel        from "./components/AdminPanel";

export default function App() {
  const [user, setUser]       = useState(null);
  const [done, setDone]       = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>

          {/* Login */}
          <Route path="/"
            element={
              user ? <Navigate to="/test" replace /> : <TaxCaseStudyLogin onSubmit={setUser} />
            }
          />

          {/* Test */}
          <Route path="/test"
            element={
              !user ? <Navigate to="/" replace /> :
              done  ? <Navigate to="/done" replace /> :
              <TaxCaseStudyTest user={user} onSubmit={() => setDone(true)} />
            }
          />

          {/* Thank you */}
          <Route path="/done"
            element={user ? <TaxCaseStudyDone /> : <Navigate to="/" replace />}
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
