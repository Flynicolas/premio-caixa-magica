
import { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ItemCard from './ItemCard';
import { useRouletteAudio } from '@/hooks/useRouletteAudio';

interface SpinItem {
  id: string;
  name: string;
  image_url?: string | null;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'special';
}

interface RouletteData {
  rouletteSlots: SpinItem[];
  winnerItem: SpinItem;
  centerIndex: number;
  totalSlots: number;
}

interface SpinRouletteWheelProps {
  rouletteData: RouletteData | null;
  onSpinComplete?: (item: SpinItem) => void;
  isSpinning?: boolean;
  className?: string;
}

const SpinRouletteWheel = ({ 
  rouletteData, 
  onSpinComplete, 
  isSpinning = false,
  className = '' 
}: SpinRouletteWheelProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showWinner, setShowWinner] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const ITEM_WIDTH = 140; // width + margin
  
  const {
    audioState,
    startBackgroundMusic,
    stopBackgroundMusic,
    startTickLoop,
    stopTickLoop,
    playRareItemSound,
    toggleMute
  } = useRouletteAudio();

  const startSpin = useCallback(() => {
    if (!rouletteData || isAnimating || !trackRef.current || !containerRef.current) return;
    
    setIsAnimating(true);
    setShowWinner(false);
    setShowParticles(false);
    
    const { centerIndex, winnerItem, totalSlots } = rouletteData;
    
    // Start audio effects
    startBackgroundMusic();
    
    // Calculate container and track dimensions
    const containerWidth = containerRef.current.offsetWidth;
    const trackWidth = totalSlots * ITEM_WIDTH;
    
    // Position the track so the winner item ends up in the center
    const centerPosition = containerWidth / 2;
    const winnerPosition = centerIndex * ITEM_WIDTH + (ITEM_WIDTH / 2);
    const finalOffset = winnerPosition - centerPosition;
    
    // Add extra spins for visual effect (3 full cycles)
    const extraSpins = 3;
    const totalDistance = finalOffset + (extraSpins * trackWidth);
    
    // Set initial track width to accommodate the spin
    if (trackRef.current) {
      trackRef.current.style.width = `${trackWidth * 4}px`; // Extend for smooth animation
    }
    
    // Animation setup
    let startTime: number;
    const totalDuration = 4000; // 4 seconds
    const phases = {
      acceleration: 0.2,   // 20% acceleration
      constant: 0.5,       // 50% constant speed  
      deceleration: 0.3    // 30% deceleration
    };
    
    // Start with fast ticking
    let currentTickInterval = 50;
    startTickLoop(currentTickInterval);
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / totalDuration, 1);
      
      // Calculate current phase and speed
      let currentSpeed = 0;
      let tickInterval = 50;
      
      if (progress < phases.acceleration) {
        // Acceleration phase
        const accelerationProgress = progress / phases.acceleration;
        currentSpeed = accelerationProgress * accelerationProgress; // Quadratic acceleration
        tickInterval = 50;
      } else if (progress < phases.acceleration + phases.constant) {
        // Constant speed phase
        currentSpeed = 1;
        tickInterval = 30;
      } else {
        // Deceleration phase
        const decelerationProgress = (progress - phases.acceleration - phases.constant) / phases.deceleration;
        currentSpeed = 1 - (decelerationProgress * decelerationProgress); // Quadratic deceleration
        tickInterval = 30 + (decelerationProgress * 200); // Slow down tick sound
      }
      
      // Update tick sound speed
      if (Math.abs(currentTickInterval - tickInterval) > 10) {
        currentTickInterval = tickInterval;
        stopTickLoop();
        startTickLoop(Math.floor(currentTickInterval));
      }
      
      // Apply easing to position
      const easeProgress = progress < 0.7 
        ? progress * progress // Ease in for most of the animation
        : 1 - Math.pow(1 - progress, 4); // Strong ease out at the end
      
      const currentPosition = totalDistance * easeProgress;
      
      if (trackRef.current) {
        trackRef.current.style.transform = `translateX(-${currentPosition}px)`;
      }
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Animation complete
        stopTickLoop();
        stopBackgroundMusic();
        setIsAnimating(false);
        setShowWinner(true);
        
        // Play rare item sound
        if (['rare', 'epic', 'legendary', 'special'].includes(winnerItem.rarity)) {
          playRareItemSound(winnerItem.rarity);
        }
        
        // Show particles for rare items
        if (['epic', 'legendary', 'special'].includes(winnerItem.rarity)) {
          setShowParticles(true);
          setTimeout(() => setShowParticles(false), 3000);
        }
        
        setTimeout(() => {
          onSpinComplete?.(winnerItem);
        }, 1000);
      }
    };
    
    requestAnimationFrame(animate);
  }, [rouletteData, isAnimating, startBackgroundMusic, stopBackgroundMusic, startTickLoop, stopTickLoop, playRareItemSound, onSpinComplete]);

  // External trigger for spinning
  useEffect(() => {
    if (isSpinning && rouletteData && !isAnimating) {
      startSpin();
    }
  }, [isSpinning, rouletteData, isAnimating, startSpin]);

  if (!rouletteData) {
    return (
      <div className={`flex items-center justify-center h-40 ${className}`}>
        <div className="text-white/70">Carregando roleta...</div>
      </div>
    );
  }

  const { rouletteSlots, centerIndex } = rouletteData;

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Audio Controls */}
      <div className="absolute top-4 right-4 z-30">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleMute}
          className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
        >
          {audioState.isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </Button>
      </div>

      {/* Golden Arrow */}
      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-20">
        <div 
          className="text-4xl animate-pulse text-yellow-400"
          style={{ 
            filter: 'drop-shadow(0 0 8px rgb(251 191 36 / 0.8))',
            textShadow: '0 0 12px rgb(251 191 36 / 0.8)'
          }}
        >
          ▼
        </div>
      </div>

      {/* Roulette Container */}
      <div className="relative w-full max-w-4xl mx-auto h-40 overflow-hidden rounded-xl border-4 border-white/20 bg-black/40 backdrop-blur-sm">
        {/* Track */}
        <div 
          ref={trackRef}
          className="flex absolute top-0 left-0 h-full"
        >
          {/* Create continuous track by duplicating items */}
          {Array.from({ length: 4 }, (_, duplicateIndex) => 
            rouletteSlots.map((item, index) => (
              <div 
                key={`${duplicateIndex}-${item.id}-${index}`}
                className={`
                  flex-shrink-0 mx-2 my-4 transition-all duration-500
                  ${showWinner && duplicateIndex === 0 && index === centerIndex ? 'scale-110 z-10' : ''}
                `}
                style={{ 
                  width: `${ITEM_WIDTH - 16}px`,
                  filter: showWinner && duplicateIndex === 0 && index === centerIndex
                    ? 'drop-shadow(0 0 16px rgb(251 191 36 / 0.8))' 
                    : 'none'
                }}
              >
                <ItemCard 
                  item={item} 
                  size="md" 
                  showRarity={false}
                  className={showWinner && duplicateIndex === 0 && index === centerIndex ? 'border-yellow-400 border-2' : ''}
                />
              </div>
            ))
          )}
        </div>

        {/* Center Highlight Zone */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-full pointer-events-none">
          <div className="w-full h-full border-2 border-dashed border-yellow-400/30" />
        </div>

        {/* Particles Effect for Rare Items */}
        {showParticles && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <Sparkles
                key={i}
                className="absolute animate-ping text-yellow-400"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random()}s`
                }}
                size={12 + Math.random() * 8}
              />
            ))}
          </div>
        )}
      </div>

      {/* Spinning Indicator */}
      {isAnimating && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-xl z-10">
          <div className="text-yellow-400 text-xl font-bold animate-pulse">
            🎰 Girando a roleta...
          </div>
        </div>
      )}

      {/* Winner Announcement */}
      {showWinner && rouletteData.winnerItem && (
        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-black/90 backdrop-blur-sm border-2 border-yellow-400 rounded-lg px-6 py-3 animate-scale-in">
            <div className="text-center">
              <div className="text-yellow-400 font-bold text-lg">🎉 Você ganhou!</div>
              <div className="text-white font-semibold">{rouletteData.winnerItem.name}</div>
              <div className="text-sm text-white/70 capitalize">{rouletteData.winnerItem.rarity}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpinRouletteWheel;
