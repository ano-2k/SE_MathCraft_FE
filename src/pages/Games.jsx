import React, { useEffect, useState, useMemo } from "react";

// Constants
const QUESTIONS_PER_ROUND = 10;
const DEFAULT_COINS = 1000;
const MAX_STREAK = 5;
const LOCAL_STORAGE_KEY_USER = "mc_user_v1";

const BASE_API = import.meta.env.VITE_BASE_API;

// Added color properties for visual distinction and styling
const DIFFICULTY = {
  easy: { threshold: 90, hintCost: 100, coinReward: 1000, color: 'text-green-600', colorClass: 'bg-green-200/50 border-green-500' },
  intermediate: { threshold: 60, hintCost: 200, coinReward: 2000, color: 'text-orange-600', colorClass: 'bg-orange-200/50 border-orange-500' },
  hard: { threshold: 30, hintCost: 300, coinReward: 3000, color: 'text-red-600', colorClass: 'bg-red-200/50 border-red-500' },
};

// ====================================================================
// CRITICAL FIX: REMOVED local NUMBER_HINT_POOL and generateHint function
// ====================================================================

export default function Games() {
  // Game State (to be persisted)
  const [user, setUser] = useState({ coins: DEFAULT_COINS });
  const [mode, setMode] = useState("easy");
  // NOTE: currentQuestion no longer stores the solution
  const [currentQuestion, setCurrentQuestion] = useState(null); 
  const [currentIndex, setCurrentIndex] = useState(0);
  const [roundRecords, setRoundRecords] = useState([]);
  
  // Ephemeral State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hintText, setHintText] = useState(""); 
  const [hintUsed, setHintUsed] = useState(false); 
  const [answer, setAnswer] = useState("");
  const [hasAnswered, setHasAnswered] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [timer, setTimer] = useState(0);
  const [streak, setStreak] = useState(MAX_STREAK);
  const [questionId, setQuestionId] = useState(0); 
  const [hintRotationIndex, setHintRotationIndex] = useState(0); 
  const [isInitialising, setIsInitialising] = useState(true); 


  // --- Utility to get user-specific storage key ---
  const getGameStorageKey = () => {
    const token = localStorage.getItem("token");
    if (!token) return "mc_game_v1_guest"; 
    return `mc_game_v1_${token.slice(-10)}`; 
  };


  // --- Game State Persistence Handlers ---
  const saveUser = (u) => {
    setUser(u);
    localStorage.setItem(LOCAL_STORAGE_KEY_USER, JSON.stringify(u));
    window.dispatchEvent(new CustomEvent('mcCoinUpdate'));
  };

  const saveGameState = ({ q, idx, records, m, t, hu, ht }) => {
    const gameState = { 
        currentQuestion: q, 
        currentIndex: idx, 
        roundRecords: records, 
        mode: m, 
        timer: t,
        hintUsed: hu, 
        hintText: ht,
    };
    localStorage.setItem(getGameStorageKey(), JSON.stringify(gameState));
  };
  
 
// --- Initialization: Load User & Game State ---
useEffect(() => {
    // 1️⃣ Load User Coins
    const rawUser = localStorage.getItem(LOCAL_STORAGE_KEY_USER);
    if (rawUser) {
        setUser(JSON.parse(rawUser));
    } else {
        const initialUser = { coins: DEFAULT_COINS };
        setUser(initialUser);
        localStorage.setItem(LOCAL_STORAGE_KEY_USER, JSON.stringify(initialUser));
    }

    // 2️⃣ Load Game State
    const token = localStorage.getItem("token");
    if (!token) {
        localStorage.removeItem(getGameStorageKey());
        setIsInitialising(false); 
        return; 
    }

    const rawGame = localStorage.getItem(getGameStorageKey());
    if (!rawGame) {
         setIsInitialising(false); 
         return;
    }

    const gameState = JSON.parse(rawGame);

    // 🔹 ROUND COMPLETED: Force Mission Debrief
    if ((gameState.currentIndex || 0) >= QUESTIONS_PER_ROUND && (gameState.roundRecords?.length || 0) > 0) {
        setRoundRecords(gameState.roundRecords);
        setMode(gameState.mode || "easy");
        setCurrentQuestion(null);          
        setCurrentIndex(QUESTIONS_PER_ROUND);
        setShowSummary(true);             
        setIsInitialising(false); 
        return;                            
    }

    // 🔹 IN-PROGRESS GAME: Restore question
    if (gameState.currentQuestion && (gameState.currentIndex || 0) < QUESTIONS_PER_ROUND) {
        // NOTE: Restoring question state only includes the image URL
        setCurrentQuestion(gameState.currentQuestion); 
        setCurrentIndex(gameState.currentIndex || 0);
        setRoundRecords(gameState.roundRecords || []);
        setMode(gameState.mode || "easy");
        setTimer(gameState.timer || 0);
        setHintUsed(gameState.hintUsed || false); 
        setHintText(gameState.hintText || "");    
        setQuestionId(prev => prev + 1); 
    }
    
    setIsInitialising(false);

}, []); 


  // --- Timer and Streak Logic ---
  useEffect(() => {
    if (!currentQuestion || hasAnswered || loading || showSummary) return;
    if (currentIndex >= QUESTIONS_PER_ROUND) return;

    const cfg = DIFFICULTY[mode];
    const token = localStorage.getItem("token");
    if (!token) return;

    const id = setInterval(() => {
        setTimer(t => {
            const newT = t + 1;
            const calculatedStreak = Math.max(0, MAX_STREAK - Math.floor(newT / cfg.threshold));
            setStreak(calculatedStreak);
            if (newT % 5 === 0 && currentQuestion) {
                saveGameState({ 
                    q: currentQuestion, 
                    idx: currentIndex, 
                    records: roundRecords, 
                    m: mode, 
                    t: newT,
                    hu: hintUsed,
                    ht: hintText, 
                });
            }
            return newT;
        });
    }, 1000);

    return () => clearInterval(id);
  }, [currentQuestion, hasAnswered, mode, loading, currentIndex, roundRecords, hintUsed, hintText, showSummary]); 

  // --- State Persistence on Unmount (Logout/Tab Close) ---
  useEffect(() => {
      if (!currentQuestion || currentIndex >= QUESTIONS_PER_ROUND) return;

      const saveFinalState = () => {
          const token = localStorage.getItem("token");
          if (token && currentQuestion) {
              saveGameState({
                  q: currentQuestion,
                  idx: currentIndex,
                  records: roundRecords,
                  m: mode,
                  t: timer, 
                  hu: hintUsed,
                  ht: hintText,
              });
          }
      };
      return saveFinalState;
  }, [currentQuestion, currentIndex, roundRecords, mode, timer, hintUsed, hintText]); 


  // --- Game Flow Functions ---
// 🎯 CRITICAL FIX 1: loadNextQuestion MUST use POST and send context
  const loadNextQuestion = async (nextIndex) => {
    const token = localStorage.getItem("token");
    const gameModeId = localStorage.getItem("current_game_mode_id");
    const questionNumber = nextIndex + 1;

    if (!token || !gameModeId) {
      console.error("User logged out or game context expired.");
      restartToModeSelection();
      return;
    }
  
    if (nextIndex >= QUESTIONS_PER_ROUND) {
      finalizeRound(roundRecords);
      return;
    }
  
    setLoading(true);
    setError("");
    setHintText("");
    setHintUsed(false);
    setAnswer("");
    setHasAnswered(false);
    setTimer(0);
    setStreak(MAX_STREAK);
    setCurrentIndex(nextIndex);
    setQuestionId((prev) => prev + 1);

    // Persist previous state (if any)
    if (currentQuestion) {
      saveGameState({
        q: currentQuestion,
        idx: nextIndex,
        records: roundRecords,
        m: mode,
        t: 0,
        hu: hintUsed,
        ht: hintText,
      });
    }
  
    try {
      // 🎯 CRITICAL FIX: Use POST method and send game context
      const res = await fetch(`${BASE_API}/api/marcconrad-game/`, {
        method: "POST", 
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${token}`,
        },
        body: JSON.stringify({
          game_mode_id: gameModeId,
          question_number: questionNumber,
        }),
      });
  
      if (!res.ok) {
        throw new Error(`API failed with status: ${res.status}`);
      }
  
      const data = await res.json();
  
      // Validate response format: ONLY check for question image, NO solution
      if (!data || !data.question) {
        throw new Error("Invalid API response format. Missing 'question'.");
      }
  
      // CRITICAL FIX: Only assign the question image. Solution is GONE.
      const newQ = { question_img: data.question }; 
      setCurrentQuestion(newQ);
  
      saveGameState({
        q: newQ,
        idx: nextIndex,
        records: roundRecords,
        m: mode,
        t: 0,
        hu: false,
        ht: "",
      });
    } catch (err) {
      console.error(err);
      setError(`Failed to load question data: ${err.message}. Please check the API endpoint.`);
      setCurrentQuestion(null);
    } finally {
      setLoading(false);
    }
  };


  const restartToModeSelection = () => {
    setMode("easy");
    setCurrentQuestion(null);
    setCurrentIndex(0);
    setRoundRecords([]);
    setLoading(false);
    setError("");
    setHintText("");
    setHintUsed(false); 
    setAnswer("");
    setHasAnswered(false);
    setShowSummary(false); 
    setTimer(0);
    setStreak(MAX_STREAK);
    setQuestionId(0);
    localStorage.removeItem(getGameStorageKey());
    localStorage.removeItem("current_game_mode_id");
    setIsInitialising(false); 
  };


  const startRound = () => {
    if (!localStorage.getItem("token")) {
        console.error("User not logged in. Cannot start round.");
        restartToModeSelection(); 
        return;
    }
    
    setRoundRecords([]);
    setShowSummary(false);
    setCurrentQuestion(null); 
    setHintUsed(false); 
    setHintText(""); 
    setIsInitialising(false); 
    
    const today = new Date().toISOString().slice(0, 10);
    const attemptsLog = JSON.parse(localStorage.getItem("dailyAttempts") || "{}");
    const attemptNumber = (attemptsLog[today] || 0) + 1;
    attemptsLog[today] = attemptNumber;
    localStorage.setItem("dailyAttempts", JSON.stringify(attemptsLog));

    const token = localStorage.getItem("token");
    
    fetch(`${BASE_API}/api/create-game/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Token ${token}`, 
      },
      body: JSON.stringify({
        mode: mode,
        attempt: attemptNumber,
      }),
    })
    .then(res => res.json())
    .then(data => {
        if (data?.id) {
            localStorage.setItem("current_game_mode_id", data.id);
            // After creating the game mode record, load the first question
            loadNextQuestion(0);
        }
    })
    .catch(err => {
        console.error("Failed to save game attempt:", err);
        setError("Failed to start game session. Check backend setup.");
        setLoading(false);
    });
    
    localStorage.removeItem(getGameStorageKey());
    setLoading(true); // Set loading while waiting for create-game API
  };


// 🎯 CRITICAL FIX 2: handleSubmit MUST use a new backend API for checking the answer
  const handleSubmit = async () => {
    if (!currentQuestion || hasAnswered || loading) return;

    setLoading(true);

    const token = localStorage.getItem("token");
    const gameModeId = localStorage.getItem("current_game_mode_id");
    const questionNumber = currentIndex + 1;
    const numericAnswer = Number(answer);

    if (!token || !gameModeId || Number.isNaN(numericAnswer)) {
      setLoading(false);
      setError("Invalid answer or missing game context.");
      return;
    }
    
    try {
        // Send all context to the backend for checking and record creation
        const submissionRes = await fetch(`${BASE_API}/api/submit-answer/`, { 
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Token ${token}`,
            },
            body: JSON.stringify({
                game_mode_id: gameModeId,
                question_number: questionNumber,
                user_answer: numericAnswer,
                time_taken: timer,
                streak: streak,
                hint_used: hintUsed,
            }),
        });

        if (!submissionRes.ok) {
            throw new Error("Failed to submit answer to the server.");
        }

        // Backend returns: { status: 'correct'/'incorrect'/'skipped', correct_answer: 'X', final_streak: N, iq_delta: M }
        const result = await submissionRes.json();
        
        const rec = {
            question_number: questionNumber,          
            user_answer: answer || "—",
            correct_answer: result.correct_answer, // Use secure answer from backend
            question_img: currentQuestion.question_img,
            time: timer,
            streak: result.final_streak,
            status: result.status,
            iq: result.iq_delta 
        };

        const updatedRecords = [...roundRecords, rec];
        setRoundRecords(updatedRecords);
        setHasAnswered(true); 

        const nextIndex = currentIndex + 1;

        if (nextIndex >= QUESTIONS_PER_ROUND) {
            setCurrentIndex(nextIndex); 
            setCurrentQuestion(null); 
            finalizeRound(updatedRecords); 
        } else {
            // Give the user a moment to see the result, then load next
            setTimeout(() => {
                loadNextQuestion(nextIndex);
            }, 1500);
        }

    } catch (err) {
        console.error("Submission error:", err);
        setError("Failed to submit answer. Check connection.");
    } finally {
        setLoading(false);
    }
  };


// 🎯 CRITICAL FIX 3: handleNextPuzzle MUST use the same new backend API for skipping
  const handleNextPuzzle = async () => {
    if (!currentQuestion || hasAnswered || loading) return;

    setLoading(true);

    const token = localStorage.getItem("token");
    const gameModeId = localStorage.getItem("current_game_mode_id");
    const questionNumber = currentIndex + 1;

    if (!token || !gameModeId) {
      setLoading(false);
      setError("Missing game context.");
      return;
    }

    try {
        const skipRes = await fetch(`${BASE_API}/api/submit-answer/`, { 
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Token ${token}`,
            },
            body: JSON.stringify({
                game_mode_id: gameModeId,
                question_number: questionNumber,
                user_answer: "SKIPPED", // Indicate a skip
                time_taken: timer,
                streak: 0, // Streak is zeroed on skip
                hint_used: hintUsed,
            }),
        });

        if (!skipRes.ok) {
            throw new Error("Failed to submit skip action to the server.");
        }
        
        const result = await skipRes.json();
        
        const rec = {
            question_number: questionNumber,      
            user_answer: "SKIPPED",
            correct_answer: result.correct_answer, // Get correct answer for summary
            question_img: currentQuestion.question_img,
            time: timer,
            streak: 0,
            status: "skipped",
            iq: result.iq_delta,
            game_mode: gameModeId
        };
        
        const updatedRecords = [...roundRecords, rec];
        setRoundRecords(updatedRecords);
        setHasAnswered(true);

        const nextIndex = currentIndex + 1;
        
        if (nextIndex >= QUESTIONS_PER_ROUND) {
            setCurrentIndex(nextIndex); 
            setCurrentQuestion(null); 
            finalizeRound(updatedRecords); 
        } else {
            setTimeout(() => {
                loadNextQuestion(nextIndex);
            }, 500);
        }
    } catch (err) {
        console.error("Skip submission error:", err);
        setError("Failed to skip puzzle. Check connection.");
    } finally {
        setLoading(false);
    }
  };


 // --- Handle Hint Purchase (Your existing code, which was already perfect) ---
const handleHint = async () => {
  if (!currentQuestion || hintUsed) return;

  const cfg = DIFFICULTY[mode];
  const token = localStorage.getItem("token");
  const gameModeId = localStorage.getItem("current_game_mode_id");
  const questionNumber = currentIndex + 1; 

  if ((user.coins || 0) < cfg.hintCost) {
    setHintText(`INSUFFICIENT FUNDS: Need ${cfg.hintCost} 💰 to purchase hint.`);
    return;
  }
  
  try {
    const hintRes = await fetch(`${BASE_API}/api/get-hint/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Token ${token}`,
      },
      body: JSON.stringify({
        game_mode_id: gameModeId,
        question_number: questionNumber,
        rotation_index: hintRotationIndex, 
      }),
    });

    if (!hintRes.ok) {
      throw new Error("Failed to fetch hint from the server.");
    }
    
    const hintData = await hintRes.json();
    const hint = hintData.hint_text; 
    
    setHintText(hint);
    setHintRotationIndex(prev => prev + 1); 

    const updatedUser = { ...user, coins: user.coins - cfg.hintCost };
    saveUser(updatedUser);

    setHintUsed(true);

    saveGameState({
      q: currentQuestion,
      idx: currentIndex,
      records: roundRecords,
      m: mode,
      t: timer,
      hu: true, 
      ht: hint,
    });
    
    await fetch(`${BASE_API}/api/update-coins/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Token ${token}`,
      },
      body: JSON.stringify({
        amount: cfg.hintCost,   
        action: "spend",        
      }),
    });

  } catch (err) {
    console.error("Hint purchase error:", err);
    setHintText("SYSTEM ERROR: Could not generate hint. Try again later.");
  }
};
// --- Finalize Round ---
// NOTE: This function no longer posts individual records, as that's now handled 
// by submit_answer API (or skip logic). It only posts the IQ update and finalizes the UI.
 const finalizeRound = (records) => {
  const finalRecords = records || roundRecords;

  const totalStreak = finalRecords
    .filter(r => r.status !== 'summary')
    .reduce((sum, r) => sum + r.streak, 0);

  const maxPossibleStreak = MAX_STREAK * QUESTIONS_PER_ROUND;
  const iqPercent = maxPossibleStreak > 0 ? Math.round((totalStreak / maxPossibleStreak) * 100) : 0;

  const correctCount = finalRecords.filter(r => r.status === "correct").length;
  const coinsAwarded = correctCount >= 5 ? DIFFICULTY[mode].coinReward : 0; 
  
  const summaryRecord = {
    status: "summary",
    message: [
      `MISSION COMPLETE: ${correctCount}/${QUESTIONS_PER_ROUND} Sequences Decoded.`,
      coinsAwarded > 0 ? `+${coinsAwarded} COINS DEPOSITED.` : `Reward threshold (5 correct) not met.`
    ],
    coins: coinsAwarded,
    correctCount,
    iq: iqPercent
  };

  const newRoundRecords = [...finalRecords, summaryRecord];
  setRoundRecords(newRoundRecords);
  setCurrentQuestion(null); 
  setShowSummary(true); 
  setCurrentIndex(QUESTIONS_PER_ROUND); 

  if (coinsAwarded > 0) {
    const updatedUser = { ...user, coins: (user.coins || 0) + coinsAwarded };
    saveUser(updatedUser);

    const token = localStorage.getItem("token");
    fetch(`${BASE_API}/api/update-coins/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Token ${token}`,
      },
      body: JSON.stringify({
        amount: coinsAwarded,  
        action: "add",         
      }),
    });
  }

  // --- PATCH GameMode to store final IQ ---
  const token = localStorage.getItem("token");
  const gameModeId = localStorage.getItem("current_game_mode_id"); 

  if (token && gameModeId) {
    fetch(`${BASE_API}/api/update-gameMode/${gameModeId}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Token ${token}`
      },
      body: JSON.stringify({ iq: iqPercent })
    })
    .finally(() => {
        localStorage.removeItem(getGameStorageKey());
    });
  } else {
      localStorage.removeItem(getGameStorageKey());
  }
};


  const modeColor = DIFFICULTY[mode]?.color || 'text-pink-600';
  const modePillClass = DIFFICULTY[mode]?.colorClass || 'bg-pink-200/50 border-pink-500';
  const streakTextClass = streak === 0 
    ? "text-red-500" 
    : streak < MAX_STREAK 
    ? "text-orange-500" 
    : "text-green-500";

  const [previewImage, setPreviewImage] = useState(null);
  return (
    <div className="min-h-screen font-sans antialiased relative overflow-hidden">
      <style jsx global>{`
        /* --- GLOBAL GAME THEME STYLES (Rest of your existing styles) --- */
        body {
            font-family: 'Inter', sans-serif;
        }
        .game-panel {
          background: #FFFFFF;
          border: 3px solid #EC4899;
          border-radius: 1.5rem;
          box-shadow: 0 0 25px rgba(236, 72, 153, 0.3), 0 5px 15px rgba(0, 0, 0, 0.1); 
        }
        .btn {
          padding: 0.9rem 2rem;
          border-radius: 0.8rem;
          font-weight: 800;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          letter-spacing: 0.08em;
          box-shadow: 0 6px #BDBDBD, 0 0 10px rgba(0, 0, 0, 0.1); 
          cursor: pointer;
        }
        .btn:hover:not(:disabled) {
            transform: translateY(-3px);
            box-shadow: 0 8px #9E9E9E, 0 0 20px rgba(236, 72, 153, 0.5);
        }
        .btn:active:not(:disabled) {
          transform: translateY(2px);
          box-shadow: 0 3px #9E9E9E;
        }
        .btn-submit {
          background: linear-gradient(145deg, #EC4899, #F472B6); 
          color: #FFFFFF;
        }
        .btn-hint {
          background: linear-gradient(145deg, #FACC15, #FDE68A); 
          color: #374151; 
        }
        .btn-skip {
            background: linear-gradient(145deg, #D1D5DB, #E5E7EB); 
            color: #374151;
        }
        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          box-shadow: 0 4px #BDBDBD;
        }
        .answer-input {
          padding: 1.2rem;
          border-radius: 0.75rem;
          background-color: #F8FAFC; 
          color: #059669; 
          border: 3px solid #EC4899; 
          text-align: center;
          font-size: 1.75rem;
          font-family: monospace;
          box-shadow: inset 0 0 10px rgba(236, 72, 153, 0.3);
        }
        .loading-trim-box {
            position: relative;
            background-color: #f8fafc; 
            min-height: 200px;
            max-height: 350px;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
        }
        .loading-trim-box::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(236, 72, 153, 0.4), transparent); 
            transform: translateX(-100%);
            animation: trimShimmer 1.5s infinite;
        }
        @keyframes trimShimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }
      `}</style>

      {/* FIXED GAME HEADER AND COINS */}
      <header className="fixed top-0 left-0 right-0 p-4 game-header flex justify-between items-center z-20">
          <div className="text-3xl font-extrabold text-gray-800 tracking-widest uppercase">
              <span className="text-pink-600">MATH</span><span className="text-emerald-600">CRAFT</span>
          </div>
      </header>

      <main className="pt-36 px-4 sm:px-8 flex justify-center items-start min-h-screen ml-0 sm:ml-64">

        {!isInitialising && (
            <>
                {error && <div className="text-red-600 mb-4 game-panel p-3 text-center border-red-500">{error}</div>}


                {/* Start Screen - MISSION SELECTION */}
                {!currentQuestion && !showSummary && currentIndex === 0 && !loading && (
                <section className="game-panel p-10 mb-6 text-center">
                    <h1 className="text-4xl font-extrabold text-gray-800 mb-6 tracking-wider">
                    <span className="text-emerald-600">Select</span> Mode
                    </h1>
                    <p className="text-gray-600 mb-8 max-w-lg mx-auto text-lg">
                    Choose your challenge threat level. Decode 5 or more sequences to earn your coin reward.
                    </p>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                    <select
    value={mode}
    onChange={(e) => setMode(e.target.value)}
    className="rounded-xl p-3 bg-gray-50 text-gray-800 border-4 border-pink-500 text-sm sm:text-base shadow-inner w-full max-w-xs mx-auto appearance-none focus:outline-none"
    style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
>
                        <option value="easy">Easy (90s, +1000 coins)</option>
<option value="intermediate">Intermediate (60s, +2000 coins)</option>
<option value="hard">Hard (30s, +3000 coins)</option>
                    </select>
                    <button className="btn btn-submit w-full max-w-xs mx-auto md:w-auto shadow-pink-600/50 shadow-lg text-sm sm:text-base whitespace-nowrap px-6 py-3" onClick={startRound}>
    Execute Challenge
</button>
                    </div>
                </section>
                )}

                {/* Game Screen - ACTIVE PUZZLE */}
            {(currentQuestion || loading) && !showSummary && (
            <div className="flex flex-col items-center w-full">
                
                {/* Stats Bar on Top */}
              <div className="w-full max-w-3xl mb-6 text-gray-800 p-4 game-panel border-t-4 border-pink-600 shadow-none flex flex-col sm:flex-row sm:justify-around gap-2 sm:gap-4 text-center">
  <div className="text-sm sm:text-lg font-semibold flex items-center justify-between sm:justify-center w-full sm:w-auto px-2">
      Mode: <span className={`${modeColor} font-extrabold ml-2 border px-3 py-1 rounded-full ${modePillClass}`}>{mode}</span>
  </div>
  <div className="text-sm sm:text-lg font-semibold text-gray-600 flex items-center justify-between sm:justify-center w-full sm:w-auto px-2">
      Puzzle: <span className="text-gray-900 font-extrabold ml-2">{currentIndex + 1} / {QUESTIONS_PER_ROUND}</span>
  </div>
  <div className="text-sm sm:text-lg font-semibold text-gray-600 flex items-center justify-between sm:justify-center w-full sm:w-auto px-2">
      Streak: <span className={`font-extrabold ${streakTextClass} ml-2 text-2xl`}>{streak}x</span>
  </div>
  <div className="text-sm sm:text-lg font-semibold text-gray-600 flex items-center justify-between sm:justify-center w-full sm:w-auto px-2">
      Time: <span className="font-extrabold text-cyan-600 ml-2">{timer}s</span>
  </div>
</div>

                {/* Game Section Below */}
                <section className="game-panel p-6 sm:p-10 flex flex-col gap-8 w-full max-w-3xl">
                <div 
                    key={questionId} 
                    className={`flex flex-col items-center justify-center fade-in ${loading ? 'opacity-100' : 'opacity-100'}`}
                >
                    <div className={`border-4 border-emerald-500 p-3 bg-white rounded-xl shadow-2xl shadow-emerald-500/30 mb-8 w-full max-w-lg mx-auto loading-trim-box h-[300px]`}>
                    {loading ? (
                        <div className="text-xl text-pink-600 animate-pulse p-10 tracking-widest text-center">...Transmitting Data Sequence...</div>
                    ) : (
                        currentQuestion && (
                        <img
                            src={currentQuestion.question_img}
                            alt={`Puzzle ${currentIndex + 1}`}
                            className="w-auto h-auto max-h-[300px] rounded-lg mx-auto"
                            onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/400x150/f0f3f7/EC4899?text=DATA+CORRUPTION" }}
                        />
                        )
                    )}
                    </div>

                    <div className="flex justify-center mb-6 w-full">
                    <input
                        type="number"
                        placeholder="INPUT SOLUTION..."
                        className="answer-input w-full max-w-md"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                        disabled={loading}
                        autoFocus
                    />
                    </div>

                    <div className="flex gap-4 justify-center flex-wrap w-full mt-2">
                    <button className="btn btn-submit shadow-pink-600/40 shadow-xl" onClick={handleSubmit} disabled={loading || !answer}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        Submit
                    </button>

                    <button 
                        className="btn btn-hint shadow-yellow-600/40 shadow-xl" 
                        onClick={handleHint} 
                        disabled={loading || hintUsed || user.coins < DIFFICULTY[mode].hintCost}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-1" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.81 2.031a1 1 0 00-.36 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.81-2.031a1 1 0 00-1.175 0l-2.81 2.031c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.361-1.118L2.05 8.72a1 1 0 01.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        Purchase Hint ({DIFFICULTY[mode].hintCost})
                    </button>

                    <button className="btn btn-skip shadow-gray-400/50 shadow-xl" onClick={handleNextPuzzle} disabled={loading}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" /><path fillRule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                        Next Puzzle
                    </button>
                    </div>
                    
                    {hintText && (
                    <div className="text-gray-700 mt-6 p-4 bg-yellow-100/70 rounded-lg border-2 border-yellow-500 font-mono text-center text-sm sm:text-base shadow-lg shadow-yellow-500/50">
                        {hintText}
                    </div>
                    )}
                </div>
                </section>
            </div>
            )}


                {/* ────────────────────────────────────────────────────────────────
     SUMMARY SCREEN – RESPONSIVE TABLE / CARD LAYOUT (JSX only)
   ──────────────────────────────────────────────────────────────── */}
{showSummary && (
  <section className="game-panel p-6 sm:p-8">

    {/* Title */}
    <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center uppercase tracking-wider text-pink-600">
      <span className="text-emerald-600">Summary</span>
    </h2>

     {/* FINAL MISSION RESULT CARD – LIGHT GREEN IF REWARD, LIGHT RED IF NOT */}
{roundRecords.length > 0 && roundRecords[roundRecords.length - 1].status === "summary" && (
  <div
    className={`
      mx-auto max-w-2xl p-5 sm:p-7 rounded-2xl border-4 shadow-xl
      text-center font-bold text-lg sm:text-xl
      ${roundRecords[roundRecords.length - 1].coins > 0
        ? "bg-gradient-to-br from-green-50 to-green-100 border-green-300 shadow-green-400/30 text-green-700"
        : "bg-gradient-to-br from-red-50 to-red-100 border-red-300 shadow-red-400/30 text-red-700"
      }
    `}
  >
    {/* Status Title */}
    <p className="text-2xl sm:text-3xl mb-3 text-gray-900 font-extrabold tracking-wide">
      {roundRecords[roundRecords.length - 1].coins > 0 ? "Status: Reward Granted" : "Status: Complete"}
    </p>

    {/* Mission Summary */}
    <p className="mb-3 text-base sm:text-lg text-gray-700">
      Mission Complete: {roundRecords[roundRecords.length - 1].correctCount}/{QUESTIONS_PER_ROUND} Sequences Decoded.
    </p>

    {/* Reward Line – LIGHT GREEN or LIGHT RED */}
    <p
      className={`
        text-lg sm:text-xl font-bold tracking-wider
        ${roundRecords[roundRecords.length - 1].coins > 0
          ? "text-green-600"
          : "text-red-600"
        }
      `}
    >
      {roundRecords[roundRecords.length - 1].coins > 0
        ? `+${roundRecords[roundRecords.length - 1].coins} COINS DEPOSITED`
        : "Reward threshold (5 correct) not met."
      }
    </p>
  </div>
)}

    <h3 className="text-xl font-semibold text-gray-600 mb-4 border-b border-gray-300 pb-2 mt-6 tracking-wider">
      Sequence Log
    </h3>

    {/* ────── RESPONSIVE CONTAINER ────── */}
    <div className="w-full overflow-x-auto sm:overflow-visible">

      {/* ---------- DESKTOP TABLE (≥640px) ---------- */}
      <table className="hidden sm:table min-w-full table-auto border-collapse text-xs sm:text-sm">
        <thead>
          <tr className="bg-gray-100 uppercase text-[10px] sm:text-xs">
            <th className="p-3 font-medium">Q No</th>
            <th className="p-3 font-medium">Image</th>
            <th className="p-3 font-medium">Time (s)</th>
            <th className="p-3 font-medium">Streak</th>
            <th className="p-3 font-medium">Your Input</th>
            <th className="p-3 font-medium">Correct Answer</th>
            <th className="p-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {roundRecords
            .filter(r => r.status !== "summary")
            .map((r, i) => (
              <tr
                key={i}
                className={`text-center transition-colors ${
                  r.status === "correct"
                    ? "bg-green-50/50 hover:bg-green-100"
                    : r.status === "skipped"
                    ? "bg-yellow-50/50 hover:bg-yellow-100"
                    : "bg-red-50/50 hover:bg-red-100"
                }`}
              >
                <td className="p-3">{r.question_number}</td>
                <td className="p-3">
                  <img
                    src={r.question_img}
                    alt={`Q${r.question_number}`}
                    className="w-16 h-16 object-contain mx-auto rounded-lg border border-gray-300 cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => setPreviewImage(r.question_img)}
                    onError={e => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "https://placehold.co/80x80/f0f3f7/EC4899?text=NA";
                    }}
                  />
                </td>
                <td className="p-3 text-cyan-600">{r.time}</td>
                <td className="p-3 text-pink-600">{r.streak}</td>
                <td className="p-3 font-mono">{r.user_answer}</td>
                <td className="p-3 font-mono">{r.correct_answer}</td>
                <td
                  className={`p-3 font-bold ${
                    r.status === "correct"
                      ? "text-green-600"
                      : r.status === "skipped"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {r.status === "correct" ? "PASS" : r.status === "skipped" ? "SKIP" : "FAIL"}
                </td>
              </tr>
            ))}
        </tbody>
      </table>

{/* ---------- MOBILE CARD LIST (<640px) ---------- */}
<div className="sm:hidden space-y-4">
  {roundRecords
    .filter(r => r.status !== "summary")
    .map((r, i) => (
      <div
        key={i}
        className={`p-4 rounded-lg border-2 ${
          r.status === "correct"
            ? "bg-green-50 border-green-400"
            : r.status === "skipped"
            ? "bg-yellow-50 border-yellow-400"
            : "bg-red-50 border-red-400"
        }`}
      >
        {/* Q# + Status */}
        <div className="flex justify-between items-center mb-2">
          <span className="font-bold text-gray-800">Q{r.question_number}</span>
          <span
            className={`font-bold ${
              r.status === "correct"
                ? "text-green-600"
                : r.status === "skipped"
                ? "text-yellow-600"
                : "text-red-600"
            }`}
          >
            {r.status === "correct" ? "PASS" : r.status === "skipped" ? "SKIP" : "FAIL"}
          </span>
        </div>

        {/* Image – scrollable if needed */}
        <div className="overflow-x-auto -mx-4 px-4 mb-3">
          <img
            src={r.question_img}
            alt={`Q${r.question_number}`}
            className="h-24 w-auto max-w-none mx-auto rounded border border-gray-300 cursor-pointer"
            onClick={() => setPreviewImage(r.question_img)}
            onError={e => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "https://placehold.co/80x80/f0f3f7/EC4899?text=NA";
            }}
          />
        </div>

        {/* Text data – 2-column grid */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="font-bold text-gray-600">Time</span>
            <p className="font-bold text-cyan-600">{r.time}s</p>
          </div>
          <div>
            <span className="font-bold text-gray-600">Streak</span>
            <p className="font-bold text-pink-600">{r.streak}</p>
          </div>
          <div>
            <span className="font-bold text-gray-600">Your Input</span>
            <p className="font text-gray-800">
              {/* Lower-case only for SKIPPED */}
              {r.status === "skipped" ? r.user_answer.toLowerCase() : r.user_answer}
            </p>
          </div>
          <div>
            <span className="font-bold text-gray-600">Correct</span>
            <p className="font-bold text-emerald-600">{r.correct_answer}</p>
          </div>
        </div>
      </div>
    ))}
</div>
    </div>

    {/* Restart button */}
    <div className="flex justify-center mt-8">
      <button
        className="btn btn-submit text-xl shadow-pink-600/50 shadow-xl"
        onClick={restartToModeSelection}
      >
        Select New Mode
      </button>
    </div>

    {/* IQ badge */}
    {roundRecords.length > 0 && roundRecords[roundRecords.length - 1].status === "summary" && (
      <div className="mt-6 mx-auto max-w-sm p-6 bg-gradient-to-r from-pink-500 to-rose-400 text-white rounded-2xl shadow-2xl shadow-pink-500/50 animate-pulse text-center font-extrabold text-2xl">
        Score: {roundRecords[roundRecords.length - 1].iq}%
      </div>
    )}
  </section>
)}
            </>
        )}
      </main>
      
      {/* IMAGE PREVIEW MODAL */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            alt="Preview"
            className="max-h-[90%] max-w-[90%] rounded-xl shadow-2xl border-4 border-pink-500"
          />
        </div>
      )}
    </div>
  );
}