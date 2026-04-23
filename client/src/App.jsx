import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import CodingTest from "./components/CodingTest";
import Results from "./components/Results";

export default function App() {
  const [user, setUser] = useState(null);
  const [scriptingDone, setScriptingDone] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route
            path="/"
            element={user ? <Navigate to="/coding" /> : <LandingPage onSubmit={setUser} />}
          />
          <Route
            path="/coding"
            element={
              !user ? <Navigate to="/" /> :
              scriptingDone ? <Navigate to="/results" /> :
              <CodingTest user={user} onSubmit={() => setScriptingDone(true)} />
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
