
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowDown, Sparkles, X } from 'lucide-react';
import { Prize } from '@/data/chestData';

interface SpinCarouselProps {
  isOpen: boolean;
  onClose: () => void;
  prizes: Prize[];
  onPrizeWon: (prize: Prize) => void;
  chestName: string;
}

const SpinCarousel = ({ isOpen, onClose, prizes, onPrizeWon, chestName }: SpinCarouselProps) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);
  const [spinPhase, setSpinPhase] = useState<'ready' | 'building' | 'slowing' | 'stopping' | 'showing-result'>('ready');

  // Create carousel with enough items to ensure smooth spinning
  const carouselItems = [...prizes, ...prizes, ...prizes, ...prizes, ...prizes];

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
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">
            {chestName}
          </h2>
          <p className="text-white/80">
            {spinPhase === 'ready' && 'Prepare-se para descobrir seu prêmio!'}
            {spinPhase === 'building' && 'Acelerando... 🚀'}
            {spinPhase === 'slowing' && 'Definindo seu destino... ✨'}
            {spinPhase === 'stopping' && 'Quase lá... 🎯'}
            {spinPhase === 'showing-result' && selectedPrize && `🎉 Você ganhou: ${selectedPrize.name}! 🎉`}
          </p>
        </div>

        {/* Arrow Indicator - perfectly centered */}
        <div className="flex justify-center mb-4">
          <ArrowDown className={`w-8 h-8 text-yellow-400 ${
            spinPhase === 'showing-result' ? 'animate-bounce text-green-400' : 
            !isSpinning ? 'animate-bounce' : 'animate-pulse'
          }`} />
        </div>

        {/* Improved Carousel Container */}
        <div className={`relative rounded-lg p-8 mb-8 overflow-hidden transition-all duration-500 ${
          spinPhase === 'showing-result' 
            ? 'bg-gradient-to-r from-green-600/40 via-yellow-500/50 to-green-600/40 shadow-2xl' 
            : isSpinning 
              ? 'bg-gradient-to-r from-purple-600/40 via-yellow-500/50 to-purple-600/40 shadow-2xl' 
              : 'bg-gradient-to-r from-gray-800/60 via-gray-700/70 to-gray-800/60'
        }`}>
          <div className="absolute inset-0 bg-black/20 rounded-lg" />
          
          {/* Center indicator line - perfectly centered */}
          <div className={`absolute left-1/2 top-0 bottom-0 w-1 transform -translate-x-1/2 z-10 transition-all duration-300 ${
            spinPhase === 'showing-result' 
              ? 'bg-green-400 shadow-xl shadow-green-400/80' 
              : isSpinning 
                ? 'bg-yellow-400 shadow-xl shadow-yellow-400/80' 
                : 'bg-yellow-400 shadow-lg shadow-yellow-400/50'
          }`} />
          
          {/* Enhanced spinning particles */}
          {(isSpinning || spinPhase === 'showing-result') && (
            <div className="absolute inset-0 z-5">
              {[...Array(spinPhase === 'showing-result' ? 50 : 30)].map((_, i) => (
                <Sparkles 
                  key={i}
                  className={`absolute w-4 h-4 animate-ping ${
                    spinPhase === 'showing-result' ? 'text-green-400' : 'text-yellow-400'
                  }`}
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${1 + Math.random()}s`
                  }}
                />
              ))}
            </div>
          )}
          
          {/* Carousel - 5 items visible, each 140px + 20px gap = 160px total */}
          <div className="relative overflow-hidden h-44" style={{ width: '800px', margin: '0 auto' }}>
            <div 
              id="carousel"
              className={`flex gap-5 h-full transition-all ${
                spinPhase === 'building' ? 'blur-[1px]' : ''
              }`}
              style={{ transform: 'translateX(0px)' }}
            >
              {carouselItems.map((prize, index) => {
                const isWinningItem = spinPhase === 'showing-result' && 
                  selectedPrize && 
                  prize.name === selectedPrize.name && 
                  index === prizes.length * 2 + prizes.findIndex(p => p.name === selectedPrize.name);
                
                return (
                  <div
                    key={`${prize.name}-${index}`}
                    className={`min-w-[140px] h-40 rounded-lg border-2 flex flex-col items-center justify-center p-3 shadow-xl transition-all duration-500 ${
                      isWinningItem
                        ? 'bg-gradient-to-br from-green-400/90 to-green-600/90 border-green-300 scale-110 shadow-green-400/50 animate-pulse'
                        : isSpinning 
                          ? 'bg-gradient-to-br from-purple-800/90 to-purple-900/90 border-purple-400/60 scale-95 shadow-purple-500/30' 
                          : 'bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-yellow-400/60 shadow-yellow-400/20'
                    }`}
                  >
                    <img 
                      src={prize.image} 
                      alt={prize.name}
                      className="w-20 h-20 object-contain rounded mb-2"
                    />
                    <span className="text-xs text-white text-center font-medium truncate w-full px-1">
                      {prize.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-4">
          {!isSpinning && !selectedPrize && spinPhase === 'ready' && (
            <Button
              onClick={spinCarousel}
              className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold px-10 py-4 text-xl hover:opacity-90 transition-all duration-300 animate-pulse shadow-lg"
            >
              🎯 Girar Roleta
            </Button>
          )}

          {isSpinning && spinPhase !== 'showing-result' && (
            <div className="text-center">
              <div className="animate-spin w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-white font-medium text-xl">
                {spinPhase === 'building' && 'Acelerando...'}
                {spinPhase === 'slowing' && 'Definindo...'}
                {spinPhase === 'stopping' && 'Parando...'}
              </p>
            </div>
          )}

          {spinPhase === 'showing-result' && selectedPrize && (
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2 animate-bounce">
                🎉 {selectedPrize.name} 🎉
              </div>
              <p className="text-white text-lg">Preparando sua recompensa...</p>
              <div className="mt-4">
                <div className="w-24 h-1 bg-green-400 rounded-full mx-auto animate-pulse" />
              </div>
            </div>
          )}

          <Button
            onClick={handleClose}
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10"
            disabled={isSpinning && spinPhase !== 'showing-result'}
          >
            <X className="w-4 h-4 mr-2" />
            {spinPhase === 'showing-result' ? 'Pular' : 'Fechar'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SpinCarousel;
