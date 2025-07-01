
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowDown, RotateCcw, Package } from 'lucide-react';
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
  const [showResult, setShowResult] = useState(false);

  // Duplicate prizes to create seamless infinite scroll effect
  const carouselItems = [...prizes, ...prizes, ...prizes, ...prizes];

  const spinCarousel = () => {
    setIsSpinning(true);
    setSelectedPrize(null);
    setShowResult(false);

    // Random prize selection
    const randomIndex = Math.floor(Math.random() * prizes.length);
    const wonPrize = prizes[randomIndex];

    // Calculate final position for animation
    const finalPosition = -(randomIndex * 120 + Math.random() * 2400 + 1200);

    const carousel = document.getElementById('carousel');
    if (carousel) {
      carousel.style.transform = `translateX(${finalPosition}px)`;
      carousel.style.transition = 'transform 4s cubic-bezier(0.25, 0.1, 0.25, 1)';
    }

    // Stop spinning after animation
    setTimeout(() => {
      setIsSpinning(false);
      setSelectedPrize(wonPrize);
      setShowResult(true);
    }, 4000);
  };

  const handleSpinAgain = () => {
    const carousel = document.getElementById('carousel');
    if (carousel) {
      carousel.style.transform = 'translateX(0px)';
      carousel.style.transition = 'none';
    }
    setShowResult(false);
    setTimeout(spinCarousel, 100);
  };

  const handleKeepPrize = () => {
    if (selectedPrize) {
      onPrizeWon(selectedPrize);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold gold-gradient bg-clip-text text-transparent mb-2">
            {chestName}
          </h2>
          <p className="text-white/80">Prepare-se para descobrir seu prêmio!</p>
        </div>

        {/* Arrow Indicator */}
        <div className="flex justify-center mb-4">
          <ArrowDown className="w-8 h-8 text-yellow-400 animate-bounce" />
        </div>

        {/* Carousel Container */}
        <div className="relative bg-gradient-to-r from-yellow-600/20 via-yellow-400/30 to-yellow-600/20 rounded-lg p-6 mb-8 overflow-hidden">
          <div className="absolute inset-0 bg-black/40 rounded-lg" />
          
          {/* Center indicator line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-yellow-400 transform -translate-x-1/2 z-10" />
          
          {/* Carousel */}
          <div className="relative overflow-hidden h-32">
            <div 
              id="carousel"
              className="flex space-x-4 h-full"
              style={{ transform: 'translateX(0px)' }}
            >
              {carouselItems.map((prize, index) => (
                <div
                  key={`${prize.name}-${index}`}
                  className="min-w-[100px] h-28 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border-2 border-yellow-400/50 flex flex-col items-center justify-center p-2 shadow-lg"
                >
                  <img 
                    src={prize.image} 
                    alt={prize.name}
                    className="w-16 h-16 object-cover rounded mb-1"
                  />
                  <span className="text-xs text-white text-center font-medium truncate w-full">
                    {prize.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-4">
          {!isSpinning && !showResult && (
            <Button
              onClick={spinCarousel}
              className="gold-gradient text-black font-bold px-8 py-4 text-lg hover:opacity-90 transition-all duration-300 animate-pulse"
            >
              🎯 Girar Roleta
            </Button>
          )}

          {isSpinning && (
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full mx-auto mb-2" />
              <p className="text-white font-medium">Girando...</p>
            </div>
          )}

          <Button
            onClick={onClose}
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10"
          >
            Fechar
          </Button>
        </div>
      </div>

      {/* Result Modal */}
      {showResult && selectedPrize && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-60 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-card via-card to-card/90 border-2 border-yellow-400 rounded-xl p-8 max-w-md w-full text-center animate-scale-in">
            <div className="mb-6">
              <div className="w-32 h-32 mx-auto rounded-lg overflow-hidden mb-4 gold-glow animate-pulse">
                <img 
                  src={selectedPrize.image} 
                  alt={selectedPrize.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <h3 className="text-2xl font-bold gold-gradient bg-clip-text text-transparent mb-2">
                🎉 PARABÉNS! 🎉
              </h3>
              
              <h4 className="text-xl font-bold text-white mb-2">
                {selectedPrize.name}
              </h4>
              
              <p className="text-white/80 text-sm mb-4">
                {selectedPrize.description}
              </p>
              
              <div className="text-lg font-bold text-yellow-400">
                {selectedPrize.value}
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleKeepPrize}
                className="w-full gold-gradient text-black font-bold hover:opacity-90"
              >
                <Package className="w-4 h-4 mr-2" />
                Guardar Prêmio
              </Button>
              
              <Button
                onClick={handleSpinAgain}
                variant="outline" 
                className="w-full border-yellow-400 text-yellow-400 hover:bg-yellow-400/10"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Girar Novamente
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpinCarousel;
