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

  // Initialize audio elements
  useEffect(() => {
    // Create tick sound (metallic click)
    tickAudioRef.current = new Audio();
    tickAudioRef.current.volume = 0.3;
    tickAudioRef.current.preload = 'auto';
    
    // Create background music
    backgroundMusicRef.current = new Audio();
    backgroundMusicRef.current.volume = 0.2;
    backgroundMusicRef.current.loop = true;
    backgroundMusicRef.current.preload = 'auto';
    
    // Create rare item sound
    rareItemSoundRef.current = new Audio();
    rareItemSoundRef.current.volume = 0.5;
    rareItemSoundRef.current.preload = 'auto';

    // Since we don't have real audio files, we'll use Web Audio API for synthetic sounds
    createSyntheticSounds();

    return () => {
      // Cleanup
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
      }
    };
  }, []);

  const createSyntheticSounds = () => {
    // Create synthetic tick sound using Web Audio API
    const createTickSound = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    };

    // Replace the tick audio play function
    if (tickAudioRef.current) {
      const originalPlay = tickAudioRef.current.play.bind(tickAudioRef.current);
      tickAudioRef.current.play = () => {
        if (!audioState.isMuted) {
          try {
            createTickSound();
          } catch (error) {
            console.warn('Could not play tick sound:', error);
          }
        }
        return Promise.resolve();
      };
    }
  };

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

  const playTickSound = useCallback(() => {
    if (tickAudioRef.current && !audioState.isMuted) {
      tickAudioRef.current.play().catch(console.warn);
    }
  }, [audioState.isMuted]);

  const startTickLoop = useCallback((interval: number = 200) => {
    if (tickIntervalRef.current) {
      clearInterval(tickIntervalRef.current);
    }
    
    tickIntervalRef.current = setInterval(() => {
      playTickSound();
    }, interval);
  }, [playTickSound]);

  const stopTickLoop = useCallback(() => {
    if (tickIntervalRef.current) {
      clearInterval(tickIntervalRef.current);
      tickIntervalRef.current = null;
    }
  }, []);

  const playRareItemSound = useCallback((rarity: string) => {
    if (rareItemSoundRef.current && !audioState.isMuted) {
      // Different sounds for different rarities
      const rarityVolumes = {
        rare: 0.4,
        epic: 0.6,
        legendary: 0.8,
        special: 1.0
      };

      rareItemSoundRef.current.volume = rarityVolumes[rarity as keyof typeof rarityVolumes] || 0.3;
      
      // Create synthetic celebration sound
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Create a sequence of ascending notes
        const frequencies = [523, 659, 783, 1047]; // C5, E5, G5, C6
        frequencies.forEach((freq, index) => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + index * 0.15);
          oscillator.type = 'sine';
          
          const volume = rarityVolumes[rarity as keyof typeof rarityVolumes] || 0.3;
          gainNode.gain.setValueAtTime(volume, audioContext.currentTime + index * 0.15);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * 0.15 + 0.3);
          
          oscillator.start(audioContext.currentTime + index * 0.15);
          oscillator.stop(audioContext.currentTime + index * 0.15 + 0.3);
        });
      } catch (error) {
        console.warn('Could not play rare item sound:', error);
      }
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