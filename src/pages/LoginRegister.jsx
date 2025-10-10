import React, { useEffect, useState } from "react";
import "../App.css"; // Your CSS file
import { Eye, EyeOff } from "lucide-react";
import Footer from "../components/Footer.jsx";
import { useNavigate } from "react-router-dom";

const LoginRegister = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [menuOpen, setMenuOpen] = useState(false);
  const [message, setMessage] = useState(""); // Inline message
  const [messageType, setMessageType] = useState(""); // "success" or "error"

  // Password visibility
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

  useEffect(() => {
    // Floating numbers animation
    // Check for window.anime to prevent runtime errors if anime.js isn't loaded
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

    // Activate tab from URL
    const params = new URLSearchParams(window.location.search);
    if (params.get("tab") === "signup") setActiveTab("signup");
  }, []);

const navigate = useNavigate();

  // ------------------- API INTEGRATION -------------------
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

  // Reset last visited page to dashboard
  localStorage.setItem("mc_current_page", "dashboard");

  setMessageType("success");
  setMessage("Login successful! Redirecting...");
  setTimeout(() => {
  navigate("/dashboard");
}, 500); 
}
 else {
        setMessageType("error");
        if (data.non_field_errors && data.non_field_errors.length > 0) {
          setMessage("Incorrect username or password.");
        } else if (data.username) {
          setMessage(`Username: ${data.username.join(", ")}`);
        } else if (data.password) {
          setMessage(`Password: ${data.password.join(", ")}`);
        } else {
          setMessage("Login failed. Please try again.");
        }
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
        setActiveTab("login");
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

  const handlePlayNow = () => navigate("/login-register?tab=login");
  const handleRegister = () => navigate("/login-register?tab=signup");

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-gradient-to-br from-white via-pink-100 to-pink-200 font-sans">

      {/* Navbar (Fixed at Top) */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white bg-opacity-70 backdrop-blur-md shadow-md">
        <div className="w-full">
          <div className="flex justify-between items-center h-16 px-4 sm:px-8">
            <a href="/" className="text-pink-600 font-bold text-2xl">MathCraft</a>
            <div className="hidden sm:flex space-x-3 items-center">
              <a href="/" className="px-3 py-1 bg-pink-500 text-white font-semibold rounded-lg shadow-md glow-hover transition text-sm text-center">Home</a>
              <button onClick={handlePlayNow} className="px-3 py-1 bg-pink-500 text-white font-semibold rounded-lg shadow-md glow-hover transition text-sm">Login</button>
              <button onClick={handleRegister} className="px-3 py-1 bg-pink-500 text-white font-semibold rounded-lg shadow-md glow-hover transition text-sm">Register</button>
              <button className="px-3 py-1 bg-pink-500 text-white font-semibold rounded-lg shadow-md glow-hover transition text-sm">About</button>
            </div>
            <div className="sm:hidden">
              <button onClick={() => setMenuOpen(!menuOpen)} className="text-pink-600 font-bold text-2xl">☰</button>
            </div>
          </div>
        </div>
        {menuOpen && (
          <div className="sm:hidden flex flex-col gap-2 px-4 py-2 bg-white bg-opacity-90 backdrop-blur-md">
            <a href="/" className="px-3 py-1 bg-pink-500 text-white font-semibold rounded-lg shadow-md glow-hover transition text-sm text-center">Home</a>
            <button onClick={handlePlayNow} className="px-3 py-1 bg-pink-500 text-white font-semibold rounded-lg shadow-md glow-hover transition text-sm">Login</button>
            <button onClick={handleRegister} className="px-3 py-1 bg-pink-500 text-white font-semibold rounded-lg shadow-md glow-hover transition text-sm">Register</button>
            <button className="px-3 py-1 bg-pink-500 text-white font-semibold rounded-lg shadow-md glow-hover transition text-sm">About</button>
          </div>
        )}
      </nav>

      {/* Main Content Area: Centering and Floating Numbers */}
      {/* flex-grow ensures this area fills the space between the fixed Navbar and the Footer */}
      <main className="flex-grow flex items-center justify-center relative z-10 pt-20">
        
        {/* Floating Numbers (restricted to the main content area) */}
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

        {/* Login/Register Card - Perfectly centered */}
        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl w-full max-w-md p-6 relative z-20 mt-32">
          <h2 className="text-2xl font-bold text-center text-pink-700 mb-6 animate-fade-in">Welcome to MathCraft</h2>

          {/* Tabs */}
          <div className="flex mb-6 gap-2 justify-center">
            <button
              className={`tab-button ${activeTab === "login" ? "tab-active" : "tab-inactive"}`}
              onClick={() => { setActiveTab("login"); setMessage(""); }}
            >
              Login
            </button>
            <button
              className={`tab-button ${activeTab === "signup" ? "tab-active" : "tab-inactive"}`}
              onClick={() => { setActiveTab("signup"); setMessage(""); }}
            >
              Signup
            </button>
          </div>

          {/* Inline Message */}
          {message && (
            <div className={`mb-4 p-3 rounded ${messageType === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {message}
            </div>
          )}

          {/* Login Form */}
          {activeTab === "login" && (
            <form onSubmit={handleLoginSubmit}>
              <input
                type="text"
                placeholder="Username"
                className="w-full p-3 mb-4 border rounded-lg focus:ring-2 focus:ring-pink-400 focus:outline-none"
                value={loginData.username}
                onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
              />
              <div className="relative">
                <input
                  type={showLoginPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full p-3 mb-2 border rounded-lg focus:ring-2 focus:ring-pink-400 focus:outline-none pr-10"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                >
                  {showLoginPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
              <p className="text-sm text-pink-600 mb-4 text-right cursor-pointer hover:underline">Forgot password?</p>
              <button type="submit" className="w-full py-3 bg-pink-500 text-white font-semibold rounded-lg shadow-md glow-hover transition transform">Login</button>
              <p className="text-center mt-4 text-gray-600">
                Not a member? <span className="text-pink-500 cursor-pointer hover:underline" onClick={() => setActiveTab("signup")}>Signup now</span>
              </p>
            </form>
          )}

          {/* Signup Form */}
          {activeTab === "signup" && (
            <form onSubmit={handleSignupSubmit}>
              <input
                type="text"
                placeholder="Username"
                className="w-full p-3 mb-4 border rounded-lg focus:ring-2 focus:ring-pink-400 focus:outline-none"
                value={signupData.username}
                onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
              />
              <input
                type="email"
                placeholder="Email Address"
                className="w-full p-3 mb-4 border rounded-lg focus:ring-2 focus:ring-pink-400 focus:outline-none"
                value={signupData.email}
                onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
              />

              {/* Password */}
              <div className="relative">
                <input
                  type={showSignupPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full p-3 mb-4 border rounded-lg focus:ring-2 focus:ring-pink-400 focus:outline-none pr-10"
                  value={signupData.password}
                  onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500"
                  onClick={() => setShowSignupPassword(!showSignupPassword)}
                >
                  {showSignupPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <input
                  type={showSignupConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  className="w-full p-3 mb-4 border rounded-lg focus:ring-2 focus:ring-pink-400 focus:outline-none pr-10"
                  value={signupData.confirmPassword}
                  onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500"
                  onClick={() => setShowSignupConfirmPassword(!showSignupConfirmPassword)}
                >
                  {showSignupConfirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>

              <button type="submit" className="w-full py-3 bg-pink-500 text-white font-semibold rounded-lg shadow-md glow-hover transition transform">Signup</button>
              <p className="text-center mt-4 text-gray-600">
                Already a member? <span className="text-pink-500 cursor-pointer hover:underline" onClick={() => setActiveTab("login")}>Login now</span>
              </p>
            </form>
          )}
        </div>
      </main>

      {/* Footer - Full width at the absolute bottom */}
      <Footer />
    </div>
  );
};

export default LoginRegister;