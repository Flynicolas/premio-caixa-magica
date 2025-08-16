import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { ScratchCardType } from '@/types/scratchCard';

interface PrizeItem {
  id: string;
  name: string;
  image_url: string | null;
  rarity: string;
  base_value: number;
  probability_weight: number;
}

interface PrizeShowcaseStyleTwoProps {
  scratchType: ScratchCardType;
  className?: string;
}

const PrizeShowcaseStyleTwo = ({ scratchType, className }: PrizeShowcaseStyleTwoProps) => {
  const [items, setItems] = useState<PrizeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadItems = async () => {
      setIsLoading(true);
      try {
        const { data: probs } = await supabase
          .from('scratch_card_probabilities')
          .select('item_id, probability_weight')
          .eq('scratch_type', scratchType)
          .eq('is_active', true);

        if (!probs || probs.length === 0) {
          setItems([]);
          return;
        }

        const ids = probs.map(p => p.item_id);
        const { data: its } = await supabase
          .from('items')
          .select('id, name, image_url, rarity, base_value')
          .in('id', ids)
          .eq('is_active', true);

        const merged: PrizeItem[] = (its || []).map(i => ({
          id: i.id,
          name: i.name,
          image_url: i.image_url,
          rarity: i.rarity as string,
          base_value: i.base_value,
          probability_weight: probs.find(v => v.item_id === i.id)?.probability_weight ?? 0,
        })).sort((a, b) => b.base_value - a.base_value).slice(0, 4); // Top 4 prêmios

        setItems(merged);
      } catch (error) {
        console.error('Erro ao carregar itens:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadItems();
  }, [scratchType]);

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: 'from-gray-400 to-gray-600',
      uncommon: 'from-green-400 to-green-600',
      rare: 'from-blue-400 to-blue-600',
      epic: 'from-purple-400 to-purple-600',
      legendary: 'from-yellow-400 to-yellow-600'
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="text-center">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
              <div className="flex gap-2 overflow-x-auto">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex-shrink-0 w-20 h-16 bg-muted rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="text-center mb-4">
          <h3 className="text-lg font-bold text-primary mb-1">
            🏆 Prêmios em Destaque
          </h3>
          <p className="text-xs text-muted-foreground">
            Estilo 2: Cards Horizontais - Layout em Linha
          </p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scroll-smooth">
          {items.map((item, index) => (
            <div 
              key={item.id} 
              className="flex-shrink-0 bg-gradient-to-br from-card/40 to-card/80 border border-border/50 rounded-lg p-3 min-w-[100px] hover:scale-105 transition-transform duration-200"
            >
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 relative">
                  <img 
                    src={item.image_url || '/placeholder.svg'} 
                    alt={item.name}
                    className="w-full h-full object-contain rounded"
                  />
                  <div className={`absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r ${getRarityColor(item.rarity)} rounded-full border border-background`}>
                    <span className="text-xs text-white font-bold flex items-center justify-center w-full h-full">
                      {index + 1}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-xs font-medium text-foreground truncate" title={item.name}>
                    {item.name.length > 12 ? item.name.substring(0, 12) + '...' : item.name}
                  </p>
                  
                  <Badge className={`text-xs px-1 py-0 bg-gradient-to-r ${getRarityColor(item.rarity)} text-white border-0`}>
                    {item.rarity}
                  </Badge>
                  
                  <p className="text-xs font-bold text-primary">
                    R$ {item.base_value.toFixed(0)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {items.length === 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              Nenhum prêmio configurado
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PrizeShowcaseStyleTwo;