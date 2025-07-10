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
    
    const { centerIndex, winnerItem } = rouletteData;
    
    // Start audio effects
    startBackgroundMusic();
    
    // Calculate positions
    const containerWidth = containerRef.current.offsetWidth;
    const centerPosition = centerIndex * ITEM_WIDTH;
    const targetPosition = centerPosition - (containerWidth / 2) + (ITEM_WIDTH / 2);
    
    // Add extra spins for visual effect
    const extraSpins = 3; // 3 full spins
    const fullSpinDistance = rouletteData.totalSlots * ITEM_WIDTH;
    const totalDistance = targetPosition + (extraSpins * fullSpinDistance);
    
    // Animation phases
    let startTime: number;
    let startPosition = 0;
    const totalDuration = 4000; // 4 seconds total
    const accelerationPhase = 0.2; // 20% acceleration
    const constantPhase = 0.5; // 50% constant speed
    const decelerationPhase = 0.3; // 30% deceleration
    
    // Start tick loop
    let tickInterval = 100; // Initial tick interval
    startTickLoop(tickInterval);
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / totalDuration, 1);
      
      let currentSpeed = 0;
      
      if (progress < accelerationPhase) {
        // Acceleration phase
        const accelerationProgress = progress / accelerationPhase;
        currentSpeed = accelerationProgress;
      } else if (progress < accelerationPhase + constantPhase) {
        // Constant speed phase
        currentSpeed = 1;
      } else {
        // Deceleration phase
        const decelerationProgress = (progress - accelerationPhase - constantPhase) / decelerationPhase;
        currentSpeed = 1 - Math.pow(decelerationProgress, 2);
        
        // Slow down tick sound
        const newTickInterval = 100 + (decelerationProgress * 300);
        startTickLoop(Math.floor(newTickInterval));
      }
      
      // Apply easing
      const easeProgress = progress < accelerationPhase + constantPhase 
        ? progress * progress // Ease in
        : 1 - Math.pow(1 - progress, 3); // Ease out
      
      const currentPosition = startPosition + (totalDistance * easeProgress);
      
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
        <div className="text-muted-foreground">Carregando roleta...</div>
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
          className="bg-background/80 backdrop-blur-sm"
        >
          {audioState.isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </Button>
      </div>

      {/* Golden Arrow */}
      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-20">
        <div 
          className="text-4xl animate-pulse"
          style={{ 
            color: 'hsl(var(--primary))',
            filter: 'drop-shadow(0 0 8px hsl(var(--primary) / 0.6))',
            textShadow: '0 0 12px hsl(var(--primary) / 0.8)'
          }}
        >
          ▼
        </div>
      </div>

      {/* Roulette Container */}
      <div className="relative w-full max-w-4xl mx-auto h-40 overflow-hidden rounded-xl border-4 border-border bg-background/90 backdrop-blur-sm">
        {/* Track */}
        <div 
          ref={trackRef}
          className="flex absolute top-0 left-0 h-full"
          style={{ width: `${ITEM_WIDTH * rouletteData.totalSlots}px` }}
        >
          {rouletteSlots.map((item, index) => (
            <div 
              key={`${item.id}-${index}`}
              className={`
                flex-shrink-0 mx-2 my-4 transition-all duration-500
                ${showWinner && index === centerIndex ? 'scale-110 z-10' : ''}
              `}
              style={{ 
                width: `${ITEM_WIDTH - 16}px`,
                filter: showWinner && index === centerIndex
                  ? 'drop-shadow(0 0 16px hsl(var(--primary) / 0.8))' 
                  : 'none'
              }}
            >
              <ItemCard 
                item={item} 
                size="md" 
                showRarity={false}
                className={showWinner && index === centerIndex ? 'border-primary' : ''}
              />
            </div>
          ))}
        </div>

        {/* Center Highlight Zone */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-full pointer-events-none">
          <div 
            className="w-full h-full border-2 border-dashed opacity-30"
            style={{ borderColor: 'hsl(var(--primary))' }}
          />
        </div>

        {/* Particles Effect for Rare Items */}
        {showParticles && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <Sparkles
                key={i}
                className="absolute animate-ping text-primary"
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
        <div className="absolute inset-0 flex items-center justify-center bg-background/20 backdrop-blur-sm rounded-xl z-10">
          <div className="text-primary text-xl font-bold animate-pulse">
            🎰 Girando a roleta...
          </div>
        </div>
      )}

      {/* Winner Announcement */}
      {showWinner && rouletteData.winnerItem && (
        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-background/95 backdrop-blur-sm border-2 border-primary rounded-lg px-6 py-3 animate-scale-in">
            <div className="text-center">
              <div className="text-primary font-bold text-lg">🎉 Você ganhou!</div>
              <div className="text-foreground font-semibold">{rouletteData.winnerItem.name}</div>
              <div className="text-sm text-muted-foreground capitalize">{rouletteData.winnerItem.rarity}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpinRouletteWheel;