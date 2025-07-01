
import { useState } from 'react';
import { Prize } from '@/data/chestData';
import { SpinCarouselProps, SpinPhase } from './types';
import SpinCarouselHeader from './SpinCarouselHeader';
import CarouselContainer from './CarouselContainer';
import SpinControls from './SpinControls';

const SpinCarousel = ({ isOpen, onClose, prizes, onPrizeWon, chestName }: SpinCarouselProps) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);
  const [spinPhase, setSpinPhase] = useState<SpinPhase>('ready');

  const spinCarousel = () => {
    setIsSpinning(true);
    setSelectedPrize(null);
    setSpinPhase('building');

    // Random prize selection
    const randomIndex = Math.floor(Math.random() * prizes.length);
    const wonPrize = prizes[randomIndex];

    // Calculate exact positioning - each item is 160px wide (140px + 20px gap)
    const itemWidth = 160;
    const containerWidth = 5 * itemWidth; // 5 items visible
    const centerPosition = containerWidth / 2 - itemWidth / 2; // Center of the container
    
    // Find the position of our selected prize in the repeated array
    const targetItemIndex = prizes.length * 2 + randomIndex; // Use middle section
    const targetPosition = targetItemIndex * itemWidth;
    
    // Calculate final position to center the selected item
    const finalPosition = centerPosition - targetPosition;
    
    // Add extra spins for effect
    const extraSpins = itemWidth * prizes.length * 4; // 4 full rotations
    const totalFinalPosition = finalPosition - extraSpins;

    const carousel = document.getElementById('carousel');
    if (carousel) {
      // Reset position
      carousel.style.transition = 'none';
      carousel.style.transform = 'translateX(0px)';
      
      // Force reflow
      carousel.offsetHeight;
      
      // Phase 1: Fast acceleration
      setTimeout(() => {
        setSpinPhase('building');
        carousel.style.transition = 'transform 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        carousel.style.transform = `translateX(-1200px)`;
      }, 100);

      // Phase 2: Maximum speed with longer duration
      setTimeout(() => {
        setSpinPhase('slowing');
        carousel.style.transition = 'transform 4s cubic-bezier(0.23, 1, 0.32, 1)';
        carousel.style.transform = `translateX(${totalFinalPosition}px)`;
      }, 1600);

      // Phase 3: Final positioning
      setTimeout(() => {
        setSpinPhase('stopping');
      }, 4500);

      // Phase 4: Show result for 2 seconds
      setTimeout(() => {
        setIsSpinning(false);
        setSelectedPrize(wonPrize);
        setSpinPhase('showing-result');
      }, 6000);

      // Phase 5: Open congratulations modal after showing result
      setTimeout(() => {
        onPrizeWon(wonPrize);
        onClose();
        setSpinPhase('ready');
      }, 8000); // 2 seconds after stopping
    }
  };

  const resetCarousel = () => {
    const carousel = document.getElementById('carousel');
    if (carousel) {
      carousel.style.transition = 'none';
      carousel.style.transform = 'translateX(0px)';
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
