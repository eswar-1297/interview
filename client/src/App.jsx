import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import HRTest from "./components/HRTest";
import Results from "./components/Results";

export default function App() {
  const [user, setUser] = useState(null);
  const [hrDone, setHrDone] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route
            path="/"
            element={user ? <Navigate to="/hr" /> : <LandingPage onSubmit={setUser} />}
          />
          <Route
            path="/hr"
            element={
              !user ? <Navigate to="/" /> :
              hrDone ? <Navigate to="/results" /> :
              <HRTest user={user} onSubmit={() => setHrDone(true)} />
            }
          />
          <Route
            path="/results"
            element={user ? <Results user={user} /> : <Navigate to="/" />}
          />
        </Routes>
      </div>
    </Router>
  );
}
