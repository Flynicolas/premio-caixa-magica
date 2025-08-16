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

interface PrizeShowcaseStyleOneProps {
  scratchType: ScratchCardType;
  className?: string;
}

const PrizeShowcaseStyleOne = ({ scratchType, className }: PrizeShowcaseStyleOneProps) => {
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
        })).sort((a, b) => b.base_value - a.base_value).slice(0, 6); // Top 6 prêmios

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
      common: 'bg-gray-100 text-gray-800',
      uncommon: 'bg-green-100 text-green-800',
      rare: 'bg-blue-100 text-blue-800',
      epic: 'bg-purple-100 text-purple-800',
      legendary: 'bg-yellow-100 text-yellow-800'
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="text-center">
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
              <div className="h-3 bg-muted rounded w-1/2 mx-auto"></div>
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
            🎁 Prêmios Disponíveis
          </h3>
          <p className="text-xs text-muted-foreground">
            Estilo 1: Compacto Mobile - Lista Vertical
          </p>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto">
          {items.map((item, index) => (
            <div key={item.id} className="flex items-center gap-3 p-2 bg-card/50 rounded-lg border border-border/30">
              <div className="w-8 h-8 flex-shrink-0">
                <img 
                  src={item.image_url || '/placeholder.svg'} 
                  alt={item.name}
                  className="w-full h-full object-contain rounded"
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-foreground truncate">
                    {item.name}
                  </span>
                  <Badge className={`text-xs px-1 py-0 ${getRarityColor(item.rarity)}`}>
                    {item.rarity}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    #{index + 1}
                  </span>
                  <span className="text-xs font-bold text-primary">
                    R$ {item.base_value.toFixed(2)}
                  </span>
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

export default PrizeShowcaseStyleOne;