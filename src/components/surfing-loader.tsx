"use client";

import { useEffect, useState } from "react";

const TIPS = [
  "Surfing for the best answer...",
  "Catching a wave through the menu...",
  "Paddling out to check the allergens...",
  "Reading the lineup for the perfect recommendation...",
  "Checking the kitchen forecast...",
  "Hang 10 — almost there...",
  "Dialing in the specs...",
  "Cross-referencing every recipe...",
];

interface SurfingLoaderProps {
  /** Dark-themed (for SpecOS on a dark background). Default false. */
  dark?: boolean;
  /** Optional override message instead of rotating tips. */
  message?: string;
}

export function SurfingLoader({ dark = false, message }: SurfingLoaderProps) {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    if (message) return;
    const id = setInterval(() => setTipIndex((i) => (i + 1) % TIPS.length), 1800);
    return () => clearInterval(id);
  }, [message]);

  const currentTip = message || TIPS[tipIndex];

  const cardCls = dark
    ? "bg-white/5 border-white/10"
    : "bg-gradient-to-br from-sky-50 via-white to-orange-50 border-ditch-orange/20";
  const textCls = dark ? "text-white" : "text-gray-800";
  const subCls = dark ? "text-white/60" : "text-gray-500";

  return (
    <div className={`rounded-2xl border ${cardCls} p-6 overflow-hidden`}>
      <div className="relative h-28 sm:h-32 w-full">
        {/* Sky / sun */}
        <div className="absolute inset-0 flex items-start justify-end pr-6 pt-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 opacity-80 blur-[1px]" />
        </div>

        {/* Wave layers */}
        <svg
          className="absolute bottom-0 left-0 w-full h-20"
          viewBox="0 0 400 80"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            d="M0 50 Q 50 30 100 50 T 200 50 T 300 50 T 400 50 V80 H0 Z"
            fill={dark ? "#325269" : "#325269"}
            opacity="0.85"
          >
            <animate
              attributeName="d"
              dur="3s"
              repeatCount="indefinite"
              values="
                M0 50 Q 50 30 100 50 T 200 50 T 300 50 T 400 50 V80 H0 Z;
                M0 50 Q 50 60 100 40 T 200 55 T 300 45 T 400 50 V80 H0 Z;
                M0 50 Q 50 30 100 50 T 200 50 T 300 50 T 400 50 V80 H0 Z
              "
            />
          </path>
          <path
            d="M0 60 Q 60 45 120 60 T 240 60 T 360 60 T 400 60 V80 H0 Z"
            fill={dark ? "#1e3a52" : "#5ba7d4"}
            opacity="0.7"
          >
            <animate
              attributeName="d"
              dur="4s"
              repeatCount="indefinite"
              values="
                M0 60 Q 60 45 120 60 T 240 60 T 360 60 T 400 60 V80 H0 Z;
                M0 60 Q 60 70 120 50 T 240 65 T 360 55 T 400 60 V80 H0 Z;
                M0 60 Q 60 45 120 60 T 240 60 T 360 60 T 400 60 V80 H0 Z
              "
            />
          </path>
        </svg>

        {/* Surfer — surfs left to right, bobbing on the wave */}
        <div className="absolute bottom-6 left-0 w-full">
          <div className="surfer-track">
            <svg width="56" height="56" viewBox="0 0 100 100" aria-hidden>
              {/* surfboard */}
              <ellipse
                cx="50"
                cy="78"
                rx="32"
                ry="6"
                fill="#cd6028"
                stroke="#a44a1e"
                strokeWidth="1"
              />
              <ellipse cx="50" cy="76" rx="28" ry="3" fill="#fff" opacity="0.4" />
              {/* legs */}
              <path
                d="M44 72 L42 60 M56 72 L58 60"
                stroke="#e8b58a"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
              {/* body */}
              <path
                d="M50 38 L44 64 L56 64 Z"
                fill="#cd6028"
              />
              {/* arms out for balance */}
              <path
                d="M44 50 L32 46 M56 50 L68 46"
                stroke="#e8b58a"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
              {/* head */}
              <circle cx="50" cy="30" r="8" fill="#e8b58a" />
              {/* hair */}
              <path
                d="M43 26 Q45 20 50 21 Q55 20 57 26 Q54 24 50 24 Q46 24 43 26 Z"
                fill="#3a2a1a"
              />
              {/* sunglasses */}
              <rect x="44" y="28" width="5" height="3" rx="1" fill="#1a1a1a" />
              <rect x="51" y="28" width="5" height="3" rx="1" fill="#1a1a1a" />
            </svg>
          </div>
        </div>
      </div>

      {/* Rotating tip */}
      <div className="mt-4 text-center">
        <p className={`text-sm sm:text-base font-medium ${textCls} transition-opacity`}>
          {currentTip}
        </p>
        <div className="mt-2 flex items-center justify-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full bg-ditch-orange animate-bounce`} style={{ animationDelay: "0ms" }} />
          <span className={`w-1.5 h-1.5 rounded-full bg-ditch-orange animate-bounce`} style={{ animationDelay: "150ms" }} />
          <span className={`w-1.5 h-1.5 rounded-full bg-ditch-orange animate-bounce`} style={{ animationDelay: "300ms" }} />
        </div>
        <p className={`text-[10px] uppercase tracking-wider mt-2 ${subCls}`}>
          AI is thinking
        </p>
      </div>

      <style jsx>{`
        .surfer-track {
          animation: surf-x 3.5s ease-in-out infinite;
          display: inline-block;
          transform-origin: bottom center;
        }
        @keyframes surf-x {
          0% {
            transform: translateX(-10%) translateY(0) rotate(-4deg);
          }
          25% {
            transform: translateX(25%) translateY(-4px) rotate(2deg);
          }
          50% {
            transform: translateX(55%) translateY(0) rotate(-2deg);
          }
          75% {
            transform: translateX(80%) translateY(-4px) rotate(3deg);
          }
          100% {
            transform: translateX(-10%) translateY(0) rotate(-4deg);
          }
        }
      `}</style>
    </div>
  );
}
