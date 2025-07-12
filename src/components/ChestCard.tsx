
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import { ChestType } from '@/data/chestData';

interface ChestCardProps {
  id: string;
  name: string;
  price: number;
  type: ChestType;
  description: string;
  image: string;
  onOpen: (type: ChestType) => void;
  userBalance: number;
  premiumBonus?: number;
}

const ChestCard = ({ 
  id, 
  name, 
  price, 
  type, 
  description, 
  image, 
  onOpen, 
  userBalance,
  premiumBonus = 0
}: ChestCardProps) => {
  const canAfford = userBalance >= price;
  
  const chestColors = {
    silver: 'from-gray-400 to-gray-600',
    gold: 'from-yellow-400 to-yellow-600',
    diamond: 'from-blue-400 to-cyan-400',
    ruby: 'from-red-400 to-pink-500',
    premium: 'from-purple-500 to-pink-600'
  };

  const chestGlows = {
    silver: 'shadow-gray-400/30',
    gold: 'shadow-yellow-400/40',
    diamond: 'shadow-blue-400/40',
    ruby: 'shadow-red-400/40',
    premium: 'shadow-purple-500/50'
  };

  return (
    <Card className={`relative overflow-hidden transition-all duration-300 hover:scale-105 ${chestGlows[type]} hover:shadow-xl border-2 h-full flex flex-col`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${chestColors[type]} opacity-10`} />
      
      {/* Premium Badge */}
      {premiumBonus > 0 && (
        <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10">
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-xs sm:text-sm px-2 sm:px-3 py-1">
            +{premiumBonus}% Bônus
          </Badge>
        </div>
      )}

      <div className="relative z-10 p-4 sm:p-6 flex-1 flex flex-col">
        {/* Chest Image */}
        <div className="mb-4 sm:mb-6 flex justify-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 flex items-center justify-center">
            <img 
              src={image} 
              alt={name}
              className="w-full h-full object-contain drop-shadow-2xl animate-float"
            />
          </div>
        </div>

        {/* Chest Info */}
        <div className="text-center flex-1 flex flex-col">
          <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">
            {name}
          </h3>
          
          <p className="text-sm text-muted-foreground mb-4 flex-1">
            {description}
          </p>
          
          <div className="space-y-3 sm:space-y-4">
            <div className="text-xl sm:text-2xl font-bold text-primary">
              R$ {price.toFixed(2).replace('.', ',')}
            </div>
            
            <Button
              onClick={() => onOpen(type)}
              disabled={!canAfford}
              className={`w-full h-12 sm:h-14 text-sm sm:text-base font-bold transition-all duration-200 touch-manipulation ${
                canAfford 
                  ? `bg-gradient-to-r ${chestColors[type]} text-white hover:opacity-90` 
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
            >
              {canAfford ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Abrir Baú
                </>
              ) : (
                'Saldo Insuficiente'
              )}
            </Button>
            
            {!canAfford && (
              <p className="text-xs sm:text-sm text-red-400">
                Saldo: R$ {userBalance.toFixed(2).replace('.', ',')}
              </p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ChestCard;
