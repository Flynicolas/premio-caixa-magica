import React from 'react';
import { cn } from '@/lib/utils';
import { ScratchCardType, scratchCardTypes } from '@/types/scratchCard';

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

  const getScratchTypes = (): ScratchCardType[] => {
    return Object.keys(scratchCardTypes) as ScratchCardType[];
  };

  const handleScratchClick = (gameId: ScratchCardType) => {
    if (isLoading || gameId === currentScratch) return;
    onScratchChange(gameId);
  };

  return (
    <div className={cn("flex justify-center py-2", className)}>
      <div className="flex gap-2 overflow-x-auto scrollbar-hide px-2 max-w-full">
        {getScratchTypes().map((type) => {
          const config = scratchCardTypes[type];
          const isSelected = type === currentScratch;
          const isDisabled = isLoading;

          return (
            <button
              key={type}
              onClick={() => handleScratchClick(type)}
              disabled={isDisabled}
              className={cn(
                "flex flex-col items-center gap-1.5 p-2.5 rounded-lg transition-all duration-300",
                "w-16 h-20 flex-shrink-0",
                {
                  "gold-border ring-2 ring-[hsl(var(--gold-middle))] scale-105 gold-gradient-subtle": isSelected,
                  "bg-card/50 hover:gold-gradient-subtle hover:scale-102 hover:gold-border": !isSelected && !isDisabled,
                  "opacity-50 cursor-not-allowed": isDisabled,
                  "active:scale-95": !isDisabled,
                  "gold-loading": isDisabled
                }
              )}
            >
              <div className="w-10 h-10 rounded-md overflow-hidden bg-muted">
                <img
                  src={config.coverImage}
                  alt={config.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className={cn(
                "text-xs font-semibold transition-colors duration-300 text-center leading-tight",
                isSelected ? "gold-text" : "text-primary hover:gold-text"
              )}>
                R$ {config.price.toFixed(2).replace('.', ',')}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ResponsiveSwitchBar;