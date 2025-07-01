
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Lock } from 'lucide-react';
import { Chest, ChestType } from '@/data/chestData';

interface ChestCardProps {
  chest: Chest;
  chestType: ChestType;
  onOpen: () => void;
  balance: number;
}

const ChestCard = ({ chest, chestType, onOpen, balance }: ChestCardProps) => {
  const canAfford = balance >= chest.price;
  
  const chestColors = {
    silver: 'from-gray-400 to-gray-600',
    gold: 'from-yellow-400 to-yellow-600',
    diamond: 'from-blue-400 to-cyan-400',
    ruby: 'from-red-400 to-pink-500',
    premium: 'from-purple-500 to-pink-600'
  };

  const chestThemes = {
    silver: 'border-gray-400/30 bg-gray-400/10',
    gold: 'border-yellow-400/30 bg-yellow-400/10',
    diamond: 'border-blue-400/30 bg-blue-400/10',
    ruby: 'border-red-400/30 bg-red-400/10',
    premium: 'border-purple-400/30 bg-purple-400/10'
  };

  const chestImages = {
    silver: '/lovable-uploads/70a08625-c438-4292-8356-821b05c265bc.png',
    gold: '/lovable-uploads/0220327d-3f58-4207-9a07-545072aad33d.png',
    diamond: '/lovable-uploads/7f613316-382c-4ea0-baf0-bf6ed60e27ba.png',
    ruby: '/lovable-uploads/f6ed1f29-bbd2-497a-af2f-3204fa4345b4.png',
    premium: '/lovable-uploads/dce87e40-cfc4-462f-becb-60e5d4dc0b8c.png'
  };

  // Get first 5 rare+ items from chest
  const rareItems = chest.prizes
    .filter(prize => prize.rarity !== 'common')
    .slice(0, 5);

  return (
    <Card className="relative overflow-hidden border-primary/20 bg-card/50 hover:bg-card/70 transition-all duration-300 group h-full">
      <CardContent className="p-6 flex flex-col h-full">
        {/* Chest Image */}
        <div className="relative mb-6 flex justify-center">
          <div className="w-40 h-40 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
            <img 
              src={chestImages[chestType]} 
              alt={chest.name}
              className="w-full h-full object-contain drop-shadow-lg"
            />
          </div>
          
          {/* Floating sparkles */}
          <div className="absolute -top-2 -right-2">
            <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
          </div>
        </div>

        {/* Chest Info */}
        <div className="text-center mb-4 flex-grow">
          <h3 className="text-xl font-bold text-primary mb-2">{chest.name}</h3>
          <p className="text-sm text-muted-foreground mb-4">{chest.description}</p>
          
          {/* Preview Items */}
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2">Itens Raros Inclusos:</p>
            <div className="flex justify-center space-x-1">
              {rareItems.map((item, index) => (
                <div 
                  key={index}
                  className={`w-10 h-10 rounded border ${chestThemes[chestType]} flex items-center justify-center p-1`}
                >
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="text-2xl font-bold text-white mb-4">
            R$ {chest.price.toFixed(2).replace('.', ',')}
          </div>
        </div>

        {/* Action Button */}
        <Button
          onClick={onOpen}
          disabled={!canAfford}
          className={`w-full font-bold ${
            canAfford 
              ? `bg-gradient-to-r ${chestColors[chestType]} text-black hover:opacity-90` 
              : 'bg-gray-600 text-gray-300 cursor-not-allowed'
          }`}
        >
          {canAfford ? (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Abrir Baú
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 mr-2" />
              Saldo Insuficiente
            </>
          )}
        </Button>

        {!canAfford && (
          <Badge variant="destructive" className="mt-2 text-xs">
            Faltam R$ {(chest.price - balance).toFixed(2).replace('.', ',')}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
};

export default ChestCard;
