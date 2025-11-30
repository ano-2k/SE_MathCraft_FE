import React, { useEffect, useState, useRef } from "react"; 
import Footer from "../components/Footer.jsx";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx"; 

import { FaUser,FaHome,FaChartBar,FaTrophy,FaRocket,FaStar, FaCrown,FaBrain, FaCoins, FaLevelUpAlt, FaMedal,FaCog, FaFileAlt,FaStopwatch,FaLightbulb,FaBullseye,FaSignal,FaChartLine, FaGlobe, FaFire, FaCalendarAlt ,FaGift} from "react-icons/fa"; 
import { GiPartyPopper } from "react-icons/gi";

const customStyles = `
/* CSS for Fade In */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* CSS for Floating Numbers (Simple CSS animation) */
@keyframes float {
    0% { transform: translate(0, 0) rotate(0deg); opacity: 0.5; }
    50% { transform: translate(10px, -10px) rotate(5deg); opacity: 0.7; }
    100% { transform: translate(0, 0) rotate(0deg); opacity: 0.5; }
}

.floating-number {
    animation: float 10s ease-in-out infinite;
    position: absolute; 
    pointer-events: none;
    font-size: 4rem;
    font-weight: bold;
    color: #f472b6; 
    opacity: 0.5;
    z-index: 0;
}

/* Base glow effect */
.glow-hover {
  transition: box-shadow 0.3s ease-in-out, transform 0.3s ease;
}
.glow-hover:hover {
  box-shadow: 0 0 20px rgba(236, 72, 153, 0.8), 0 0 8px rgba(236, 72, 153, 0.4);
}

.animate-bounce-slow {
  animation: slowBounce 3s infinite ease-in-out;
}
@keyframes slowBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

/* Unique Hover Effect for Feature Cards */
.feature-card-hover {
    transition: all 0.3s ease-out;
}
.feature-card-hover:hover {
    transform: scale(1.03) translateY(-5px);
    box-shadow: 0 20px 40px rgba(236, 72, 153, 0.3);
}

/* Style for the nested individual feature cards */
.nested-feature-card {
    padding: 1.5rem;
    background: #ffffff;
    border-radius: 1rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transition: all 0.2s ease-out;
    border-left: 5px solid #EC4899;
}
.nested-feature-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 15px rgba(236, 72, 153, 0.3);
    border-left: 5px solid #9333ea;
}

/* Mobile Menu Animation (Now handled in Navbar.jsx CSS, but kept here for customStyles) */
@keyframes fadeInDown {
  0% { opacity: 0; transform: translateY(-10px); }
  100% { opacity: 1; transform: translateY(0); }
}

.animate-fadeInDown {
  animation: fadeInDown 0.3s ease-out forwards;
}
`;

const ScrollReveal = ({ children, delay = 0 }) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => observer.disconnect();
  }, []);

  const transitionDelay = `${delay}ms`;
  const baseStyle = { 
    opacity: isVisible ? 1 : 0, 
    transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
    transition: `opacity 0.8s ease-out ${transitionDelay}, transform 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${transitionDelay}`,
  };

  return (
    <div ref={ref} style={baseStyle}>
      {children}
    </div>
  );
};

const Home = () => {

  const navigate = useNavigate();
  
  const gameModeContent = {
    title: "Game Modes and Rewards",
    sections: [
      { mode: "Easy Mode", icon: <FaRocket className="text-blue-500" />, threshold: "90 seconds", reward: "+1000 Coins", cost: "100 Coins", detail: "A great starting point to learn patterns and earn foundational coins. Time is generous, but the streak mechanic still requires focus." },
      { mode: "Intermediate Mode", icon: <FaStar className="text-yellow-500" />,  threshold: "60 seconds", reward: "+2000 Coins", cost: "200 Coins", detail: "The balanced challenge for steady progress. Faster reaction times are needed to maintain streaks and maximize your Score gain." },
      { mode: "Hard Mode", icon: <FaCrown className="text-red-600" />,  threshold: "30 seconds", reward: "+3000 Coins", cost: "300 Coins", detail: "The ultimate test of speed and skill. Strict time limits demand instant logic processing for the highest rewards and leaderboard placement." },
    ],
    bonus: "Each game round consists of 10 sequence puzzles. You must correctly decode 5 or more sequences to earn the coin reward." 
  };
  
  const levelRuleCard = {
    icon: <FaLevelUpAlt className="text-pink-600" />,
    title: "⭐ The Level Progression System",
    detail: "Answer 5 or more questions correctly in any mode (Easy, Intermediate, or Hard) to earn a success streak. Complete 5 streaks to reach the next level!",
    gradient: "from-pink-100 to-rose-100", 
    border: "border-pink-500",
    textColor: "text-pink-700",
  };

  const dashboardFeatures = [
      { icon: <FaBrain className="text-purple-600" />,  name: "Overall Score & Accuracy", detail: "Monitor your aggregate Score, which represents your intellectual ranking across all difficulties, alongside your lifetime accuracy and total puzzles solved.", color: "bg-teal-50" },
      { icon: <FaCoins className="text-orange-500" />,  name: "Coin Ledger Tracking", detail: "View your total earned coins and total spent coins. This ledger is updated in real-time as you buy hints or earn rewards.", color: "bg-yellow-50" },
      { icon: <FaMedal className="text-yellow-600" />,  name: "Peak Metrics & History", detail: "Review your personal bests, including your longest combo streak, fastest puzzle time, highest mode mastery, and the recent game activity log stream.", color: "bg-purple-50" },
      { icon: <FaTrophy className="text-green-600" />,  name: "Leaderboard Access", detail: "See your rank and the global top players in Easy, Intermediate, and Hard modes, driving competitive engagement.", color: "bg-red-50" }
  ];

  const profileFeatures = [
      { icon: <FaCog className="text-gray-500" />,  name: "Account Management", detail: "Use Edit Mode to update your username, email, and upload a custom profile photo.", color: "bg-blue-50" },
      { icon: <FaFileAlt className="text-cyan-600" />,  name: "Performance Snapshot", detail: "A static record of your current Overall Score, Total Missions solved, Accuracy percentage, Coins balance, and Join Date.", color: "bg-indigo-50" },
      { icon: <FaStar className="text-pink-500" />, name: "Achievement List", detail: "Displays a simple list of all the achievement badges you have successfully unlocked.", color: "bg-pink-50" },
      { icon: <FaCalendarAlt className="text-green-600" />, name: "Join Date & Logout", detail: "View your official join date and quickly access the logout function to secure your session.", color: "bg-green-50" }
  ];

  const mechanicsContent = [
      { icon: <FaStopwatch className="text-orange-500" />,  name: "Dynamic Streak System", detail: 'Your combo streak starts at 5x and decreases by 1 for every time threshold passed (e.g., every 30s in Hard mode). The final streak is critical for your end-of-round Score calculation.' },
      { icon: <FaLightbulb className="text-yellow-500" />,  name: "Strategic Hint Purchase", detail: 'Hints are available once per question. The coin cost is automatically deducted from your balance (100, 200, or 300 coins depending on mode).' },
      { icon: <FaBrain className="text-purple-600" />, name: "Score Calculation", detail: 'Your round Score is determined by the total streak accumulated across all 10 puzzles compared to the maximum possible streak (50), rewarding both accuracy and speed.' },
      { icon: <FaBullseye className="text-green-600" />,  name: "Answer Submission", detail: 'When you submit your answer, the system validates it, determines the status (Correct, Incorrect, or Skipped), and calculates the streak and Score update for that puzzle.' }
  ];

  const achievementsFeatures = [
      { icon: <FaMedal className="text-red-500" />,  name: "Six Unlockable Badges", detail: "Earn prestige titles like 'Code Crusader' (100 puzzles solved) and 'Master Calibrator' (Best Score of 100).", color: "bg-yellow-50" },
      { icon: <FaSignal className="text-cyan-500" />,  name: "Progress Visuals", detail: "Track your progress toward goals with dynamic progress bars, showing current vs. target progress for milestones like the Apex Challenger.", color: "bg-green-50" },
      { icon: <GiPartyPopper className="text-pink-500" />, name: "Dynamic Celebrations", detail: "Newly unlocked badges trigger a visible animation and celebration for a rewarding experience, ensuring you notice your accomplishments.", color: "bg-pink-50" }
  ];

  const graphFeatures = [
      { icon: <FaChartLine className="text-purple-500" />,  name: "Score Evolution", detail: "See your Score trend line over your last 10 games, plotting your intellectual growth.", color: "bg-purple-50" },
      { icon: <FaGlobe className="text-blue-500" />, name: "Mode Engagement", detail: "Visualize the distribution of your games played across Easy, Intermediate, and Hard modes with a doughnut chart.", color: "bg-cyan-50" },
      { icon: <FaFire className="text-red-500" />, name: "Game Performance", detail: "A bar chart detailing your total streak per game for the last 10 rounds, color-coded by difficulty mode.", color: "bg-red-50" },
      { icon: <FaCalendarAlt className="text-green-500" />,  name: "Monthly Score", detail: "Track your average Score performance across recent months using a horizontal bar chart.", color: "bg-orange-50" }
  ];

  const startJourneyContent = {
    title: "Join the Elite Ranks Today",
    text: "Every new player receives 5000 complimentary coins to start their adventure. Use this initial funding wisely to purchase hints and climb the global leaderboards.",
    cta: "Decode sequences. Claim glory.",
  };

  const floatingNumbers = [
    { top: "15%", left: "10%", val: 3, delay: "0s" },  
    { top: "15%", right: "10%", val: '-', delay: "1s" }, 
    { top: "5%", right: "25%", val: 6, delay: "2s" },  
    { top: "65%", left: "15%", val: 5, delay: "3s" }, 
    { top: "5%", left: "35%", val: '+', delay: "4s" }, 
  ];

  const handleLearnMore = () => {
    const challengeSection = document.getElementById('main-features');
    if (challengeSection) {
      const navbarHeight = 64; 
      const top = challengeSection.getBoundingClientRect().top + window.scrollY - navbarHeight;
      window.scrollTo({
        top,
        behavior: 'smooth'
      });
    }
  };

  const WrapperCard = ({ icon, name, color, children, delay }) => (
    <ScrollReveal delay={delay}>
      <div className={`p-4 rounded-2xl shadow-xl bg-white transition duration-300 border-t-8 ${color} transform feature-card-hover h-full`}>
        <div className="flex items-center space-x-3 mb-4 border-b border-gray-200 pb-3">
          <span className="text-4xl text-pink-600">{icon}</span>
          <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900">{name}</h3>
        </div>
        <div className="space-y-4">
          {children}
        </div>
      </div>
    </ScrollReveal>
  );

  const DetailCard = ({ icon, name, detail, color, delay }) => (
    <ScrollReveal delay={delay}>
      <div className={`nested-feature-card ${color} hover:shadow-lg transition duration-200`}>
          <p className="text-base sm:text-lg font-bold text-pink-700 mb-1 flex items-center space-x-2">
            <span className="text-xl text-purple-600">{icon}</span> 
            <span>{name}</span>
          </p>
          <p className="text-sm sm:text-base font-medium text-gray-600">{detail}</p>
      </div>
    </ScrollReveal>
  );
  
  const PointCard = ({ icon, name, detail, delay }) => (
    <ScrollReveal delay={delay}>
      <div className="p-6 bg-white rounded-xl shadow-2xl border-l-8 border-pink-600 feature-card-hover flex items-start space-x-4 h-full">
        <span className="text-4xl flex-shrink-0 mt-0.5">{icon}</span>
        <div>
          <p className="text-xl font-bold text-gray-800 mb-1">{name}:</p>
          <p className="text-gray-600 text-base">{detail}</p>
        </div>
      </div>
    </ScrollReveal>
  );

  const handleRegisterClick = () => {
    navigate("/login-register?tab=signup");
  }


  return (
    <div className="min-h-screen relative overflow-x-hidden bg-gradient-to-br from-white via-pink-100 to-pink-200">
      
      <style>{customStyles}</style>
      <Navbar /> 
      <div className="absolute inset-0 pointer-events-none w-full h-full">
        {floatingNumbers.map((n, i) => (
          <div
            key={i}
            className="floating-number"
            style={{
              top: n.top || "auto",
              left: n.left || "auto",
              right: n.right || "auto",
              bottom: n.bottom || "auto",
              animationDelay: n.delay,
            }}
          >
            {n.val}
          </div>
        ))}
      </div>

      {/* --- HERO SECTION (Smooth Fade-In) --- */}
      <section className="w-full h-screen flex flex-col justify-center text-center px-4 sm:px-8 relative z-10 pt-16">
        <h1 className="text-4xl sm:text-6xl font-bold text-pink-700 mb-4" style={{ animation: "fadeIn 0.8s ease-out 0s forwards", opacity: 0 }}>
          Welcome to MathCraft: The Sequence Decoders
        </h1>
        <p className="text-xl sm:text-3xl text-pink-600 mb-6" style={{ animation: "fadeIn 0.8s ease-out 0.2s forwards", opacity: 0 }}>
          Challenge your logical intelligence with complex mathematical pattern puzzles.
        </p>
        <p className="text-gray-700 mb-8" style={{ animation: "fadeIn 0.8s ease-out 0.4s forwards", opacity: 0 }}>
          Your mission is to analyze visual sequences and input the correct numerical solution to earn coins and boost your Overall Score.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
                onClick={() => navigate("/login-register?tab=login")} 
                className="px-8 py-3 bg-pink-500 text-white font-semibold rounded-lg shadow-lg transition glow-hover" 
                style={{ animation: "fadeIn 0.8s ease-out 0.6s forwards", opacity: 0 }}
            >
              Start Decoding
            </button>
            <button 
              onClick={handleLearnMore} 
              className="relative z-20 px-8 py-3 bg-pink-500 text-white font-semibold rounded-lg shadow-lg transition glow-hover"
              style={{ animation: "fadeIn 0.8s ease-out 0.8s forwards", opacity: 0 }}
            >
              Deep Dive Mechanics
            </button>
        </div>
      </section>

      <main id="main-features" className="w-full bg-white relative z-20 shadow-inner-top"> 

          <section className="py-20 px-4 sm:px-8">
            <div className="max-w-6xl mx-auto w-full">
              <ScrollReveal>
                <h2 className="text-4xl font-bold text-pink-700 mb-12 border-b-4 border-pink-500 pb-2 text-center">
                  {gameModeContent.title}
                </h2>
              </ScrollReveal>
              
              <div className="grid md:grid-cols-3 gap-8 text-center mb-12">
                {gameModeContent.sections.map((c, i) => (
                  <ScrollReveal key={i} delay={i * 200}>
                    {/* Mode Card Design */}
                    <div className="p-8 rounded-2xl shadow-xl bg-white transition duration-300 border-t-8 border-pink-500 transform feature-card-hover h-full">
                        <div className="flex flex-col items-center">
                            <span className="text-5xl text-pink-600 mb-3 animate-bounce-slow">{c.icon}</span> 
                            <h3 className="text-2xl font-extrabold text-gray-900 mb-2">{c.mode}</h3>
                            <div className="w-1/4 h-1 bg-pink-300 mb-4 rounded-full"></div>
                            <p className="text-pink-700 text-lg flex items-center font-semibold">
  <span className="text-xl mr-2 text-yellow-500"><FaStopwatch /></span> Threshold: {c.threshold}
</p>

<p className="text-gray-800 text-xl font-bold flex items-center">
  <span className="text-xl mr-2 text-green-500"><FaGift /></span> Coin Reward: {c.reward}
</p>

                            <p className="text-gray-500 text-sm font-medium mt-4">{c.detail}</p>
                        </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
              <ScrollReveal delay={600}>
                <p className="text-center text-xl p-6 bg-pink-50 rounded-xl shadow-inner border-l-4 border-pink-500 font-semibold text-gray-700">
                  {gameModeContent.bonus}
                </p>
              </ScrollReveal>
              <ScrollReveal delay={800}>
                  <div className={`mt-8 max-w-2xl mx-auto p-6 bg-gradient-to-r ${levelRuleCard.gradient} rounded-2xl shadow-2xl border-4 ${levelRuleCard.border} transform feature-card-hover`}>
                      <h3 className={`text-xl sm:text-2xl font-extrabold ${levelRuleCard.textColor} mb-2 flex items-center justify-center space-x-3`}>
                          <span className="text-3xl"><FaLevelUpAlt className="text-pink-600" /></span>
                          <span>{levelRuleCard.title}</span>
                      </h3>
                      <p className="text-base sm:text-lg font-semibold text-gray-700">
                          {levelRuleCard.detail}
                      </p>
                  </div>
              </ScrollReveal>
            </div>
          </section>
          <section className="py-20 px-4 sm:px-8 bg-pink-50 border-t border-gray-200">
            <div className="max-w-6xl mx-auto w-full">
              <ScrollReveal>
                <h2 className="text-4xl font-bold text-pink-700 mb-12 border-b-4 border-pink-500 pb-2 text-center">
                  The Agent Hub: Dashboard and Profile
                </h2>
              </ScrollReveal>
              
              <div className="grid md:grid-cols-2 gap-8">
                <WrapperCard icon={<FaHome />}  name="Dashboard: Mission Control" color="border-purple-500" delay={100}>
                    <div className="space-y-4">
                        {dashboardFeatures.map((f, i) => (
                            <DetailCard 
                                key={i} 
                                icon={f.icon} 
                                name={f.name} 
                                detail={f.detail} 
                                color={f.color}
                                delay={i * 50} 
                            />
                        ))}
                    </div>
                </WrapperCard>
                <WrapperCard icon={<FaUser />} name="Profile: Personal Records" color="border-pink-500" delay={300}>
                    <div className="space-y-4">
                        {profileFeatures.map((f, i) => (
                            <DetailCard 
                                key={i} 
                                icon={f.icon} 
                                name={f.name} 
                                detail={f.detail} 
                                color={f.color}
                                delay={i * 50} 
                            />
                        ))}
                    </div>
                </WrapperCard>
              </div>
            </div>
          </section>

          <section className="py-20 px-4 sm:px-8">
            <div className="max-w-6xl mx-auto w-full">
              <ScrollReveal>
                <h2 className="text-4xl font-bold text-pink-700 mb-12 border-b-4 border-pink-500 pb-2 text-center">
                  Core Mechanics: Streak, Score, and Progression
                </h2>
              </ScrollReveal>

              <div className="grid md:grid-cols-2 gap-8">
                {mechanicsContent.map((p, i) => (
                  <PointCard 
                    key={i} 
                    icon={p.icon} 
                    name={p.name} 
                    detail={p.detail} 
                    delay={i * 150} 
                  />
                ))}
              </div>
            </div>
          </section>
          <section className="py-20 px-4 sm:px-8 bg-pink-50 border-t border-gray-200">
            <div className="max-w-6xl mx-auto w-full">
              <ScrollReveal>
                <h2 className="text-4xl font-bold text-pink-700 mb-12 border-b-4 border-pink-500 pb-2 text-center">
                  Milestones and Analytics
                </h2>
              </ScrollReveal>
              
              <div className="grid md:grid-cols-2 gap-8">
                <WrapperCard icon={<FaTrophy />}  name="Achievements: Badge Tracking" color="border-yellow-500" delay={100}>
                    <div className="space-y-4">
                        {achievementsFeatures.map((f, i) => (
                            <DetailCard 
                                key={i} 
                                icon={f.icon} 
                                name={f.name} 
                                detail={f.detail} 
                                color={f.color}
                                delay={i * 50} 
                            />
                        ))}
                    </div>
                </WrapperCard>
                <WrapperCard icon={<FaChartBar />}  name="Graph: Performance Deep Dive" color="border-teal-500" delay={300}>
                    <div className="space-y-4">
                        {graphFeatures.map((f, i) => (
                            <DetailCard 
                                key={i} 
                                icon={f.icon} 
                                name={f.name} 
                                detail={f.detail} 
                                color={f.color}
                                delay={i * 50} 
                            />
                        ))}
                    </div>
                </WrapperCard>
              </div>
            </div>
          </section>
          <section id="start-journey" className="py-20 px-4 sm:px-8 flex flex-col justify-center border-t border-gray-100 bg-white">
            <div className="max-w-6xl mx-auto w-full text-center">

              <ScrollReveal delay={200}>
                <h2 className="text-5xl font-extrabold text-pink-700 mb-6">
                  {startJourneyContent.title}
                </h2>
              </ScrollReveal>
              <ScrollReveal delay={400}>
                <p className="text-2xl text-gray-700 mb-10 max-w-2xl mx-auto">
                  {startJourneyContent.text}
                </p>
              </ScrollReveal>
              <ScrollReveal delay={600}>
                <p className="text-4xl font-extrabold text-pink-500 mb-12 animate-pulse">
                  {startJourneyContent.cta}
                </p>
              </ScrollReveal>
              <div className="flex justify-center">
                <ScrollReveal delay={800}>
                  <button onClick={handleRegisterClick} className="px-12 py-5 bg-pink-600 text-white font-extrabold text-xl rounded-full shadow-2xl transition hover:bg-pink-700 glow-hover animate-bounce-slow">
                    Begin Your Adventure!
                  </button>
                </ScrollReveal>
              </div>
            </div>
          </section>
      </main>


      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;