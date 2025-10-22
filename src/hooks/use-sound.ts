'use client';

import { useCallback, useEffect, useState } from 'react';
import { getSoundGenerator, SoundEffect } from '@/lib/sound-generator';

const SOUND_ENABLED_KEY = 'sound-enabled';
const SOUND_VOLUME_KEY = 'sound-volume';

/**
 * 効果音再生用のカスタムフック
 */
export function useSound() {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [isClient, setIsClient] = useState(false);

  // クライアントサイドでのみ実行
  useEffect(() => {
    setIsClient(true);

    // localStorageから設定を読み込む
    const savedMuted = localStorage.getItem(SOUND_ENABLED_KEY);
    const savedVolume = localStorage.getItem(SOUND_VOLUME_KEY);

    if (savedMuted !== null) {
      const muted = savedMuted === 'false';
      setIsMuted(muted);
      getSoundGenerator().setMuted(muted);
    }

    if (savedVolume !== null) {
      const vol = parseFloat(savedVolume);
      setVolume(vol);
      getSoundGenerator().setVolume(vol);
    }
  }, []);

  const play = useCallback((effect: SoundEffect) => {
    if (!isClient) return;

    const generator = getSoundGenerator();

    switch (effect) {
      case 'click':
        generator.playClick();
        break;
      case 'correct':
        generator.playCorrect();
        break;
      case 'incorrect':
        generator.playIncorrect();
        break;
      case 'complete':
        generator.playComplete();
        break;
      case 'transition':
        generator.playTransition();
        break;
      case 'flip':
        generator.playFlip();
        break;
      case 'notification':
        generator.playNotification();
        break;
      case 'achievement':
        generator.playAchievement();
        break;
    }
  }, [isClient]);

  const toggleMute = useCallback(() => {
    if (!isClient) return;

    const newMuted = !isMuted;
    setIsMuted(newMuted);
    getSoundGenerator().setMuted(newMuted);
    localStorage.setItem(SOUND_ENABLED_KEY, String(!newMuted));
  }, [isMuted, isClient]);

  const changeVolume = useCallback((newVolume: number) => {
    if (!isClient) return;

    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(clampedVolume);
    getSoundGenerator().setVolume(clampedVolume);
    localStorage.setItem(SOUND_VOLUME_KEY, String(clampedVolume));
  }, [isClient]);

  return {
    play,
    isMuted,
    toggleMute,
    volume,
    changeVolume,
  };
}

/**
 * 簡易版のフック - 効果音再生のみ
 */
export function useSoundEffect() {
  const { play } = useSound();
  return play;
}
