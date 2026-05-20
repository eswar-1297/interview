import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import VLSIFinalTest from "./components/VLSIFinalTest";
import Results from "./components/Results";

export default function App() {
  const [user, setUser]         = useState(null);
  const [testDone, setTestDone] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route
            path="/"
            element={user ? <Navigate to="/vlsi-final" /> : <LandingPage onSubmit={setUser} />}
          />
          <Route
            path="/vlsi-final"
            element={
              !user ? <Navigate to="/" /> :
              testDone ? <Navigate to="/results" /> :
              <VLSIFinalTest user={user} onSubmit={() => setTestDone(true)} />
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
