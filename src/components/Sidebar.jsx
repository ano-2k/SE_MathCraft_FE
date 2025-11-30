import React, { useState, useEffect } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { Home, Gamepad2, Trophy, BarChart3 } from "lucide-react";

const Sidebar = ({ setPage, page }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: "Dashboard", icon: <Home size={20} />, key: "dashboard" },
    { label: "Game", icon: <Gamepad2 size={20} />, key: "game" },
    { label: "Achievements", icon: <Trophy size={20} />, key: "achievements" },
    { label: "Graph", icon: <BarChart3 size={20} />, key: "graph" },
  ];

  const handleNavigation = (key) => {
  setPage(key);
  localStorage.setItem("mc_current_page", key);
  setIsOpen(false); 

  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "smooth",
  });
};


  useEffect(() => {
    const savedPage = localStorage.getItem("mc_current_page");
    if (savedPage) setPage(savedPage);
  }, [setPage]);

  return (
    <>
      {/* --- Mobile Top Bar (Hamburger + Logo) --- */}
<div className="md:hidden fixed top-0 left-0 w-full flex justify-between items-center bg-white/80 backdrop-blur-md px-4 py-3 shadow-md z-[70] h-[60px]">
  <button
    onClick={() => handleNavigation("dashboard")}
    className="flex items-center gap-2 focus:outline-none"
  >
    <div className="w-9 h-9 rounded-lg bg-pink-500 flex items-center justify-center text-white font-bold shadow-md">
      M
    </div>
    <div>
      <div className="text-pink-600 font-bold text-base">MathCraft</div>
      <div className="text-[10px] text-gray-500 -mt-1">Futuristic IQ Puzzles</div>
    </div>
  </button>

  <button
    onClick={() => setIsOpen(!isOpen)}
    className="text-pink-600 text-2xl focus:outline-none"
  >
    {isOpen ? <FiX /> : <FiMenu />}
  </button>
</div>

      {/* --- Sidebar (Desktop + Mobile Slide-in) --- */}
      <aside
  className={`fixed top-0 left-0 h-screen w-64 p-6 bg-white/70 backdrop-blur-md shadow-lg flex flex-col justify-between z-[60] transition-transform duration-300
  ${isOpen ? "translate-x-0" : "-translate-x-full"} 
  md:translate-x-0`}
>


        <div>
         {/* Logo – Desktop Only */}
<button
  onClick={() => handleNavigation("dashboard")}
  className="hidden md:flex items-center gap-3 mb-8 w-full text-left focus:outline-none rounded-lg p-1"
>
  <div className="w-10 h-10 rounded-lg bg-pink-500 flex items-center justify-center text-white font-bold shadow-md">
    M
  </div>
  <div>
    <div className="text-pink-600 text-lg font-bold">MathCraft</div>
    <div className="text-xs text-gray-500 -mt-1">Futuristic IQ Puzzles</div>
  </div>
</button>

          {/* Navigation Items */}
          <nav className="space-y-2 mt-16 md:mt-0">
            {navItems.map((item) => {
              const active = page === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => handleNavigation(item.key)}
                  className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-lg font-semibold transition-all duration-200
                    ${active
                      ? "bg-pink-100 text-pink-700 shadow-inner ring-2 ring-pink-500/50"
                      : "hover:bg-pink-50 text-gray-700 hover:text-pink-600"
                    }`}
                >
                  <span className="flex items-center justify-center w-5">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="text-xs text-gray-500 text-center border-t pt-4 border-gray-100">
          © 2025 MathCraft
        </div>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm md:hidden z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;