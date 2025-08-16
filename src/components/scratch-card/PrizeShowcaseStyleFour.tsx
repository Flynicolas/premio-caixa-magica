import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { ScratchCardType } from '@/types/scratchCard';

interface PrizeItem {
  id: string;
  name: string;
  image_url: string | null;
  base_value: number;
}

interface PrizeShowcaseStyleFourProps {
  scratchType: ScratchCardType;
  className?: string;
}

const PrizeShowcaseStyleFour = ({ scratchType, className }: PrizeShowcaseStyleFourProps) => {
  const [items, setItems] = useState<PrizeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadItems = async () => {
      setIsLoading(true);
      try {
        const { data: probs } = await supabase
          .from('scratch_card_probabilities')
          .select('item_id')
          .eq('scratch_type', scratchType)
          .eq('is_active', true);

        if (!probs || probs.length === 0) {
          setItems([]);
          return;
        }

        const ids = probs.map(p => p.item_id);
        const { data: its } = await supabase
          .from('items')
          .select('id, name, image_url, base_value')
          .in('id', ids)
          .eq('is_active', true);

        const merged: PrizeItem[] = (its || [])
          .sort((a, b) => b.base_value - a.base_value)
          .slice(0, 4); // Top 4 para layout compacto

        setItems(merged);
      } catch (error) {
        console.error('Erro ao carregar itens:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadItems();
  }, [scratchType]);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-3">
          <div className="animate-pulse space-y-2">
            <div className="h-3 bg-muted rounded w-2/3"></div>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-12 h-12 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-3">
        <div className="text-center mb-3">
          <h3 className="text-sm font-bold text-primary mb-1">
            Prêmios Disponíveis
          </h3>
          <p className="text-xs text-muted-foreground">
            Estilo 4: Resumido e Menor
          </p>
        </div>

        <div className="flex justify-center gap-2 flex-wrap">
          {items.map((item) => (
            <div 
              key={item.id} 
              className="flex flex-col items-center p-2 bg-background/50 rounded-lg border border-border/50 min-w-[60px]"
            >
              <div className="w-10 h-10 mb-1">
                <img 
                  src={item.image_url || '/placeholder.svg'} 
                  alt={item.name}
                  className="w-full h-full object-contain rounded"
                />
              </div>
              
              <p className="text-xs font-bold text-primary text-center">
                R$ {item.base_value.toFixed(0)}
              </p>
            </div>
          ))}
        </div>

        {items.length === 0 && (
          <div className="text-center py-4">
            <p className="text-xs text-muted-foreground">
              Nenhum prêmio configurado
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PrizeShowcaseStyleFour;