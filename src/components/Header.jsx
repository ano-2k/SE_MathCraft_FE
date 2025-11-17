import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Award, Edit2, LogOut } from "lucide-react";

const BASE_API = import.meta.env.VITE_BASE_API;
const LOCAL_STORAGE_KEY_USER = "mc_user_v1";

/* --------------------------------------------------------------
   1. Achievement Notification
   -------------------------------------------------------------- */
const AchievementNotification = ({ isVisible, badgeNames }) => {
  const badgeCount = badgeNames?.length || 0;
  if (!badgeCount) return null;

  // Fix underscore → space
  const cleanNames = badgeNames.map(n => n.replace(/_/g, ' '));
  const message =
    badgeCount === 1
      ? `${cleanNames[0]} unlocked!`
      : `${badgeCount} New Achievements Unlocked!`;

  return (
    <div
      className={`
        fixed top-32 md:top-28 left-1/2 -translate-x-1/2 z-[99]
        p-4 rounded-2xl shadow-2xl
        bg-gradient-to-r from-purple-600 to-pink-500 text-white
        flex items-center gap-3 font-bold text-base md:text-lg
        border-2 border-yellow-300
        transition-all duration-700
        ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"}
      `}
    >
      <Award size={28} className="text-yellow-300 animate-pulse" />
      <span>{message}</span>
    </div>
  );
};
/* --------------------------------------------------------------
   2. Coin Notification + Zoom Animation
   -------------------------------------------------------------- */
const CoinNotification = ({ amount, type, triggerKey }) => {
  if (!triggerKey || amount === 0) return null;

  const isReward = type === "reward";
  const message = isReward ? `+${amount}` : `-${amount}`;

  return (
    <>
      <style>{`
        @keyframes fly-to-coin {
          0%   { opacity:1; transform:scale(1.6) translate(0,0); }
          70%  { opacity:1; transform:scale(1.2) translate(0,-30px); }
          100% { opacity:0; transform:scale(0.6) translate(0,-30px); }
        }
        @keyframes fade-out-deduction {
          0%   { opacity:1; transform:scale(1); }
          100% { opacity:0; transform:scale(0.8) translateY(-40px); }
        }
      `}</style>

      <div
        key={triggerKey}
        className="fixed right-20 md:right-36 top-24 md:top-6 pointer-events-none"
        style={{
          animation: isReward
            ? "fly-to-coin 0.9s ease-out forwards"
            : "fade-out-deduction 0.7s ease-out forwards",
        }}
      >
        <span
          className={`
            inline-block px-3 py-1 rounded-full font-extrabold text-lg
            ${isReward
              ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg"
              : "bg-red-100 text-red-600 shadow-md"
            }
          `}
        >
          {message}
        </span>
      </div>
    </>
  );
};

/* --------------------------------------------------------------
   3. useCoins Hook
   -------------------------------------------------------------- */
export const useCoins = () => {
  const [coins, setCoins] = useState(0);
  const [loading, setLoading] = useState(true);
  const [coinAnimation, setCoinAnimation] = useState(null);
  const [lastCoins, setLastCoins] = useState(0);
  const [achievementNotification, setAchievementNotification] = useState({
    isVisible: false,
    badgeNames: [],
  });

  const triggerCoinAnimation = (amount, type) => {
    if (amount <= 0) return;
    setCoinAnimation({ amount, type, triggerKey: Date.now() });
    setTimeout(() => setCoinAnimation(null), type === "reward" ? 1500 : 800);
  };

  const triggerAchievementNotification = (badgeNames) => {
    setAchievementNotification({ isVisible: true, badgeNames });
    setTimeout(() => setAchievementNotification((p) => ({ ...p, isVisible: false })), 4000);
    setTimeout(() => setAchievementNotification({ isVisible: false, badgeNames: [] }), 4700);
  };

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const { data } = await axios.get(`${BASE_API}/api/user-coins/`, {
          headers: { Authorization: `Token ${token}` },
        });
        const verified = data.coins;
        const raw = localStorage.getItem(LOCAL_STORAGE_KEY_USER);
        const user = JSON.parse(raw || "{}");
        if (user.coins !== verified) {
          user.coins = verified;
          localStorage.setItem(LOCAL_STORAGE_KEY_USER, JSON.stringify(user));
        }
        setCoins(verified);
        setLastCoins(verified);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchCoins();

    const onUpdate = (e) => {
      if (e.detail?.newCoinBalance !== undefined) {
        const { newCoinBalance, rewardAmount, type, rewarded_badges } = e.detail;
        if (rewarded_badges?.length) triggerAchievementNotification(rewarded_badges);
        const raw = localStorage.getItem(LOCAL_STORAGE_KEY_USER);
        const user = JSON.parse(raw || "{}");
        user.coins = newCoinBalance;
        localStorage.setItem(LOCAL_STORAGE_KEY_USER, JSON.stringify(user));
        setCoins(newCoinBalance);
        setLastCoins(newCoinBalance);
        if (rewardAmount) triggerCoinAnimation(rewardAmount, type);
      } else {
        setTimeout(() => {
          const raw = localStorage.getItem(LOCAL_STORAGE_KEY_USER);
          const cur = JSON.parse(raw || "{}").coins || 0;
          if (cur !== lastCoins) {
            const diff = Math.abs(cur - lastCoins);
            const t = cur > lastCoins ? "reward" : "deduction";
            if (lastCoins) triggerCoinAnimation(diff, t);
            setCoins(cur);
            setLastCoins(cur);
          }
        }, 50);
      }
    };
    window.addEventListener("mcCoinUpdate", onUpdate);
    return () => window.removeEventListener("mcCoinUpdate", onUpdate);
  }, [lastCoins]);

  return { coins, loading, coinAnimation, achievementNotification };
};

/* --------------------------------------------------------------
   4. Header Component – FINAL FIXED VERSION
   -------------------------------------------------------------- */
const Header = ({ pageTitle, setPage, enterEditMode }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState("");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const { coins, loading, coinAnimation, achievementNotification } = useCoins();

  const coinRef = useRef(null);
  const profileRef = useRef(null);

  // Zoom coin on hover (desktop) or tap (mobile)
  const addZoom = () => coinRef.current?.classList.add("animate-zoom");
  const removeZoom = () => coinRef.current?.classList.remove("animate-zoom");
  const tapZoom = () => {
    addZoom();
    setTimeout(removeZoom, 450);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownOpen && profileRef.current && !profileRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  // Fetch current month & profile photo
  useEffect(() => {
    const now = new Date();
    setCurrentMonth(now.toISOString().slice(0, 7));

    const fetchPhoto = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const { data } = await axios.get(`${BASE_API}/api/profile/`, {
          headers: { Authorization: `Token ${token}` },
        });
        setProfilePhoto(data.photo);
      } catch (e) {
        console.error(e);
      }
    };
    fetchPhoto();
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await axios.post(`${BASE_API}/api/logout/`, {}, {
          headers: { Authorization: `Token ${token}` },
        });
      }
    } catch (e) {
      console.warn(e);
    } finally {
      ["token", "mc_user", "mc_game_v1_guest", "mc_user_v1"].forEach((k) =>
        localStorage.removeItem(k)
      );
      window.location.href = "/login-register";
    }
  };

  return (
    <header className="fixed md:top-0 top-[60px] md:left-64 left-0 right-0 z-40 bg-white/70 backdrop-blur-md shadow-md">

      {coinAnimation && <CoinNotification {...coinAnimation} />}
      <AchievementNotification {...achievementNotification} />

      <div className="flex items-center justify-between px-4 md:px-8 py-3 md:py-4">
        <div className="flex items-center gap-6">
          <div className="text-2xl font-bold text-pink-600 md:block hidden">MathCraft</div>
          <div className="text-lg font-semibold text-gray-700">{pageTitle}</div>
        </div>

        <div className="flex items-center gap-6">
          <div
            ref={coinRef}
            className="text-gray-800 font-bold rounded-full bg-white py-2 px-4 border-2 border-yellow-500
              shadow-lg flex items-center shadow-yellow-400/50 transition-all duration-300"
            onMouseEnter={addZoom}
            onMouseLeave={removeZoom}
            onTouchStart={tapZoom}
          >
            <span className="text-yellow-700 font-extrabold text-lg">
              {loading ? "..." : coins}
            </span>
          </div>

          <div ref={profileRef} className="relative">
            <img
              onClick={(e) => {
                e.stopPropagation();
                setDropdownOpen((v) => !v);
              }}
              src={profilePhoto || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
              alt="profile"
              className="w-11 h-11 rounded-full border-2 border-pink-500 cursor-pointer
                shadow-sm hover:ring-4 hover:ring-pink-300 transition-shadow object-cover"
            />
            {dropdownOpen && (
              <div className="absolute right-0 mt-3 w-44 bg-white rounded-xl shadow-lg py-2 z-50">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    setPage("profileEdit");
                    enterEditMode();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-pink-50"
                >
                  <Edit2 size={16} /> Edit Profile
                </button>
                <hr className="my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-pink-50 text-red-500"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 pb-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white shadow-sm text-sm text-gray-700 border border-pink-200">
          <svg className="w-4 h-4 text-pink-500" viewBox="0 0 24 24" fill="none">
            <path
              d="M7 11h10M7 15h10M7 7h10"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>Month: {currentMonth}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
