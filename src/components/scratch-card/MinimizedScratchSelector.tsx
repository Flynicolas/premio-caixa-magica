import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { scratchCardTypes, ScratchCardType } from '@/types/scratchCard';

interface MinimizedScratchSelectorProps {
  selectedType: ScratchCardType;
  onTypeSelect: (type: ScratchCardType) => void;
  onNewGame: () => void;
  userBalance?: number;
  className?: string;
}

const MinimizedScratchSelector = ({ 
  selectedType, 
  onTypeSelect, 
  onNewGame,
  userBalance = 0,
  className 
}: MinimizedScratchSelectorProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleTypeChange = (type: ScratchCardType) => {
    onTypeSelect(type);
    setIsExpanded(false);
    // Slight delay before starting new game
    setTimeout(() => {
      onNewGame();
    }, 300);
  };

  return (
    <div className={cn(
      "bg-background/95 backdrop-blur-sm border border-border/50 rounded-xl p-3 shadow-lg transition-all duration-300",
      {
        'pb-2': !isExpanded,
        'pb-4': isExpanded
      },
      className
    )}>
      {/* Header sempre visível */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img 
            src={scratchCardTypes[selectedType].coverImage}
            alt={scratchCardTypes[selectedType].name}
            className="w-8 h-8 rounded object-cover"
          />
          <div>
            <p className="text-sm font-semibold text-foreground">
              {scratchCardTypes[selectedType].name}
            </p>
            <p className="text-xs text-muted-foreground">
              R$ {scratchCardTypes[selectedType].price.toFixed(2)}
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 h-auto"
        >
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Opções expandidas */}
      {isExpanded && (
        <div className="mt-3 space-y-2 animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-3 gap-2">
            {(Object.entries(scratchCardTypes) as [ScratchCardType, typeof scratchCardTypes[ScratchCardType]][]).map(([type, config]) => {
              const isSelected = selectedType === type;
              const canAfford = userBalance >= config.price;
              
              return (
                <button
                  key={type}
                  onClick={() => handleTypeChange(type)}
                  disabled={!canAfford}
                  className={cn(
                    "relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200",
                    {
                      'border-primary shadow-lg': isSelected,
                      'border-border/50 hover:border-border': !isSelected && canAfford,
                      'border-border/30 opacity-50': !canAfford
                    }
                  )}
                >
                  <img 
                    src={config.coverImage}
                    alt={config.name}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Preço */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 text-center">
                    R$ {config.price.toFixed(2)}
                  </div>

                  {/* Indicador de seleção */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-primary/20 border-2 border-primary" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Saldo do usuário */}
          <div className="text-center pt-2 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              Seu saldo: <span className="font-semibold text-primary">R$ {userBalance.toFixed(2)}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MinimizedScratchSelector;