
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  
  const chestImages = {
    silver: '/lovable-uploads/ba84a4b9-15d4-4eea-afe4-518604f4b511.png',
    gold: '/lovable-uploads/a9a1a1e2-6d02-4df8-a1f7-95f111b30ee1.png',
    diamond: '/lovable-uploads/b32691e3-5eb0-4d76-85c1-f349a2615f80.png',
    ruby: '/lovable-uploads/1e75dbed-c6dc-458b-bf5f-867f613d6c3f.png',
    premium: '/lovable-uploads/4a2fd772-393f-42ee-a420-0714594e7fbb.png'
  };

  const rarityColors = {
    silver: 'from-gray-400 to-gray-600',
    gold: 'from-yellow-400 to-yellow-600',
    diamond: 'from-blue-400 to-cyan-500',
    ruby: 'from-red-500 to-pink-600',
    premium: 'from-purple-500 via-pink-500 to-yellow-500'
  };

  return (
    <Card className={`relative overflow-hidden border-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
      canAfford ? 'border-primary/50 cursor-pointer' : 'border-gray-600 opacity-50'
    } bg-gradient-to-br from-card to-card/80 backdrop-blur-sm`}>
      
      {/* Shine effect */}
      <div className="absolute inset-0 chest-shine opacity-30" />
      
      {/* Rarity indicator */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${rarityColors[chestType]}`} />
      
      <div className="relative p-6 text-center">
        {/* Chest Image */}
        <div className={`w-24 h-24 mx-auto mb-4 rounded-lg overflow-hidden ${canAfford ? 'float pulse-gold' : ''}`}>
          <img 
            src={chestImages[chestType]} 
            alt={chest.name}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Chest Info */}
        <h3 className="text-xl font-bold mb-2 gold-gradient bg-clip-text text-transparent">
          {chest.name}
        </h3>
        
        <p className="text-sm text-muted-foreground mb-4 min-h-[40px]">
          {chest.description}
        </p>

        {/* Price */}
        <div className="mb-4">
          <span className="text-2xl font-bold text-primary">
            R$ {chest.price.toFixed(2)}
          </span>
        </div>

        {/* Prize count */}
        <Badge variant="secondary" className="mb-4">
          <Sparkles className="w-3 h-3 mr-1" />
          {chest.prizes.length} prêmios
        </Badge>

        {/* Action Button */}
        <Button
          onClick={onOpen}
          disabled={!canAfford}
          className={`w-full font-bold transition-all duration-300 ${
            canAfford 
              ? 'gold-gradient text-black hover:opacity-90 hover:scale-105' 
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
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

        {/* Sample prizes preview */}
        <div className="mt-4 text-xs text-muted-foreground">
          <p>Exemplos: {chest.prizes.slice(0, 3).map(p => p.name).join(', ')}...</p>
        </div>
      </div>
    </Card>
  );
};

export default ChestCard;
