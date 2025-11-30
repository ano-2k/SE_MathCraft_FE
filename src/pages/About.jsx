import React, { useState, useEffect, useRef } from 'react';
import { Zap, Code, Brain, Trophy, Gamepad, BarChart3, Star, Mail } from 'lucide-react';
import { useNavigate } from "react-router-dom"; 
import Footer from '../components/Footer'; 
import Navbar from "../components/Navbar.jsx"; 

const PRIMARY_PINK = 'text-pink-600';

const AboutSection = ({ children, className = '' }) => (
    <div
        className={`bg-white p-6 sm:p-10 rounded-3xl shadow-2xl border-b-4 border-pink-400 
        transform transition-all duration-300 ease-out 
        hover:scale-[1.01] hover:shadow-2xl hover:shadow-pink-400/50 hover:-translate-y-1 cursor-pointer 
        ${className}`}
    >
        {children}
    </div>
);

const FeatureCard = ({ icon: Icon, title, description, color }) => (
    <div 
        className="p-6 bg-pink-50/70 rounded-xl border border-pink-200 shadow-md text-center h-full 
        transform transition-all duration-300 ease-out 
        hover:scale-[1.05] hover:shadow-2xl hover:shadow-pink-400/50 hover:-translate-y-3 cursor-pointer"
    >
        <Icon size={36} className={`mx-auto mb-4 ${color}`} strokeWidth={2.5} />
        <h3 className="text-xl font-extrabold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
    </div>
);

const blinkKeyframes = `
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.2; }
  }
  
  /* ADDED: Mobile Menu Animation Keyframes (Keeping for BlinkingText) */
  @keyframes fadeInDown {
    0% {
      opacity: 0;
      transform: translateY(-10px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-fadeInDown {
    animation: fadeInDown 0.3s ease-out forwards;
  }
`;

const BlinkingText = ({ children, className = '' }) => (
    <>
        <style>{blinkKeyframes}</style>
        <span className={`animate-blink text-pink-600 ${className}`} style={{ animation: 'blink 1.5s infinite' }}>
            {children}
        </span>
    </>
);


export default function About() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
    });
    const [formStatus, setFormStatus] = useState(null); 

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // ADDED: Asynchronous Form Submission Handler 
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormStatus(null); // Clear previous status
        
        const formUrl = 'https://formspree.io/f/xkglbwjq'; //Formspree URL

        try {
            const response = await fetch(formUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setFormData({
                    name: '',
                    email: '',
                    message: '',
                });
                setFormStatus({ status: 'success', message: 'Message sent successfully! Thank you for your feedback.' });
            } else {
                const data = await response.json();
                setFormStatus({ status: 'error', message: data.error || 'Failed to send message. Please try again.' });
            }
        } catch (error) {
            setFormStatus({ status: 'error', message: 'Network error. Please check your connection.' });
        }
    };


  return (
    <div className="min-h-screen relative overflow-x-hidden bg-gradient-to-br from-white via-pink-100 to-pink-200">
      
      <Navbar /> 

      {/* 2. MAIN CONTENT AREA */}
      <div className="pt-16 px-4 md:px-8 font-sans relative z-10"> 
          
          <div className="absolute inset-0 opacity-40 -z-20">
            <div className="w-1/2 h-full bg-pink-200 rounded-full blur-3xl mx-auto -translate-y-1/4"></div>
          </div>

          <header className="py-6 sm:py-8 text-center max-w-4xl mx-auto mb-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-3 tracking-tighter">
              <span className={PRIMARY_PINK}>About</span>{' '}
              <span className={PRIMARY_PINK}>MathCraft</span>
            </h1>
            <p className="text-xl text-gray-600 font-medium">
              The ultimate platform for logic puzzles and mathematical intelligence training.
            </p>
          </header>
          
          <main className="max-w-6xl mx-auto space-y-10 pb-12">

            {/* 1. Mission Statement */}
            <AboutSection className="bg-gradient-to-br from-white to-pink-50">
                <h2 className={`text-2xl font-extrabold ${PRIMARY_PINK} mb-4 flex items-center`}>
                    <Star size={24} className="mr-2" /> Our Mission
                </h2>
                <p className="text-lg text-gray-700 leading-relaxed">
                    MathCraft is designed to push the boundaries of your analytical thinking and logical deduction. We transform abstract mathematical concepts into engaging, visual puzzles, offering a fun and competitive way to track your cognitive growth and IQ potential.
                </p>

                <blockquote className={`mt-6 p-4 border-l-4 border-pink-500 text-xl font-semibold bg-pink-100/50`}>
                    <BlinkingText>
                        "Intelligence is not a fixed trait, it's a muscle you must train daily. MathCraft is your digital gym."
                    </BlinkingText>
                </blockquote>
            </AboutSection>

            {/* 2. The Mechanics */}
            <AboutSection>
                <h2 className={`text-2xl font-extrabold ${PRIMARY_PINK} mb-6 text-center flex items-center justify-center`}>
                    <Code size={24} className="mr-2" /> The Mechanics
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FeatureCard
                        icon={Gamepad}
                        title="Engaging Puzzles"
                        color={PRIMARY_PINK} 
                        description="Solve sequence-based puzzles across three difficulty modes: Easy, Intermediate, and Hard."
                    />
                    <FeatureCard
                        icon={Brain}
                        title="Streak & Score System"
                        color={PRIMARY_PINK} 
                        description="Earn higher scores by maintaining a correct streak and solving puzzles quickly. Time is critical!"
                    />
                    <FeatureCard
                        icon={Trophy}
                        title="Achievements & Leaderboard"
                        color={PRIMARY_PINK}
                        description="Track your mastery, climb the global leaderboards, and unlock exclusive badges for bragging rights."
                    />
                </div>
            </AboutSection>
            
            {/* 3. Difficulty Levels */}
            <AboutSection className="bg-pink-50/50 border-pink-400">
                <h2 className={`text-2xl font-extrabold ${PRIMARY_PINK} mb-6 flex items-center`}>
                    <BarChart3 size={24} className="mr-2" /> Challenge Levels
                </h2>
                <div className="space-y-4">
                    <div className="p-3 border-l-4 border-green-500 bg-green-50 rounded-lg shadow-sm">
                        <h4 className="font-bold text-green-700">EASY Mode (90s / Puzzle)</h4>
                        <p className="text-gray-600 text-sm">Perfect for warm-ups and beginners. Focus on accuracy over speed.</p>
                    </div>
                    <div className="p-3 border-l-4 border-orange-500 bg-orange-50 rounded-lg shadow-sm">
                        <h4 className="font-bold text-orange-700">INTERMEDIATE Mode (60s / Puzzle)</h4>
                        <p className="text-gray-600 text-sm">The standard test. Requires balance between speed and careful consideration.</p>
                    </div>
                    <div className="p-3 border-l-4 border-red-500 bg-red-50 rounded-lg shadow-sm">
                        <h4 className="font-bold text-red-700">HARD Mode (30s / Puzzle)</h4>
                        <p className="text-gray-600 text-sm">The ultimate test of cognitive processing speed and complexity tolerance. High risk, high reward.</p>
                    </div>
                </div>
            </AboutSection>

            {/* 4. Contact & Feedback Section */}
            <AboutSection className="bg-gradient-to-tr from-pink-50 to-white border-pink-500">
                <h2 className={`text-2xl font-extrabold ${PRIMARY_PINK} mb-6 text-center flex items-center justify-center`}>
                    <Mail size={24} className="mr-2" /> Contact & Feedback
                </h2>

                {/* Contact Email */}
                <div className="text-center mb-6 p-4 bg-pink-50 rounded-xl border border-pink-300">
                    <p className="text-lg font-semibold text-gray-700">
                        Need support or have suggestions? Email us directly:
                    </p>
                    <a 
                        href="mailto:mathcraftfeedback@gmail.com" 
                        className={`text-xl font-extrabold ${PRIMARY_PINK} hover:underline transition`}
                    >
                        mathcraftfeedback@gmail.com
                    </a>
                </div>

                {/* Formspree Feedback Form */}
                <form
                    onSubmit={handleSubmit} 
                    className="space-y-4 max-w-lg mx-auto p-6 bg-white rounded-xl shadow-inner border border-gray-200"
                >
                    <p className="text-base font-semibold text-gray-700">Send us a message:</p>
                    {formStatus && (
                        <div className={`p-3 rounded-lg text-sm font-semibold text-center 
                            ${formStatus.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {formStatus.message}
                        </div>
                    )}
                    
                    <input
                        type="text"
                        name="name"
                        placeholder="Your Name"
                        value={formData.name} 
                        onChange={handleChange} 
                        className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:ring-pink-500 transition"
                    />

                    <input
                        type="email"
                        name="email"
                        placeholder="Your Email"
                        value={formData.email} 
                        onChange={handleChange} 
                        className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:ring-pink-500 transition"
                    />
                    
                    <textarea
                        name="message"
                        placeholder="Your feedback, bug report, or feature request..."
                        rows="4"
                        required
                        value={formData.message} 
                        onChange={handleChange} 
                        className="w-full p-3 border-2 border-gray-300 rounded-lg resize-none focus:border-pink-500 focus:ring-pink-500 transition"
                    ></textarea>

                    <button
                        type="submit"
                        className="w-full bg-pink-500 hover:bg-pink-600 text-white p-3 rounded-lg shadow-pink-600/50 shadow-lg text-lg font-extrabold transition duration-200"
                    >
                        Send Message
                    </button>
                </form>

            </AboutSection>

          </main>
      </div>
      
      {/* 3. FOOTER */}
      <Footer />
    </div>
  );
}