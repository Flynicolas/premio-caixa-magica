import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ChestType } from '@/data/chestData';
import ItemCard from '../ItemCard';

interface ChestItem {
  id: string;
  name: string;
  image_url?: string | null;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'special';
  base_value: number;
  probability_weight: number;
}

interface ChestItemPreviewProps {
  chestType: ChestType;
}

const ChestItemPreview = ({ chestType }: ChestItemPreviewProps) => {
  const [chestItems, setChestItems] = useState<ChestItem[]>([]);

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
            const rarityOrder = { legendary: 4, epic: 3, rare: 2, common: 1, special: 5 };
            const rarityDiff = (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0);
            if (rarityDiff !== 0) return rarityDiff;
            return b.base_value - a.base_value;
          })
          .slice(0, 5);

        setChestItems(items as ChestItem[]);
      } catch (error) {
        console.error('Erro ao buscar itens do baú:', error);
      }
    };

    fetchChestItems();
  }, [chestType]);

  return (
    <div className="mb-8 flex-grow">
      <div className="text-center mb-6">
        <p className="text-lg text-muted-foreground font-medium">
          🎁 Você pode ganhar:
        </p>
      </div>
      
      {chestItems.length > 0 ? (
        <div className="grid grid-cols-5 gap-3 justify-items-center">
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
                className="hover:scale-110 transition-transform duration-200"
              />
              
              <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 text-xs text-white font-medium w-24 text-center opacity-0 group-hover/item:opacity-100 transition-opacity bg-black/90 px-3 py-2 rounded-lg z-10 truncate">
                {item.name}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground text-sm py-8">
          Carregando itens...
        </div>
      )}
    </div>
  );
};

export default ChestItemPreview;