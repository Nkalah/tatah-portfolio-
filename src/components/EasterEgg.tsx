/**
 * EasterEgg.tsx - Konami Code & "build" Keyboard Listener
 * 
 * Triggers particle burst + secret builder achievement banner.
 */

import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, X } from 'lucide-react';
import { soundManager } from '../audio/soundManager.ts';

const KONAMI_SEQUENCE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
];

export function EasterEgg() {
  const [konamiIndex, setKonamiIndex] = useState(0);
  const [typedBuffer, setTypedBuffer] = useState('');
  const [unlocked, setUnlocked] = useState(false);

  const triggerCelebration = () => {
    soundManager.playSuccess();
    setUnlocked(true);

    // Cyan & Gold Confetti Particle Burst
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#06b6d4', '#38bdf8', '#fbbf24', '#f8fafc'],
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check Konami Code
      if (e.key === KONAMI_SEQUENCE[konamiIndex]) {
        const next = konamiIndex + 1;
        if (next === KONAMI_SEQUENCE.length) {
          triggerCelebration();
          setKonamiIndex(0);
        } else {
          setKonamiIndex(next);
        }
      } else {
        setKonamiIndex(0);
      }

      // Check "build" typing sequence
      const newBuf = (typedBuffer + e.key.toLowerCase()).slice(-5);
      setTypedBuffer(newBuf);
      if (newBuf === 'build') {
        triggerCelebration();
        setTypedBuffer('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [konamiIndex, typedBuffer]);

  if (!unlocked) return null;

  return (
    <div className="fixed top-20 right-6 z-50 animate-in slide-in-from-top-4 duration-300">
      <div className="p-4 rounded-xl bg-[#090d16]/95 border border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.35)] backdrop-blur-md max-w-sm text-xs font-mono text-slate-100 flex items-start gap-3">
        <div className="p-2 rounded bg-cyan-950/80 border border-cyan-400/50 text-cyan-400 shrink-0">
          <Trophy className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-white text-sm">Secret Unlocked!</span>
            <button
              onClick={() => setUnlocked(false)}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-slate-300 leading-normal mb-2">
            You discovered the builder easter egg (Konami code / "build").
          </p>
          <div className="p-2 rounded bg-slate-950 border border-slate-800 text-[11px] text-cyan-300">
            "Build things. Break things. Understand why. Build better." — Tafadzwa Nkala
          </div>
        </div>
      </div>
    </div>
  );
}
