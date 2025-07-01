
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
    const itemWidth = 154; // 150px + 4px gap
    const containerWidth = 1120; // 7 items visible
    const centerPosition = containerWidth / 2 - 75; // Center of container minus half item width
    
    // Calculate position for winning item to be in center
    // With 10 repetitions, we have plenty of items to work with
    const extendedLength = prizes.length * 10;
    const middleSection = Math.floor(extendedLength / 2);
    const targetIndex = middleSection + randomIndex;
    const targetPosition = -(targetIndex * itemWidth) + centerPosition;
    
    // Add extra distance for dramatic spinning effect (reduced for smoother animation)
    const extraSpins = itemWidth * prizes.length * 2; // Reduced from 3 to 2
    const finalPosition = targetPosition - extraSpins;

    // Reset carousel position to start
    carousel.style.transition = 'none';
    carousel.style.transform = 'translateX(0px)';
    
    // Force reflow
    carousel.offsetHeight;
    
    // Start spinning animation with longer, smoother transition
    setTimeout(() => {
      carousel.style.transition = 'transform 5s cubic-bezier(0.25, 0.1, 0.25, 1)';
      carousel.style.transform = `translateX(${finalPosition}px)`;
    }, 100);

    // Phase 1: Spinning at full speed
    setTimeout(() => {
      setSpinPhase('slowing');
    }, 2500);

    // Phase 2: Slowing down
    setTimeout(() => {
      setSpinPhase('stopped');
      setSelectedPrize(wonPrize);
      setIsSpinning(false);
    }, 5000);

    // Phase 3: Show result with pulse effect (wait 1 second as requested)
    setTimeout(() => {
      setSpinPhase('showing-result');
    }, 6000);

    // Phase 4: Open congratulations modal
    setTimeout(() => {
      onPrizeWon(wonPrize);
      resetCarousel();
      onClose();
    }, 8000);
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
      <div className="w-full max-w-7xl">
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
