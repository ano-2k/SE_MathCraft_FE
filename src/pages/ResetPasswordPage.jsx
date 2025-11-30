import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import Footer from "../components/Footer.jsx";

const ResetPasswordPage = () => {
  const { uid, token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); 
  const [menuOpen, setMenuOpen] = useState(false); 
  const [formErrors, setFormErrors] = useState({}); 


  const [isLongEnough, setIsLongEnough] = useState(false);
  const [hasCapital, setHasCapital] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);
  const [hasSpecial, setHasSpecial] = useState(false);
  const [isConfirmMatch, setIsConfirmMatch] = useState(false);
  const [flashStatus, setFlashStatus] = useState(null); 
  
  const navigate = useNavigate();
  const apiBase = import.meta.env.VITE_BASE_API;

  const navbarRef = useRef(null); 
  const floatingRefs = useRef([]);

  const floatingNumbers = [
    { top: "5%", left: "5%", val: 3 },
    { top: "10%", right: "10%", val: 7 },
    { top: "20%", left: "20%", val: 9 },
    { top: "25%", right: "25%", val: 12 },
    { top: "40%", left: "10%", val: 5 },
    { top: "45%", right: "15%", val: 8 },
  ];


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
  
  useEffect(() => {
    if (!window.anime) return;

    floatingRefs.current.forEach((el, index) => {
      window.anime({
        targets: el,
        translateY: [
          { value: (Math.random() - 0.5) * 50, duration: 4000 },
          { value: (Math.random() - 0.5) * 50, duration: 4000 },
          { value: 0, duration: 4000 },
        ],
        translateX: [
          { value: (Math.random() - 0.5) * 50, duration: 4000 },
          { value: (Math.random() - 0.5) * 50, duration: 4000 },
          { value: 0, duration: 4000 },
        ],
        rotate: [
          { value: (Math.random() - 0.5) * 30, duration: 5000 },
          { value: (Math.random() - 0.5) * 30, duration: 5000 },
          { value: 0, duration: 5000 },
        ],
        opacity: [
          { value: 0.3 + Math.random() * 0.4, duration: 3000 },
          { value: 0.6 + Math.random() * 0.4, duration: 3000 },
          { value: 0.3 + Math.random() * 0.4, duration: 3000 },
        ],
        scale: [
          { value: 0.8 + Math.random() * 0.3, duration: 3000 },
          { value: 0.9 + Math.random() * 0.3, duration: 3000 },
          { value: 1, duration: 3000 },
        ],
        loop: true,
        easing: "easeInOutQuad",
        delay: index * 300,
      });
    });
  }, []);


  const validatePassword = (currentPassword, currentConfirmPassword) => {
    const errors = {};
    const p = currentPassword; 
    const cP = currentConfirmPassword;

    const oldStatus = { isLongEnough, hasCapital, hasNumber, hasSpecial, isConfirmMatch };

    const long = p.length >= 8;
    const capital = /[A-Z]/.test(p);
    const number = /[0-9]/.test(p);
    const special = /[!@#$%^&*(),.?":{}|<>]/.test(p);

    const checkAndFlash = (current, setFunction, name) => {
      if (current && !oldStatus[name]) {
        setFlashStatus(name);
        setTimeout(() => setFlashStatus(null), 1500);
      }
      setFunction(current);
    };

    checkAndFlash(long, setIsLongEnough, 'isLongEnough');
    checkAndFlash(capital, setHasCapital, 'hasCapital');
    checkAndFlash(number, setHasNumber, 'hasNumber');
    checkAndFlash(special, setHasSpecial, 'hasSpecial');

    const isComplex = long && capital && number && special;
    
    if (!isComplex && p.length > 0) {
        if (!long) errors.password = "Password must be at least 8 characters.";
        else if (!capital) errors.password = "Password must contain at least one capital letter.";
        else if (!number) errors.password = "Password must contain at least one number.";
        else if (!special) errors.password = "Password must contain at least one special character.";
    }

    const matches = p === cP && cP.length > 0;

    if (matches && !oldStatus.isConfirmMatch) {
      setFlashStatus('isConfirmMatch');
      setTimeout(() => setFlashStatus(null), 1500);
    }
    setIsConfirmMatch(matches);

    if (p.length > 0 && cP.length > 0 && p !== cP) {
        errors.confirmPassword = "Passwords do not match.";
    }

    setFormErrors(errors);
    
    return isComplex && matches;
  };
  
  const handlePasswordChange = (e) => {
      const newPassword = e.target.value;
      setPassword(newPassword);
      validatePassword(newPassword, confirmPassword);
  };

  const handleConfirmPasswordChange = (e) => {
      const newConfirmPassword = e.target.value;
      setConfirmPassword(newConfirmPassword);
      validatePassword(password, newConfirmPassword);
  };


  const handleReset = async (e) => {
    e.preventDefault();
    setMessage("");
    setFormErrors({});

    if (!validatePassword(password, confirmPassword)) {
        setMessage("Please fix the password errors before proceeding.");
        setMessageType("error");
        return;
    }

    try {
      const res = await fetch(`${apiBase}/api/password-reset/confirm/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, token, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Password reset successfully! Redirecting to login...");
        setMessageType("success");
        setTimeout(() => navigate("/login-register"), 2000);
      } else {
        let errorMessage = data.detail || data.password?.join(" ") || "Failed to reset password. Link may be invalid or expired.";
        setMessage(errorMessage);
        setMessageType("error");
      }
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong.");
      setMessageType("error");
    }
  };

  // Navigation Handlers
  const handlePlayNow = () => {
    setMenuOpen(false);
    navigate("/login-register?tab=login");
  };
  const handleRegister = () => {
    setMenuOpen(false);
    navigate("/login-register?tab=signup");
  };
  const handleAbout = () => {
    setMenuOpen(false);
    navigate("/about");
  };
  

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-gradient-to-br from-white via-pink-100 to-pink-200 font-sans">
      
      {/* Header/Navbar */}
      <nav ref={navbarRef} className="fixed top-0 left-0 right-0 z-50 bg-white bg-opacity-70 backdrop-blur-md shadow-md">
        <div className="w-full">
          <div className="flex justify-between items-center h-16 px-4 sm:px-8">
            <a href="/" className="text-pink-600 font-bold text-2xl" onClick={() => setMenuOpen(false)}>MathCraft</a>
            <div className="hidden sm:flex space-x-3 items-center">
              <a href="/" className="px-3 py-1 bg-pink-500 text-white font-semibold rounded-lg shadow-md glow-hover transition text-sm text-center">Home</a>
              <button onClick={handlePlayNow} className="px-3 py-1 bg-pink-500 text-white font-semibold rounded-lg shadow-md glow-hover transition text-sm">Login</button>
              <button onClick={handleRegister} className="px-3 py-1 bg-pink-500 text-white font-semibold rounded-lg shadow-md glow-hover transition text-sm">Register</button>
              <button onClick={handleAbout} className="px-3 py-1 bg-pink-500 text-white font-semibold rounded-lg shadow-md glow-hover transition text-sm">About</button>
            </div>
            <div className="sm:hidden">
              <button onClick={() => setMenuOpen(!menuOpen)} className="text-pink-600 font-bold text-2xl">☰</button>
            </div>
          </div>
        </div>
        {menuOpen && (
          <div className="sm:hidden flex flex-col gap-0 border-t border-pink-200 bg-white shadow-lg animate-fadeInDown">
            <a href="/" onClick={() => setMenuOpen(false)} className="w-full px-4 py-3 text-pink-700 font-semibold border-b border-pink-100 hover:bg-pink-50 transition text-center">Home</a>
            <button onClick={handlePlayNow} className="w-full px-4 py-3 text-pink-700 font-semibold border-b border-pink-100 hover:bg-pink-50 transition">Login</button>
            <button onClick={handleRegister} className="w-full px-4 py-3 text-pink-700 font-semibold border-b border-pink-100 hover:bg-pink-50 transition">Register</button>
            <button onClick={handleAbout} className="w-full px-4 py-3 text-pink-700 font-semibold hover:bg-pink-50 transition">About</button>
          </div>
        )}
      </nav>

      <div className="absolute inset-0 pointer-events-none w-full h-full z-0">
        {floatingNumbers.map((n, i) => (
          <div
            key={i}
            ref={(el) => (floatingRefs.current[i] = el)}
            className="floating-number"
            style={{
              position: "absolute",
              top: n.top || "auto",
              left: n.left || "auto",
              right: n.right || "auto",
              bottom: n.bottom || "auto",
              fontSize: "3rem",
              fontWeight: "bold",
              color: "#f472b6",
              opacity: 0.5,
            }}
          >
            {n.val}
          </div>
        ))}
      </div>

      {/* Reset Card */}
      <main className="flex-grow flex items-center justify-center relative z-10 pt-20">
        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl w-full max-w-md p-6 relative z-20 mt-32">
          <h2 className="text-2xl font-bold text-center text-pink-700 mb-6 animate-fade-in">
            Reset Your Password
          </h2>

          {message && (
            <div
              className={`mb-4 p-2 rounded text-center ${
                messageType === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleReset}>
            
            {/* NEW PASSWORD INPUT SECTION */}
            <div className="relative mb-4">
                {flashStatus && (
                    <div className="text-sm p-2 rounded-lg bg-green-100 text-green-700 border border-green-300 flex items-center transition duration-300 animate-slideInDown 
                                    absolute left-1/2 -top-10 transform -translate-x-1/2 z-30 shadow-lg min-w-[70%] whitespace-nowrap">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-5 w-5 mr-2 text-white bg-green-500 rounded-full flex-shrink-0 animate-scaleIn" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        
                        <span className="font-semibold">
                            {flashStatus === 'isLongEnough' && 'Min 8 characters'}
                            {flashStatus === 'hasCapital' && 'Capital letter added'}
                            {flashStatus === 'hasNumber' && 'Number added'}
                            {flashStatus === 'hasSpecial' && 'Special character added'}
                            {flashStatus === 'isConfirmMatch' && 'Passwords matched'}
                        </span>
                    </div>
                )}
                
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="New Password"
                    // Conditional border/focus
                    className={`w-full p-3 rounded-lg focus:outline-none transition pr-10 ${
                        isLongEnough && hasCapital && hasNumber && hasSpecial
                            ? 'border-2 border-green-500 focus:ring-green-100 focus:ring-2' 
                            : 'border border-gray-300 focus:ring-pink-400 focus:ring-2'    
                    }`}
                    value={password}
                    onChange={handlePasswordChange}
                    required
                  />
                  <button
                    type="button"
                    className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 hover:text-pink-600 transition"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                </div>
            </div>
            {/* Error Display for Password */}
            {formErrors.password && <p className="text-red-500 text-sm mb-4 -mt-3">{formErrors.password}</p>}


            {/* CONFIRM PASSWORD INPUT SECTION */}
            <div className="relative mb-4">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                className={`w-full p-3 border rounded-lg focus:outline-none pr-10 ${
                    isConfirmMatch 
                        ? 'border-2 border-green-500 focus:ring-green-100 focus:ring-2' 
                        : 'border border-gray-300 focus:ring-pink-400 focus:ring-2'
                }`}
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                required
              />
              <button
                type="button"
                className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 hover:text-pink-600 transition"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>
            {formErrors.confirmPassword && <p className="text-red-500 text-sm mb-4 -mt-3">{formErrors.confirmPassword}</p>}


            <button
              type="submit"
              className="w-full py-3 bg-pink-500 text-white font-semibold rounded-lg shadow-md glow-hover transition transform"
            >
              Reset Password
            </button>

            <p
              className="text-center mt-4 text-gray-600 cursor-pointer hover:underline"
              onClick={() => navigate("/login-register")}
            >
              Back to login
            </p>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};
export default ResetPasswordPage;