import { useEffect, useState } from "react";

export default function Hero({ theme }) {
  const photos = [
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1950&q=80", 
    "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1950&q=80", 
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1950&q=80", 
    "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1950&q=80", 
    "https://images.unsplash.com/photo-1494783367193-149034c05e8f?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", 
    "https://images.unsplash.com/photo-1493558103817-58b2924bce98?auto=format&fit=crop&w=1950&q=80", 
    "https://images.unsplash.com/photo-1558980395-2f289089d3ec?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", 
    "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=1950&q=80", 
    "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1950&q=80",
    "https://images.unsplash.com/photo-1674795443496-98018df71033?q=80&w=1520&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1748182575169-e1e8e3901ec3?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"

  ];

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % photos.length);
    }, 8000); // change every 8 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ background: theme.background }}
    >
      {/* Background slideshow */}
      <div className="absolute inset-0 pointer-events-none">
        {photos.map((photo, index) => (
          <div
            key={index}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-2000 ${
              index === current ? "opacity-100" : "opacity-0"
            }`}
            style={{ backgroundImage: `url('${photo}')` }}
          ></div>
        ))}
      </div>

      {/* Floating travel icons */}
      <img
        src="https://img.icons8.com/ios-filled/50/0284C7/airplane-take-off.png"
        className="absolute top-20 left-10 w-12 animate-floatPlane"
        alt="plane"
      />
      <img
        src="https://img.icons8.com/ios-filled/50/0284C7/suitcase.png"
        className="absolute bottom-32 right-20 w-12 animate-floatSuitcase"
        alt="suitcase"
      />
      <img
        src="https://img.icons8.com/ios-filled/50/0284C7/palm-tree.png"
        className="absolute top-32 right-10 w-16 animate-floatPalm"
        alt="palm tree"
      />

      {/* Hero content */}
      <div className="flex flex-col items-center justify-center text-center px-6 z-10">
        <h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-4 opacity-0 animate-fadeSlide animation-delay-200"
          style={{ color: theme.text }}
        >
          Plan Smarter,{" "}
          <span className="animate-accentPulse" style={{ color: theme.accent }}>
            Travel Better
          </span>
        </h1>

        <p className="text-lg sm:text-xl md:text-2xl max-w-2xl mb-4 opacity-0 animate-fadeSlide animation-delay-400" style={{ color: theme.subtext || theme.text }}>
          An AI-powered tool that turns your destination and interests into a
          structured, day-by-day itinerary.
        </p>


        <div className="flex flex-wrap gap-4 justify-center opacity-0 animate-fadeSlide animation-delay-600">
          {/* <a
            href="#start"
            className="px-6 py-3 rounded-2xl shadow-lg transform transition-transform duration-300 hover:scale-110 focus:scale-105 focus:outline-none focus:ring-4 animate-buttonPulse"
            style={{
              backgroundColor: theme.accent,
              color: theme.buttonText || "#fff",
            }}
          >
            Start Planning
          </a> */}

          {/* <a
            href="#sample"
            className="px-6 py-3 rounded-2xl shadow-lg transform transition-transform duration-300 hover:scale-110 focus:scale-105 focus:outline-none focus:ring-4 animate-buttonPulse"
            style={{
              backgroundColor: theme.buttonAltBackground || "#fff",
              color: theme.accent,
            }}
          >
            View Sample
          </a> */}
        </div>
      </div>

      {/* Floating accent blobs */}
      <div
        className="absolute top-10 left-10 w-32 h-32 rounded-full opacity-20 animate-bounceSlow"
        style={{ backgroundColor: theme.accent }}
      ></div>
      <div
        className="absolute top-20 right-20 w-24 h-24 rounded-full opacity-15 animate-bounceSlowReverse"
        style={{ backgroundColor: theme.accent }}
      ></div>

      {/* Keyframe animations */}
      <style jsx>{`
        @keyframes fadeSlide {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeSlide { animation: fadeSlide 0.8s forwards; }
        .animation-delay-200 { animation-delay: 0.2s; }
        .animation-delay-400 { animation-delay: 0.4s; }
        .animation-delay-600 { animation-delay: 0.6s; }

        @keyframes bounceSlow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        .animate-bounceSlow { animation: bounceSlow 5s infinite ease-in-out; }
        .animate-bounceSlowReverse { animation: bounceSlow 6s infinite ease-in-out reverse; }

        @keyframes accentPulse {
          0%, 100% { opacity: 1; text-shadow: 0 0 0px ${theme.accent}; }
          50% { opacity: 0.85; text-shadow: 0 0 15px ${theme.accent}; }
        }
        .animate-accentPulse { animation: accentPulse 2s infinite ease-in-out; }

        @keyframes buttonPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .animate-buttonPulse { animation: buttonPulse 3s infinite ease-in-out; }

        @keyframes floatPlane {
          0% { transform: translateX(-50px) translateY(0); }
          50% { transform: translateX(50vw) translateY(-10px); }
          100% { transform: translateX(100vw) translateY(0); }
        }
        .animate-floatPlane { animation: floatPlane 15s infinite linear; }

        @keyframes floatSuitcase {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }
        .animate-floatSuitcase { animation: floatSuitcase 6s infinite ease-in-out; }

        @keyframes floatPalm {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-5deg); }
        }
        .animate-floatPalm { animation: floatPalm 8s infinite ease-in-out; }
      `}</style>
    </section>
  );
}
