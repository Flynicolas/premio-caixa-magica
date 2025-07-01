
import { Sparkles } from 'lucide-react';
import { CarouselContainerProps } from './types';

const CarouselContainer = ({ prizes, isSpinning, spinPhase, selectedPrize, carouselRef }: CarouselContainerProps) => {
  // Create enough items to ensure smooth spinning (5 repetitions)
  const extendedPrizes = Array(5).fill(prizes).flat();

  return (
    <div className={`relative rounded-lg p-8 mb-8 overflow-hidden transition-all duration-300 ${
      spinPhase === 'showing-result' 
        ? 'bg-gradient-to-r from-green-600/40 via-yellow-500/50 to-green-600/40 shadow-2xl' 
        : isSpinning 
          ? 'bg-gradient-to-r from-purple-600/40 via-yellow-500/50 to-purple-600/40 shadow-xl' 
          : 'bg-gradient-to-r from-gray-800/60 via-gray-700/70 to-gray-800/60'
    }`}>
      
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/20 rounded-lg" />
      
      {/* Spinning particles effect */}
      {(isSpinning || spinPhase === 'showing-result') && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          {[...Array(spinPhase === 'showing-result' ? 40 : 25)].map((_, i) => (
            <Sparkles 
              key={i}
              className={`absolute w-3 h-3 ${
                spinPhase === 'showing-result' ? 'text-green-400 animate-bounce' : 'text-yellow-400 animate-ping'
              }`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${0.8 + Math.random() * 0.4}s`
              }}
            />
          ))}
        </div>
      )}
      
      {/* Central indicator arrow */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
        <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-yellow-400 animate-pulse" />
      </div>
      
      {/* Carousel container - 5 items visible */}
      <div className="relative overflow-hidden h-44 mx-auto" style={{ width: '800px' }}>
        <div 
          ref={carouselRef}
          className="flex gap-5 h-full will-change-transform"
          style={{ 
            transform: 'translateX(0px)',
            transition: 'none'
          }}
        >
          {extendedPrizes.map((prize, index) => {
            // Check if this is the winning item in the center
            const isWinningItem = spinPhase === 'showing-result' && 
              selectedPrize && 
              prize.name === selectedPrize.name && 
              index === Math.floor(extendedPrizes.length / 2) + prizes.findIndex(p => p.name === selectedPrize.name);
            
            return (
              <div
                key={`${prize.name}-${index}`}
                className={`min-w-[140px] h-40 rounded-xl border-2 flex flex-col items-center justify-center p-3 shadow-lg transition-all duration-300 ${
                  isWinningItem
                    ? 'bg-gradient-to-br from-green-400 to-green-600 border-green-300 scale-110 shadow-green-400/50 animate-pulse z-10'
                    : spinPhase === 'stopped' && selectedPrize && prize.name === selectedPrize.name
                      ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 border-yellow-300 scale-105 shadow-yellow-400/40'
                      : isSpinning 
                        ? 'bg-gradient-to-br from-purple-800/90 to-purple-900/90 border-purple-400/60 shadow-purple-500/20' 
                        : 'bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-yellow-400/60 shadow-yellow-400/10'
                }`}
              >
                <img 
                  src={prize.image} 
                  alt={prize.name}
                  className="w-16 h-16 object-contain rounded mb-2"
                />
                <span className="text-xs text-white text-center font-medium truncate w-full px-1">
                  {prize.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Bottom indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
      </div>
    </div>
  );
};

export default CarouselContainer;
