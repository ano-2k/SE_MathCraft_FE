import React, { useState } from "react";
// Assuming component files have the .jsx extension for robust imports
import Sidebar from "./Sidebar.jsx";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";  
import Dashboard from "../pages/Dashboard.jsx";
import Game from "../pages/Games.jsx";
import Achievements from "../pages/Achievements.jsx";
import Graph from "../pages/Graph.jsx";
import Profile from "../pages/Profile.jsx";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

// Function to check local storage for the last visited page
const getInitialPage = () => {
  // Try to retrieve the saved page key.
  const savedPage = localStorage.getItem('mc_current_page');
  
  // Return the saved page key, or default to 'dashboard'.
  return savedPage || "dashboard";
};


const Layout = () => {
  const [page, setPage] = useState(getInitialPage);
  const navigate = useNavigate();   


  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login-register");
    }
  }, [navigate]);

  useEffect(() => {
    localStorage.setItem("mc_current_page", page);
  }, [page]);

  // Pass page to Header for dynamic title
  const getPageTitle = () => {
    switch (page) {
      case "dashboard": return "Dashboard";
      case "game": return "Game";
      case "achievements": return "Achievements";
      case "graph": return "Graph";
      case "profileView": return "View Profile";
      case "profileEdit": return "Edit Profile";
      default: return "";
    }
  };

  // Decide which component to render
  const renderContent = () => {
    switch (page) {
      case "dashboard": return <Dashboard />;
      case "game": return <Game />;
      case "achievements": return <Achievements />;
      case "graph": return <Graph />;
      case "profileView": return <Profile mode="view" />;
      case "profileEdit": return <Profile mode="edit" />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-white via-pink-100 to-pink-200 font-sans relative overflow-hidden">
      <Sidebar setPage={setPage} page={page} />
      <div className="flex-1 flex flex-col">
        {/* NOTE: You'll need to pass 'coins' and 'coinAnimation' props to Header 
            from Layout's state if you implement coin logic here. */}
        <Header pageTitle={getPageTitle()} setPage={setPage} coins={1200} coinAnimation={null} /> 
        <main className="flex-1 p-8 pt-28 overflow-auto">{renderContent()}</main><Footer />
      </div>

      {/* Floating numbers */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="floating-number" style={{ top: "5rem", left: "8rem" }}>3</div>
        <div className="floating-number" style={{ top: "8rem", right: "8rem" }}>7</div>
        <div className="floating-number" style={{ bottom: "10rem", left: "16rem" }}>12</div>
        <div className="floating-number" style={{ bottom: "6rem", right: "14rem" }}>20</div>
      </div>
    </div>
  );
};

export default Layout;
