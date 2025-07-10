
import { useState, useEffect, useRef, useCallback } from 'react';

interface AudioState {
  isPlaying: boolean;
  isMuted: boolean;
}

export const useRouletteAudio = () => {
  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false,
    isMuted: false
  });

  const tickAudioRef = useRef<HTMLAudioElement | null>(null);
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);
  const rareItemSoundRef = useRef<HTMLAudioElement | null>(null);
  const tickIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio context and elements
  useEffect(() => {
    // Initialize audio context
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Audio context not supported:', error);
    }

    // Create audio elements
    tickAudioRef.current = new Audio();
    tickAudioRef.current.volume = 0.3;
    tickAudioRef.current.preload = 'auto';
    
    backgroundMusicRef.current = new Audio();
    backgroundMusicRef.current.volume = 0.2;
    backgroundMusicRef.current.loop = true;
    backgroundMusicRef.current.preload = 'auto';
    
    rareItemSoundRef.current = new Audio();
    rareItemSoundRef.current.volume = 0.5;
    rareItemSoundRef.current.preload = 'auto';

    return () => {
      // Cleanup
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const createTickSound = useCallback((frequency: number = 800, duration: number = 0.1) => {
    if (!audioContextRef.current || audioState.isMuted) return;
    
    try {
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.3, audioContextRef.current.currentTime + duration);
      
      gainNode.gain.setValueAtTime(0.15, audioContextRef.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + duration);
      
      oscillator.start(audioContextRef.current.currentTime);
      oscillator.stop(audioContextRef.current.currentTime + duration);
    } catch (error) {
      console.warn('Could not create tick sound:', error);
    }
  }, [audioState.isMuted]);

  const startBackgroundMusic = useCallback(() => {
    if (backgroundMusicRef.current && !audioState.isMuted) {
      setAudioState(prev => ({ ...prev, isPlaying: true }));
      // Since we don't have a real file, we'll skip this for now
      // backgroundMusicRef.current.play().catch(console.warn);
    }
  }, [audioState.isMuted]);

  const stopBackgroundMusic = useCallback(() => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.pause();
      backgroundMusicRef.current.currentTime = 0;
      setAudioState(prev => ({ ...prev, isPlaying: false }));
    }
  }, []);

  const playTickSound = useCallback((speed: number = 1) => {
    // Adjust frequency based on speed - higher frequency for faster speeds
    const frequency = 600 + (speed * 400);
    const duration = 0.05 + (0.05 / speed); // Shorter duration for faster speeds
    createTickSound(frequency, duration);
  }, [createTickSound]);

  const startTickLoop = useCallback((interval: number = 200) => {
    if (tickIntervalRef.current) {
      clearInterval(tickIntervalRef.current);
    }
    
    // Calculate speed based on interval (shorter interval = higher speed)
    const speed = Math.max(0.5, 200 / interval);
    
    tickIntervalRef.current = setInterval(() => {
      playTickSound(speed);
    }, interval);
  }, [playTickSound]);

  const stopTickLoop = useCallback(() => {
    if (tickIntervalRef.current) {
      clearInterval(tickIntervalRef.current);
      tickIntervalRef.current = null;
    }
  }, []);

  const playRareItemSound = useCallback((rarity: string) => {
    if (!audioContextRef.current || audioState.isMuted) return;
    
    try {
      // Different sounds for different rarities
      const rarityConfigs = {
        rare: { frequencies: [523, 659], volume: 0.3 },
        epic: { frequencies: [523, 659, 783], volume: 0.4 },
        legendary: { frequencies: [523, 659, 783, 1047], volume: 0.5 },
        special: { frequencies: [523, 659, 783, 1047, 1319], volume: 0.6 }
      };

      const config = rarityConfigs[rarity as keyof typeof rarityConfigs] || rarityConfigs.rare;
      
      // Create a sequence of ascending notes
      config.frequencies.forEach((freq, index) => {
        const oscillator = audioContextRef.current!.createOscillator();
        const gainNode = audioContextRef.current!.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContextRef.current!.destination);
        
        oscillator.frequency.setValueAtTime(freq, audioContextRef.current!.currentTime + index * 0.15);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(config.volume, audioContextRef.current!.currentTime + index * 0.15);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current!.currentTime + index * 0.15 + 0.4);
        
        oscillator.start(audioContextRef.current!.currentTime + index * 0.15);
        oscillator.stop(audioContextRef.current!.currentTime + index * 0.15 + 0.4);
      });
    } catch (error) {
      console.warn('Could not play rare item sound:', error);
    }
  }, [audioState.isMuted]);

  const toggleMute = useCallback(() => {
    setAudioState(prev => ({ ...prev, isMuted: !prev.isMuted }));
    if (audioState.isPlaying && !audioState.isMuted) {
      stopBackgroundMusic();
    }
  }, [audioState.isMuted, audioState.isPlaying, stopBackgroundMusic]);

  return {
    audioState,
    startBackgroundMusic,
    stopBackgroundMusic,
    playTickSound,
    startTickLoop,
    stopTickLoop,
    playRareItemSound,
    toggleMute
  };
};
