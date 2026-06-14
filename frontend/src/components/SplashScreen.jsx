import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';

/**
 * SplashScreen — Morphing logo intro animation.
 * Shows for ~2.8s, then calls onComplete to reveal the app.
 */
export default function SplashScreen({ onComplete }) {
  const ringRef  = useRef(null);
  const ring2Ref = useRef(null);
  const dotsRef  = useRef([]);

  useEffect(() => {
    const tl = gsap.timeline({ onComplete });

    // Outer ring spins
    tl.to(ringRef.current, {
      rotation: 360,
      duration: 2.5,
      ease: 'power2.inOut',
      transformOrigin: 'center center',
    }, 0);

    // Inner ring spins opposite
    tl.to(ring2Ref.current, {
      rotation: -360,
      duration: 2.5,
      ease: 'power2.inOut',
      transformOrigin: 'center center',
    }, 0);

    // Floating dots pulse outward
    dotsRef.current.forEach((dot, i) => {
      if (!dot) return;
      tl.to(dot, {
        scale: 1.6,
        opacity: 0.8,
        duration: 0.4,
        ease: 'power1.out',
        yoyo: true,
        repeat: 3,
        delay: i * 0.08,
      }, 0.3);
    });

    // Fade out entire splash
    tl.to('.splash-root', {
      opacity: 0,
      scale: 1.05,
      duration: 0.5,
      ease: 'power2.in',
    }, 2.3);

    return () => tl.kill();
  }, []);

  // Orbital dot positions
  const dots = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * 2 * Math.PI;
    const r = 72;
    return {
      x: Math.cos(angle) * r,
      y: Math.sin(angle) * r,
    };
  });

  return (
    <div className="splash-root fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#080706]">

      {/* Background ambient glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[400px] h-[400px] rounded-full bg-amber-500/5 blur-[100px]" />
      </div>

      {/* Logo mark */}
      <div className="relative flex items-center justify-center">

        {/* Outer spinning ring */}
        <svg
          ref={ringRef}
          width="180"
          height="180"
          viewBox="0 0 180 180"
          className="absolute"
        >
          <circle
            cx="90" cy="90" r="82"
            fill="none"
            stroke="url(#goldGrad1)"
            strokeWidth="1.5"
            strokeDasharray="12 8"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="goldGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#92400e" stopOpacity="0.3" />
            </linearGradient>
          </defs>
        </svg>

        {/* Inner spinning ring */}
        <svg
          ref={ring2Ref}
          width="140"
          height="140"
          viewBox="0 0 140 140"
          className="absolute"
        >
          <circle
            cx="70" cy="70" r="62"
            fill="none"
            stroke="url(#goldGrad2)"
            strokeWidth="0.8"
            strokeDasharray="4 12"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="goldGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.1" />
            </linearGradient>
          </defs>
        </svg>

        {/* Orbital dots */}
        <div className="absolute w-[180px] h-[180px]">
          {dots.map((pos, i) => (
            <div
              key={i}
              ref={(el) => (dotsRef.current[i] = el)}
              className="absolute w-1.5 h-1.5 rounded-full bg-amber-400"
              style={{
                left: `calc(50% + ${pos.x}px - 3px)`,
                top:  `calc(50% + ${pos.y}px - 3px)`,
                opacity: 0.4 + (i % 3) * 0.15,
              }}
            />
          ))}
        </div>

        {/* Center Logo */}
        <motion.div
          className="relative z-10 flex flex-col items-center justify-center w-24 h-24 rounded-3xl"
          style={{ background: 'linear-gradient(135deg, #1a1714, #111010)', border: '1px solid rgba(245,158,11,0.25)' }}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Chain Link SVG icon */}
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <motion.path
              d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
              stroke="url(#iconGold)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, ease: 'easeInOut', delay: 0.3 }}
            />
            <motion.path
              d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
              stroke="url(#iconGold)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, ease: 'easeInOut', delay: 0.5 }}
            />
            <defs>
              <linearGradient id="iconGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>
      </div>

      {/* App name */}
      <motion.div
        className="mt-10 flex flex-col items-center gap-2"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className="text-4xl font-black tracking-tight text-gold-gradient">
          Linky
        </h1>
        <motion.p
          className="text-xs tracking-[0.25em] text-amber-600/70 uppercase font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          Smart URL Shortener
        </motion.p>
      </motion.div>

      {/* Loading bar */}
      <motion.div
        className="mt-10 w-32 h-[2px] rounded-full overflow-hidden bg-white/5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #d97706, #fbbf24, #f59e0b)' }}
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ delay: 0.6, duration: 1.8, ease: 'easeInOut' }}
        />
      </motion.div>
    </div>
  );
}
