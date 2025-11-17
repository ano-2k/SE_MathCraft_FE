import React, { useEffect, useState } from "react";
import Footer from "../components/Footer.jsx";
import { useNavigate } from "react-router-dom";
// --- Custom Styles to replace App.css and ensure animations work ---
const customStyles = `
/* Custom CSS for Animations and Scroll Reveal */
.animate-fade-in {
  animation: fadeIn 0.8s ease-out forwards;
  opacity: 0;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

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

/* Scroll Reveal */
.scroll-reveal-item {
    opacity: 0;
    transform: translateY(30px);
    transition: all 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94); /* smoother transition */
}
.scroll-reveal-item.is-visible {
    opacity: 1;
    transform: translateY(0);
}

/* Custom shadow for the main content to pop slightly */
.shadow-inner-top {
    box-shadow: 0 -10px 20px -5px rgba(0, 0, 0, 0.1);
}
`;

// --- Component for Scroll Reveal ---
const ScrollReveal = ({ children, delay = 0 }) => (
  <div 
    className="scroll-reveal-item"
    style={{ transitionDelay: `${delay}ms` }}
  >
    {children}
  </div>
);

const Home = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  // --- Content Definitions for Scrollable Sections ---
  const challengeContent = {
    title: "The Challenge: Choose Your Mission",
    sections: [
      { mode: "Easy Mode", icon: '🚀', time: "90 seconds per puzzle ⏱️", reward: "+500 coins 💰" },
      { mode: "Intermediate Mode", icon: '🌟', time: "60 seconds per puzzle ⏱️", reward: "+1000 coins 💰" },
      { mode: "Hard Mode", icon: '👑', time: "30 seconds per puzzle ⏱️", reward: "+2000 coins 💰" },
    ],
    bonus: "Solve 5 or more puzzles in a single round to boost your streaks, earn extra coins, and rise as a Master Codebreaker."
  };

  const dashboardContent = {
    title: "Your Dashboard Awaits: Command Center",
    stats: [
        { icon: '🧠', title: "Monthly IQ Summary", description: "Track your intellectual growth, identify peak performance days, and compare monthly results." },
        { icon: '📊', title: "Quick Stats & History", description: "View your last 5 game scores, track wins/losses, and analyze time-per-puzzle metrics." },
        { icon: '🏆', title: "Total Milestones", description: "Review your lifetime achievements, including Total Games Played, your Highest Streak achieved, and your All-Time Best IQ Score." },
    ],
    motto: "Your dashboard keeps you motivated, showing exactly how far your brainpower has taken you."
  };
  
  const mechanicsContent = {
    title: "How MathCraft Works: The Mechanics Explained",
    points: [
      { icon: '🍌', detail: 'The Code Challenge: Your goal is to solve the complex number grid or equation in the image to determine the numerical value of the **Banana Symbol**.' },
      { icon: '💡', detail: 'Hint System & Coin Cost: You can use **one hint per question**. The cost is deducted from your coin balance: Easy (100 coins), Intermediate (200 coins), Hard (300 coins).' },
      { icon: '⏱️', detail: 'Strict Time Limits: Each game mode enforces a time limit (30, 60, or 90 seconds). This encourages quick, intuitive logic and sharpens your mental calculation skills.' },
      { icon: '📈', detail: 'IQ Score Tracking: Your IQ score is calculated based on accuracy, speed, and the difficulty mode you choose. Higher scores unlock prestige levels and exclusive achievements.' },
      { icon: '🥇', detail: 'Streak Multipliers: Completing puzzles consecutively without errors earns you streak multipliers, which significantly boost your coin rewards and ranking points.' },
    ]
  };

  const exploreContent = {
    title: "Explore the World of MathCraft",
    pages: [
      "Head to the Game Page to begin your next challenge and collect coins as you conquer puzzles.",
      "Earn epic badges on the Achievements Page.",
      "Visualize your growth on the Graph Page.",
      "Personalize your experience through the Profile Page.",
    ],
    motto: "Every victory, every streak, every badge tells your story — the story of a true number warrior."
  };

  const startJourneyContent = {
    title: "Start Your Journey Today",
    text: "Begin your adventure with 1000 complimentary coins in your account. Play smart, think fast, and climb the ranks to claim your spot among the greatest codebreakers of MathCraft.",
    cta: "Crack the code. Claim the glory.",
  };
  // --- End Content Definitions ---


  // --- Floating Numbers & Symbols (Updated per user request) ---
  const floatingNumbers = [
    // Numbers (3, 7, 6, 5)
    { top: "15%", left: "10%", val: 3 },  
    { top: "15%", right: "10%", val: '-' }, 
    { top: "5%", right: "25%", val: 6 },  
    { top: "65%", left: "15%", val: 5 }, 

    // Symbols (🍌, +, -, =)
    { top: "5%", left: "35%", val: '+' }, 

];
  // --- End Floating Numbers ---

  const navigate = useNavigate();

const handlePlayNow = () => navigate("/login-register?tab=login");
const handleRegister = () => navigate("/login-register?tab=signup");




  // --- Smooth scroll handler for "Learn More" button ---
 const handleLearnMore = () => {
  const challengeSection = document.getElementById('challenge');
  if (challengeSection) {
    const navbarHeight = 64; // Adjust if your navbar height changes
    const top = challengeSection.getBoundingClientRect().top + window.scrollY - navbarHeight;
    window.scrollTo({
      top,
      behavior: 'smooth'
    });
  }
};


  // --- End Scroll Handler ---

  useEffect(() => {
    // --- SCROLL REVEAL IMPLEMENTATION (Intersection Observer) ---
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, {
      threshold: 0.1 // Trigger when 10% of the element is visible
    });

    document.querySelectorAll('.scroll-reveal-item').forEach(el => observer.observe(el));
    
    const cleanupObserver = () => observer.disconnect();
    
    // Floating numbers animation (Anime.js)
    const setupAnime = () => {
      if (typeof window.anime !== "undefined") {
        document.querySelectorAll(".floating-number").forEach((el, index) => {
            window.anime({
                targets: el,
                translateY: [
                    { value: (Math.random() - 0.5) * 60, duration: 5000 },
                    { value: (Math.random() - 0.5) * 60, duration: 5000 },
                    { value: 0, duration: 5000 },
                ],
                translateX: [
                    { value: (Math.random() - 0.5) * 60, duration: 5000 },
                    { value: (Math.random() - 0.5) * 60, duration: 5000 },
                    { value: 0, duration: 5000 },
                ],
                rotate: [
                    { value: (Math.random() - 0.5) * 36, duration: 6000 },
                    { value: (Math.random() - 0.5) * 36, duration: 6000 },
                    { value: 0, duration: 6000 },
                ],
                opacity: [
                    { value: 0.5 + Math.random() * 0.3, duration: 4000 }, // Base opacity increased for better visibility
                    { value: 0.7 + Math.random() * 0.3, duration: 4000 },
                    { value: 0.5 + Math.random() * 0.3, duration: 4000 },
                ],
                scale: [
                    { value: 0.8 + Math.random() * 0.4, duration: 4000 },
                    { value: 0.9 + Math.random() * 0.4, duration: 4000 },
                    { value: 1.1, duration: 4000 },
                ],
                loop: true,
                easing: "easeInOutSine", // Use a smoother easing for floating
                delay: index * 200, // Faster stagger for more numbers
            });
        });
      } else {
        console.error("Anime.js not found. Include it in index.html.");
      }
    };

    setupAnime();
    return cleanupObserver;

  }, []);

  return (
    // Main wrapper uses full-screen gradient background
    <div className="min-h-screen relative overflow-x-hidden bg-gradient-to-br from-white via-pink-100 to-pink-200">
      
      {/* Injecting Custom Styles */}
      <style>{customStyles}</style>

      {/* Navbar */}
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
      {/* Floating Numbers (Background Animation) */}
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
              fontSize: "4rem", // Increased size for better visibility
              fontWeight: "bold",
              color: n.val === '🍌' ? '#f59e0b' : '#f472b6', // Banana is yellow/orange, others pink
              opacity: 0.7, // Increased base opacity
              zIndex: 0,
            }}
          >
            {n.val}
          </div>
        ))}
      </div>

      {/* --- HERO SECTION (RESTORED STRUCTURE) --- */}
      <section className="w-full h-screen flex flex-col justify-center text-center px-4 sm:px-8 relative z-10 pt-16">
        <h1 className="text-4xl sm:text-6xl font-bold text-pink-700 mb-4 animate-fade-in">
          Welcome to MathCraft Puzzle Game
        </h1>
        <p className="text-xl sm:text-3xl text-pink-600 mb-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          Test your IQ with exciting math shape puzzles
        </p>
        <p className="text-gray-700 mb-8 animate-fade-in" style={{ animationDelay: "0.4s" }}>
          Each puzzle challenges you to find the number associated with the correct shape using logic and pattern recognition.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
                onClick={handlePlayNow} 
                className="px-8 py-3 bg-pink-500 text-white font-semibold rounded-lg shadow-lg transition glow-hover animate-fade-in" 
                style={{ animationDelay: "0.6s" }}
            >
              Play Now
            </button>
<button 
  onClick={handleLearnMore} 
  className="relative z-20 px-8 py-3 bg-pink-500 text-white font-semibold rounded-lg shadow-lg transition glow-hover animate-fade-in"
  style={{ animationDelay: "0.8s" }}
>
  Learn More
</button>



        </div>
      </section>

      {/* --- SCROLLABLE SECTIONS (White Background) --- */}
      <main className="w-full bg-white relative z-20 shadow-inner-top"> 

          {/* 1. The Challenge Section */}
          <section id="challenge" className="min-h-[70vh] py-20 px-4 sm:px-8 flex items-center">
            <div className="max-w-6xl mx-auto w-full">
              <ScrollReveal>
                <h2 className="text-4xl font-bold text-pink-700 mb-12 border-b-4 border-pink-500 pb-2 text-center">
                  {challengeContent.title}
                </h2>
              </ScrollReveal>
              
              <div className="grid md:grid-cols-3 gap-8 text-center">
                {challengeContent.sections.map((c, i) => (
                  <ScrollReveal key={i} delay={i * 200}>
                    {/* Card Design */}
                    <div className="p-8 rounded-xl shadow-2xl bg-white transition duration-300 hover:scale-[1.02] border-t-8 border-pink-500 transform hover:-translate-y-2 border-r-4 border-b-4 hover:shadow-3xl cursor-pointer">
                        <div className="flex flex-col items-center">
                            <span className="text-5xl text-pink-600 mb-3 animate-bounce-slow">{c.icon}</span> 
                            <h3 className="text-2xl font-extrabold text-gray-900 mb-2">{c.mode}</h3>
                            <div className="w-1/4 h-1 bg-pink-300 mb-4 rounded-full"></div>
                            <div className="flex flex-col items-start w-full px-4 space-y-3">
                                <p className="text-pink-700 text-lg flex items-center font-semibold">
                                    <span className="text-xl mr-2">⏱️</span> Time Limit: {c.time.split('⏱️')[0].trim()}
                                </p>
                                <p className="text-gray-800 text-xl font-bold flex items-center">
                                    <span className="text-xl mr-2">🎁</span> Reward: {c.reward.split('💰')[0].trim()}
                                </p>
                            </div>
                        </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>

              <ScrollReveal delay={600}>
                <p className="text-center text-xl mt-12 p-6 bg-pink-50 rounded-xl shadow-inner border-l-4 border-pink-500 font-semibold text-gray-700">
                  {challengeContent.bonus}
                </p>
              </ScrollReveal>
            </div>
          </section>

          {/* 2. Your Dashboard Awaits Section (Horizontal Cards Implemented) */}
          <section id="dashboard" className="min-h-[70vh] py-20 px-4 sm:px-8 flex items-center border-t border-gray-100 bg-white">
            <div className="max-w-6xl mx-auto w-full">
              <ScrollReveal>
                <h2 className="text-4xl font-bold text-pink-700 mb-12 border-b-4 border-pink-500 pb-2 text-center">
                  {dashboardContent.title}
                </h2>
              </ScrollReveal>
              
              {/* Grid for horizontal display of Key Metrics Cards */}
              <div className="grid md:grid-cols-3 gap-8 mb-12">
                  {dashboardContent.stats.map((stat, i) => (
                      <ScrollReveal key={i} delay={i * 200}>
                          {/* Horizontal Card Structure */}
                          <div className="p-6 h-full rounded-xl shadow-2xl bg-pink-100 transition duration-300 hover:scale-[1.02] border-t-8 border-pink-500 transform hover:-translate-y-2 cursor-pointer text-center">
                              <span className="text-4xl text-pink-700 mb-3 block">{stat.icon}</span> 
                              <h3 className="text-xl font-extrabold text-gray-900 mb-2">{stat.title}</h3>
                              <div className="w-1/4 h-1 bg-pink-400 mx-auto mb-4 rounded-full"></div>
                              <p className="text-gray-700 text-sm">{stat.description}</p>
                          </div>
                      </ScrollReveal>
                  ))}
              </div>

              {/* Motto/Text moved below the cards and centered */}
              <div className="space-y-6 max-w-4xl mx-auto text-center mt-12">
                  <ScrollReveal delay={800}>
                      <p className="text-3xl font-extrabold text-pink-800 leading-snug">
                         Visualize your progress. Transform your mind.
                      </p>
                  </ScrollReveal>
                  <ScrollReveal delay={1000}>
                      <p className="italic text-xl text-gray-600 border-t-4 border-b-4 border-pink-500 py-4 bg-gray-50 p-4 rounded-md shadow-inner">
                          {dashboardContent.motto}
                      </p>
                  </ScrollReveal>
              </div>
            </div>
          </section>

          {/* 3. Game Mechanics Section (Subtle Pink BG) */}
          <section id="mechanics" className="min-h-[70vh] py-20 px-4 sm:px-8 flex items-center bg-pink-50 border-t border-gray-200">
            <div className="max-w-6xl mx-auto w-full">
              <ScrollReveal>
                <h2 className="text-4xl font-bold text-pink-700 mb-12 border-b-4 border-pink-500 pb-2 text-center">
                  {mechanicsContent.title}
                </h2>
              </ScrollReveal>

              <div className="grid md:grid-cols-2 gap-8">
                {mechanicsContent.points.map((p, i) => (
                  <ScrollReveal key={i} delay={i * 150}>
                    <div className="p-6 bg-white rounded-xl shadow-2xl border-l-8 border-pink-600 hover:shadow-3xl transition duration-300 transform hover:scale-[1.01] flex items-start space-x-4">
                      <span className="text-4xl flex-shrink-0 mt-0.5">{p.icon}</span>
                      <div>
                        <p className="text-xl font-bold text-gray-800 mb-1">
                          {p.detail.split(':')[0].trim()}
                        </p>
                        <p className="text-gray-600 text-base">
                          {p.detail.split(':')[1] ? p.detail.split(':')[1].trim() : p.detail}
                        </p>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>
          
          {/* 4. Explore the World of MathCraft & Start Your Journey Section */}
          <section id="explore-journey" className="min-h-screen py-20 px-4 sm:px-8 flex flex-col justify-center border-t border-gray-100 bg-white">
            <div className="max-w-6xl mx-auto w-full">

                {/* Explore Section */}
                <ScrollReveal>
                    <h2 className="text-4xl font-bold text-pink-700 mb-10 border-b-4 border-pink-500 pb-2 text-center">
                    {exploreContent.title}
                    </h2>
                </ScrollReveal>
                <div className="grid md:grid-cols-4 gap-6">
                    {exploreContent.pages.map((item, i) => (
                        <ScrollReveal key={i} delay={i * 150}>
                            {/* Card Height ensured to be equal using h-full */}
                            <div className="p-5 bg-pink-50 rounded-xl shadow-lg hover:shadow-2xl transition duration-300 border-b-4 border-pink-400 transform hover:-translate-y-1 h-full">
                                <p className="text-gray-700 font-semibold text-center">{item}</p>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
                <ScrollReveal delay={800}>
                    <p className="text-center text-2xl mt-12 font-extrabold text-pink-600 p-4 rounded-xl bg-pink-100 shadow-inner">
                        {exploreContent.motto}
                    </p>
                </ScrollReveal>

                <div className="mt-24 pt-10 border-t-2 border-pink-200">
                    {/* Start Journey Section */}
                    <ScrollReveal delay={1000}>
                        <h2 className="text-5xl font-extrabold text-pink-700 mb-6 text-center">
                            {startJourneyContent.title}
                        </h2>
                    </ScrollReveal>
                    <ScrollReveal delay={1200}>
                        <p className="text-center text-2xl text-gray-700 mb-10 max-w-2xl mx-auto">
                            {startJourneyContent.text}
                        </p>
                    </ScrollReveal>
                    <ScrollReveal delay={1400}>
                        <p className="text-center text-4xl font-extrabold text-pink-500 mb-12 animate-pulse">
                            {startJourneyContent.cta}
                        </p>
                    </ScrollReveal>

                    <div className="flex justify-center">
                        <ScrollReveal delay={1600}>
                            <button onClick={handleRegister} className="px-12 py-5 bg-pink-600 text-white font-extrabold text-xl rounded-full shadow-2xl transition hover:bg-pink-700 glow-hover animate-bounce-slow">
                                Begin Your Adventure!
                            </button>
                        </ScrollReveal>
                    </div>
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
 