"use client";

import { useEffect, useState } from "react";

interface ExpPopupProps {
  id: string;
  x: number;
  y: number;
  exp: number;
  onComplete: (id: string) => void;
}

export function ExpPopup({ id, x, y, exp, onComplete }: ExpPopupProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // アニメーション完了後に削除
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete(id);
    }, 2000);

    return () => clearTimeout(timer);
  }, [id, onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className="exp-popup"
      style={{
        position: 'fixed',
        left: `${x}px`,
        top: `${y}px`,
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    >
      <div className="exp-popup-content text-3xl font-bold text-yellow-400">
        +{exp} EXP
      </div>
    </div>
  );
}

interface ExpPopupData {
  id: string;
  x: number;
  y: number;
  exp: number;
}

interface ExpPopupManagerProps {
  popups: ExpPopupData[];
  onRemove: (id: string) => void;
}

export function ExpPopupManager({ popups, onRemove }: ExpPopupManagerProps) {
  return (
    <>
      {popups.map(popup => (
        <ExpPopup
          key={popup.id}
          id={popup.id}
          x={popup.x}
          y={popup.y}
          exp={popup.exp}
          onComplete={onRemove}
        />
      ))}
    </>
  );
}
