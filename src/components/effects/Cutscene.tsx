"use client";

import { useEffect, useState } from "react";

export type CutsceneType = 'PERFECT' | 'EXCELLENT' | 'GOOD' | 'NICE';

interface CutsceneProps {
  type: CutsceneType;
  onComplete: () => void;
}

export function Cutscene({ type, onComplete }: CutsceneProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // カットイン表示時間（1秒）
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 1000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  const getStyles = () => {
    switch (type) {
      case 'PERFECT':
        return {
          text: 'PERFECT!',
          gradient: 'from-yellow-400 via-orange-400 to-pink-500',
          textColor: 'text-white',
          glow: 'rgba(251, 191, 36, 0.8)'
        };
      case 'EXCELLENT':
        return {
          text: 'EXCELLENT!',
          gradient: 'from-purple-400 via-pink-400 to-red-400',
          textColor: 'text-white',
          glow: 'rgba(168, 85, 247, 0.8)'
        };
      case 'GOOD':
        return {
          text: 'GOOD!',
          gradient: 'from-blue-400 via-cyan-400 to-teal-400',
          textColor: 'text-white',
          glow: 'rgba(59, 130, 246, 0.8)'
        };
      case 'NICE':
        return {
          text: 'NICE!',
          gradient: 'from-green-400 via-emerald-400 to-teal-400',
          textColor: 'text-white',
          glow: 'rgba(34, 197, 94, 0.8)'
        };
    }
  };

  const styles = getStyles();

  return (
    <div
      className="cutscene-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        pointerEvents: 'none',
      }}
    >
      <div
        className={`cutscene-text text-7xl md:text-9xl font-black ${styles.textColor} bg-gradient-to-r ${styles.gradient} bg-clip-text text-transparent`}
        style={{
          textShadow: `
            0 0 20px ${styles.glow},
            0 0 40px ${styles.glow},
            0 0 60px ${styles.glow},
            4px 4px 8px rgba(0, 0, 0, 0.5)
          `,
          WebkitTextStroke: '2px rgba(255, 255, 255, 0.5)',
        }}
      >
        {styles.text}
      </div>
    </div>
  );
}
