import React from "react";

const Sidebar = ({ setPage, page }) => {
  const navItems = [
    { label: "Dashboard", icon: "🏠", key: "dashboard" },
    { label: "Game", icon: "🎮", key: "game" },
    { label: "Achievements", icon: "🏆", key: "achievements" },
    { label: "Graph", icon: "📊", key: "graph" },
  ];

  // Helper function to handle navigation and save state
  const handleNavigation = (key) => {
    setPage(key);
    // CRITICAL: Save the currently selected page key to local storage for persistence on refresh
    // This ensures that on a refresh, the app knows which page to load initially.
    localStorage.setItem('mc_current_page', key);
  };

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 p-6 bg-white/70 backdrop-blur-md shadow-lg flex flex-col justify-between z-50">
      <div>
        <button
          onClick={() => handleNavigation("dashboard")}
          className="flex items-center gap-3 mb-8 w-full text-left focus:outline-none focus:ring-2 focus:ring-pink-500 rounded-lg p-1"
        >
          <div className="w-10 h-10 rounded-lg bg-pink-500 flex items-center justify-center text-white font-bold shadow-md">
            M
          </div>
          <div>
            <div className="text-pink-600 text-lg font-bold">MathCraft</div>
            <div className="text-xs text-gray-500 -mt-1">Futuristic IQ Puzzles</div>
          </div>
        </button>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const active = page === item.key;
            return (
              <button
                key={item.key}
                onClick={() => handleNavigation(item.key)}
                className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  active
                    ? "bg-pink-100 text-pink-700 shadow-inner ring-2 ring-pink-500/50"
                    : "hover:bg-pink-50 text-gray-700 hover:text-pink-600"
                }`}
              >
                <span>{item.icon}</span> {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="text-xs text-gray-500 text-center border-t pt-4 border-gray-100">© 2025 MathCraft</div>
    </aside>
  );
};

export default Sidebar;
