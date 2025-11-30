import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";


const fadeInDownKeyframes = `
  @keyframes fadeInDown {
    0% { opacity: 0; transform: translateY(-10px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeInDown {
    animation: fadeInDown 0.3s ease-out forwards;
  }
`;

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const navbarRef = useRef(null); 
    const navigate = useNavigate();
    const location = useLocation(); 
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleHome = (e) => {
        if (location.pathname === '/') {
            e.preventDefault();
            scrollToTop();
        }
        setMenuOpen(false); 
    }

    const handlePlayNow = () => {
        if (location.pathname === "/login-register" && new URLSearchParams(location.search).get("tab") === "login") {
            scrollToTop(); 
        } else {
            navigate("/login-register?tab=login");
        }
        setMenuOpen(false); 
    };
  
    const handleRegister = () => {
        if (location.pathname === "/login-register" && new URLSearchParams(location.search).get("tab") === "signup") {
            scrollToTop(); 
        } else {
            navigate("/login-register?tab=signup");
        }
        setMenuOpen(false); 
    };
  
    const handleAbout = () => {
        if (location.pathname === "/about") {
            scrollToTop(); 
        } else {
            navigate("/about");
        }
        setMenuOpen(false); 
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuOpen && navbarRef.current && !navbarRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuOpen]); 

    const isActive = (path, tab = null) => {
        const pathMatch = location.pathname === path;

        if (path === '/login-register') {
            const currentTab = new URLSearchParams(location.search).get("tab");
            
            if (tab === 'login') {
                return pathMatch && currentTab === 'login';
            }
            if (tab === 'signup') {
                return pathMatch && currentTab === 'signup';
            }
            return pathMatch && (currentTab === 'login' || currentTab === 'signup');
        }
        
        return pathMatch;
    };

    const activeStyle = "bg-pink-700";
    const defaultStyle = "bg-pink-500";
    const buttonClass = (path, tab = null) => 
        `px-3 py-1 text-white font-semibold rounded-lg shadow-md glow-hover transition text-sm ${
            isActive(path, tab) ? activeStyle : defaultStyle
        }`;


    return (
        <nav ref={navbarRef} className="fixed top-0 left-0 right-0 z-50 bg-white bg-opacity-70 backdrop-blur-md shadow-md">
            <style>{fadeInDownKeyframes}</style> 
            
            <div className="w-full">
                <div className="flex justify-between items-center h-16 px-4 sm:px-8">
                    <a href="/" className="text-pink-600 font-bold text-2xl" onClick={handleHome}>MathCraft</a>
                    <div className="hidden sm:flex space-x-3 items-center">
                        
                        {/* Home Link */}
                        <a 
                            href="/" 
                            onClick={handleHome} 
                            className={buttonClass('/')}
                        >
                            Home
                        </a>
                        
                        {/* Login Button */}
                        <button 
                            onClick={handlePlayNow} 
                            className={buttonClass('/login-register', 'login')} 
                        >
                            Login
                        </button>
                        
                        {/* Register Button */}
                        <button 
                            onClick={handleRegister} 
                            className={buttonClass('/login-register', 'signup')}
                        >
                            Register
                        </button>
                        
                        {/* About Button */}
                        <button 
                            onClick={handleAbout} 
                            className={buttonClass('/about')}
                        >
                            About
                        </button>
                    </div>
                    <div className="sm:hidden">
                        <button onClick={() => setMenuOpen(!menuOpen)} className="text-pink-600 font-bold text-2xl">☰</button>
                    </div>
                </div>
            </div>
            {/* Mobile menu styling */}
            {menuOpen && (
                <div className="sm:hidden flex flex-col gap-0 border-t border-pink-200 bg-white shadow-lg animate-fadeInDown">
                    
                    {/* Mobile Home Link */}
                    <a href="/" onClick={handleHome} className="w-full px-4 py-3 text-pink-700 font-semibold border-b border-pink-100 hover:bg-pink-50 transition text-center">
                        Home
                    </a>
                    
                    {/* Mobile Login Button */}
                    <button onClick={handlePlayNow} className="w-full px-4 py-3 text-pink-700 font-semibold border-b border-pink-100 hover:bg-pink-50 transition">
                        Login
                    </button>
                    
                    {/* Mobile Register Button */}
                    <button onClick={handleRegister} className="w-full px-4 py-3 text-pink-700 font-semibold border-b border-pink-100 hover:bg-pink-50 transition">
                        Register
                    </button>
                    
                    {/* Mobile About Button */}
                    <button onClick={handleAbout} className="w-full px-4 py-3 text-pink-700 font-semibold hover:bg-pink-50 transition">
                        About
                    </button>
                </div>
            )}
        </nav>
    );
};

export default Navbar;