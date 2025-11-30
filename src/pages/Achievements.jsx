import React, { useState, useEffect } from "react";
import axios from "axios";
import { Flame, Award, BarChart3, Clock, CheckCircle, XCircle, Zap, TrendingUp, Shield } from "lucide-react";
import {LuZap} from 'react-icons/lu';

const BASE_API = import.meta.env.VITE_BASE_API;
const LOCAL_STORAGE_KEY_USER = "mc_user_v1";

const iconComponents = { Flame, Award, BarChart3, Clock, CheckCircle, XCircle, Zap, TrendingUp, Shield };

const achievementStyles = {
  "Code Crusader": { 
    bg: 'from-blue-50 to-cyan-100', 
    border: 'border-cyan-500', 
    shadow: 'shadow-cyan-400/50',
    iconColor: 'text-cyan-700',
    animation: 'hover:shadow-2xl'
  },
  "Master Calibrator": { 
    bg: 'from-gray-50 to-slate-100', 
    border: 'border-slate-400', 
    shadow: 'shadow-slate-300/50',
    iconColor: 'text-slate-600',
    animation: 'hover:shadow-2xl'
  },
  "Daily Devotion": { 
    bg: 'from-amber-50 to-yellow-100', 
    border: 'border-yellow-500', 
    shadow: 'shadow-yellow-400/50',
    iconColor: 'text-yellow-700',
    animation: 'hover:shadow-2xl'
  },
  "Lightning Solver": { 
    bg: 'from-sky-50 to-blue-100', 
    border: 'border-blue-400', 
    shadow: 'shadow-blue-300/50',
    iconColor: 'text-blue-600',
    animation: 'hover:shadow-2xl'
  },
  "Apex Challenger": { 
    bg: 'from-red-50 to-rose-100', 
    border: 'border-red-500', 
    shadow: 'shadow-red-400/50',
    iconColor: 'text-red-700',
    animation: 'hover:shadow-2xl'
  },
  "True Polymath": { 
    bg: 'from-emerald-50 to-teal-100', 
    border: 'border-teal-500', 
    shadow: 'shadow-teal-400/50',
    iconColor: 'text-teal-700',
    animation: 'hover:shadow-2xl'
  },
};

const CustomAnimations = () => (
  <style global jsx>{`
    /* REAL LIGHTNING FLASH ANIMATION */
    @keyframes lightning-flash {
        0% { opacity: 0; }
        1% { opacity: 1; background-color: rgba(255, 255, 255, 0.9); }
        3% { opacity: 0.5; background-color: rgba(173, 216, 230, 0.7); } /* Light Blue */
        4% { opacity: 1; background-color: rgba(255, 255, 255, 1); }
        6% { opacity: 0; }
        100% { opacity: 0; }
    }
    .lightning-flash-overlay {
        animation: lightning-flash 0.5s ease-out; /* Single, quick flash */
    }

    /* Helper for newly unlocked (Kept as requested) */
    @keyframes pulse-fast {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.4; }
    }
    .animate-pulse-fast {
        animation: pulse-fast 0.6s cubic-bezier(0.4, 0, 0.6, 0.6) infinite;
    }

    .animate-bounce-once {
        animation: bounce 1s cubic-bezier(0.28, 0.84, 0.42, 1);
    }
  `}</style>
);

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

  const styles = achievementStyles[title] || achievementStyles["Code Crusader"];

  const isLightningSolver = title === "Lightning Solver";
  const [flashKey, setFlashKey] = useState(null);

  const handleMouseEnter = () => {
    if (isLightningSolver) {
      setFlashKey(Date.now());
    }
  };
  const handleMouseLeave = () => {
    if (isLightningSolver) {
      setFlashKey(null);
    }
  };

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
  className={`bg-gradient-to-br ${styles.bg} p-4 sm:p-6 rounded-2xl shadow-xl border-b-4 ${
    styles.border
  } flex flex-col transform transition-all duration-300 ease-out ${styles.animation} ${celebrationClasses} h-full 
  hover:scale-[1.03] hover:shadow-2xl hover:-translate-y-2 shadow-md cursor-pointer relative overflow-hidden group`}
  style={{ transform: 'translateZ(0) scale(1)', willChange: 'transform' }}
  onMouseEnter={handleMouseEnter}
  onMouseLeave={handleMouseLeave}
>

      {isLightningSolver && flashKey !== null && (
          <div
              key={flashKey} 
              className="absolute inset-0 z-10 rounded-2xl pointer-events-none lightning-flash-overlay"
          />
      )}
      <div 
        className="flex flex-col items-center text-center flex-grow relative z-20"
        style={{ transform: 'translateZ(0)' }} 
      >
          <div
            className={`mb-4 transition duration-500 ${ 
              isComplete
                ? "text-purple-600"
                : styles.iconColor
            } ${isNewlyUnlocked ? "animate-bounce-once text-pink-500" : ""}`}
          >
            <IconComponent size={48} strokeWidth={2.5} />
          </div>

          <h4 className="text-lg sm:text-xl font-extrabold text-gray-800 mb-2">{title}</h4>

          <div className="text-sm sm:text-base text-gray-600 mb-4 
            text-center w-full 
            flex flex-col justify-center items-center 
            min-h-[150px] pb-2"> 
            <p className="flex-shrink-0 italic">{goalDescription}</p>
            
            {isPrimaryMetric && displayValue !== undefined && (
              <p className="text-sm font-semibold text-gray-700 mt-2 flex-shrink-0">
                {displayLabel}
                <span className="text-4xl font-black text-pink-700 block mt-1">{displayValue}</span>
              </p>
            )}

            {targetProgress > 0 && <ProgressBar current={currentProgress} target={targetProgress} />}
            {children}
            
          </div>
      </div>
      <div className={`flex items-center space-x-2 text-lg font-black mt-4 w-full justify-center relative z-20 ${statusColor}`}> 
        <StatusIcon size={20} />
        <span>{statusText}</span>
      </div>
    </div>
  );
};

const Achievements = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newlyUnlocked, setNewlyUnlocked] = useState({}); 
  const prevData = React.useRef(null);
  const [newlyUnlockedCount, setNewlyUnlockedCount] = useState(0); 


  CustomAnimations();

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${BASE_API}/api/user-achievements/`, {
          headers: { Authorization: `Token ${token}` },
        });
        
        const newData = response.data;
        setData(newData);

       
        if (newData.rewarded_badges && newData.rewarded_badges.length > 0) {
          const newCoinsAmount = newData.rewarded_badges.length * 5000;

          const rawUser = localStorage.getItem(LOCAL_STORAGE_KEY_USER);
          const localUser = JSON.parse(rawUser || '{}');
          localUser.coins = newData.coins; 
          localStorage.setItem(LOCAL_STORAGE_KEY_USER, JSON.stringify(localUser));
          
          const event = new CustomEvent('mcCoinUpdate', { 
              detail: { 
                  newCoinBalance: newData.coins, 
                  rewardAmount: newCoinsAmount, 
                  type: 'reward', 
                  source: 'achievement',
                  rewarded_badges: newData.rewarded_badges, 
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

  useEffect(() => {
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

  useEffect(() => {
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
      <div 
          className="absolute inset-0 z-50 bg-pink-50 text-pink-700"
      >
        <div 
            className="min-h-screen flex items-center justify-center lg:ml-64"
        >
          <div className="text-center">
            <LuZap className="animate-spin text-6xl mb-2 mx-auto" /> 
            <p className="text-lg font-semibold">Loading Achievements...</p>
          </div>
        </div>
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