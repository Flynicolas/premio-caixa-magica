import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Lock, Eye, AlertTriangle } from 'lucide-react';
import { Chest, ChestType } from '@/data/chestData';
import { useChestItemCount } from '@/hooks/useChestItemCount';
import ItemCard from './ItemCard';

interface ChestCardProps {
  chest: Chest;
  chestType: ChestType;
  onOpen: () => void;
  onViewItems: () => void;
  balance: number;
}

const ChestCard = ({ chest, chestType, onOpen, onViewItems, balance }: ChestCardProps) => {
  const { itemCount, hasMinimumItems, loading } = useChestItemCount(chestType);
  const canAfford = balance >= chest.price;
  const canPurchase = canAfford && hasMinimumItems;
  
  const chestColors = {
    silver: 'from-gray-400 to-gray-600',
    gold: 'from-yellow-400 to-yellow-600',
    delas: 'from-pink-400 to-rose-500',
    diamond: 'from-blue-400 to-cyan-400',
    ruby: 'from-red-400 to-pink-500',
    premium: 'from-purple-500 to-pink-600'
  };

  const chestBorderColors = {
    silver: 'border-gray-400/30',
    gold: 'border-yellow-400/30',
    delas: 'border-pink-400/30',
    diamond: 'border-blue-400/30',
    ruby: 'border-red-400/30',
    premium: 'border-purple-500/30'
  };

  const chestImages = {
    silver: '/lovable-uploads/8f503764-12ee-4e00-8148-76b279be343f.png',
    gold: '/lovable-uploads/8c5dedca-ad61-4b14-a649-8b854950a875.png',
    delas: '/lovable-uploads/85b1ecea-b443-4391-9986-fb77979cf6ea.png',
    diamond: '/lovable-uploads/0ec6f6c5-203f-4fca-855d-59171f78adf3.png',
    ruby: '/lovable-uploads/a7b012cc-0fae-4b69-b2f4-690740a0ba92.png',
    premium: '/lovable-uploads/d43f06a5-1532-42ba-8362-5aefb160b408.png'
  };

  // Get 5 rare items for preview
  const rareItems = chest.prizes.filter(prize => prize.rarity === 'rare' || prize.rarity === 'epic' || prize.rarity === 'legendary').slice(0, 5);

  const getButtonContent = () => {
    if (loading) {
      return (
        <>
          <Sparkles className="w-4 h-4 mr-2" />
          Carregando...
        </>
      );
    }

    if (!hasMinimumItems) {
      return (
        <>
          <AlertTriangle className="w-4 h-4 mr-2" />
          Indisponível
        </>
      );
    }

    if (!canAfford) {
      return (
        <>
          <Lock className="w-4 h-4 mr-2" />
          Sem Saldo
        </>
      );
    }

    return (
      <>
        <Sparkles className="w-4 h-4 mr-2" />
        Abrir Baú
      </>
    );
  };

  const getStatusMessage = () => {
    if (!hasMinimumItems) {
      return 'Baú indisponível no momento';
    }

    if (!canAfford) {
      return `Faltam R$ ${(chest.price - balance).toFixed(2).replace('.', ',')}`;
    }

    return null;
  };

  return (
    <Card className={`relative overflow-hidden ${chestBorderColors[chestType]} bg-card/50 hover:bg-card/70 transition-all duration-300 group h-full border-2 aspect-[4/5]`}>
      <CardContent className="p-4 flex flex-col h-full">
        {/* Chest Image */}
        <div className="relative mb-4 flex justify-center">
          <div className="w-24 h-24 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
            <img 
              src={chestImages[chestType]} 
              alt={chest.name}
              className="w-full h-full object-contain drop-shadow-lg"
            />
          </div>
          
          {/* View Items Button */}
          <button
            onClick={onViewItems}
            className={`absolute top-1 right-1 bg-gradient-to-r ${chestColors[chestType]} text-white px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 flex items-center space-x-1 hover:scale-105`}
          >
            <Eye className="w-3 h-3" />
            <span>ver</span>
          </button>
          
          {/* Floating sparkles */}
          <div className="absolute -top-1 -left-1">
            <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
          </div>
        </div>

        {/* Chest Info */}
        <div className="text-center mb-3 flex-grow">
          <h3 className="text-lg font-bold text-primary mb-1">{chest.name}</h3>
          
          <div className="text-xl font-bold text-white mb-3">
            R$ {chest.price.toFixed(2).replace('.', ',')}
          </div>

          {/* Preview of rare items using ItemCard */}
          <div className="mb-3">
            <p className="text-xs text-muted-foreground mb-2">Itens Raros:</p>
            <div className="flex justify-center space-x-1">
              {rareItems.map((item, index) => (
                <ItemCard
                  key={index}
                  item={{
                    name: item.name,
                    image_url: item.image,
                    rarity: item.rarity as 'common' | 'rare' | 'epic' | 'legendary',
                    description: item.description
                  }}
                  size="sm"
                  showRarity={false}
                  className="hover:transform-none hover:shadow-none"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Button
          onClick={onOpen}
          disabled={!canPurchase || loading}
          className={`w-full font-bold transition-all duration-300 text-sm ${
            canPurchase 
              ? `bg-gradient-to-r ${chestColors[chestType]} text-black hover:opacity-90 hover:scale-105` 
              : 'bg-gray-600 text-gray-300 cursor-not-allowed'
          }`}
        >
          {getButtonContent()}
        </Button>

        {/* Status Message */}
        {getStatusMessage() && (
          <Badge 
            variant="destructive" 
            className="mt-1 text-xs text-center w-full"
          >
            {getStatusMessage()}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
};

export default ChestCard;
