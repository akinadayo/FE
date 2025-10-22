"use client";

import { useState, useCallback } from "react";
import { Particle, ParticleType } from "./Particle";

interface ParticleData {
  id: string;
  type: ParticleType;
  x: number;
  y: number;
  color?: string;
}

const confettiColors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#ff9ff3'];

// ランダムな値を生成するヘルパー関数（クライアント側のみ）
const getRandomInRange = (min: number, max: number) => {
  return min + Math.random() * (max - min);
};

const getRandomElement = <T,>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};

export function useParticles() {
  const [particles, setParticles] = useState<ParticleData[]>([]);

  const spawnParticles = useCallback((
    x: number,
    y: number,
    type: ParticleType = 'sparkle',
    count: number = 10
  ) => {
    const newParticles: ParticleData[] = [];

    for (let i = 0; i < count; i++) {
      // ランダムな位置に配置（中心から放射状）
      const angle = (Math.PI * 2 * i) / count;
      const distance = getRandomInRange(50, 150);
      const offsetX = Math.cos(angle) * distance;
      const offsetY = Math.sin(angle) * distance;

      newParticles.push({
        id: `particle-${Date.now()}-${i}-${Math.random()}`,
        type,
        x: x + offsetX,
        y: y + offsetY,
        color: type === 'confetti' ? getRandomElement(confettiColors) : undefined,
      });
    }

    setParticles(prev => [...prev, ...newParticles]);
  }, []);

  const spawnBurst = useCallback((
    x: number,
    y: number,
    types: ParticleType[] = ['star', 'sparkle', 'circle']
  ) => {
    const totalCount = 15;
    const newParticles: ParticleData[] = [];

    for (let i = 0; i < totalCount; i++) {
      const angle = (Math.PI * 2 * i) / totalCount;
      const distance = getRandomInRange(30, 150);
      const offsetX = Math.cos(angle) * distance;
      const offsetY = Math.sin(angle) * distance;
      const particleType = getRandomElement(types);

      newParticles.push({
        id: `burst-${Date.now()}-${i}-${Math.random()}`,
        type: particleType,
        x: x + offsetX,
        y: y + offsetY,
        color: particleType === 'confetti' ? getRandomElement(confettiColors) : undefined,
      });
    }

    setParticles(prev => [...prev, ...newParticles]);
  }, []);

  const spawnConfetti = useCallback((x: number, y: number) => {
    const count = 30;
    const newParticles: ParticleData[] = [];

    for (let i = 0; i < count; i++) {
      const offsetX = getRandomInRange(-200, 200);
      const offsetY = getRandomInRange(-200, 200);

      newParticles.push({
        id: `confetti-${Date.now()}-${i}-${Math.random()}`,
        type: 'confetti',
        x: x + offsetX,
        y: y + offsetY,
        color: getRandomElement(confettiColors),
      });
    }

    setParticles(prev => [...prev, ...newParticles]);
  }, []);

  const removeParticle = useCallback((id: string) => {
    setParticles(prev => prev.filter(p => p.id !== id));
  }, []);

  return {
    particles,
    spawnParticles,
    spawnBurst,
    spawnConfetti,
    removeParticle,
  };
}

interface ParticleManagerProps {
  particles: ParticleData[];
  onRemove: (id: string) => void;
}

export function ParticleManager({ particles, onRemove }: ParticleManagerProps) {
  return (
    <>
      {particles.map(particle => (
        <Particle
          key={particle.id}
          id={particle.id}
          type={particle.type}
          x={particle.x}
          y={particle.y}
          color={particle.color}
          onComplete={onRemove}
        />
      ))}
    </>
  );
}
