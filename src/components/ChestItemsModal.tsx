
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-gradient-to-br from-card via-card to-card/90 border-primary/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-primary">
            {chestType} - Conteúdo
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

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {itemsInRarity.map((item, index) => (
                      <ItemCard
                        key={index}
                        item={{
                          name: item.name,
                          image_url: item.image_url,
                          rarity: (item.rarity === 'special' ? 'legendary' : item.rarity) as 'common' | 'rare' | 'epic' | 'legendary',
                          description: `Valor: R$ ${item.base_value.toFixed(2)}`
                        }}
                        size="md"
                        showRarity={false}
                      />
                    ))}
                  </div>
                </div>
              );
            })
          )}

          <div className="mt-6 p-4 bg-primary/10 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">
              <strong>Probabilidade de acerto item raro:</strong> Varia conforme a raridade<br/>
              <strong>Média de lucro nos itens comuns:</strong> Todos os prêmios têm valor real
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChestItemsModal;
