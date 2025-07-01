
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowDown, RotateCcw, Package, Sparkles, X } from 'lucide-react';
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
  const [spinPhase, setSpinPhase] = useState<'ready' | 'building' | 'slowing' | 'stopping'>('ready');

  // Create carousel with 5 visible items and proper spacing
  const carouselItems = [...prizes, ...prizes, ...prizes, ...prizes];

  const spinCarousel = () => {
    setIsSpinning(true);
    setSelectedPrize(null);
    setShowResult(false);
    setSpinPhase('building');

    // Random prize selection
    const randomIndex = Math.floor(Math.random() * prizes.length);
    const wonPrize = prizes[randomIndex];

    // Calculate position to land exactly on an item (140px per item)
    const itemWidth = 140;
    const visibleItems = 5;
    const centerPosition = (visibleItems - 1) * itemWidth / 2;
    
    // Calculate final position to land on the selected prize
    const finalItemPosition = randomIndex * itemWidth;
    const extraSpins = itemWidth * prizes.length * 3; // 3 full rotations
    const finalPosition = -(finalItemPosition + extraSpins - centerPosition);

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
        carousel.style.transform = `translateX(-800px)`;
      }, 100);

      // Phase 2: Maximum speed with longer duration
      setTimeout(() => {
        setSpinPhase('slowing');
        carousel.style.transition = 'transform 3.5s cubic-bezier(0.23, 1, 0.32, 1)';
        carousel.style.transform = `translateX(${finalPosition}px)`;
      }, 1600);

      // Phase 3: Final positioning
      setTimeout(() => {
        setSpinPhase('stopping');
      }, 4000);
    }

    // Stop spinning after animation
    setTimeout(() => {
      setIsSpinning(false);
      setSelectedPrize(wonPrize);
      setSpinPhase('ready');
      setTimeout(() => {
        setShowResult(true);
      }, 500);
    }, 5500);
  };

  const handleSpinAgain = () => {
    const carousel = document.getElementById('carousel');
    if (carousel) {
      carousel.style.transform = 'translateX(0px)';
      carousel.style.transition = 'none';
    }
    setShowResult(false);
    setSpinPhase('ready');
    setTimeout(spinCarousel, 100);
  };

  const handleKeepPrize = () => {
    if (selectedPrize) {
      onPrizeWon(selectedPrize);
      onClose();
    }
  };

  const resetCarousel = () => {
    const carousel = document.getElementById('carousel');
    if (carousel) {
      carousel.style.transition = 'none';
      carousel.style.transform = 'translateX(0px)';
    }
  };

  const handleClose = () => {
    resetCarousel();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold gold-gradient bg-clip-text text-transparent mb-2">
            {chestName}
          </h2>
          <p className="text-white/80">
            {spinPhase === 'ready' && 'Prepare-se para descobrir seu prêmio!'}
            {spinPhase === 'building' && 'Acelerando... 🚀'}
            {spinPhase === 'slowing' && 'Definindo seu destino... ✨'}
            {spinPhase === 'stopping' && 'Quase lá... 🎯'}
          </p>
        </div>

        {/* Arrow Indicator - centered and always visible */}
        <div className="flex justify-center mb-4">
          <ArrowDown className={`w-8 h-8 text-yellow-400 ${!isSpinning ? 'animate-bounce' : 'animate-pulse'}`} />
        </div>

        {/* Improved Carousel Container */}
        <div className={`relative rounded-lg p-8 mb-8 overflow-hidden transition-all duration-500 ${
          isSpinning 
            ? 'bg-gradient-to-r from-purple-600/40 via-yellow-500/50 to-purple-600/40 shadow-2xl' 
            : 'bg-gradient-to-r from-gray-800/60 via-gray-700/70 to-gray-800/60'
        }`}>
          <div className="absolute inset-0 bg-black/20 rounded-lg" />
          
          {/* Center indicator line - thicker and more visible */}
          <div className={`absolute left-1/2 top-0 bottom-0 w-2 transform -translate-x-1/2 z-10 transition-all duration-300 ${
            isSpinning ? 'bg-yellow-400 shadow-xl shadow-yellow-400/80' : 'bg-yellow-400 shadow-lg shadow-yellow-400/50'
          }`} />
          
          {/* Enhanced spinning particles */}
          {isSpinning && (
            <div className="absolute inset-0 z-5">
              {[...Array(30)].map((_, i) => (
                <Sparkles 
                  key={i}
                  className="absolute w-4 h-4 text-yellow-400 animate-ping"
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
          
          {/* Improved Carousel - larger and better spaced */}
          <div className="relative overflow-hidden h-40">
            <div 
              id="carousel"
              className={`flex space-x-4 h-full transition-all ${
                spinPhase === 'building' ? 'blur-[1px]' : ''
              }`}
              style={{ transform: 'translateX(0px)' }}
            >
              {carouselItems.map((prize, index) => (
                <div
                  key={`${prize.name}-${index}`}
                  className={`min-w-[136px] h-36 rounded-lg border-2 flex flex-col items-center justify-center p-3 shadow-xl transition-all duration-300 ${
                    isSpinning 
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
              ))}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-4">
          {!isSpinning && !showResult && (
            <Button
              onClick={spinCarousel}
              className="gold-gradient text-black font-bold px-10 py-4 text-xl hover:opacity-90 transition-all duration-300 animate-pulse shadow-lg"
            >
              🎯 Girar Roleta
            </Button>
          )}

          {isSpinning && (
            <div className="text-center">
              <div className="animate-spin w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-white font-medium text-xl">
                {spinPhase === 'building' && 'Acelerando...'}
                {spinPhase === 'slowing' && 'Definindo...'}
                {spinPhase === 'stopping' && 'Parando...'}
              </p>
            </div>
          )}

          <Button
            onClick={handleClose}
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10"
          >
            Fechar
          </Button>
        </div>
      </div>

      {/* Enhanced Result Modal */}
      {showResult && selectedPrize && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-60 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-card via-card to-card/90 border-2 border-yellow-400 rounded-xl p-8 max-w-lg w-full text-center animate-scale-in relative overflow-hidden">
            {/* Close button */}
            <button
              onClick={handleKeepPrize}
              className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Celebration particles */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <Sparkles 
                  key={i}
                  className="absolute w-6 h-6 text-yellow-400 animate-ping"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`
                  }}
                />
              ))}
            </div>

            <div className="relative z-10">
              <div className="mb-6">
                <div className="w-48 h-48 mx-auto rounded-lg overflow-hidden mb-4 border-4 border-yellow-400 bg-transparent flex items-center justify-center">
                  <img 
                    src={selectedPrize.image} 
                    alt={selectedPrize.name}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                
                <h3 className="text-5xl font-bold gold-gradient bg-clip-text text-transparent mb-4 animate-bounce">
                  Parabéns!
                </h3>
                
                <h4 className="text-2xl font-bold text-white mb-2">
                  {selectedPrize.name}
                </h4>
                
                <p className="text-white/80 text-sm mb-4">
                  {selectedPrize.description}
                </p>
                
                <div className="text-3xl font-bold text-yellow-400 animate-pulse">
                  {selectedPrize.value}
                </div>
              </div>

              <div className="space-y-4">
                <Button
                  onClick={handleKeepPrize}
                  className="w-full gold-gradient text-black font-bold hover:opacity-90 text-lg py-4"
                >
                  <Package className="w-5 h-5 mr-2" />
                  Guardar Prêmio
                </Button>
                
                <Button
                  onClick={handleSpinAgain}
                  variant="outline" 
                  className="w-full border-yellow-400 text-yellow-400 hover:bg-yellow-400/10 py-3"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Girar Novamente
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpinCarousel;
