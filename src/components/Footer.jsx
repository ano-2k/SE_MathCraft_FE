import React, { useMemo } from 'react';

const InstagramIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const FacebookIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const YouTubeIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42A2.88 2.88 0 0 0 20.7 4.58C19.24 4.19 12 4.19 12 4.19s-7.24 0-8.7.39A2.88 2.88 0 0 0 1.46 6.42C1.07 7.88 1.07 12 1.07 12s0 4.12.39 5.58a2.88 2.88 0 0 0 1.84 1.84c1.46.39 8.7.39 8.7.39s7.24 0 8.7-.39a2.88 2.88 0 0 0 1.84-1.84c.39-1.46.39-5.58.39-5.58s0-4.12-.39-5.58z"/>
    <polygon points="10 15 15 12 10 9 10 15"/>
  </svg>
);

// --- Main Footer Component ---
const Footer = () => {
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  const gameModes = [
    { name: "Easy", href: "#challenge" },
    { name: "Intermediate", href: "#challenge" },
    { name: "Hard", href: "#challenge" },
  ];

  const exploreLinks = [
    { name: "Dashboard", href: "#dashboard" },
    { name: "Games", href: "#mechanics" },
    { name: "Achievements", href: "#explore-journey" },
    { name: "Graph", href: "#explore-journey" },
    { name: "Profile", href: "#explore-journey" },
  ];

  return (
    <footer className="bg-pink-50 text-gray-700 mt-12 border-t border-pink-100 shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 border-b border-pink-200 pb-8 mb-8">

          <div className="col-span-2 md:col-span-1">
            <h3 className="text-2xl font-extrabold tracking-tight text-pink-700">
              MathCraft
            </h3>
            <p className="mt-4 text-sm text-gray-600 max-w-xs">
              Master math puzzles, earn coins, and rise through the ranks as a Codebreaker!
            </p>
          </div>

          {/* Game Modes */}
          <div>
            <h4 className="text-base font-semibold text-pink-700 mb-4">Game Modes</h4>
            <ul className="space-y-3">
              {gameModes.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-sm text-gray-600 hover:text-pink-700 transition">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-base font-semibold text-pink-700 mb-4">Explore</h4>
            <ul className="space-y-3">
              {exploreLinks.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-sm text-gray-600 hover:text-pink-700 transition">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <p className="text-sm text-gray-500 mb-6 md:mb-0">
            &copy; {currentYear} MathCraft. All rights reserved.
          </p>

          <div className="flex space-x-6">
            <a 
              href="https://www.instagram.com/a.n.o._.2k/?igsh=eGxkNHAxaTdyNW5v&utm_source=qr" 
              className="text-pink-500 hover:text-pink-700 transition-colors duration-200"
              aria-label="Follow us on Instagram"
            >
              <InstagramIcon className="w-6 h-6" />
            </a>
            <a 
              href="https://www.facebook.com/share/17JR2TUFrx/?mibextid=wwXIfr" 
              className="text-pink-500 hover:text-pink-700 transition-colors duration-200"
              aria-label="Like us on Facebook"
            >
              <FacebookIcon className="w-6 h-6" />
            </a>
            <a 
              href="https://www.youtube.com/@ano_2k" 
              className="text-pink-500 hover:text-pink-700 transition-colors duration-200"
              aria-label="Subscribe to us on YouTube"
            >
              <YouTubeIcon className="w-6 h-6" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
