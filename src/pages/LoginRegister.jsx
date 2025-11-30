import React, { useEffect, useState, useRef } from "react";
import "../App.css";
import { Eye, EyeOff } from "lucide-react";
import Footer from "../components/Footer.jsx";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar.jsx"; 


const LoginRegister = () => {
  const [message, setMessage] = useState(""); 
  const [messageType, setMessageType] = useState(""); 
  const [signupErrors, setSignupErrors] = useState({});

  const [isLongEnough, setIsLongEnough] = useState(false);
  const [hasCapital, setHasCapital] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);
  const [hasSpecial, setHasSpecial] = useState(false);

  const [isConfirmMatch, setIsConfirmMatch] = useState(false);
  
  const [flashStatus, setFlashStatus] = useState(null); 

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);

  const floatingNumbers = [
    { top: "5%", left: "5%", val: 3 },
    { top: "10%", right: "10%", val: 7 },
    { top: "20%", left: "20%", val: 9 },
    { top: "25%", right: "25%", val: 12 },
    { top: "40%", left: "10%", val: 5 },
    { top: "45%", right: "15%", val: 8 },
    { bottom: "25%", left: "15%", val: 15 },
    { bottom: "20%", right: "10%", val: 20 },
  ];

  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [signupData, setSignupData] = useState({
    username: "",
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const apiBase = import.meta.env.VITE_BASE_API;

  // Forgot password state
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [forgotUsername, setForgotUsername] = useState(""); // store attempted username
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStepMessage, setForgotStepMessage] = useState(""); 

  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialTab = params.get("tab") === "signup" ? "signup" : "login";
  const [activeTab, setActiveTab] = useState(initialTab);
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab === "signup") setActiveTab("signup");
    else if (tab === "login") setActiveTab("login");
  }, [location.search]);

  useEffect(() => {
    scrollToTop();
  }, [activeTab]);


  useEffect(() => {
    // Floating numbers animation
    if (typeof window.anime !== "undefined") {
      document.querySelectorAll(".floating-number").forEach((el, index) => {
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
    } else {
      console.error("Anime.js not found. Include it in index.html.");
    }

  }, []);

  // ------------------- API INTEGRATION -------------------

  const validateSignup = (data = signupData) => {
    const errors = {};
    const { password, confirmPassword } = data;
    const p = password; 
    const oldStatus = { isLongEnough, hasCapital, hasNumber, hasSpecial, isConfirmMatch };

    // --- 1. Password Complexity Check & State Update ---
    
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


    // --- 2. Confirm Password Match Check ---
    const matches = p === confirmPassword && confirmPassword.length > 0;

    if (matches && !oldStatus.isConfirmMatch) {
      setFlashStatus('isConfirmMatch');
      setTimeout(() => setFlashStatus(null), 1500);
    }
    setIsConfirmMatch(matches);

    if (p.length > 0 && confirmPassword.length > 0 && p !== confirmPassword) {
        errors.confirmPassword = "Passwords do not match.";
    }

    setSignupErrors(errors);
    
    return isComplex && matches;
  };


  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch(`${apiBase}/api/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginData.username, password: loginData.password }),
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("mc_user", JSON.stringify(data.user));
        localStorage.setItem("mc_current_page", "dashboard");
        setMessageType("success");
        setMessage("Login successful! Redirecting...");
        setTimeout(() => navigate("/dashboard"), 500);
      } else {
        setMessageType("error");
        setMessage("Username or Password Incorrect.");
        setForgotUsername(loginData.username); 
      }
    } catch (err) {
      console.error(err);
      setMessageType("error");
      setMessage("Login failed. Please try again.");
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setSignupErrors({}); 
    
    if (!validateSignup()) { 
      return; 
    }
    
    try {
      const res = await fetch(`${apiBase}/api/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: signupData.username,
          email: signupData.email,
          password: signupData.password,
          confirm_password: signupData.confirmPassword,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessageType("success");
        setMessage("Signup successful! Please login.");
        navigate("/login-register?tab=login", { replace: true }); 
        setLoginData({ username: signupData.username, password: "" });
      } else {
        setMessageType("error");
        let errorMessage = "";
        if (data.username) errorMessage += `Username: ${data.username.join(", ")}. `;
        if (data.email) errorMessage += `Email: ${data.email.join(", ")}. `;
        if (data.password) errorMessage += `Password: ${data.password.join(", ")}. `;
        if (data.confirm_password) errorMessage += `Confirm Password: ${data.confirm_password.join(", ")}. `;
        if (!errorMessage && data.non_field_errors) errorMessage = data.non_field_errors.join(", ");
        if (!errorMessage && data.detail) errorMessage = data.detail;
        if (!errorMessage) errorMessage = "Signup failed. Please check your input.";
        setMessage(errorMessage);
      }
    } catch (err) {
      console.error(err);
      setMessageType("error");
      setMessage("Signup failed. Please try again.");
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotStepMessage("");
    try {
      const res = await fetch(`${apiBase}/api/password-reset/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: forgotUsername, email: forgotEmail }),
      });
      const data = await res.json();
      setForgotStepMessage(data.detail);
    } catch (err) {
      console.error(err);
      setForgotStepMessage("Something went wrong. Try again.");
    }
  };
 
  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-gradient-to-br from-white via-pink-100 to-pink-200 font-sans">

      <Navbar /> 

      <main className="flex-grow flex items-center justify-center relative z-10 py-10 pt-32 sm:pt-40 px-4">
        <div className="absolute inset-0 pointer-events-none w-full h-full">
          {floatingNumbers.map((n, i) => (
            <div
              key={i}
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

        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md p-6 sm:p-8 relative z-20">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-pink-700 mb-6 sm:mb-8 animate-slideIn">Welcome to MathCraft</h2> 

          {!showResetPassword && (
            <div className="flex mb-6 gap-0 p-1 bg-pink-100/70 rounded-xl shadow-inner border border-pink-200">
              <button
                className={`w-1/2 py-2 text-lg font-bold rounded-lg transition duration-200 ${
                    activeTab === "login" 
                        ? "bg-pink-500 text-white shadow-md hover:bg-pink-600" 
                        : "text-gray-600 hover:bg-pink-200/50"
                }`}
                onClick={() => {
                  if (activeTab === "login") { 
                      scrollToTop();
                  } else {
                      setMessage(""); 
                      navigate("/login-register?tab=login", { replace: true }); 
                  }
                }}
              >
                Login
              </button>
              <button
                className={`w-1/2 py-2 text-lg font-bold rounded-lg transition duration-200 ${
                    activeTab === "signup" 
                        ? "bg-pink-500 text-white shadow-md hover:bg-pink-600"
                        : "text-gray-600 hover:bg-pink-200/50"
                }`}
                onClick={() => {
                   if (activeTab === "signup") { 
                       scrollToTop();
                   } else {
                       setMessage(""); 
                       navigate("/login-register?tab=signup", { replace: true }); 
                   }
                }}
              >
                Signup
              </button>
            </div>
          )}

          {message && !showResetPassword && (
            <div className={`mb-4 p-3 rounded-lg font-medium ${messageType === "success" ? "bg-green-100 text-green-700 border border-green-300" : "bg-red-100 text-red-700 border border-red-300"}`}>
              {message}
            </div>
          )}
          {showResetPassword && (
            <form onSubmit={handleForgotPassword}>
              <input
                type="text"
                placeholder="Username"
                className="w-full p-3 mb-4 border rounded-lg focus:ring-2 focus:ring-pink-400 focus:outline-none bg-gray-100"
                value={forgotUsername}
                disabled
              />
              <input
                type="email"
                placeholder="Enter registered email"
                className="w-full p-3 mb-4 border rounded-lg focus:ring-2 focus:ring-pink-400 focus:outline-none"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
              />
              {forgotStepMessage && (
                <div
                  className={`mb-4 p-2 rounded text-sm ${
                    forgotStepMessage.toLowerCase().includes("successfully") 
                      ? "bg-green-100 text-green-700" 
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {forgotStepMessage}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-pink-500 text-white font-semibold rounded-lg shadow-md glow-hover transition transform hover:bg-pink-600"
              >
                Send Reset Link
              </button>
              <p
                className="text-center mt-4 text-gray-600 text-sm cursor-pointer hover:underline"
                onClick={() => { setShowResetPassword(false); setMessage(""); setForgotStepMessage(""); }}
              >
                Back to login
              </p>
            </form>
          )}

          {/* Login Form */}
          {!showResetPassword && activeTab === "login" && (
            <form onSubmit={handleLoginSubmit}>
              <input
                type="text"
                placeholder="Username"
                className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none transition"
                value={loginData.username}
                onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                required
              />
              <div className="relative">
                <input
                  type={showLoginPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full p-3 mb-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none transition pr-10"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 hover:text-pink-600 transition"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                >
                  {showLoginPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
              <p
                className="text-sm text-pink-600 mb-4 text-right cursor-pointer hover:underline"
                onClick={() => setShowResetPassword(true)}
              >
                Forgot password?
              </p>
              <button type="submit" className="w-full py-3 bg-pink-500 text-white font-bold rounded-lg shadow-xl hover:bg-pink-600 glow-hover transition transform">Log In</button>
              <p className="text-center mt-4 text-gray-600">
                Not a member? <span className="text-pink-600 cursor-pointer hover:underline font-medium" onClick={() => navigate("/login-register?tab=signup")}>Signup now</span> {/* FIX: Use navigate */}
              </p>
            </form>
          )}

          {/* Signup Form */}
          {!showResetPassword && activeTab === "signup" && (
            <form onSubmit={handleSignupSubmit}>
              <input
                type="text"
                placeholder="Username"
                className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none transition"
                value={signupData.username}
                onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
                required
              />
              <input
                type="email"
                placeholder="Email Address"
                className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none transition"
                value={signupData.email}
                onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                required
              />
              
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

                  {/* Password Input Field */}
                  <div className="relative">
                      <input
                          type={showSignupPassword ? "text" : "password"}
                          placeholder="Password"
                          className={`w-full p-3 rounded-lg focus:outline-none transition pr-10 ${
                              isLongEnough && hasCapital && hasNumber && hasSpecial
                                  ? 'border-2 border-green-500 focus:ring-green-100 focus:ring-2' 
                                  : 'border border-gray-300 focus:ring-pink-500 focus:ring-2'    
                          }`}
                          value={signupData.password}
                          onChange={(e) => {
                              const newData = { ...signupData, password: e.target.value };
                              setSignupData(newData);
                              validateSignup(newData); 
                          }}
                          required
                      />
                      <button
                          type="button"
                          className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 hover:text-pink-600 transition"
                          onClick={() => setShowSignupPassword(!showSignupPassword)}
                      >
                          {showSignupPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                      </button>
                  </div>
              </div>

              {signupErrors.password && <p className="text-red-500 text-sm mb-4 -mt-3">{signupErrors.password}</p>}
              
              <div className="relative">
                <input
                  type={showSignupConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  className={`w-full p-3 mb-4 rounded-lg focus:outline-none transition pr-10 ${
                    isConfirmMatch 
                        ? 'border-2 border-green-500 focus:ring-green-100 focus:ring-2' 
                        : 'border border-gray-300 focus:ring-pink-500 focus:ring-2'    
                  }`}
                  value={signupData.confirmPassword}
                  onChange={(e) => {
                    const newData = { ...signupData, confirmPassword: e.target.value };
                    setSignupData(newData);
                    validateSignup(newData); 
                  }}
                  required
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 hover:text-pink-600 transition"
                  onClick={() => setShowSignupConfirmPassword(!showSignupConfirmPassword)}
                >
                  {showSignupConfirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
              {signupErrors.confirmPassword && <p className="text-red-500 text-sm mb-4 -mt-3">{signupErrors.confirmPassword}</p>}
              <button type="submit" className="w-full py-3 bg-pink-500 text-white font-bold rounded-lg shadow-xl hover:bg-pink-600 glow-hover transition transform">Sign Up</button>
              <p className="text-center mt-4 text-gray-600">
                Already a member? <span className="text-pink-600 cursor-pointer hover:underline font-medium" onClick={() => navigate("/login-register?tab=login")}>Login</span> {/* FIX: Use navigate */}
              </p>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LoginRegister;