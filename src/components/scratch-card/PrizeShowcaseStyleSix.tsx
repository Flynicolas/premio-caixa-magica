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

interface PrizeShowcaseStyleSixProps {
  scratchType: ScratchCardType;
  className?: string;
}

const PrizeShowcaseStyleSix = ({ scratchType, className }: PrizeShowcaseStyleSixProps) => {
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
          .slice(0, 10); // Top 10 para tabela

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
        <CardContent className="p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex gap-3 items-center">
                  <div className="w-8 h-8 bg-muted rounded"></div>
                  <div className="flex-1 h-3 bg-muted rounded"></div>
                  <div className="w-12 h-3 bg-muted rounded"></div>
                </div>
              ))}
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
            📋 Lista de Prêmios
          </h3>
          <p className="text-xs text-muted-foreground">
            Estilo 6: Miniaturas em Tabela
          </p>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto">
          {items.map((item, index) => (
            <div 
              key={item.id} 
              className="flex items-center gap-3 p-2 bg-background/30 hover:bg-background/50 border border-border/30 rounded-lg transition-all duration-200 group"
            >
              {/* Posição */}
              <div className="w-6 text-center">
                <span className="text-xs font-bold text-muted-foreground">
                  {index + 1}
                </span>
              </div>

              {/* Miniatura */}
              <div className="w-8 h-8 flex-shrink-0">
                <img 
                  src={item.image_url || '/placeholder.svg'} 
                  alt={item.name}
                  className="w-full h-full object-contain rounded group-hover:scale-110 transition-transform duration-200"
                />
              </div>

              {/* Nome do item */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-foreground truncate" title={item.name}>
                  {item.name}
                </h4>
              </div>

              {/* Valor */}
              <div className="text-right flex-shrink-0">
                <span className="text-sm font-bold text-primary">
                  R$ {item.base_value.toFixed(0)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {items.length === 0 && (
          <div className="text-center py-8">
            <div className="text-3xl mb-2">📋</div>
            <p className="text-sm text-muted-foreground">
              Nenhum prêmio configurado
            </p>
          </div>
        )}

        {/* Footer com resumo */}
        {items.length > 0 && (
          <div className="mt-4 pt-3 border-t border-border/30">
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>Total de {items.length} prêmios</span>
              <span>
                Valor máximo: R$ {Math.max(...items.map(i => i.base_value)).toFixed(0)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PrizeShowcaseStyleSix;