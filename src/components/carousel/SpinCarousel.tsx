
import { useState, useRef } from 'react';
import { Prize } from '@/data/chestData';
import { SpinCarouselProps, SpinPhase } from './types';
import SpinCarouselHeader from './SpinCarouselHeader';
import CarouselContainer from './CarouselContainer';
import SpinControls from './SpinControls';

const SpinCarousel = ({ isOpen, onClose, prizes, onPrizeWon, chestName }: SpinCarouselProps) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);
  const [spinPhase, setSpinPhase] = useState<SpinPhase>('ready');
  const carouselRef = useRef<HTMLDivElement>(null);

  const spinCarousel = () => {
    if (!carouselRef.current) return;

    setIsSpinning(true);
    setSelectedPrize(null);
    setSpinPhase('spinning');

    // Select random prize
    const randomIndex = Math.floor(Math.random() * prizes.length);
    const wonPrize = prizes[randomIndex];

    const carousel = carouselRef.current;
    const itemWidth = 160; // 140px + 20px gap
    const containerWidth = 800; // 5 items visible
    const centerPosition = containerWidth / 2 - 70; // Center of container minus half item width
    
    // Calculate position for winning item to be in center
    const extendedLength = prizes.length * 5; // 5 repetitions
    const middleSection = Math.floor(extendedLength / 2);
    const targetIndex = middleSection + randomIndex;
    const targetPosition = -(targetIndex * itemWidth) + centerPosition;
    
    // Add extra spins for dramatic effect
    const extraSpins = itemWidth * prizes.length * 3;
    const finalPosition = targetPosition - extraSpins;

    // Reset carousel position
    carousel.style.transition = 'none';
    carousel.style.transform = 'translateX(0px)';
    
    // Force reflow
    carousel.offsetHeight;
    
    // Start spinning animation
    setTimeout(() => {
      carousel.style.transition = 'transform 4s cubic-bezier(0.25, 0.1, 0.25, 1)';
      carousel.style.transform = `translateX(${finalPosition}px)`;
    }, 50);

    // Phase 1: Spinning at full speed
    setTimeout(() => {
      setSpinPhase('slowing');
    }, 2000);

    // Phase 2: Slowing down
    setTimeout(() => {
      setSpinPhase('stopped');
      setSelectedPrize(wonPrize);
      setIsSpinning(false);
    }, 4000);

    // Phase 3: Show result with pulse effect
    setTimeout(() => {
      setSpinPhase('showing-result');
    }, 5000);

    // Phase 4: Open congratulations modal
    setTimeout(() => {
      onPrizeWon(wonPrize);
      resetCarousel();
      onClose();
    }, 7000);
  };

  const resetCarousel = () => {
    if (carouselRef.current) {
      carouselRef.current.style.transition = 'none';
      carouselRef.current.style.transform = 'translateX(0px)';
    }
    setSpinPhase('ready');
    setSelectedPrize(null);
    setIsSpinning(false);
  };

  const handleClose = () => {
    resetCarousel();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <SpinCarouselHeader 
          chestName={chestName}
          spinPhase={spinPhase}
          selectedPrize={selectedPrize}
        />

        <CarouselContainer
          prizes={prizes}
          isSpinning={isSpinning}
          spinPhase={spinPhase}
          selectedPrize={selectedPrize}
          carouselRef={carouselRef}
        />

        <SpinControls
          isSpinning={isSpinning}
          selectedPrize={selectedPrize}
          spinPhase={spinPhase}
          onSpin={spinCarousel}
          onClose={handleClose}
        />
      </div>
    </div>
  );
};

export default SpinCarousel;
