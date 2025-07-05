
import { DatabaseItem } from '@/types/database';
import { SpinPhase } from './types';

interface CarouselContainerProps {
  prizes: (DatabaseItem | any)[];
  isSpinning: boolean;
  spinPhase: SpinPhase;
  selectedPrize: DatabaseItem | any | null;
  carouselRef: React.RefObject<HTMLDivElement>;
}

const CarouselContainer = ({ 
  prizes, 
  isSpinning, 
  spinPhase, 
  selectedPrize, 
  carouselRef 
}: CarouselContainerProps) => {
  // Criar array estendido para efeito de carrossel infinito
  const extendedPrizes = Array(10).fill(prizes).flat();

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'shadow-lg shadow-yellow-400/50 border-2 border-yellow-400';
      case 'epic':
        return 'shadow-lg shadow-purple-400/50 border-2 border-purple-400';
      case 'rare':
        return 'shadow-lg shadow-blue-400/50 border-2 border-blue-400';
      default:
        return 'shadow-md shadow-gray-400/30 border border-gray-300';
    }
  };

  const getRarityBg = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'bg-gradient-to-b from-yellow-100 to-yellow-50';
      case 'epic':
        return 'bg-gradient-to-b from-purple-100 to-purple-50';
      case 'rare':
        return 'bg-gradient-to-b from-blue-100 to-blue-50';
      default:
        return 'bg-gradient-to-b from-gray-100 to-gray-50';
    }
  };

  return (
    <div className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-8 mb-8 shadow-2xl border border-primary/20">
      {/* Indicador central */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
        <div className="w-1 h-16 bg-gradient-to-b from-primary to-primary/50 rounded-full shadow-lg"></div>
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
          <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-transparent border-b-primary"></div>
        </div>
      </div>

      {/* Container do carrossel */}
      <div className="overflow-hidden w-full h-40 relative">
        <div 
          ref={carouselRef}
          className="flex space-x-1 transition-none h-full"
          style={{ width: `${extendedPrizes.length * 154}px` }}
        >
          {extendedPrizes.map((prize, index) => {
            const isSelected = selectedPrize && 
              ((prize.id && prize.id === selectedPrize.id) || 
               (prize.name === selectedPrize.name));
            
            const isPulsingWinner = spinPhase === 'showing-result' && isSelected;
            
            return (
              <div
                key={`${prize.id || prize.name}-${index}`}
                className={`
                  flex-shrink-0 w-36 h-36 rounded-xl flex flex-col items-center justify-center p-3 
                  transition-all duration-300 relative overflow-hidden
                  ${getRarityBg(prize.rarity || 'common')}
                  ${getRarityGlow(prize.rarity || 'common')}
                  ${isPulsingWinner ? 'animate-pulse scale-110 ring-4 ring-primary' : ''}
                  ${isSpinning ? 'blur-sm' : spinPhase === 'stopped' ? 'blur-none' : ''}
                `}
              >
                {/* Brilho especial para itens raros */}
                {(['epic', 'legendary'].includes(prize.rarity)) && (
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
                )}
                
                {/* Imagem do item */}
                <div className="w-16 h-16 rounded-lg overflow-hidden mb-2 flex items-center justify-center bg-white/80 shadow-sm">
                  {(prize.image_url || prize.image) ? (
                    <img 
                      src={prize.image_url || prize.image} 
                      alt={prize.name}
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = '<div class="text-2xl">📦</div>';
                        }
                      }}
                    />
                  ) : (
                    <div className="text-2xl">📦</div>
                  )}
                </div>

                {/* Nome do item */}
                <p className="text-xs text-center font-bold truncate w-full mb-1 text-gray-800">
                  {prize.name}
                </p>

                {/* Valor do item */}
                <p className="text-xs text-center font-medium truncate w-full text-green-700">
                  {prize.base_value ? `R$ ${Number(prize.base_value).toFixed(2)}` : 
                   prize.value ? prize.value : 'Sem valor'}
                </p>

                {/* Badge de raridade */}
                {prize.rarity && (
                  <div className={`
                    absolute top-1 right-1 px-1 py-0.5 rounded text-xs font-bold
                    ${prize.rarity === 'legendary' ? 'bg-yellow-500 text-white' :
                      prize.rarity === 'epic' ? 'bg-purple-500 text-white' :
                      prize.rarity === 'rare' ? 'bg-blue-500 text-white' :
                      'bg-gray-500 text-white'}
                  `}>
                    {prize.rarity.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Efeito de brilho para o item selecionado */}
                {isPulsingWinner && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/30 via-transparent to-primary/30 animate-pulse pointer-events-none"></div>
                )}
              </div>
            );
          })}
        </div>

        {/* Efeitos de fade nas bordas */}
        <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-gray-800 to-transparent pointer-events-none z-10"></div>
        <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-gray-800 to-transparent pointer-events-none z-10"></div>
      </div>

      {/* Status do sorteio */}
      <div className="text-center mt-4">
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-black/50 rounded-full">
          <div className={`w-2 h-2 rounded-full ${
            isSpinning ? 'bg-red-500 animate-pulse' : 
            spinPhase === 'showing-result' ? 'bg-green-500' : 'bg-gray-500'
          }`}></div>
          <span className="text-white text-sm font-medium">
            {isSpinning ? 'Sorteando...' : 
             spinPhase === 'showing-result' ? 'Parabéns!' : 'Pronto para sortear'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CarouselContainer;
