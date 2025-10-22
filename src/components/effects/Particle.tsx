"use client";

import { useEffect, useState } from "react";

export type ParticleType = 'star' | 'sparkle' | 'confetti' | 'heart' | 'circle';

interface ParticleProps {
  id: string;
  type: ParticleType;
  x: number;
  y: number;
  onComplete: (id: string) => void;
  color?: string;
}

const confettiColors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#ff9ff3'];

export function Particle({ id, type, x, y, onComplete, color }: ParticleProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // アニメーション完了後に削除
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete(id);
    }, 1500);

    return () => clearTimeout(timer);
  }, [id, onComplete]);

  if (!isVisible) return null;

  const renderParticle = () => {
    switch (type) {
      case 'star':
        return (
          <div className="particle-star text-4xl">
            ⭐
          </div>
        );
      case 'sparkle':
        return (
          <div className="particle-sparkle text-3xl">
            ✨
          </div>
        );
      case 'confetti':
        return (
          <div className="particle-confetti w-3 h-3 rounded-sm"
               style={{ backgroundColor: color || confettiColors[0] }}>
          </div>
        );
      case 'heart':
        return (
          <div className="particle-heart text-2xl">
            💖
          </div>
        );
      case 'circle':
        return (
          <div className="particle-circle w-2 h-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500">
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="particle-container"
      style={{
        position: 'fixed',
        left: `${x}px`,
        top: `${y}px`,
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    >
      {renderParticle()}
    </div>
  );
}
