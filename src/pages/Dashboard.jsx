import React, { useState, useEffect } from "react";
// --- Import react-icons for the Leaderboard and other metrics ---
import { LuTrophy, LuMedal, LuStar, LuZap, LuShield } from 'react-icons/lu';
import { FaCrown } from 'react-icons/fa'; // Using FaCrown for a distinct Hard mode icon
// Import for Coins Card icons
import { FaCoins } from 'react-icons/fa'; 
import { GiReceiveMoney, GiPayMoney } from 'react-icons/gi';
import "../App.css"; // floating-number + glow-hover styles
import axios from "axios";
const BASE_API = import.meta.env.VITE_BASE_API;


const Icon = ({ name, className }) => {
    const icons = {
        Fire: <span className={`${className} font-bold text-6xl leading-none text-pink-500`}>★</span>, // Star/Badge
        Puzzle: <span className={`${className} font-bold text-6xl leading-none text-purple-500`}>◫</span>, // Puzzle/Grid
        Target: <span className={`${className} font-bold text-6xl leading-none text-green-500`}>⊙</span>,  // Target/Circle
        Clock: <span className={`${className} font-bold text-xl leading-none text-purple-700`}>◷</span>, // Clock
        Zap: <span className={`${className} font-bold text-xl leading-none text-pink-700`}>⚡</span>, // Zap/Lightning
        Shield: <span className={`${className} font-bold text-xl leading-none text-green-700`}>🛡️</span>, // Shield/Mastery
    };
    return icons[name] || null;
};

// ------------------------------------------------------------------------------------------

const Dashboard = () => {
    // --- Initial State (Cleaned) ---
    const [user, setUser] = useState({
        name: "",
        level: 1,
        xp: 0,
        xpToNextLevel: 100,
        dailyStreak: 0,
        accuracy: 0.0,
        totalPuzzlesSolved: 0,
        currentIQ: 0,
        progress_count: 0, // Added for LevelProgressCard
        max_count: 5,      // Added for LevelProgressCard
        monthlyMetrics: {},
        monthlyIQs: {},
        puzzlesByDifficulty: { Easy: 0, Intermediate: 0, Hard: 0 },
        recentGames: [],
    });

    // --- NEW STATE for Total Coins (Since you mentioned they are overall/stable) ---
    const [totalCoins, setTotalCoins] = useState({
        earned: 0,
        spent: 0,
    });

    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); 
    const [leaderboard, setLeaderboard] = useState({
        easy: [],
        intermediate: [],
        hard: [],
    });
    const [peakMetrics, setPeakMetrics] = useState({
        // Updated structure based on user's reference
        longestStreak: { Easy: 0, Intermediate: 0, Hard: 0 }, 
        fastestPuzzle: { Easy: '0s', Intermediate: '0s', Hard: '0s' },
        highestModeMastery: { Easy: '0%', Intermediate: '0%', Hard: '0%' },
    });
    const [greeting, setGreeting] = useState("");
    const [overallScore, setOverallScore] = useState(0);

    // --- API Calls (Unchanged) ---

    // Fetch Mode Counts
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem("token"); 
                const res = await axios.get(`${BASE_API}/api/user-mode-counts/`, {
                    headers: { Authorization: `Token ${token}` },
                });
                setUser((prev) => ({
                    ...prev, 
                    puzzlesByDifficulty: {
                        Easy: res.data.Easy || 0,
                        Intermediate: res.data.Intermediate || 0,
                        Hard: res.data.Hard || 0,
                    },
                    totalPuzzlesSolved: res.data.Total || 0,
                }));
            } catch (error) {
                console.error("Failed to fetch mode counts:", error);
            }
        };
        fetchUserData();
    }, []);

    // Fetch Peak Metrics
    useEffect(() => {
        const token = localStorage.getItem("token");
        axios.get(`${BASE_API}/api/peak-metrics/`, { headers: { Authorization: `Token ${token}` } })
            .then(res => setPeakMetrics(res.data))
            .catch(err => console.error("Failed to fetch peak metrics:", err));
    }, []);

    // Fetch Monthly Performance
 useEffect(() => {
  const fetchMonthlyPerformance = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("No token found — user not logged in.");
        return;
      }

      const [year, mon] = month.split("-");
      const res = await axios.get(`${BASE_API}/api/monthly-performance/${year}/${mon}/`, {
        headers: { Authorization: `Token ${token}` },
      });

      const data = res.data || {};
      const puzzlesPlayed = data.total_puzzles || 0;
      const coinsEarned = data.total_coins_earned || 0; 
      const coinsSpent = data.total_coins_spent || 0;   

      // Update Total Coins (using monthly API data for initial display as requested)
      setTotalCoins({
        earned: coinsEarned, 
        spent: coinsSpent,   
      });

      // Update Monthly Metrics (excluding coins)
      setUser((prev) => ({
        ...prev,
        monthlyMetrics: {
          ...prev.monthlyMetrics,
          [month]: {
            puzzlesPlayed: puzzlesPlayed,
            modeBreakdown: data.mode_counts || { Easy: 0, Intermediate: 0, Hard: 0 },
            iqSummary: data.iqSummary || { Easy: 0, Intermediate: 0, Hard: 0 },
            message:
              puzzlesPlayed === 0
                ? "No activity this month — keep playing to earn stats!"
                : null,
          },
        },
        monthlyIQs: {
          ...prev.monthlyIQs,
          [month]: data.iqSummary
            ? Object.values(data.iqSummary).reduce((a, b) => a + b, 0)
            : 0, 
        },
        currentIQ: data.iqSummary
          ? Object.values(data.iqSummary).reduce((a, b) => a + b, 0)
          : prev.currentIQ, 
      }));
    } catch (error) {
      console.error("Failed to fetch monthly performance:", error);
      // Graceful fallback
      setUser((prev) => ({
        ...prev,
        monthlyMetrics: {
          ...prev.monthlyMetrics,
          [month]: {
            puzzlesPlayed: 0,
            modeBreakdown: { Easy: 0, Intermediate: 0, Hard: 0 },
            iqSummary: { Easy: 0, Intermediate: 0, Hard: 0 },
            message: "No performance records found for this month.",
          },
        },
        monthlyIQs: { ...prev.monthlyIQs, [month]: 0 },
      }));
    }
  };

  fetchMonthlyPerformance();
}, [month]);

    // Fetch Recent Games, User Level, Daily Streak, Total Puzzles, Overall Accuracy, Leaderboard, Greeting (Unchanged)
    useEffect(() => {
        const fetchRecentGames = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(`${BASE_API}/api/recent-activity/`, {
                    headers: { Authorization: `Token ${token}` },
                });
                setUser(prev => ({ ...prev, recentGames: res.data || [] }));
            } catch (error) {
                console.error("Failed to fetch recent activity:", error);
            }
        };
        fetchRecentGames();
    }, []);

   useEffect(() => {
    const fetchUserLevel = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const res = await axios.get(`${BASE_API}/api/user-level/`, {
                headers: { Authorization: `Token ${token}` },
            });

            setUser(prev => ({ 
                ...prev, 
                level: res.data.level || 1,
                progress_count: res.data.progress_count || 0,
                max_count: res.data.max_count || 5
            }));
        } catch (err) {
            console.error("Failed to fetch user level:", err);
        }
    };
    fetchUserLevel();
}, []);


    const fetchStat = (endpoint) => {
        const token = localStorage.getItem("token");
        axios.get(`${BASE_API}/${endpoint}/`, { headers: { Authorization: `Token ${token}` } })
            .then(res => {
                if (endpoint.includes('daily-streak')) {
                    setUser(prev => ({ ...prev, dailyStreak: res.data.daily_streak || 0 }));
                } else if (endpoint.includes('total-puzzles')) {
                    setUser(prev => ({ ...prev, totalPuzzlesSolved: res.data.total_puzzles_attempted || 0 }));
                } else if (endpoint.includes('overall-accuracy')) {
                    setUser(prev => ({ ...prev, accuracy: res.data.overall_accuracy || 0.0 }));
                }
            })
            .catch(console.error);
    };

    useEffect(() => {
        fetchStat('api/daily-streak');
        fetchStat('api/total-puzzles');
        fetchStat('api/overall-accuracy');
    }, []);
    
   
    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;
                const res = await axios.get(`${BASE_API}/api/leaderboard/`, {
                    headers: { Authorization: `Token ${token}` }
                });
                setLeaderboard(res.data);
            } catch (err) {
                console.error("Failed to fetch leaderboard:", err);
            }
        };
        fetchLeaderboard();
    }, []);

    useEffect(() => {
    const fetchGreeting = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            return;
        }

        try {
            const res = await axios.get(`${BASE_API}/api/greeting/`, {
                headers: { Authorization: `Token ${token}` },
            });
            const { greet, username } = res.data || {};
            setGreeting(greet || "Hello");
            setUser(prev => ({ ...prev, name: username || prev.name }));
        } catch (err) {
            console.error("Failed to fetch greeting:", err);
        }
    };
    fetchGreeting();
}, []);

useEffect(() => {
    const fetchOverallScore = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const res = await axios.get(`${BASE_API}/api/overall-score/`, {
                headers: { Authorization: `Token ${token}` }
            });

            setOverallScore(res.data.overall_score || 0);
        } catch (error) {
            console.error("Failed to fetch overall score:", error);
        }
    };

    fetchOverallScore();
}, []);


    // --- Anime.js Floating numbers (Remains unchanged) ---
    useEffect(() => {
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
                        { value: 0.05 + Math.random() * 0.1, duration: 3000 }, 
                        { value: 0.1 + Math.random() * 0.15, duration: 3000 },
                        { value: 0.05 + Math.random() * 0.1, duration: 3000 },
                    ],
                    loop: true,
                    easing: "easeInOutQuad",
                    delay: index * 300,
                });
            });
        } else console.error("Anime.js not found. Include it in index.html.");
    }, []);
    // --------------------------------------------------------

    if (!user) return null;

    // Destructure required user variables (relying on state, which gets updated from API)
    const { dailyStreak, accuracy, totalPuzzlesSolved, level, xp, xpToNextLevel, currentIQ } = user;
    
    const currentMonthlyMetrics = user.monthlyMetrics[month] || {
        puzzlesPlayed: 0,
        modeBreakdown: { Easy: 0, Intermediate: 0, Hard: 0 },
        iqSummary: { Easy: 0, Intermediate: 0, Hard: 0 } 
    };
    const monthlyIQ = user.monthlyIQs[month] != null ? user.monthlyIQs[month] : 0;
    
    // --- FIX: Calculate Max Streak from longestStreak object ---
    const longestStreakData = peakMetrics.longestStreak || {};
    let maxStreak = 0;
    let maxStreakMode = 'N/A';

    Object.entries(longestStreakData).forEach(([mode, value]) => {
        const numericValue = parseInt(value, 10);
        if (!isNaN(numericValue) && numericValue > maxStreak) {
            maxStreak = numericValue;
            maxStreakMode = mode;
        }
    });
    const safeLongestStreakDisplay = { value: maxStreak, mode: maxStreakMode };
    // --- END FIX ---


    // --- Utility Components for the Theme ---

    const GameCard = ({ children, className = "" }) => (
        <div
            className={`bg-white p-6 rounded-3xl shadow-xl border border-pink-200 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(236,72,153,0.3)] ${className}`}
        >
            {children}
        </div>
    );
    
    const DetailedKeyStat = ({ title, iconName, breakdown, unit = '' }) => {
        const difficultyColors = {
            Easy: { text: 'text-green-600', bg: 'bg-green-100', border: 'border-green-300' },
            Intermediate: { text: 'text-orange-600', bg: 'bg-orange-100', border: 'border-orange-300' },
            Hard: { text: 'text-red-600', bg: 'bg-red-100', border: 'border-red-300' },
        };

        return (
            <div className="p-4 bg-white rounded-xl border border-pink-200 shadow-md">
                <div className="flex items-center space-x-2 mb-3">
                    <Icon name={iconName} className="text-xl" />
                    <h4 className="text-sm font-bold text-gray-700 tracking-wider">{title}</h4>
                </div>
                <div className="space-y-2">
                    {Object.entries(breakdown).map(([mode, value]) => {
                        const colors = difficultyColors[mode];
                        return (
                            <div key={mode} className={`flex justify-between items-center px-3 py-1.5 rounded-lg border ${colors.border} ${colors.bg}`}>
                                <span className={`text-xs font-semibold ${colors.text}`}>{mode}</span>
                                <span className={`text-base font-black ${colors.text}`}>{value}{unit}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

   // --- Card 2: Peak Metrics (Fixed to utilize full height) ---
    const PeakMetricsCard = ({ longestStreak, fastestPuzzle, highestModeMastery }) => {
        const safeLongestStreak = longestStreak || { Easy: 0, Intermediate: 0, Hard: 0 };
        const safeFastestPuzzle = fastestPuzzle || { Easy: '0s', Intermediate: '0s', Hard: '0s' };
        const safeHighestMastery = highestModeMastery || { Easy: '0%', Intermediate: '0%', Hard: '0%' };

        return (
            // Added h-full to make it stretch
            <GameCard className="flex flex-col p-4 space-y-4 h-full"> 
                <h3 className="text-xl font-extrabold text-pink-700 border-b-2 border-purple-300 pb-2 mb-2 tracking-wider">
                    Peak Metrics Analysis
                </h3>
                <div className="p-4 bg-purple-50 rounded-xl border-2 border-purple-300 text-center shadow-inner">
                    <p className="text-sm font-semibold text-gray-600 mb-4">Longest Combo Streak</p>

                    <div className="flex justify-around">
                        {Object.entries(safeLongestStreak).map(([mode, value]) => (
                            <div key={mode} className="flex flex-col items-center">
                                <p className="text-xs font-medium text-purple-600">{mode}</p>
                                <p className="text-3xl font-black text-pink-700 mt-1">{value}</p>
                            </div>
                        ))}
                    </div>
                </div>


                {/* Ensure the rest of the content takes available space */}
                <div className="grid grid-cols-1 gap-4 pt-2 flex-grow"> 
                    <DetailedKeyStat 
                        title="Fastest Puzzle Time"
                        iconName="Clock"
                        breakdown={safeFastestPuzzle}
                    />
                    <DetailedKeyStat 
                        title="Highest Mode Accuracy"
                        iconName="Shield"
                        breakdown={safeHighestMastery}
                    />
                </div>
            </GameCard>
        );
    };


    
    // --- Core Metric Cards (Unchanged) ---

    const DailyStreakCard = () => (
        <GameCard className="text-center transition-transform duration-300 hover:scale-[1.03] active:scale-[1.03]">
            <Icon name="Fire" className="text-pink-600 text-5xl mb-2" />
            <p className="text-4xl font-black text-pink-700">
                {dailyStreak} {dailyStreak === 1 ? "Day" : "Days" }
            </p>
            <p className="text-sm text-gray-500 mt-1">Daily Login Streak</p>
        </GameCard>
    );

    const TotalPuzzlesCard = () => (
        <GameCard className="text-center hover:scale-[1.03] transition-transform duration-300">
            <Icon name="Puzzle" className="text-purple-600 text-5xl mb-2" />
            <p className="text-4xl font-black text-purple-700">{totalPuzzlesSolved}</p>
            <p className="text-sm text-gray-500 mt-1">Total Puzzles Solved</p>
        </GameCard>
    );

    const AccuracyCard = () => (
        <GameCard className="text-center hover:scale-[1.03] transition-transform duration-300">
            <Icon name="Target" className="text-green-600 text-5xl mb-2" />
            <p className="text-4xl font-black text-green-700">{accuracy}%</p>
            <p className="text-sm text-gray-500 mt-1">Overall Accuracy</p>
        </GameCard>
    );

    // --- Coin Ledger Card (Account Total) - FIXED TO FILL HEIGHT ---
    const CoinsManagementCard = ({ earned, spent }) => (
        // REMOVED: max-w-xs mx-auto to allow it to fill the column space
        // ADDED: h-full to make it match the height of neighbors in the grid
        <GameCard className="bg-gradient-to-br from-yellow-50 to-orange-100 border-orange-300 shadow-lg hover:scale-[1.01] transition-transform p-6 flex flex-col justify-between h-full">
            
            {/* Header */}
            <div className="flex items-center mb-4 border-b border-orange-200 pb-2">
                <FaCoins className="text-2xl text-orange-600 mr-2" />
                <h3 className="text-xl font-extrabold text-orange-700  tracking-wider">
                    Coin Ledger
                </h3>
            </div>

            {/* Coins Stats */}
            <div className="grid grid-cols-2 gap-4 text-center flex-grow items-center">
                
                {/* Coins Earned */}
                <div className="p-3 bg-yellow-100 rounded-lg border border-yellow-300 shadow-inner flex flex-col items-center justify-center">
                    <GiReceiveMoney className="text-4xl text-green-600 mb-1" />
                    <p className="text-sm font-semibold text-gray-700 uppercase">Earned</p>
                    <p className="text-3xl font-black text-green-700 mt-1">{earned}</p>
                </div>

                {/* Coins Spent */}
                <div className="p-3 bg-red-100 rounded-lg border border-red-300 shadow-inner flex flex-col items-center justify-center">
                    <GiPayMoney className="text-4xl text-red-600 mb-1" />
                    <p className="text-sm font-semibold text-gray-700 uppercase">Spent</p>
                    <p className="text-3xl font-black text-red-700 mt-1">{spent}</p>
                </div>

            </div>

        </GameCard>
    );


    // --- Overall Score Card (New Color Scheme: Teal/Green) ---
    const OverallScoreCard = ({ score }) => (
        <GameCard className="!p-3 bg-teal-50 border-teal-300 shadow-lg text-center h-auto">
            <div className="flex items-center justify-between">
                
                {/* Title Block */}
                <div className="flex flex-col items-start mr-4">
                    <div className="flex items-center mb-0">
                        <LuStar className="text-lg text-teal-600 mr-1" />
                        <h3 className="text-sm font-black text-teal-700 tracking-widest">
                            Overall Score
                        </h3>
                    </div>
                    <p className="text-xs text-gray-500 mt-0">Combined total across all modes.</p>
                </div>

                {/* Score Value Block */}
                <div className="p-1.5 bg-white rounded-lg border-2 border-teal-400 min-w-[100px]">
                    <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-green-600 ">
                        {score}
                    </p>
                </div>
                
            </div>
        </GameCard>
    );


    // --- Leaderboard Component (Added Hover Effect) ---
    const LeaderboardCard = ({ leaderboard }) => {
      // Configuration updated to use React Icons
      const modeConfig = {
        easy: { title: "Easy Mode", icon: <LuZap className="text-2xl" />, bg: "bg-green-50", border: "border-green-300", text: "text-green-700", iqClass: "text-green-600" },
        intermediate: { title: "Intermediate Mode", icon: <LuTrophy className="text-2xl" />, bg: "bg-yellow-50", border: "border-yellow-300", text: "text-yellow-700", iqClass: "text-yellow-600" },
        hard: { title: "Hard Mode", icon: <FaCrown className="text-2xl" />, bg: "bg-red-50", border: "border-red-300", text: "text-red-700", iqClass: "text-red-600" },
      };

      // Rank Icons updated to use React Icons
      const getMedal = (rank, colorClass = "text-gray-500") => {
        if (rank === 1) return <LuMedal className={`text-yellow-500 text-lg`} />;
        if (rank === 2) return <LuMedal className={`text-gray-400 text-lg`} />;
        if (rank === 3) return <LuMedal className={`text-yellow-700 text-lg`} />;
        return <span className={`font-semibold ${colorClass}`}> {rank}.</span>;
      };

      const ModeLeaderboard = ({ mode, data }) => {
        const config = modeConfig[mode];
        const displayData = data.slice(0, 5); // Ensure max 5 rows

        return (
          <div className={`p-4 rounded-xl shadow-inner ${config.bg} border-2 ${config.border} flex flex-col h-full`}>
            <h4 className={`text-lg font-extrabold ${config.text} mb-3 flex items-center justify-center space-x-2`}>
              {config.icon} <span>{config.title}</span>
            </h4>
            <div className="flex-grow">
              {displayData.length > 0 ? (
                <table className="w-full text-left table-auto">
                  <thead className="text-gray-500 text-xs  border-b border-gray-300">
                    <tr>
                      <th className="py-1 w-1/4">Rank</th>
                      <th className="py-1 w-1/2">User</th>
                      <th className="py-1 w-1/4 text-right">Score</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-800">
                    {displayData.map((user, i) => (
                      <tr 
                        key={i} 
                        // ADDED HOVER EFFECT HERE
                        className={`border-b border-gray-200 last:border-b-0 ${i % 2 === 0 ? 'bg-white/50' : ''} transition duration-150 hover:bg-purple-100/60 cursor-pointer`}
                      >
                        <td className={`py-2 font-black text-sm flex items-center`}>
                          {getMedal(i + 1)}
                        </td>
                        <td className="py-2 text-sm font-semibold truncate">
                          {user.username}
                        </td>
                        <td className={`py-2 text-sm font-extrabold text-right ${config.iqClass}`}>
                          {user.overall_score}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-6 text-gray-500 italic text-sm">
                  No ranking data yet.
                </div>
              )}
            </div>
          </div>
        );
      };

      return (
        <GameCard className="lg:col-span-3 p-4">
          <h3 className="text-2xl font-extrabold text-pink-700 border-b-2 border-purple-300 pb-2 mb-6  tracking-wider text-center">
            Global Leaderboard Rankings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ModeLeaderboard mode="easy" data={leaderboard.easy} />
            <ModeLeaderboard mode="intermediate" data={leaderboard.intermediate} />
            <ModeLeaderboard mode="hard" data={leaderboard.hard} />
          </div>
        </GameCard>
      );
    };

    // --- LEVEL PROGRESS CARD COMPONENT (Unchanged) ---
    const LevelProgressCard = ({ level, correctStreak, maxStreak }) => {
        const progressPercentage = (correctStreak / maxStreak) * 100;
        
        return (
            <GameCard className="!p-4 bg-pink-50 border-pink-300 shadow-lg h-full">
  <div className="flex items-center justify-between h-full">
    {/* Level Card (Rectangular with animation) */}
    <div
      className="flex items-center space-x-3 p-3 bg-white rounded-xl border-2 border-purple-400 shadow-xl transition-all duration-500 hover:scale-[1.05] glow-hover"
    >
      <span className="text-sm font-black text-gray-700 ">Current Level</span>
      <span className="text-3xl font-black text-purple-700 transition-transform duration-500">
        {level}
      </span>
    </div>

    {/* Progress Bar and Text */}
    <div className="flex-1 ml-6">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-semibold text-pink-600">
          Progress to Level {level + 1}
        </span>
        <span className="text-xs font-bold text-gray-600">
          {correctStreak}/{maxStreak} Correct Streak
        </span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner mb-1">
        <div
          className="h-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 transition-all duration-500 shadow-lg"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>

      {/* Level Up Instruction */}
      <p className="text-[11px] text-gray-600 italic mt-1 leading-snug">
        ⭐ <span className="font-semibold text-pink-600">Level up rule: </span>  
        Answer <span className="font-semibold">5 or more questions correctly</span> in any mode  
        ( Easy, Intermediate, or Hard ) to earn a <span className="text-purple-600 font-semibold">success streak</span>.  
        Complete <span className="font-bold text-pink-700">5 streaks</span> to reach the next level!
      </p>
    </div>
  </div>
</GameCard>

        );
    };


    // --- Monthly Performance Snapshot (Unchanged from previous modification) ---
    const MonthlyPerformanceSnapshot = ({ month, currentMonthlyMetrics, monthlyIQ, setMonth }) => (
        // Added h-full to make it stretch
        <GameCard className="lg:col-span-1 bg-gradient-to-r from-white to-pink-50 border-pink-300 hover:scale-[1.015] shadow-2xl p-4 h-full flex flex-col">

            <div className="flex justify-between items-start mb-4">
                <h2 className="text-lg font-bold text-pink-600 tracking-wider">
                    Monthly Performance
                </h2>
                {/* Month Selector */}
                <div className="text-right p-1 bg-pink-100/70 rounded-xl border border-pink-300">
                    <input
                        type="month"
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        className="px-1 py-0.5 border border-pink-400 rounded-lg bg-white text-pink-700 text-xs focus:ring-purple-500 focus:border-purple-500 transition cursor-pointer"
                    />
                </div>
            </div>

            {/* Main Metrics (Vertical stack for space saving) */}
            <div className="flex flex-col space-y-3 border-b pb-3 border-pink-200">
                {[
                    { label: "Monthly Score", value: monthlyIQ || 0, color: "bg-gradient-to-r from-pink-600 to-purple-700 text-transparent bg-clip-text", size: "text-4xl" },
                    { label: "Puzzles Played", value: currentMonthlyMetrics?.puzzlesPlayed || 0, color: "text-purple-700", size: "text-3xl" },
                ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between px-2 py-1 bg-pink-50 rounded-lg"> 
                        <p className="text-xs font-bold text-gray-500 tracking-widest">{item.label}</p>
                        <p className={`${item.size} font-black ${item.color} [text-shadow:_0_0_5px_rgba(236,72,153,0.5)]`}>
                            {item.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Mode Breakdown (Simplified) */}
            <p className="text-sm font-bold text-pink-700 mt-4 mb-2">Mode Breakdown:</p>
            <div className="flex justify-between space-x-1">
                {["Easy", "Intermediate", "Hard"].map((mode) => (
                    <div key={mode} className="text-center p-1 rounded-lg bg-pink-50 border border-pink-200 w-1/3">
                        <span className="text-sm font-extrabold text-gray-800">
                            {currentMonthlyMetrics?.modeBreakdown?.[mode] || 0}
                        </span>
                        <p className="text-xs text-gray-500">{mode}</p>
                    </div>
                ))}
            </div>

            {/* 💖 Scores by Mode Table */}
            <p className="text-sm font-bold text-pink-700 mt-6 mb-3">Scores by Mode:</p>
            <div className="overflow-x-auto flex-grow">
                <table className="min-w-full bg-white border border-purple-200 rounded-xl overflow-hidden shadow-lg text-sm">
                    <thead className="bg-purple-100/80 text-purple-700  text-xs tracking-wider">
                        <tr>
                            <th className="py-2 px-3 text-left">Mode</th>
                            <th className="py-2 px-3 text-right">Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {["Easy", "Intermediate", "Hard"].map((mode, index) => {
                            const modeColors = {
                                Easy: 'text-green-600',
                                Intermediate: 'text-yellow-600',
                                Hard: 'text-red-600',
                            };
                            const rowBg = index % 2 === 0 ? "bg-white" : "bg-purple-50/70";

                            return (
                                <tr key={mode} className={`${rowBg} hover:bg-purple-100/60 transition`}>
                                    <td className="py-2 px-3 font-semibold text-gray-800">
                                        <span className={`text-sm font-black ${modeColors[mode]}`}>{mode}</span>
                                    </td>
                                    <td className="py-2 px-3 text-right font-bold text-md text-pink-700">
                                        {currentMonthlyMetrics?.iqSummary?.[mode] ?? 0}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

        </GameCard>
    );

    // --- Main Render ---

    return (
        <div className="min-h-screen text-gray-900 md:ml-64 pt-20 md:pt-26 px-4 md:px-8 space-y-8 font-sans relative">

            
            {/* Background Subtle Gradient Glow */}
            <div className="absolute inset-0 opacity-40 -z-20">
                <div className="w-1/2 h-full bg-pink-200 rounded-full blur-3xl mx-auto -translate-y-1/4"></div>
            </div>
            
            {/* Floating numbers (Subtle background texture) */}
            <div className="absolute inset-0 pointer-events-none -z-10">
                <div className="floating-number text-gray-400" style={{ top: "5rem", left: "8rem" }}>3</div>
                <div className="floating-number text-gray-400" style={{ top: "8rem", right: "8rem" }}>7</div>
                <div className="floating-number text-gray-400" style={{ bottom: "10rem", left: "16rem" }}>12</div>
                <div className="floating-number text-gray-400" style={{ bottom: "6rem", right: "14rem" }}>20</div>
            </div>
            
            {/* 1. Header Greeting and Overall Score Card */}
<div className="flex flex-col md:flex-row items-start justify-between gap-4">
  {/* Greeting */}
  <div className="text-xl md:text-2xl pt-2">
    <span className="font-light text-gray-600">{greeting.split(",")[0]}, </span>
    <span className="font-extrabold text-pink-700">{user.name.toUpperCase()}</span>
  </div>

  {/* Overall Score Card */}
  <div className="w-full md:w-96">  
    <OverallScoreCard score={overallScore} />
  </div>
</div>


            {/* 2. LEVEL PROGRESS BAR (Full Width) */}
            <LevelProgressCard 
                level={user.level} 
                correctStreak={user.progress_count || 0} 
                maxStreak={user.max_count || 5} 
            />

            {/* 3. Global Leaderboard Rankings (MOVED UP) */}
            <LeaderboardCard leaderboard={leaderboard} />

            {/* 4. Monthly Performance, Coin Ledger, and Peak Metrics (New 3-column grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                
                {/* Card 1: MONTHLY PERFORMANCE SUMMARY (1/3 width) - Now has h-full */}
                <MonthlyPerformanceSnapshot 
                    month={month} 
                    currentMonthlyMetrics={currentMonthlyMetrics} 
                    monthlyIQ={monthlyIQ} 
                    setMonth={setMonth}
                />

                {/* Card 2: Coin Ledger (MIDDLE) - Now fills height */}
                <div className="lg:col-span-1">
                    <CoinsManagementCard 
                        earned={totalCoins.earned} 
                        spent={totalCoins.spent} 
                    />
                </div>

                {/* Card 3: Peak Metrics (1/3 width) - Now has h-full */}
                <PeakMetricsCard 
                    longestStreak={peakMetrics.longestStreak}
                    fastestPuzzle={peakMetrics.fastestPuzzle}
                    highestModeMastery={peakMetrics.highestModeMastery}
                />
            </div>

            {/* 5. Section 2: Recent Activity and Distribution (Unchanged Position) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                
                {/* Card 3: Recent Game History - Detailed Log (2/3 width) */}
                <GameCard className="lg:col-span-2">
                    <h3 className="text-lg font-bold text-pink-700 mb-4">
                        Recent Activity Log Stream
                    </h3>
                    <div className="overflow-x-auto w-full">

                        <table className="w-full text-left font-mono">
                            <thead className="text-pink-500 border-b border-pink-200">
                                <tr>
                                    <th className="py-2 text-xs uppercase tracking-wider">Time Stamp</th>
                                    <th className="py-2 text-xs uppercase tracking-wider">Mode</th>
                                    <th className="py-2 text-xs uppercase tracking-wider">Streak</th>
                                    <th className="py-2 text-xs uppercase tracking-wider text-right">Score</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-700">
                                {user.recentGames.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="py-6 text-center text-gray-500 italic">
                                            🎮 No activity yet — start playing to see your progress here!
                                        </td>
                                    </tr>
                                ) : (
                                    user.recentGames.slice(0, 5).map((g, i) => {
                                        const modeKey = g.mode ? g.mode.trim().toLowerCase() : '';

                                        return (
                                            <tr key={i} className="border-t border-pink-50 transition duration-150 hover:bg-pink-50">
                                                <td className="py-3 text-sm">{g.datetime || 'N/A'}</td>
                                                <td className="py-3 text-sm">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                        modeKey === 'hard' ? 'bg-red-200 text-red-800' :
                                                        modeKey === 'intermediate' ? 'bg-yellow-200 text-yellow-800' :
                                                        'bg-green-200 text-green-800'
                                                    }`}>
                                                        {g.mode || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="py-3 text-sm text-yellow-600">{g.total_streak || 0}</td>
                                                <td className="py-3 text-sm font-bold text-pink-700 text-right">{g.iq || 0}</td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </GameCard>

                {/* Card 4: Difficulty Distribution - Progress Visuals (1/3 width) */}
                <GameCard>
                    <h3 className="text-lg font-bold text-gray-700 mb-4">
                        Mission Difficulty Breakdown (Overall)
                    </h3>
                    <div className="space-y-6 pt-2">
                        {Object.entries(user.puzzlesByDifficulty).map(([mode, count]) => {
                            const total = user.totalPuzzlesSolved || 1;
                            const percentage = (count / total) * 100;
                            let colorClasses = '';

                            if (mode === 'Hard') {
                                colorClasses = 'text-red-700 bg-gradient-to-r from-red-500 to-pink-500';
                            } else if (mode === 'Intermediate') {
                                colorClasses = 'text-yellow-700 bg-gradient-to-r from-yellow-500 to-orange-400';
                            } else {
                                colorClasses = 'text-green-700 bg-gradient-to-r from-green-500 to-teal-400';
                            }

                            return (
                                <div key={mode}>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-semibold text-gray-600">{mode} Mode</span>
                                        <span className={`text-xl font-extrabold ${colorClasses.split(' ')[0]}`}>
                                            {count}
                                        </span>
                                    </div>
                                    {/* Progress Bar with Gradient and Shadow */}
                                    <div className="w-full bg-pink-100 rounded-full h-2 shadow-inner">
                                        <div 
                                            className={`h-2 rounded-full shadow-md ${colorClasses.split(' ').slice(1).join(' ')}`}
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </GameCard>
            </div>
            
            {/* 6. Section 3: New Unique Metric Cards (Unchanged Position) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <DailyStreakCard />
                <TotalPuzzlesCard />
                <AccuracyCard />
            </div>

        </div>
    );
};

export default Dashboard;