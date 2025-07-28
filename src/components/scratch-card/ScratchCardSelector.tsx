import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Coins, Star, Diamond, Trophy, Crown } from 'lucide-react';
import { ScratchCardType, scratchCardTypes } from '@/types/scratchCard';

interface ScratchCardSelectorProps {
  selectedType: ScratchCardType;
  onTypeSelect: (type: ScratchCardType) => void;
  onGenerate: () => void;
  balance: number;
  isLoading: boolean;
  hasActiveGame: boolean;
}

const cardIcons = {
  sorte: Star,
  dupla: Star,
  ouro: Coins,
  diamante: Diamond,
  premium: Crown
};

const ScratchCardSelector = ({
  selectedType,
  onTypeSelect,
  onGenerate,
  balance,
  isLoading,
  hasActiveGame
}: ScratchCardSelectorProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Escolha sua Raspadinha
        </h2>
        <p className="text-muted-foreground">
          Selecione o tipo de raspadinha e teste sua sorte!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(Object.entries(scratchCardTypes) as [ScratchCardType, typeof scratchCardTypes[ScratchCardType]][]).map(([type, config]) => {
          const Icon = cardIcons[type];
          const isSelected = selectedType === type;
          const canAfford = balance >= config.price;
          
          return (
            <Card
              key={type}
              className={`p-4 cursor-pointer transition-all duration-300 hover:scale-105 ${
                isSelected 
                  ? 'ring-2 ring-primary shadow-lg' 
                  : 'hover:shadow-md'
              } ${!canAfford ? 'opacity-60' : ''}`}
              onClick={() => onTypeSelect(type)}
            >
              <div className="text-center space-y-3">
                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-r ${config.color}`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg">{config.name}</h3>
                  <Badge 
                    variant="secondary" 
                    className={`mt-1 ${config.textColor} ${config.bgColor} bg-opacity-20`}
                  >
                    R$ {config.price.toFixed(2)}
                  </Badge>
                </div>

                {!canAfford && (
                  <p className="text-sm text-destructive">
                    Saldo insuficiente
                  </p>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <div className="text-center space-y-4">
        <div className="text-sm text-muted-foreground">
          Seu saldo: <span className="font-bold text-primary">R$ {balance.toFixed(2)}</span>
        </div>

        {!hasActiveGame && (
          <Button
            onClick={onGenerate}
            disabled={isLoading || balance < scratchCardTypes[selectedType].price}
            className={`w-full max-w-xs bg-gradient-to-r ${scratchCardTypes[selectedType].color} hover:opacity-90 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300`}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Gerando...
              </>
            ) : (
              `Comprar por R$ ${scratchCardTypes[selectedType].price.toFixed(2)}`
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ScratchCardSelector;