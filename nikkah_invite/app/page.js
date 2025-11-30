"use client";
// Next.js page (pages/index.js)
// --------------------------------
// How to use:
// 1. Create a Next.js app (npm init next-app@latest) or add this file to your pages/ directory as pages/index.js
// 2. Install dependencies:
//    npm install framer-motion
// 3. Add Tailwind CSS (recommended) or adapt styles to your CSS setup. If using Tailwind, follow the official Tailwind + Next.js setup.
// 4. Put your images in the public/ folder and name them front.jpg and back.jpg (or change the paths below):
//     /public/front.jpg  (card front image, e.g. your childhood photo collage)
//     /public/back.jpg   (optional: decorative on back)
// 5. Replace the MARQUEE_LAT and MARQUEE_LNG constants below with your event coordinates if needed.
// 6. Start Next.js and open the homepage.

import React, { useEffect, useState, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';

const MARQUEE_LAT = 31.4546281;
const MARQUEE_LNG = 73.1537843;

export default function Home() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [introFinished, setIntroFinished] = useState(false);
  const [animationStarted, setAnimationStarted] = useState(false);
  const audioRef = useRef(null);
  const controls = useAnimation();

  // Handle audio play after user interaction
  const handleStart = () => {
    setShowWelcome(false);
    if (audioRef.current) {
      audioRef.current.play().catch((err) => {
        console.log('Audio play failed:', err);
      });
    }
    // Start the intro animation after a brief delay
    setTimeout(() => {
      controls.start('drive');
      setAnimationStarted(true);
    }, 300);
  };

  useEffect(() => {
    if (animationStarted && !introFinished) {
      // Play intro: car follows path to destination (8 seconds), then show popup (2 seconds), then reveal card
      async function play() {
        // Wait for animation to complete (8 seconds) + popup display (2.5 seconds)
        await new Promise((r) => setTimeout(r, 10500));
        // Small delay then finish
        await new Promise((r) => setTimeout(r, 500));
        setIntroFinished(true);
      }
      play();
    }
  }, [animationStarted, introFinished]);

  return (
    <div className="min-h-screen bg-[#FBF9F6] flex items-center justify-center p-3 sm:p-4 md:p-6 relative overflow-hidden">
      {/* Background Audio */}
      <audio
        ref={audioRef}
        loop
        preload="auto"
        className="hidden"
      >
        <source src="/background-music.mp3" type="audio/mpeg" />
        <source src="/background-music.ogg" type="audio/ogg" />
        Your browser does not support the audio element.
      </audio>

      {/* Welcome Popup */}
      {showWelcome && (
        <WelcomePopup onStart={handleStart} />
      )}

      {/* Petal falling animation for all screens */}
      {!showWelcome && <PetalFalling />}
      
      {!showWelcome && (
        <div className="max-w-4xl w-full">
          {/* Hero / Intro map animation */}
          {!introFinished && (
            <div className="mb-4 sm:mb-6 md:mb-8">
              <IntroAnimation controls={controls} lat={MARQUEE_LAT} lng={MARQUEE_LNG} />
            </div>
          )}

          {/* Card area */}
          {introFinished && <CardFlip lat={MARQUEE_LAT} lng={MARQUEE_LNG} />}

          {/* Small footer / share */}
          {introFinished && (
            <div className="text-center text-xs sm:text-sm text-gray-500 mt-4 sm:mt-6 px-2">
              Tap the card to flip and see the details • Long-press to save or share
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------- WelcomePopup component ----------
function WelcomePopup({ onStart }) {
  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 md:p-10 max-w-md w-full mx-4 text-center"
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <div className="text-5xl sm:text-6xl mb-4">💕</div>
        <h2 className="text-2xl sm:text-3xl font-serif text-gray-800 mb-3">
          Welcome
        </h2>
        <p className="text-sm sm:text-base text-gray-600 mb-6">
          Click below to view your special invitation
        </p>
        <button
          onClick={onStart}
          className="w-full bg-[#b87d3b] hover:bg-[#a06d2f] text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 text-base sm:text-lg shadow-lg"
        >
          Click to View
        </button>
      </motion.div>
    </motion.div>
  );
}

// ---------- IntroAnimation (abstract "map fly-in") ----------
function IntroAnimation({ controls, lat, lng }) {
  const [showPopup, setShowPopup] = useState(false);
  const [carPosition, setCarPosition] = useState({ x: 5, y: 80, angle: 0 });
  const pathRef = useRef(null);

  // Path definition for the car to follow
  const pathData = "M5,80 C30,10 70,10 95,20";

  // Get point on path at given progress (0-1)
  const getPointOnPath = (prog) => {
    if (!pathRef.current) return { x: 5, y: 80 };
    const path = pathRef.current;
    const length = path.getTotalLength();
    const point = path.getPointAtLength(length * prog);
    return point;
  };

  // Animate car position along path
  useEffect(() => {
    let animationFrameId;
    let popupShown = false;

    // Wait a bit for the path ref to be available
    const timer = setTimeout(() => {
      const startTime = Date.now();
      const duration = 8000; // 8 seconds

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        if (pathRef.current) {
          const path = pathRef.current;
          const length = path.getTotalLength();
          const point = path.getPointAtLength(length * progress);

          // Calculate angle for car rotation (look ahead slightly)
          const lookAhead = Math.min(0.01, 1 - progress);
          const nextPoint = path.getPointAtLength(length * (progress + lookAhead));
          const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * (180 / Math.PI);

          setCarPosition({ x: point.x, y: point.y, angle });
        }

        // Show popup when car reaches destination
        if (progress >= 1 && !popupShown) {
          popupShown = true;
          setTimeout(() => setShowPopup(true), 100);
        }

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(animate);
        }
      };

      animationFrameId = requestAnimationFrame(animate);
    }, 100);

    return () => {
      clearTimeout(timer);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []); // Run only once on mount

  return (
    <div className="w-full rounded-xl bg-white shadow-lg p-3 sm:p-4 md:p-6 flex flex-col items-center">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800">You're invited</h2>
          <p className="text-xs sm:text-sm md:text-base text-gray-700 mt-1 sm:mt-2">We await to meet you — a little journey before a milestone</p>
        </div>

        <div className="relative bg-[#f6f3ef] rounded-lg overflow-hidden" style={{ height: 'clamp(300px, 50vh, 500px)' }}>
          {/* Stylized map / globe circle */}
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* soft gradient background */}
            <defs>
              <linearGradient id="g" x1="0" x2="1">
                <stop offset="0" stopColor="#fff" stopOpacity="1" />
                <stop offset="1" stopColor="#f3efe8" stopOpacity="1" />
              </linearGradient>
            </defs>

            <rect x="0" y="0" width="100" height="100" fill="url(#g)" />

            {/* Road/path line that the car follows */}
            <path
              ref={pathRef}
              id="carPath"
              d={pathData}
              stroke="#d9c8b0"
              strokeWidth="1"
              fill="none"
              strokeDasharray="4 3"
            />

            {/* Animated path reveal effect */}
            <motion.path
              d={pathData}
              stroke="#b87d3b"
              strokeWidth="1"
              fill="none"
              strokeDasharray="4 3"
              initial={{ pathLength: 0 }}
              animate={controls}
              variants={{
                drive: {
                  pathLength: 1,
                  transition: { duration: 8, ease: 'easeInOut' },
                },
              }}
            />

            {/* destination pin (animated pulse) centered near the end of path */}
            <g transform="translate(95,20)">
              <motion.circle
                r="8"
                fill="#fff"
                stroke="#b87d3b"
                strokeWidth="1.2"
                initial={{ scale: 0.6, opacity: 0.2 }}
                animate={{ scale: [0.8, 1.05, 0.95], opacity: [0.5, 1, 0.6] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
              <circle r="3" fill="#b87d3b" />
            </g>

            {/* Car icon moving along the path - bigger and beige */}
            <g transform={`translate(${carPosition.x},${carPosition.y}) rotate(${carPosition.angle})`}>
              {/* Simple car icon - bigger size */}
              <g transform="translate(-5,-4)">
                {/* Car body - beige color */}
                <rect x="0" y="2" width="10" height="5" rx="0.8" fill="#D2B48C" />
                {/* Car roof */}
                <path d="M1.5,2 L3.5,0.5 L6.5,0.5 L8.5,2" stroke="#C19A6B" strokeWidth="0.6" fill="none" />
                {/* Car windows */}
                <rect x="2" y="2" width="2.5" height="2" rx="0.3" fill="#E8D5B7" />
                <rect x="5.5" y="2" width="2.5" height="2" rx="0.3" fill="#E8D5B7" />
                {/* Car wheels */}
                <circle cx="2" cy="7.5" r="1" fill="#2C2C2C" />
                <circle cx="8" cy="7.5" r="1" fill="#2C2C2C" />
                {/* Wheel rims */}
                <circle cx="2" cy="7.5" r="0.5" fill="#4A4A4A" />
                <circle cx="8" cy="7.5" r="0.5" fill="#4A4A4A" />
              </g>
            </g>

            {/* small decorative dots */}
            <g>
              <circle cx="15" cy="80" r="0.8" fill="#8b5e3c" />
              <circle cx="30" cy="50" r="0.8" fill="#8b5e3c" />
              <circle cx="60" cy="32" r="0.8" fill="#8b5e3c" />
            </g>
          </svg>

          {/* Arrival popup */}
          {showPopup && (
            <motion.div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl p-4 sm:p-6 border-2 border-[#b87d3b] z-10 min-w-[240px] sm:min-w-[280px] max-w-[90%]"
              initial={{ opacity: 0, scale: 0.8, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <div className="text-center">
                <div className="text-xl sm:text-2xl mb-2">🎉</div>
                <div className="text-base sm:text-lg font-semibold text-[#b87d3b] mb-1 px-2">We have arrived at a destination</div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- PetalFalling component ----------
function PetalFalling() {
  const [petals, setPetals] = useState([]);
  const [screenHeight, setScreenHeight] = useState(1000);

  useEffect(() => {
    // Get screen height
    if (typeof window !== 'undefined') {
      setScreenHeight(window.innerHeight);
      const handleResize = () => setScreenHeight(window.innerHeight);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  useEffect(() => {
    // Create initial petals
    const initialPetals = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 5 + Math.random() * 3, // 5-8 seconds (faster)
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 180,
      xDrift: (Math.random() - 0.5) * 120,
    }));
    setPetals(initialPetals);

    // Add new petals periodically
    const interval = setInterval(() => {
      setPetals((prev) => {
        // Keep only last 20 petals to avoid memory issues
        const filtered = prev.slice(-19);
        return [
          ...filtered,
          {
            id: Date.now() + Math.random(),
            left: Math.random() * 100,
            delay: 0,
            duration: 5 + Math.random() * 3,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 180,
            xDrift: (Math.random() - 0.5) * 120,
          },
        ];
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {petals.map((petal) => (
        <motion.div
          key={petal.id}
          className="absolute top-0"
          style={{
            left: `${petal.left}%`,
          }}
          initial={{
            y: -50,
            opacity: 0.7,
            rotate: petal.rotation,
            x: 0,
          }}
          animate={{
            y: screenHeight + 50,
            opacity: [0.7, 0.9, 0.8, 0],
            rotate: petal.rotation + petal.rotationSpeed,
            x: petal.xDrift,
          }}
          transition={{
            duration: petal.duration,
            delay: petal.delay,
            repeat: Infinity,
            ease: [0.25, 0.1, 0.25, 1], // Smooth cubic bezier easing
          }}
        >
          {/* Peach colored petal SVG - more realistic petal shape - bigger size */}
          <svg width="32" height="32" viewBox="0 0 24 24" className="drop-shadow-sm">
            <path
              d="M12,3 C10,5 8,7 7,9 C6,11 7,13 9,14 C11,15 12,14 12,12 C12,14 13,15 15,14 C17,13 18,11 17,9 C16,7 14,5 12,3 Z"
              fill="#FFB6C1"
              opacity="0.85"
            />
            <path
              d="M12,3 C10,5 8,7 7,9 C6,11 7,13 9,14 C11,15 12,14 12,12 Z"
              fill="#FFC0CB"
              opacity="0.6"
            />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}

// ---------- CardFlip component ----------
function CardFlip({ lat, lng }) {
  const [flipped, setFlipped] = useState(false);

  // adjust these to match your images in public/
  const frontImage = '/front.png';
  const backImage = '/back.jpg';

  // Event details - UPDATE THESE WITH YOUR ACTUAL EVENT INFO
  const eventDetails = {
    title: "Nikah Ceremony - Tayyab & Areej",
    description: "You are warmly invited to our Nikkah ceremony. We look forward to celebrating with you.\n\nVenue: White Rose Marquee — Canal Road - Faisalabad\n\n",
    location: `White Rose Marquee, Canal Road, Faisalabad (${lat}, ${lng})`,
    startDate: new Date('2025-12-27T13:30:00'), // June 28, 2025 at 4:00 PM - UPDATE THIS
    endDate: new Date('2025-12-27T16:00:00'), // June 28, 2025 at 8:00 PM - UPDATE THIS
    googleMeetLink: 'https://meet.google.com/iks-dpgb-tkt', // REPLACE WITH YOUR GOOGLE MEET LINK
  };

  // Function to open Google Calendar with event details
  const openGoogleCalendar = () => {
    const formatDateForGoogle = (date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: eventDetails.title,
      dates: `${formatDateForGoogle(eventDetails.startDate)}/${formatDateForGoogle(eventDetails.endDate)}`,
      details: `${eventDetails.description}\n\nGoogle Meet: ${eventDetails.googleMeetLink}`,
      location: eventDetails.location,
    });

    window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, '_blank');
  };

  return (
    <div className="flex justify-center w-full px-2 sm:px-4">
      <div
        className="scene w-full flex justify-center"
        style={{ perspective: 1200 }}
        onClick={() => setFlipped((s) => !s)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter') setFlipped((s) => !s); }}
      >
        <div
          className={`card relative w-full max-w-[360px] h-[480px] sm:w-[380px] sm:h-[540px] md:w-[420px] md:h-[600px] transition-transform duration-700 ease-in-out ${flipped ? 'rotate-y-180' : ''}`}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Front */}
          <div
            className="card-face card-front absolute inset-0 backface-hidden rounded-xl shadow-2xl overflow-hidden bg-white"
            style={{ WebkitBackfaceVisibility: 'hidden', backfaceVisibility: 'hidden' }}
          >
            <div className="w-full h-full flex flex-col overflow-hidden">
              <div className="flex-shrink-0 relative" style={{ flex: '1 1 auto', minHeight: 0 }}>
                <img src={frontImage} alt="Card front" className="object-cover w-full h-full" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              </div>

              <div className="flex-shrink-0 pt-3 sm:pt-4 pb-4 sm:pb-5 md:pb-6 bg-white px-3 sm:px-4">
                <div className="text-center">
                  <div className="text-xs sm:text-sm md:text-base text-gray-500">Welcome to Nikah Cermony</div>
                  <div className="text-lg sm:text-xl md:text-2xl font-serif mt-1 sm:mt-2 text-gray-800">On 27 | 12 | 2025</div>
                  <div className="mt-2 sm:mt-3">
                    <div className="text-xl sm:text-2xl md:text-3xl font-handwriting tracking-tight text-gray-600 break-words">Tayyab <span className="mx-1 sm:mx-2 text-gray-400">&</span> Areej</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Back */}
          <div
            className="card-face card-back absolute inset-0 rounded-xl shadow-2xl overflow-hidden bg-white rotate-y-180"
            style={{ transform: 'rotateY(180deg)', WebkitBackfaceVisibility: 'hidden', backfaceVisibility: 'hidden' }}
          >
            <div className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-5 md:p-6 overflow-y-auto">
              <div className="w-full max-w-md flex flex-col items-center">
                {/* Romantic message at the top */}
                <div className="text-center mb-4 sm:mb-5 md:mb-6">
                  <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">💕</div>
                  <p className="text-sm sm:text-base md:text-lg text-gray-700 italic font-serif leading-relaxed px-2">
                    "Two hearts, one journey, forever together.
                    <br />We can't wait to share this special day with you."
                  </p>
                </div>

                <div className="w-full space-y-3 sm:space-y-4 text-xs sm:text-sm text-gray-800 px-2">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 21s-6-4.35-8-7a8 8 0 1116 0c-2 2.65-8 7-8 7z" /></svg>
                    <div>
                      <div className="font-medium">Venue</div>
                      <div className="text-xs text-gray-600">White Rose Marquee — Canal Road - Faisalabad</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 7V3M16 7V3M3 11h18M4 21h16a1 1 0 001-1V11H3v9a1 1 0 001 1z" /></svg>
                    <div>
                      <div className="font-medium">Date & Time</div>
                      <div className="text-xs text-gray-600">27 December 2025 — 1:00 PM</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 sm:mt-5 md:mt-6 w-full space-y-2 sm:space-y-3 px-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
                      window.open(url, '_blank');
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-md border border-gray-200 shadow-sm text-xs sm:text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Open in Google Maps
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openGoogleCalendar();
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-md border border-gray-200 shadow-sm text-xs sm:text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Add to Calendar
                  </button>
                </div>

                <div className="mt-4 sm:mt-5 md:mt-6 text-xs text-gray-500 text-center px-2">
                  Tap again to flip back to the card. You can share this page with family and friends.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .card { transform-style: preserve-3d; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .card-face { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
        .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
      `}</style>
    </div>
  );
}

// ---------- small handwriting font fallback (recommend adding custom fonts) ----------

/*
Notes & suggestions:
- Replace images in public/ with your own front/back card images.
- For better phone performance, keep the front image optimized (webp/jpeg under 400KB ideally).
- If you'd like an actual map animation (Mapbox, Leaflet), I can add Mapbox with a small token-based solution.
- To improve the plane animation to follow the SVG path exactly, we can use MotionPath (framer-motion v6+) or implement a small path-follow function.
- You can add an audio toggle to play a short nasheed (remember not to autoplay).
*/
