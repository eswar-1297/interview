import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import AptitudeTest from "./components/AptitudeTest";
import Results from "./components/Results";

export default function App() {
  const [user, setUser] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route
            path="/"
            element={
              user ? <Navigate to="/aptitude" /> : <LandingPage onSubmit={setUser} />
            }
          />
          <Route
            path="/aptitude"
            element={
              !user ? (
                <Navigate to="/" />
              ) : submitted ? (
                <Navigate to="/results" />
              ) : (
                <AptitudeTest
                  user={user}
                  onSubmit={() => setSubmitted(true)}
                />
              )
            }
          />
          <Route
            path="/results"
            element={
              user ? <Results user={user} /> : <Navigate to="/" />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}
