import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import JavaMCQLogin   from "./components/JavaMCQLogin";
import JavaMCQTest    from "./components/JavaMCQTest";
import JavaMCQResults from "./components/JavaMCQResults";
import AdminPanel     from "./components/AdminPanel";

export default function App() {
  const [user, setUser]         = useState(null);
  const [results, setResults]   = useState(null);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>

          {/* Login */}
          <Route path="/"
            element={
              user
                ? <Navigate to="/test" replace />
                : <JavaMCQLogin onSubmit={setUser} />
            }
          />

          {/* MCQ Test */}
          <Route path="/test"
            element={
              !user    ? <Navigate to="/" replace /> :
              results  ? <Navigate to="/done" replace /> :
              <JavaMCQTest user={user} onSubmit={setResults} />
            }
          />

          {/* Results */}
          <Route path="/done"
            element={
              user
                ? <JavaMCQResults user={user} results={results} />
                : <Navigate to="/" replace />
            }
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
