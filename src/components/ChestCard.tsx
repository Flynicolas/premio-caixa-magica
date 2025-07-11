
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Lock, Eye, AlertTriangle } from 'lucide-react';
import { Chest, ChestType } from '@/data/chestData';
import { useChestItemCount } from '@/hooks/useChestItemCount';
import { useRealtimeItems } from '@/hooks/useRealtimeItems';
import ChestOpeningModal from './ChestOpeningModal';
import ItemCard from './ItemCard';

interface ChestCardProps {
  chest: Chest;
  chestType: ChestType;
  onOpen: () => void;
  onViewItems: () => void;
  balance: number;
}

const ChestCard = ({ chest, chestType, onOpen, onViewItems, balance }: ChestCardProps) => {
  const [showOpeningModal, setShowOpeningModal] = useState(false);
  const [chestItems, setChestItems] = useState<any[]>([]);
  const { itemCount, hasMinimumItems, loading } = useChestItemCount(chestType);
  const { items: realtimeItems } = useRealtimeItems();
  const canAfford = balance >= chest.price;
  const canPurchase = canAfford && hasMinimumItems;

  // Filtrar itens em tempo real para este baú específico
  useEffect(() => {
    const filteredItems = realtimeItems.filter(item => 
      item.chest_types?.includes(chestType as any) && item.is_active
    );
    setChestItems(filteredItems);
  }, [realtimeItems, chestType]);

  const handleOpenChest = () => {
    if (canPurchase) {
      setShowOpeningModal(true);
    }
  };
  
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

  // Add safety checks with fallbacks
  const chestColor = chestColors[chestType] || chestColors.silver;
  const chestBorderColor = chestBorderColors[chestType] || chestBorderColors.silver;
  const chestImage = chestImages[chestType] || chestImages.silver;

  // Get premium items for preview (epic, legendary, special)
  const premiumItems = chestItems
    .filter(item => ['epic', 'legendary', 'special'].includes(item.rarity))
    .slice(0, 3);
  
  // Get regular items to fill the rest
  const regularItems = chestItems
    .filter(item => !['epic', 'legendary', 'special'].includes(item.rarity))
    .slice(0, 5 - premiumItems.length);

  const previewItems = [...premiumItems, ...regularItems].slice(0, 5);

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
    <Card className={`relative overflow-hidden ${chestBorderColor} bg-card/50 hover:bg-card/70 transition-all duration-300 group h-full border-2`}>
      <CardContent className="p-6 flex flex-col h-full">
        {/* Chest Image - Increased size */}
        <div className="relative mb-6 flex justify-center">
          <div className="w-32 h-32 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
            <img 
              src={chestImage} 
              alt={chest.name}
              className="w-full h-full object-contain drop-shadow-lg"
            />
          </div>
          
          {/* View Items Button */}
          <button
            onClick={onViewItems}
            className={`absolute top-1 right-1 bg-gradient-to-r ${chestColor} text-white px-3 py-2 rounded-full text-xs font-medium transition-all duration-200 flex items-center space-x-1 hover:scale-105`}
          >
            <Eye className="w-3 h-3" />
            <span>ver</span>
          </button>
        </div>

        {/* Chest Info */}
        <div className="text-center mb-4 flex-grow">
          <h3 className="text-xl font-bold text-primary mb-2">{chest.name}</h3>
          
          <div className="text-2xl font-bold text-white mb-4">
            R$ {chest.price.toFixed(2).replace('.', ',')}
          </div>

          {/* Items count */}
          <div className="mb-4">
            <Badge variant="outline" className="text-primary border-primary mb-2">
              {chestItems.length} itens disponíveis
            </Badge>
          </div>

          {/* Preview of items - Improved layout */}
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-3 font-medium">Você pode ganhar:</p>
            <div className="grid grid-cols-5 gap-2">
              {previewItems.map((item, index) => (
                <div key={index} className="flex flex-col items-center">
                  <ItemCard 
                    item={{
                      name: item.name,
                      image_url: item.image_url,
                      rarity: item.rarity as 'common' | 'rare' | 'epic' | 'legendary' | 'special',
                      description: item.description
                    }}
                    size="sm"
                    showRarity={false}
                    className="hover:transform-none hover:scale-105 transition-transform duration-200"
                  />
                </div>
              ))}
            </div>
            {chestItems.length > 5 && (
              <p className="text-xs text-muted-foreground mt-2">
                +{chestItems.length - 5} itens adicionais
              </p>
            )}
          </div>
        </div>

        {/* Action Button */}
        <Button
          onClick={handleOpenChest}
          disabled={!canPurchase || loading}
          className={`w-full font-bold transition-all duration-300 text-base py-3 ${
            canPurchase 
              ? `bg-gradient-to-r ${chestColor} text-black hover:opacity-90 hover:scale-105` 
              : 'bg-gray-600 text-gray-300 cursor-not-allowed'
          }`}
        >
          {getButtonContent()}
        </Button>

        {/* Status Message */}
        {getStatusMessage() && (
          <Badge 
            variant="destructive" 
            className="mt-2 text-xs text-center w-full"
          >
            {getStatusMessage()}
          </Badge>
        )}
      </CardContent>
      
      {/* Chest Opening Modal */}
      <ChestOpeningModal
        isOpen={showOpeningModal}
        onClose={() => setShowOpeningModal(false)}
        chestType={chestType}
        chestName={chest.name}
        chestPrice={chest.price}
      />
    </Card>
  );
};

export default ChestCard;
