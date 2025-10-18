// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/Home"; 
import LoginRegister from "./pages/LoginRegister"; 
import Layout from "./components/Layout"; 
import Graph from "./pages/Graph";
import "./App.css";

const isLoggedIn = () => !!localStorage.getItem("token"); 


const PrivateRoute = ({ children }) =>
  isLoggedIn() ? children : <Navigate to="/login-register" />;

function App() {
  return (
    <Router>
      <Routes>
        {/* 🏠 Public Home page (before login/register) */}
        <Route path="/" element={<Home />} />

        {/* 🔑 Login / Register */}
        <Route path="/login-register" element={<LoginRegister />} />

        {/* 🔒 Private routes (after successful login) */}
        <Route
          path="/dashboard/*"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        />
         {/* Example: Graph page route */}
        <Route path="/graph" element={
          <PrivateRoute>
            <Graph />
          </PrivateRoute>
        } />

        {/* Fallback redirect (any unknown path → Home) */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
