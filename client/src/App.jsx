import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import Dashboard from "./components/Dashboard";
import AptitudeTest from "./components/AptitudeTest";
import CodingTest from "./components/CodingTest";
import Results from "./components/Results";

export default function App() {
  const [user, setUser] = useState(null);
  const [aptitudeResults, setAptitudeResults] = useState(null);
  const [codingResults, setCodingResults] = useState(null);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route
            path="/"
            element={
              user ? <Navigate to="/dashboard" /> : <LandingPage onSubmit={setUser} />
            }
          />
          <Route
            path="/dashboard"
            element={
              user ? (
                <Dashboard
                  user={user}
                  aptitudeDone={!!aptitudeResults}
                  codingDone={!!codingResults}
                />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/aptitude"
            element={
              user ? (
                <AptitudeTest
                  user={user}
                  onSubmit={(results) => setAptitudeResults(results)}
                />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/coding"
            element={
              !user ? (
                <Navigate to="/" />
              ) : !aptitudeResults ? (
                <Navigate to="/dashboard" />
              ) : (
                <CodingTest
                  user={user}
                  onSubmit={(results) => setCodingResults(results)}
                />
              )
            }
          />
          <Route
            path="/results"
            element={
              user ? (
                <Results user={user} />
              ) : (
                <Navigate to="/" />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
}
