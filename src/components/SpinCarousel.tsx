
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowDown, RotateCcw, Package, Sparkles } from 'lucide-react';
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

  // Duplicate prizes to create seamless infinite scroll effect
  const carouselItems = [...prizes, ...prizes, ...prizes, ...prizes, ...prizes];

  const spinCarousel = () => {
    setIsSpinning(true);
    setSelectedPrize(null);
    setShowResult(false);
    setSpinPhase('building');

    // Random prize selection
    const randomIndex = Math.floor(Math.random() * prizes.length);
    const wonPrize = prizes[randomIndex];

    // Calculate final position for animation with more randomness
    const finalPosition = -(randomIndex * 120 + Math.random() * 1200 + 2400);

    const carousel = document.getElementById('carousel');
    if (carousel) {
      // Phase 1: Fast acceleration
      carousel.style.transform = 'translateX(0px)';
      carousel.style.transition = 'transform 1s ease-out';
      
      setTimeout(() => {
        setSpinPhase('building');
        carousel.style.transform = `translateX(-1200px)`;
      }, 100);

      // Phase 2: Maximum speed
      setTimeout(() => {
        setSpinPhase('slowing');
        carousel.style.transition = 'transform 3s cubic-bezier(0.25, 0.1, 0.25, 1)';
        carousel.style.transform = `translateX(${finalPosition}px)`;
      }, 1200);

      // Phase 3: Final slow down with suspense
      setTimeout(() => {
        setSpinPhase('stopping');
      }, 3000);
    }

    // Stop spinning after animation with celebration delay
    setTimeout(() => {
      setIsSpinning(false);
      setSelectedPrize(wonPrize);
      setSpinPhase('ready');
      // Add celebration delay
      setTimeout(() => {
        setShowResult(true);
      }, 500);
    }, 4500);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
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

        {/* Arrow Indicator - only show when not spinning */}
        {!isSpinning && (
          <div className="flex justify-center mb-4">
            <ArrowDown className="w-8 h-8 text-yellow-400 animate-bounce" />
          </div>
        )}

        {/* Carousel Container */}
        <div className={`relative rounded-lg p-6 mb-8 overflow-hidden transition-all duration-500 ${
          isSpinning 
            ? 'bg-gradient-to-r from-purple-600/30 via-yellow-400/40 to-purple-600/30 shadow-2xl' 
            : 'bg-gradient-to-r from-yellow-600/20 via-yellow-400/30 to-yellow-600/20'
        }`}>
          <div className="absolute inset-0 bg-black/40 rounded-lg" />
          
          {/* Center indicator line with glow effect */}
          <div className={`absolute left-1/2 top-0 bottom-0 w-1 transform -translate-x-1/2 z-10 transition-all duration-300 ${
            isSpinning ? 'bg-yellow-400 shadow-lg shadow-yellow-400/50' : 'bg-yellow-400'
          }`} />
          
          {/* Spinning effect particles */}
          {isSpinning && (
            <div className="absolute inset-0 z-5">
              {[...Array(20)].map((_, i) => (
                <Sparkles 
                  key={i}
                  className="absolute w-4 h-4 text-yellow-400 animate-ping"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`
                  }}
                />
              ))}
            </div>
          )}
          
          {/* Carousel */}
          <div className="relative overflow-hidden h-32">
            <div 
              id="carousel"
              className={`flex space-x-4 h-full transition-all ${
                spinPhase === 'building' ? 'blur-sm' : ''
              }`}
              style={{ transform: 'translateX(0px)' }}
            >
              {carouselItems.map((prize, index) => (
                <div
                  key={`${prize.name}-${index}`}
                  className={`min-w-[100px] h-28 rounded-lg border-2 flex flex-col items-center justify-center p-2 shadow-lg transition-all duration-200 ${
                    isSpinning 
                      ? 'bg-gradient-to-br from-purple-800 to-purple-900 border-purple-400/50 scale-95' 
                      : 'bg-gradient-to-br from-gray-800 to-gray-900 border-yellow-400/50'
                  }`}
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
              <div className="animate-spin w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full mx-auto mb-2" />
              <p className="text-white font-medium text-lg">
                {spinPhase === 'building' && 'Acelerando...'}
                {spinPhase === 'slowing' && 'Definindo...'}
                {spinPhase === 'stopping' && 'Parando...'}
              </p>
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

      {/* Enhanced Result Modal */}
      {showResult && selectedPrize && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-60 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-card via-card to-card/90 border-2 border-yellow-400 rounded-xl p-8 max-w-md w-full text-center animate-scale-in relative overflow-hidden">
            {/* Celebration particles */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(15)].map((_, i) => (
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
                <div className="w-32 h-32 mx-auto rounded-lg overflow-hidden mb-4 gold-glow animate-pulse border-4 border-yellow-400">
                  <img 
                    src={selectedPrize.image} 
                    alt={selectedPrize.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <h3 className="text-3xl font-bold gold-gradient bg-clip-text text-transparent mb-2 animate-bounce">
                  🎉 PARABÉNS! 🎉
                </h3>
                
                <h4 className="text-xl font-bold text-white mb-2">
                  {selectedPrize.name}
                </h4>
                
                <p className="text-white/80 text-sm mb-4">
                  {selectedPrize.description}
                </p>
                
                <div className="text-2xl font-bold text-yellow-400 animate-pulse">
                  {selectedPrize.value}
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleKeepPrize}
                  className="w-full gold-gradient text-black font-bold hover:opacity-90 text-lg py-3"
                >
                  <Package className="w-5 h-5 mr-2" />
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
        </div>
      )}
    </div>
  );
};

export default SpinCarousel;
