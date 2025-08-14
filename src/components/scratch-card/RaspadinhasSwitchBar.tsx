import React from 'react';
import { cn } from '@/lib/utils';
import { ScratchCardType, scratchCardTypes } from '@/types/scratchCard';
import { Coins, Star, Diamond, Crown, Zap } from 'lucide-react';

interface RaspadinhasSwitchBarProps {
  currentScratch: ScratchCardType;
  onScratchChange: (gameId: ScratchCardType) => void;
  isLoading?: boolean;
  className?: string;
  hideOnScratch?: boolean;
  gameState?: string;
}

const RaspadinhasSwitchBar = ({ 
  currentScratch, 
  onScratchChange, 
  isLoading = false,
  className,
  hideOnScratch = false,
  gameState
}: RaspadinhasSwitchBarProps) => {
  
  // Auto-hide durante scratching, reexibir em success/fail
  const shouldHide = hideOnScratch && (gameState === 'scratching' || gameState === 'fastReveal' || gameState === 'resolving');
  
  if (shouldHide) {
    return null;
  }
  
  const getIcon = (type: ScratchCardType) => {
    const icons = {
      pix: Coins,
      sorte: Star,
      dupla: Star,
      ouro: Coins,
      diamante: Diamond,
      premium: Crown
    };
    return icons[type] || Star;
  };

  const getScratchTypes = (): ScratchCardType[] => {
    return Object.keys(scratchCardTypes) as ScratchCardType[];
  };

  const handleScratchClick = (gameId: ScratchCardType) => {
    if (isLoading || gameId === currentScratch) return;
    onScratchChange(gameId);
  };

  return (
    <div className={cn("w-full transition-all duration-300", className)}>
      {/* Container compacto com scroll horizontal no mobile */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide py-2 px-1 scroll-smooth snap-x snap-mandatory">
        {getScratchTypes().map((type) => {
          const config = scratchCardTypes[type];
          const Icon = getIcon(type);
          const isSelected = type === currentScratch;
          const isDisabled = isLoading;

          return (
            <button
              key={type}
              onClick={() => handleScratchClick(type)}
              disabled={isDisabled}
              className={cn(
                // Layout base compacto
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full transition-all duration-300 whitespace-nowrap min-w-fit snap-center",
                // Estados visuais
                {
                  // Selecionado
                  "bg-primary text-primary-foreground shadow-lg scale-105": isSelected,
                  // Default (não selecionado)
                  "bg-secondary/50 text-secondary-foreground hover:bg-secondary/80 hover:scale-102": !isSelected && !isDisabled,
                  // Disabled/Loading
                  "opacity-50 cursor-not-allowed": isDisabled,
                  // Hover quando não selecionado e não disabled
                  "hover:shadow-md": !isSelected && !isDisabled
                }
              )}
            >
              {/* Ícone/Miniatura */}
              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
              
              {/* Nome curto no mobile, completo no desktop */}
              <span className="text-xs sm:text-sm font-medium">
                <span className="sm:hidden">
                  {config.name.slice(0, 3)}
                </span>
                <span className="hidden sm:inline">
                  {config.name.replace('Raspadinha', '').replace('do', '').replace('da', '').trim()}
                </span>
              </span>
              
              {/* Preço apenas no desktop */}
              <span className="hidden sm:inline text-xs opacity-80">
                R$ {config.price.toFixed(2)}
              </span>
            </button>
          );
        })}
      </div>
      
      {/* Loading indicator durante transição */}
      {isLoading && (
        <div className="flex items-center justify-center py-2">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="ml-2 text-xs text-muted-foreground">Carregando...</span>
        </div>
      )}
    </div>
  );
};

export default RaspadinhasSwitchBar;