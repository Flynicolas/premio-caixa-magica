import React from 'react';
import { cn } from '@/lib/utils';
import { ScratchCardType, scratchCardTypes } from '@/types/scratchCard';
import { Coins, Star, Diamond, Crown, Zap } from 'lucide-react';

interface RaspadinhasSwitchBarProps {
  currentScratch: ScratchCardType;
  onScratchChange: (gameId: ScratchCardType) => void;
  isLoading?: boolean;
  className?: string;
}

const RaspadinhasSwitchBar = ({ 
  currentScratch, 
  onScratchChange, 
  isLoading = false,
  className 
}: RaspadinhasSwitchBarProps) => {
  
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
    <div className={cn("w-full", className)}>
      {/* Container com scroll horizontal no mobile */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide py-2 px-1">
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
                // Layout base
                "flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300 whitespace-nowrap min-w-fit",
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
              <Icon className="w-4 h-4 flex-shrink-0" />
              
              {/* Nome curto */}
              <span className="text-sm font-medium">
                {config.name.replace('Raspadinha', '').replace('do', '').replace('da', '').trim()}
              </span>
              
              {/* Preço */}
              <span className="text-xs opacity-80">
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