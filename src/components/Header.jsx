import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
// Lucide Icon
import { Award } from "lucide-react"; 
import { User, Edit2, LogOut } from "lucide-react";
const BASE_API = import.meta.env.VITE_BASE_API;
const LOCAL_STORAGE_KEY_USER = "mc_user_v1";

// ----------------------------------------------------------------------
// 1a. Achievement Notification Component (New Sliding Box)
// ----------------------------------------------------------------------
const AchievementNotification = ({ isVisible, badgeNames, rewardAmount }) => {
    // Determine the number of unique rewards
    const badgeCount = badgeNames ? badgeNames.length : 0;
    if (badgeCount === 0) return null;

    const message = badgeCount === 1 
        ? `${badgeNames[0]} unlocked! 🎉` 
        : `${badgeCount} New Achievements Unlocked! 🏆`;
    
    return (
        <div 
            className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[101] 
                        p-4 rounded-xl shadow-2xl transition-all duration-700 
                        bg-gradient-to-r from-purple-600 to-pink-500 text-white 
                        flex items-center space-x-3 font-bold text-lg border-2 border-yellow-300
                        ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}
        >
            <Award size={28} className="text-yellow-300 animate-pulse" />
            <span>{message}</span>
        </div>
    );
};


// ----------------------------------------------------------------------
// 1b. Coin Notification Component (Visual Animation) - UNCHANGED
// ----------------------------------------------------------------------
const CoinNotification = ({ amount, type, triggerKey }) => {
  if (!triggerKey || amount === 0) return null;

  const isReward = type === 'reward';
  let message = isReward ? `+${amount}` : `-${amount}`;
  
  const textClass = "text-white text-4xl bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-2"; 
  
  const rewardAnimation = "fly-to-score-reward 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards, coin-bounce 0.3s ease-out 0s 4 alternate";
  const deductionAnimation = "fade-out-deduction 0.8s ease-out forwards";

  return (
    <>
      <style jsx global>{`
        @keyframes coin-bounce {
            0% { transform: scale(1.5) rotate(0deg); }
            50% { transform: scale(1.7) rotate(15deg); }
            100% { transform: scale(1.5) rotate(0deg); }
        }
        @keyframes fly-to-score-reward {
          0% { opacity: 1; right: 50%; top: 50%; transform: scale(1.5) translate(50%, -50%); } 
          50% { opacity: 1; right: 150px; top: 100px; transform: scale(1.2) translate(0, 0); } 
          100% { opacity: 0; right: 80px; top: 40px; transform: scale(0.5) translate(0, 0); } 
        }
        @keyframes fade-out-deduction {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-50px) scale(0.8); }
        }
        .bright-shadow-yellow {
          text-shadow: 0 0 5px #ca8a04, 0 0 15px #fde047;
          color: #f59e0b;
        }
      `}</style>
      <div
        key={triggerKey} 
        className="fixed z-[100] pointer-events-none font-extrabold transition-all duration-300"
        style={{
          animation: isReward ? rewardAnimation : deductionAnimation,
          right: isReward ? "50%" : "80px",
          top: isReward ? "50%" : "40px",
          transform: isReward ? "translate(50%, -50%)" : "none", 
        }}
      >
        <span 
            className={`${textClass} shadow-xl shadow-yellow-500/50 flex items-center justify-center`}
            style={{
              borderRadius: '9999px',
              minWidth: '60px',
              minHeight: '60px',
              boxShadow: '0 0 20px rgba(251, 191, 36, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px',
            }}
        >
            {isReward ? '★' : '💸'} {message}
        </span>
      </div>
    </>
  );
};


// ----------------------------------------------------------------------
// 2. Custom Coin Hook (Logic & State) - MODIFIED
// ----------------------------------------------------------------------
export const useCoins = () => {
  const [coins, setCoins] = useState(0);
  const [loading, setLoading] = useState(true);
  const [coinAnimation, setCoinAnimation] = useState(null);
  const [lastCoins, setLastCoins] = useState(0); 
  const [achievementNotification, setAchievementNotification] = useState({ 
      isVisible: false, 
      badgeNames: [], 
      rewardAmount: 0 
  });


  const triggerCoinAnimation = useCallback((amount, type) => {
    if (amount <= 0) return;

    setCoinAnimation({
      amount,
      type,
      triggerKey: Date.now()
    });
    
    setTimeout(() => setCoinAnimation(null), type === 'reward' ? 1500 : 800);
  }, []);

  const triggerAchievementNotification = useCallback((badgeNames, rewardAmount) => {
    setAchievementNotification({
        isVisible: true,
        badgeNames,
        rewardAmount
    });
    // Notification visible for 4 seconds, then slides up and hides
    setTimeout(() => {
        setAchievementNotification(prev => ({ ...prev, isVisible: false }));
    }, 4000);
    // Clear the data after the slide-up animation completes (700ms transition)
    setTimeout(() => {
        setAchievementNotification(prev => ({ ...prev, badgeNames: [], rewardAmount: 0 }));
    }, 4700); 
  }, []);

  useEffect(() => {
    // Initial fetch to sync with DB and set initial state
    const fetchCoins = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get(`${BASE_API}/api/user-coins/`, {
          headers: { Authorization: `Token ${token}` },
        });

        const verifiedCoins = res.data.coins;
        const rawUser = localStorage.getItem(LOCAL_STORAGE_KEY_USER);
        const localUser = JSON.parse(rawUser || '{}');
        
        if (localUser.coins !== verifiedCoins) {
            localUser.coins = verifiedCoins;
            localStorage.setItem(LOCAL_STORAGE_KEY_USER, JSON.stringify(localUser));
        }
        
        setCoins(verifiedCoins);
        setLastCoins(verifiedCoins);
      } catch (err) {
        console.error("Error fetching coins:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCoins();
    
    // Unified event handler for all coin updates
    const handleCoinUpdate = (event) => {
      // Check for the detailed payload (Game Page or Achievements Page)
      if (event.detail && event.detail.newCoinBalance !== undefined) {
          const { newCoinBalance, rewardAmount, type, rewarded_badges } = event.detail;

          // 1. Trigger Achievement Notification
          if (rewarded_badges && rewarded_badges.length > 0) {
            // Calculate the achievement specific reward for the banner message
            const achievementRewardOnly = rewarded_badges.length * 5000;
            triggerAchievementNotification(rewarded_badges, achievementRewardOnly); 
          }
          
          // 2. Update localStorage (using the newCoinBalance from the API)
          const rawUser = localStorage.getItem(LOCAL_STORAGE_KEY_USER);
          const localUser = JSON.parse(rawUser || '{}');
          localUser.coins = newCoinBalance;
          localStorage.setItem(LOCAL_STORAGE_KEY_USER, JSON.stringify(localUser));
          
          // 3. Update the component state
          setCoins(newCoinBalance);
          setLastCoins(newCoinBalance); 

          // 4. Trigger Coin Animation (using the total reward)
          if (rewardAmount > 0) {
            triggerCoinAnimation(rewardAmount, type);
          }
          
      } else {
          // Fallback logic for simple updates (retained for safety, but should be phased out)
          setTimeout(() => {
            const rawUser = localStorage.getItem(LOCAL_STORAGE_KEY_USER);
            const currentCoins = JSON.parse(rawUser || '{}').coins || 0;

            if (currentCoins !== lastCoins) {
                const diff = Math.abs(currentCoins - lastCoins);
                const type = currentCoins > lastCoins ? 'reward' : 'deduction';
                
                if (lastCoins !== 0) { 
                    triggerCoinAnimation(diff, type);
                }

                setCoins(currentCoins);
                setLastCoins(currentCoins);
            }
          }, 50);
      }
    };

    window.addEventListener('mcCoinUpdate', handleCoinUpdate);

    return () => {
        window.removeEventListener('mcCoinUpdate', handleCoinUpdate);
    };

  }, [triggerCoinAnimation, lastCoins, triggerAchievementNotification]); 

  return { coins, loading, coinAnimation, achievementNotification };
};


// ----------------------------------------------------------------------
// 3. Header Component (Displays Coin Count & Animation Overlay) - MODIFIED
// ----------------------------------------------------------------------
const Header = ({ pageTitle, setPage, enterEditMode }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState("");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const { coins, loading, coinAnimation, achievementNotification } = useCoins();

  useEffect(() => {
  const now = new Date();
  setCurrentMonth(now.toISOString().slice(0, 7));

  const fetchProfilePhoto = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      const res = await axios.get(`${BASE_API}/api/profile/`, {
        headers: { Authorization: `Token ${token}` },
      });

      setProfilePhoto(res.data.photo);
    } catch (err) {
      console.error("Error fetching profile photo:", err);
    }
  };

  fetchProfilePhoto();
}, []);

const handleLogout = async () => {
  try {
    const token = localStorage.getItem("token");
    if (token) {
      await axios.post(
        `${BASE_API}/api/logout/`,
        {},
        { headers: { Authorization: `Token ${token}` } }
      );
    }
  } catch (err) {
    console.warn("Logout API failed, forcing local logout.", err);
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("mc_user");
    localStorage.removeItem("mc_game_v1_guest");
    localStorage.removeItem("mc_user_v1");
    window.location.href = "/login-register";  // redirect to login
  }
};

  return (
    <header className="fixed top-0 left-64 right-0 z-40 bg-white/70 backdrop-blur-md shadow-md">
      {/* Coin Animation Overlay: Renders above the header and main content */}
      {coinAnimation && <CoinNotification {...coinAnimation} />} 
      
      {/* Achievement Notification Overlay */}
      <AchievementNotification {...achievementNotification} />

      <div className="flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-6">
          <div className="text-2xl font-bold text-pink-600">MathCraft</div>
          <div className="text-lg font-semibold text-gray-700">{pageTitle}</div>
        </div>

        <div className="flex items-center gap-6">
          {/* COINS DISPLAY */}
          <div className="text-gray-800 font-bold rounded-full bg-white py-2 px-4 border-2 border-yellow-500 shadow-lg flex items-center shadow-yellow-400/50 transition-all duration-300 transform hover:scale-105">
            <span className="text-yellow-600 text-xl mr-1 bright-shadow-yellow">💰</span>
            <span className="text-yellow-700 font-extrabold text-lg">
              {loading ? "..." : coins}
            </span>
          </div>

          {/* PROFILE IMAGE + DROPDOWN (Unchanged) */}
          <div className="relative">
            <img
  onClick={(e) => { e.stopPropagation(); setDropdownOpen(!dropdownOpen); }}
  src={profilePhoto || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
  alt="profile"
  className="w-11 h-11 rounded-full border-2 border-pink-500 cursor-pointer shadow-sm hover:ring-4 hover:ring-pink-300 transition-shadow object-cover"
/>
            {dropdownOpen && (
              <div className="absolute right-0 mt-3 w-44 bg-white rounded-xl shadow-lg py-2 z-50">

<button
  onClick={() => {
    setDropdownOpen(false);   // close dropdown
    setPage("profileEdit");   // navigate to edit page
    enterEditMode();          // set Layout editMode = true
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

      {/* Month Badge */}
      <div className="px-8 pb-2">
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
          <span id="currentMonthLabel">Month: {currentMonth}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;