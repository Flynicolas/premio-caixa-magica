
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ChestType } from '@/data/chestData';
import ItemCard from './ItemCard';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ChestItem {
  id: string;
  name: string;
  image_url?: string | null;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'special';
  base_value: number;
  probability_weight: number;
}

interface ChestItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  chestType: ChestType;
}

const chestTitles = {
  silver: 'Coleção Prata - Tesouros Clássicos',
  gold: 'Coleção Ouro - Riquezas Douradas', 
  delas: 'Coleção Rosa - Exclusivo Feminino',
  diamond: 'Coleção Diamante - Brilho Eterno',
  ruby: 'Coleção Rubi - Raridades Preciosas',
  premium: 'Coleção Premium - Elite Suprema'
};

const chestThemes = {
  silver: 'from-gray-400/20 via-gray-500/20 to-gray-600/20',
  gold: 'from-yellow-400/20 via-yellow-500/20 to-yellow-600/20',
  delas: 'from-pink-400/20 via-rose-500/20 to-pink-600/20',
  diamond: 'from-blue-400/20 via-cyan-500/20 to-blue-600/20',
  ruby: 'from-red-400/20 via-pink-500/20 to-red-600/20',
  premium: 'from-purple-500/20 via-pink-600/20 to-purple-700/20'
};

const ChestItemsModal = ({ isOpen, onClose, chestType }: ChestItemsModalProps) => {
  const [items, setItems] = useState<ChestItem[]>([]);
  const [loading, setLoading] = useState(true);

  const rarityLabels = {
    common: 'Comum',
    rare: 'Raro',
    epic: 'Épico',
    legendary: 'Lendário'
  };

  useEffect(() => {
    const fetchChestItems = async () => {
      if (!isOpen) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('chest_item_probabilities')
          .select(`
            probability_weight,
            items (
              id,
              name,
              image_url,
              rarity,
              base_value
            )
          `)
          .eq('chest_type', chestType)
          .eq('is_active', true);

        if (error) {
          console.error('Error fetching chest items:', error);
          return;
        }

        const chestItems: ChestItem[] = data
          ?.filter(item => item.items)
          .map(item => ({
            id: item.items!.id,
            name: item.items!.name,
            image_url: item.items!.image_url,
            rarity: item.items!.rarity as ChestItem['rarity'],
            base_value: item.items!.base_value,
            probability_weight: item.probability_weight
          }))
          .sort((a, b) => {
            const rarityOrder = { legendary: 4, epic: 3, rare: 2, common: 1, special: 0 };
            return (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0) || b.base_value - a.base_value;
          }) || [];

        setItems(chestItems);
      } catch (error) {
        console.error('Error fetching chest items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChestItems();
  }, [chestType, isOpen]);

  // Group items by rarity
  const groupedItems = items.reduce((acc, item) => {
    const rarity = item.rarity === 'special' ? 'legendary' : item.rarity;
    if (!acc[rarity]) {
      acc[rarity] = [];
    }
    acc[rarity].push(item);
    return acc;
  }, {} as Record<string, ChestItem[]>);

  const rarityOrder = ['legendary', 'epic', 'rare', 'common'];

  const chestTitle = chestTitles[chestType] || chestTitles.silver;
  const chestTheme = chestThemes[chestType] || chestThemes.silver;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-5xl max-h-[85vh] overflow-y-auto bg-gradient-to-br ${chestTheme} backdrop-blur-xl border border-white/20 shadow-2xl`}>
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-center bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            {chestTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {loading ? (
            <div className="text-center text-muted-foreground">Carregando itens...</div>
          ) : (
            rarityOrder.map(rarity => {
              const itemsInRarity = groupedItems[rarity];
              if (!itemsInRarity || itemsInRarity.length === 0) return null;

              return (
                <div key={rarity} className="mb-8">
                  <div className="flex items-center mb-4">
                    <Badge 
                      className={`mr-3 ${
                        rarity === 'legendary' ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                        rarity === 'epic' ? 'bg-gradient-to-r from-purple-400 to-purple-600' :
                        rarity === 'rare' ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                        'bg-gradient-to-r from-gray-400 to-gray-600'
                      } text-white`}
                    >
                      {rarityLabels[rarity]}
                    </Badge>
                    <h3 className="text-lg font-semibold text-white">
                      {itemsInRarity.length} {itemsInRarity.length === 1 ? 'item' : 'itens'}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {itemsInRarity.map((item, index) => (
                      <div key={index} className="group">
                        <ItemCard
                          item={{
                            name: item.name,
                            image_url: item.image_url,
                            rarity: (item.rarity === 'special' ? 'legendary' : item.rarity) as 'common' | 'rare' | 'epic' | 'legendary',
                            description: `Valor: R$ ${item.base_value.toFixed(2)}`
                          }}
                          size="md"
                          showRarity={false}
                        />
                        <div className="mt-3 text-center">
                          <h4 className="text-sm font-medium text-white/90 leading-tight">{item.name}</h4>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChestItemsModal;
