
import { Sparkles } from 'lucide-react';
import { CarouselContainerProps } from './types';

const CarouselContainer = ({ prizes, isSpinning, spinPhase, selectedPrize }: CarouselContainerProps) => {
  // Create carousel with enough items to ensure smooth spinning
  const carouselItems = [...prizes, ...prizes, ...prizes, ...prizes, ...prizes];

  return (
    <div className={`relative rounded-lg p-8 mb-8 overflow-hidden transition-all duration-500 ${
      spinPhase === 'showing-result' 
        ? 'bg-gradient-to-r from-green-600/40 via-yellow-500/50 to-green-600/40 shadow-2xl' 
        : isSpinning 
          ? 'bg-gradient-to-r from-purple-600/40 via-yellow-500/50 to-purple-600/40 shadow-2xl' 
          : 'bg-gradient-to-r from-gray-800/60 via-gray-700/70 to-gray-800/60'
    }`}>
      <div className="absolute inset-0 bg-black/20 rounded-lg" />
      
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
  );
};

export default CarouselContainer;
