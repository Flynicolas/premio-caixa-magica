import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import ItemCard from './ItemCard';

interface SpinItem {
  id: string;
  name: string;
  image_url?: string | null;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'special';
}

interface SpinRouletteWheelProps {
  items: SpinItem[];
  onSpinComplete?: (item: SpinItem) => void;
  isSpinning?: boolean;
  className?: string;
}

const SpinRouletteWheel = ({ 
  items, 
  onSpinComplete, 
  isSpinning = false,
  className = '' 
}: SpinRouletteWheelProps) => {
  const [slots, setSlots] = useState<SpinItem[]>([]);
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  
  const TOTAL_SLOTS = 25;
  const ITEM_WIDTH = 140; // width + margin
  const CENTER_INDEX = Math.floor(TOTAL_SLOTS / 2);

  // Build the roulette slots
  useEffect(() => {
    if (items.length === 0) return;
    
    const newSlots: SpinItem[] = [];
    
    // Fill slots with random items, but we'll set the winner later
    for (let i = 0; i < TOTAL_SLOTS; i++) {
      const randomItem = items[Math.floor(Math.random() * items.length)];
      newSlots.push(randomItem);
    }
    
    setSlots(newSlots);
  }, [items]);

  const startSpin = (winningItem: SpinItem) => {
    if (isAnimating || !trackRef.current) return;
    
    setIsAnimating(true);
    setWinnerIndex(null);
    
    // Update the center slot with the winning item
    const updatedSlots = [...slots];
    updatedSlots[CENTER_INDEX] = winningItem;
    setSlots(updatedSlots);
    
    // Calculate the distance to move to center the winning item
    const centerPosition = CENTER_INDEX * ITEM_WIDTH;
    const containerWidth = trackRef.current.offsetWidth;
    const targetPosition = centerPosition - (containerWidth / 2) + (ITEM_WIDTH / 2);
    
    // Animate the roulette
    let startTime: number;
    let startPosition = 0;
    const duration = 3000; // 3 seconds
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentPosition = startPosition + (targetPosition * easeOut);
      
      if (trackRef.current) {
        trackRef.current.style.transform = `translateX(-${currentPosition}px)`;
      }
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Animation complete
        setWinnerIndex(CENTER_INDEX);
        setIsAnimating(false);
        
        setTimeout(() => {
          onSpinComplete?.(winningItem);
        }, 500);
      }
    };
    
    requestAnimationFrame(animate);
  };

  // External trigger for spinning
  useEffect(() => {
    if (isSpinning && items.length > 0 && !isAnimating) {
      const randomWinner = items[Math.floor(Math.random() * items.length)];
      startSpin(randomWinner);
    }
  }, [isSpinning, items, isAnimating]);

  return (
    <div className={`relative ${className}`}>
      {/* Golden Arrow */}
      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-20">
        <div 
          className="text-4xl"
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
          style={{ width: `${ITEM_WIDTH * TOTAL_SLOTS}px` }}
        >
          {slots.map((item, index) => (
            <div 
              key={`${item.id}-${index}`}
              className={`
                flex-shrink-0 mx-2 my-4 transition-all duration-500
                ${winnerIndex === index ? 'scale-110 z-10' : ''}
              `}
              style={{ 
                width: `${ITEM_WIDTH - 16}px`,
                filter: winnerIndex === index 
                  ? 'drop-shadow(0 0 16px hsl(var(--primary) / 0.8))' 
                  : 'none'
              }}
            >
              <ItemCard 
                item={item} 
                size="md" 
                showRarity={false}
                className={winnerIndex === index ? 'border-primary' : ''}
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
      </div>

      {/* Spinning Indicator */}
      {isAnimating && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/20 backdrop-blur-sm rounded-xl">
          <div className="text-primary text-xl font-bold animate-pulse">
            Girando...
          </div>
        </div>
      )}
    </div>
  );
};

export default SpinRouletteWheel;