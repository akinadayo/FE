/**
 * Web Audio APIを使用して効果音を動的に生成するユーティリティ
 */

class SoundGenerator {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private masterVolume: number = 0.3; // デフォルト音量
  private isMuted: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initAudioContext();
    }
  }

  private initAudioContext() {
    try {
      // @ts-expect-error - webkitAudioContext for Safari
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
      this.updateVolume();
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  private updateVolume() {
    if (this.gainNode) {
      this.gainNode.gain.value = this.isMuted ? 0 : this.masterVolume;
    }
  }

  setVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateVolume();
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
    this.updateVolume();
  }

  getVolume(): number {
    return this.masterVolume;
  }

  isMutedState(): boolean {
    return this.isMuted;
  }

  /**
   * クリック音を再生（短い高音）
   */
  playClick() {
    if (!this.audioContext || !this.gainNode) return;

    const oscillator = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    oscillator.connect(gain);
    gain.connect(this.gainNode);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    const now = this.audioContext.currentTime;
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

    oscillator.start(now);
    oscillator.stop(now + 0.05);
  }

  /**
   * 正解音を再生（ポジティブな上昇音）
   */
  playCorrect() {
    if (!this.audioContext || !this.gainNode) return;

    const now = this.audioContext.currentTime;

    // 3つの音を重ねて和音を作る
    const frequencies = [523.25, 659.25, 783.99]; // C, E, G

    frequencies.forEach((freq, index) => {
      const oscillator = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();

      oscillator.connect(gain);
      gain.connect(this.gainNode!);

      oscillator.frequency.value = freq;
      oscillator.type = 'sine';

      const startTime = now + index * 0.05;
      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.3);
    });
  }

  /**
   * 不正解音を再生（ネガティブな下降音）
   */
  playIncorrect() {
    if (!this.audioContext || !this.gainNode) return;

    const oscillator = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    oscillator.connect(gain);
    gain.connect(this.gainNode);

    const now = this.audioContext.currentTime;
    oscillator.frequency.setValueAtTime(300, now);
    oscillator.frequency.exponentialRampToValueAtTime(150, now + 0.2);
    oscillator.type = 'sawtooth';

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    oscillator.start(now);
    oscillator.stop(now + 0.2);
  }

  /**
   * 完了音を再生（達成感のある和音）
   */
  playComplete() {
    if (!this.audioContext || !this.gainNode) return;

    const now = this.audioContext.currentTime;

    // アルペジオで和音を演奏
    const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C, E, G, C (1オクターブ上)

    frequencies.forEach((freq, index) => {
      const oscillator = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();

      oscillator.connect(gain);
      gain.connect(this.gainNode!);

      oscillator.frequency.value = freq;
      oscillator.type = 'triangle';

      const startTime = now + index * 0.08;
      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.5);
    });
  }

  /**
   * ページ遷移音を再生（柔らかい遷移音）
   */
  playTransition() {
    if (!this.audioContext || !this.gainNode) return;

    const oscillator = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    oscillator.connect(gain);
    gain.connect(this.gainNode);

    const now = this.audioContext.currentTime;
    oscillator.frequency.setValueAtTime(400, now);
    oscillator.frequency.exponentialRampToValueAtTime(600, now + 0.1);
    oscillator.type = 'sine';

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    oscillator.start(now);
    oscillator.stop(now + 0.1);
  }

  /**
   * フラッシュカードめくり音を再生（さらさらとした音）
   */
  playFlip() {
    if (!this.audioContext || !this.gainNode) return;

    // ホワイトノイズでさらさらとした音を作る
    const bufferSize = this.audioContext.sampleRate * 0.05;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.audioContext.createBufferSource();
    noise.buffer = buffer;

    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 2000;

    const gain = this.audioContext.createGain();

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.gainNode);

    const now = this.audioContext.currentTime;
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

    noise.start(now);
    noise.stop(now + 0.05);
  }

  /**
   * 通知音を再生（お知らせ音）
   */
  playNotification() {
    if (!this.audioContext || !this.gainNode) return;

    const now = this.audioContext.currentTime;

    // 2つの音を連続再生
    [880, 1046.50].forEach((freq, index) => {
      const oscillator = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();

      oscillator.connect(gain);
      gain.connect(this.gainNode!);

      oscillator.frequency.value = freq;
      oscillator.type = 'sine';

      const startTime = now + index * 0.1;
      gain.gain.setValueAtTime(0.1, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.1);
    });
  }

  /**
   * 達成音を再生（レベルアップ的な音）
   */
  playAchievement() {
    if (!this.audioContext || !this.gainNode) return;

    const now = this.audioContext.currentTime;

    // 上昇する和音パターン
    const pattern = [
      { freq: 523.25, time: 0 },     // C
      { freq: 659.25, time: 0.1 },   // E
      { freq: 783.99, time: 0.15 },  // G
      { freq: 1046.50, time: 0.2 },  // C (高)
    ];

    pattern.forEach(({ freq, time }) => {
      const oscillator = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();

      oscillator.connect(gain);
      gain.connect(this.gainNode!);

      oscillator.frequency.value = freq;
      oscillator.type = 'triangle';

      const startTime = now + time;
      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.4);
    });
  }
}

// シングルトンインスタンス
let soundGeneratorInstance: SoundGenerator | null = null;

export function getSoundGenerator(): SoundGenerator {
  if (typeof window === 'undefined') {
    // サーバーサイドでは何もしない
    return {
      playClick: () => {},
      playCorrect: () => {},
      playIncorrect: () => {},
      playComplete: () => {},
      playTransition: () => {},
      playFlip: () => {},
      playNotification: () => {},
      playAchievement: () => {},
      setVolume: () => {},
      setMuted: () => {},
      getVolume: () => 0.3,
      isMutedState: () => false,
    } as unknown as SoundGenerator;
  }

  if (!soundGeneratorInstance) {
    soundGeneratorInstance = new SoundGenerator();
  }
  return soundGeneratorInstance;
}

export type SoundEffect =
  | 'click'
  | 'correct'
  | 'incorrect'
  | 'complete'
  | 'transition'
  | 'flip'
  | 'notification'
  | 'achievement';
