// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/Home"; 
import LoginRegister from "./pages/LoginRegister"; 
import ResetPasswordPage from "./pages/ResetPasswordPage";
import Layout from "./components/Layout"; 
import Graph from "./pages/Graph";
import About from "./pages/About";

import "./App.css";

const isLoggedIn = () => !!localStorage.getItem("token"); 


const PrivateRoute = ({ children }) =>
  isLoggedIn() ? children : <Navigate to="/login-register" />;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        
        <Route path="/about" element={<About />} />

        <Route path="/login-register" element={<LoginRegister />} />

        <Route
          path="/dashboard/*"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        />

        <Route path="/graph" element={
          <PrivateRoute>
            <Graph />
          </PrivateRoute>
        } />
        <Route path="/reset-password/:uid/:token" element={<ResetPasswordPage />} />

        <Route path="*" element={<Navigate to="/" />} />
        
      </Routes>
    </Router>
  );
}

export default App;
