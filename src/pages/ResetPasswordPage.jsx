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
  const [messageType, setMessageType] = useState(""); // "success" or "error"
  const navigate = useNavigate();
  const apiBase = import.meta.env.VITE_BASE_API;

  const floatingNumbers = [
    { top: "5%", left: "5%", val: 3 },
    { top: "10%", right: "10%", val: 7 },
    { top: "20%", left: "20%", val: 9 },
    { top: "25%", right: "25%", val: 12 },
    { top: "40%", left: "10%", val: 5 },
    { top: "45%", right: "15%", val: 8 },
  ];

  const floatingRefs = useRef([]);

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

  const handleReset = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
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
        setMessage(data.detail || "Failed to reset password.");
        setMessageType("error");
      }
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong.");
      setMessageType("error");
    }
  };

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-gradient-to-br from-white via-pink-100 to-pink-200 font-sans">
      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white bg-opacity-70 backdrop-blur-md shadow-md">
        <div className="w-full flex justify-between items-center h-16 px-4 sm:px-8">
          <a href="/" className="text-pink-600 font-bold text-2xl">MathCraft</a>
        </div>
      </nav>

      {/* Floating Numbers */}
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
            <div className="relative mb-4">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-pink-400 focus:outline-none pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>

            <div className="relative mb-4">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-pink-400 focus:outline-none pr-10"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>

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
