import React, { useState, useEffect } from "react";
import axios from "axios";
// Lucide Icons
import { Flame, Award, BarChart3, Clock, CheckCircle, XCircle, Zap, TrendingUp, Shield } from "lucide-react";

const BASE_API = import.meta.env.VITE_BASE_API;
const LOCAL_STORAGE_KEY_USER = "mc_user_v1";

const iconComponents = { Flame, Award, BarChart3, Clock, CheckCircle, XCircle, Zap, TrendingUp, Shield };

// ----------------------------------------------------------------------
// AchievementCard Component (UNCHANGED)
// ----------------------------------------------------------------------
const AchievementCard = ({
  iconName,
  title,
  goalDescription,
  status = "LOCKED",
  currentProgress = 0,
  targetProgress = 0,
  displayValue,
  displayLabel,
  children,
  isPrimaryMetric = false,
  isNewlyUnlocked = false,
}) => {
  const IconComponent = iconComponents[iconName] || iconComponents.Award;
  const isComplete = status === "UNLOCKED";

  const StatusIcon = isComplete ? iconComponents.CheckCircle : iconComponents.XCircle;
  const statusColor = isComplete ? "text-green-600" : "text-gray-500";
  const statusText = isComplete ? "BADGE UNLOCKED" : "LOCKED GOAL";

  const celebrationClasses = isNewlyUnlocked
    ? "ring-4 ring-pink-500 ring-opacity-50 animate-pulse-fast shadow-2xl scale-105"
    : "";

  const ProgressBar = ({ current, target }) => {
    const percentage = Math.min(100, target > 0 ? Math.round((current / target) * 100) : 0);
    return (
      <div className="w-full mt-3">
        <div className="w-full bg-gray-200 rounded-full h-2.5 shadow-inner">
          <div
            className="h-2.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 transition-all duration-500"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <div className={`text-xs mt-1 font-bold ${isComplete ? "text-green-700" : "text-pink-600"}`}>
          {percentage}% Complete ({current} / {target})
        </div>
      </div>
    );
  };

  return (
    <div
  className={`bg-white p-4 sm:p-6 rounded-2xl shadow-xl border-b-4 ${
    isComplete ? "border-purple-600" : "border-pink-300"
  } flex flex-col items-center text-center transform transition-all duration-500 hover:scale-105 cursor-pointer w-full ${celebrationClasses}`}
>

      <div
        className={`mb-4 transition duration-500 ${
          isComplete
            ? "text-purple-600 animate-pulse-slow"
            : "text-pink-600"
        } ${isNewlyUnlocked ? "animate-bounce-once text-pink-500" : ""}`}
      >
        <IconComponent size={48} strokeWidth={2.5} />
      </div>

      <h4 className="text-lg sm:text-xl font-extrabold text-gray-800 mb-2">{title}</h4>

      <p className="text-sm sm:text-base text-gray-500 mb-4 h-auto flex items-center justify-center italic text-center">

        {goalDescription}
      </p>

      {isPrimaryMetric && displayValue !== undefined && (
        <p className="text-sm font-semibold text-gray-700 mt-2">
          {displayLabel}
          <span className="text-4xl font-black text-pink-700 block mt-1">{displayValue}</span>
        </p>
      )}

      {targetProgress > 0 && <ProgressBar current={currentProgress} target={targetProgress} />}

      {children}

      <div className={`flex items-center space-x-2 text-lg font-black mt-4 ${statusColor}`}>
        <StatusIcon size={20} />
        <span>{statusText}</span>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// Achievements Component (Main) - MODIFIED: Event Payload
// ----------------------------------------------------------------------
const Achievements = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newlyUnlocked, setNewlyUnlocked] = useState({}); 
  const prevData = React.useRef(null);
  const [newlyUnlockedCount, setNewlyUnlockedCount] = useState(0); 

  // --- 1. Data Fetching Effect ---
  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${BASE_API}/api/user-achievements/`, {
          headers: { Authorization: `Token ${token}` },
        });
        
        const newData = response.data;
        setData(newData);

        // 🛑 LOGIC: Dispatch custom event if coins were rewarded 🛑
        if (newData.rewarded_badges && newData.rewarded_badges.length > 0) {
          // Calculate total new coins (5000 per badge as per API logic)
          const newCoinsAmount = newData.rewarded_badges.length * 5000;

          // Update Local Storage
          const rawUser = localStorage.getItem(LOCAL_STORAGE_KEY_USER);
          const localUser = JSON.parse(rawUser || '{}');
          localUser.coins = newData.coins; 
          localStorage.setItem(LOCAL_STORAGE_KEY_USER, JSON.stringify(localUser));
          
          // Dispatch the custom event to update coins and show the notification banner
          const event = new CustomEvent('mcCoinUpdate', { 
              detail: { 
                  newCoinBalance: newData.coins, 
                  rewardAmount: newCoinsAmount, // ONLY the achievement reward
                  type: 'reward', 
                  source: 'achievement',
                  rewarded_badges: newData.rewarded_badges, // Include badges for notification
              } 
          });
          window.dispatchEvent(event);
        }
      } catch (err) {
        console.error("Error fetching achievements:", err);
        setData({}); 
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, []); 

  // --- 2. Unlocked Status Detection and Animation Trigger (UNCHANGED) ---
  useEffect(() => {
    // ... (Your original logic for badge sparkle/bounce remains here) ...
    if (data && prevData.current) {
        const newUnlocks = {};
        let unlockDetected = false;

        for (const key in data) {
            if (key === 'master_calibrator') {
                const currentIQ = data[key]?.best_iq || 0;
                const prevIQ = prevData.current[key]?.best_iq || 0;
                if (currentIQ >= 100 && prevIQ < 100) {
                    newUnlocks[key] = true;
                    unlockDetected = true;
                }
                continue;
            }
            const currentStatus = data[key]?.status;
            const prevStatus = prevData.current[key]?.status;
            if (currentStatus === "UNLOCKED" && prevStatus !== "UNLOCKED") {
                newUnlocks[key] = true;
                unlockDetected = true;
            }
        }

        if (unlockDetected) {
            setNewlyUnlocked(newUnlocks);
            const timer = setTimeout(() => {
                setNewlyUnlocked({});
            }, 1500);
            return () => clearTimeout(timer);
        }
    }
    prevData.current = data;
  }, [data]);

  // --- 3. Animated Badge Counter Effect (UNCHANGED) ---
  useEffect(() => {
    // ... (Your original logic for the counter animation remains here) ...
    if (data) {
        const actualUnlockedCount = Object.values(data).filter(
            (item) => item?.status === "UNLOCKED" || item?.best_iq >= 100
        ).length;
        
        if (newlyUnlockedCount === 0 && actualUnlockedCount > 0 && prevData.current === null) {
            setNewlyUnlockedCount(actualUnlockedCount);
        }

        if (actualUnlockedCount !== newlyUnlockedCount) {
            const step = actualUnlockedCount > newlyUnlockedCount ? 1 : -1;
            const duration = 100; 

            const updateCounter = () => {
                setNewlyUnlockedCount((prev) => {
                    if (prev !== actualUnlockedCount) {
                        return prev + step;
                    }
                    return prev;
                });
            };

            const interval = setInterval(updateCounter, duration);
            return () => clearInterval(interval);
        }
    }
  }, [data, newlyUnlockedCount]);


  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen text-pink-600 text-2xl font-semibold animate-pulse">
        Loading...
      </div>
    );

  return (
    <div className="flex flex-col items-center py-6 px-4 sm:px-8 min-h-screen lg:ml-64">


      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-pink-700 mb-8 sm:mb-12 mt-12 border-b-4 border-pink-500 pb-3 sm:pb-4 text-center">


        My Codebreaker Achievements
      </h1>

      <div className="w-full max-w-6xl mb-10 p-4 bg-white rounded-xl shadow-lg border-l-4 border-purple-500">
        <p className="text-lg font-semibold text-gray-700">
          Current Badges Unlocked:{" "}
          <span className={`font-extrabold text-purple-700 transition-all duration-300 ${newlyUnlockedCount < Object.values(data).filter((item) => item?.status === "UNLOCKED" || item?.best_iq >= 100).length ? 'text-pink-600 scale-125 animate-pulse-fast' : ''}`}>
            {newlyUnlockedCount}
          </span>{" "}
          / 6
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Unlock new badges to earn a permanent place in the Codebreaker Hall of Fame!
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full px-2 sm:px-0">


        {/* Code Crusader */}
        <AchievementCard
          iconName="Shield"
          title="Code Crusader"
          goalDescription="Solve 100 puzzles to earn this foundational badge of commitment."
          status={data?.code_crusader?.status || "LOCKED"}
          currentProgress={data?.code_crusader?.current || 0}
          targetProgress={data?.code_crusader?.target || 100}
          isNewlyUnlocked={newlyUnlocked.code_crusader}
        />

        {/* Master Calibrator (IQ) */}
        <AchievementCard
          iconName="TrendingUp"
          title="Master Calibrator"
          goalDescription="Reach a perfect score of 100 by answering all questions correctly and within the time limit, in any mode."
          status={data?.master_calibrator?.best_iq >= 100 ? "UNLOCKED" : "LOCKED"}
          isPrimaryMetric
          displayLabel="Best Score Reached:"
          displayValue={data?.master_calibrator?.best_iq || 0}
          isNewlyUnlocked={newlyUnlocked.master_calibrator}
        />

        {/* Daily Devotion (Streak) */}
        <AchievementCard
          iconName="Flame"
          title="Daily Devotion"
          goalDescription="Stay sharp by logging in and playing for 30 consecutive days."
          status={data?.daily_devotion?.status || "LOCKED"}
          isPrimaryMetric
          displayLabel="Current Streak:"
          displayValue={`${data?.daily_devotion?.current_streak || 0} ${
            (data?.daily_devotion?.current_streak || 0) === 1 ? "Day" : "Days"
          }`}
          isNewlyUnlocked={newlyUnlocked.daily_devotion}
        />

        {/* Lightning Solver (Hard Streak) */}
        <AchievementCard
          iconName="Zap"
          title="Lightning Solver"
          goalDescription="Achieve a perfect Hard mode streak: answer all 10 questions correctly within 30 seconds each."
          status={data?.speed_badge?.status || "LOCKED"}
          isPrimaryMetric
          displayLabel="Best Hard Streak:"
          displayValue={`${data?.speed_badge?.best_streak || 0} / 50`}
          isNewlyUnlocked={newlyUnlocked.speed_badge}
        />

        {/* Apex Challenger (Hard Wins) */}
        <AchievementCard
          iconName="Award"
          title="Apex Challenger"
          goalDescription="Master the most difficult puzzles by securing 50 wins in Hard mode."
          status={data?.apex_challenger?.status || "LOCKED"}
          currentProgress={data?.apex_challenger?.current || 0}
          targetProgress={data?.apex_challenger?.target || 50}
          isNewlyUnlocked={newlyUnlocked.apex_challenger}
        />

        {/* True Polymath (Versatility) */}
        <AchievementCard
          iconName="Shield"
          title="True Polymath"
          goalDescription="A badge of versatility: play at least 5 games across Easy, Intermediate, and Hard."
          status={data?.true_polymath?.status || "LOCKED"}
          isNewlyUnlocked={newlyUnlocked.true_polymath}
        >
          <p className="text-sm font-semibold text-gray-700 mt-2">
            Easy: <span className="font-bold text-pink-700">{data?.true_polymath?.Easy || 0} / 5</span>
          </p>
          <p className="text-sm font-semibold text-gray-700">
            Intermediate: <span className="font-bold text-pink-700">{data?.true_polymath?.Intermediate || 0} / 5</span>
          </p>
          <p className="text-sm font-semibold text-gray-700 mb-2">
            Hard: <span className="font-bold text-pink-700">{data?.true_polymath?.Hard || 0} / 5</span>
          </p>
        </AchievementCard>
      </div>
    </div>
  );
};

export default Achievements;