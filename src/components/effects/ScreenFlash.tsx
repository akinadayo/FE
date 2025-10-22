"use client";

import { useEffect, useState } from "react";

export type FlashColor = 'success' | 'error';

interface ScreenFlashProps {
  color: FlashColor;
  onComplete: () => void;
}

export function ScreenFlash({ color, onComplete }: ScreenFlashProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // フラッシュ効果は短時間（300ms）
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 300);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  const bgColor = color === 'success'
    ? 'rgba(34, 197, 94, 0.2)'   // 緑系
    : 'rgba(239, 68, 68, 0.2)';   // 赤系

  return (
    <div
      className="screen-flash"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: bgColor,
        zIndex: 9998,
        pointerEvents: 'none',
      }}
    />
  );
}
