
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Lock, Eye, AlertTriangle } from 'lucide-react';
import { Chest, ChestType } from '@/data/chestData';
import { useChestItemCount } from '@/hooks/useChestItemCount';
import { supabase } from '@/integrations/supabase/client';
import ChestOpeningModal from './ChestOpeningModal';
import ItemCard from './ItemCard';

interface ChestCardProps {
  chest: Chest;
  chestType: ChestType;
  onOpen: () => void;
  onViewItems: () => void;
  balance: number;
}

interface ChestItem {
  id: string;
  name: string;
  image_url?: string | null;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'special';
  base_value: number;
  probability_weight: number;
}

const ChestCard = ({ chest, chestType, onOpen, onViewItems, balance }: ChestCardProps) => {
  const [showOpeningModal, setShowOpeningModal] = useState(false);
  const [chestItems, setChestItems] = useState<ChestItem[]>([]);
  const { itemCount, hasMinimumItems, loading } = useChestItemCount(chestType);
  const canAfford = balance >= chest.price;
  const canPurchase = canAfford && hasMinimumItems;

  // Buscar itens reais do baú
  useEffect(() => {
    const fetchChestItems = async () => {
      try {
        const { data, error } = await supabase
          .from('chest_item_probabilities')
          .select(`
            item:items(
              id,
              name,
              image_url,
              rarity,
              base_value
            ),
            probability_weight
          `)
          .eq('chest_type', chestType)
          .eq('is_active', true)
          .order('probability_weight', { ascending: false });

        if (error) throw error;

        const items = (data || [])
          .filter(item => item.item)
          .map(item => ({
            ...item.item,
            probability_weight: item.probability_weight
          }))
          .sort((a, b) => {
            // Ordenar por raridade primeiro, depois por valor
            const rarityOrder = { legendary: 4, epic: 3, rare: 2, common: 1, special: 5 };
            const rarityDiff = (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0);
            if (rarityDiff !== 0) return rarityDiff;
            return b.base_value - a.base_value;
          })
          .slice(0, 5); // Pegar apenas os 5 melhores

        setChestItems(items as ChestItem[]);
      } catch (error) {
        console.error('Erro ao buscar itens do baú:', error);
      }
    };

    fetchChestItems();
  }, [chestType]);

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
    <Card className={`relative overflow-hidden ${chestBorderColor} bg-card/50 hover:bg-card/70 transition-all duration-300 group h-full border-2 aspect-[4/5]`}>
      <CardContent className="p-6 flex flex-col h-full">
        {/* Header com nome e preço */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-primary mb-2">{chest.name}</h3>
          <div className="text-2xl font-bold text-white">
            R$ {chest.price.toFixed(2).replace('.', ',')}
          </div>
        </div>

        {/* Chest Image - Maior e mais destacada */}
        <div className="relative mb-6 flex justify-center">
          <div className="w-32 h-32 rounded-xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm">
            <img 
              src={chestImage} 
              alt={chest.name}
              className="w-full h-full object-contain drop-shadow-2xl"
            />
          </div>
          
          {/* View Items Button - Reposicionado */}
          <button
            onClick={onViewItems}
            className={`absolute -top-2 -right-2 bg-gradient-to-r ${chestColor} text-white px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center space-x-2 hover:scale-105 shadow-lg`}
          >
            <Eye className="w-4 h-4" />
            <span>Ver Itens</span>
          </button>
        </div>

        {/* Preview of items - Mais diagramado */}
        <div className="mb-6 flex-grow">
          <p className="text-sm text-muted-foreground mb-4 text-center font-medium">
            🎁 Você pode ganhar:
          </p>
          
          {chestItems.length > 0 ? (
            <div className="grid grid-cols-5 gap-2">
              {chestItems.map((item, index) => (
                <div key={item.id} className="relative group/item">
                  <ItemCard
                    item={{
                      name: item.name,
                      image_url: item.image_url,
                      rarity: item.rarity,
                      description: null
                    }}
                    size="sm"
                    showRarity={false}
                    className="hover:scale-105 transition-transform duration-200"
                  />
                  
                  {/* Tooltip com nome do item */}
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-white font-medium truncate w-20 text-center opacity-0 group-hover/item:opacity-100 transition-opacity bg-black/80 px-2 py-1 rounded z-10">
                    {item.name}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground text-sm">
              Carregando itens...
            </div>
          )}
        </div>

        {/* Action Button */}
        <Button
          onClick={handleOpenChest}
          disabled={!canPurchase || loading}
          className={`w-full font-bold transition-all duration-300 text-lg py-6 ${
            canPurchase 
              ? `bg-gradient-to-r ${chestColor} text-black hover:opacity-90 hover:scale-105 shadow-lg` 
              : 'bg-gray-600 text-gray-300 cursor-not-allowed'
          }`}
        >
          {getButtonContent()}
        </Button>

        {/* Status Message */}
        {getStatusMessage() && (
          <Badge 
            variant="destructive" 
            className="mt-3 text-sm text-center w-full py-2"
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
