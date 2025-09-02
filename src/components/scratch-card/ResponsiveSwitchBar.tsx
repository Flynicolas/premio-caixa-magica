import React from 'react';
import { cn } from '@/lib/utils';
import { ScratchCardType, scratchCardTypes } from '@/types/scratchCard';
import { Coins, Star, Diamond, Crown, Zap, Trophy } from 'lucide-react';

interface ResponsiveSwitchBarProps {
  currentScratch: ScratchCardType;
  onScratchChange: (gameId: ScratchCardType) => void;
  isLoading?: boolean;
  className?: string;
  hideOnScratch?: boolean;
  gameState?: string;
}

const ResponsiveSwitchBar = ({ 
  currentScratch, 
  onScratchChange, 
  isLoading = false,
  className,
  hideOnScratch = false,
  gameState
}: ResponsiveSwitchBarProps) => {
  
  // Auto-hide durante scratching, fastReveal e resolving
  const shouldHide = hideOnScratch && (gameState === 'scratching' || gameState === 'fastReveal' || gameState === 'resolving');
  
  if (shouldHide) {
    return null;
  }
  
  const getIcon = (type: ScratchCardType) => {
    const icons = {
      pix: Coins,
      sorte: Star,
      dupla: Trophy,
      ouro: Coins,
      diamante: Diamond,
      premium: Crown
    };
    return icons[type] || Zap;
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
      {/* Container responsivo com scroll suave */}
      <div className="relative">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide py-3 px-2 scroll-smooth snap-x snap-mandatory">
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
                  // Layout responsivo - menor no mobile
                  "flex flex-col sm:flex-row items-center gap-1 sm:gap-2",
                  "px-2 py-2 sm:px-4 sm:py-2 rounded-lg sm:rounded-full",
                  "min-w-[70px] sm:min-w-fit whitespace-nowrap snap-center",
                  "transition-all duration-300 relative",
                  // Estados visuais
                  {
                    // Selecionado
                    "bg-primary text-primary-foreground shadow-lg scale-105 ring-2 ring-primary/30": isSelected,
                    // Default (não selecionado)
                    "bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground border border-border": !isSelected && !isDisabled,
                    // Disabled/Loading
                    "opacity-60 cursor-not-allowed": isDisabled,
                    // Hover quando não selecionado e não disabled
                    "hover:shadow-md hover:scale-102": !isSelected && !isDisabled
                  }
                )}
              >
                {/* Ícone com tamanho adaptativo */}
                <Icon className="w-5 h-5 sm:w-4 sm:h-4 flex-shrink-0" />
                
                {/* Nome adaptativo */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                  <span className="text-xs sm:text-sm font-medium leading-tight">
                    {/* Mobile: Nome super compacto */}
                    <span className="sm:hidden block text-center">
                      {type === 'pix' ? 'PIX' : 
                       type === 'sorte' ? 'Sorte' :
                       type === 'dupla' ? 'Dupla' :
                       type === 'ouro' ? 'Ouro' :
                       type === 'diamante' ? 'Diam.' :
                       'Premium'}
                    </span>
                    {/* Desktop: Nome atrativo */}
                    <span className="hidden sm:inline">
                      {type === 'pix' ? 'PIX Rápido' : 
                       type === 'sorte' ? 'Sorte Premium' :
                       type === 'dupla' ? 'Dupla Chance' :
                       type === 'ouro' ? 'Ouro Tech' :
                       type === 'diamante' ? 'Diamante VIP' :
                       'Casa Deluxe'}
                    </span>
                  </span>
                  
                  {/* Preço sempre visível mas adaptativo */}
                  <span className={cn(
                    "text-xs font-medium",
                    isSelected ? "text-primary-foreground/90" : "text-muted-foreground"
                  )}>
                    R${config.price.toFixed(0)}
                  </span>
                </div>

                {/* Indicador de seleção para mobile */}
                {isSelected && (
                  <div className="sm:hidden absolute -top-1 -right-1 w-3 h-3 bg-primary border-2 border-background rounded-full" />
                )}
              </button>
            );
          })}
        </div>
        
        {/* Gradientes para indicar scroll */}
        <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-background to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      </div>
      
      {/* Loading indicator elegante */}
      {isLoading && (
        <div className="flex items-center justify-center py-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full">
            <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-muted-foreground font-medium">Carregando...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResponsiveSwitchBar;