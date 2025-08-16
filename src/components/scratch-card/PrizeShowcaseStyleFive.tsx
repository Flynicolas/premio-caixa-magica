import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { ScratchCardType } from '@/types/scratchCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PrizeItem {
  id: string;
  name: string;
  image_url: string | null;
  base_value: number;
}

interface PrizeShowcaseStyleFiveProps {
  scratchType: ScratchCardType;
  className?: string;
}

const PrizeShowcaseStyleFive = ({ scratchType, className }: PrizeShowcaseStyleFiveProps) => {
  const [items, setItems] = useState<PrizeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

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
          .slice(0, 8); // Top 8 para o carrossel

        setItems(merged);
      } catch (error) {
        console.error('Erro ao carregar itens:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadItems();
  }, [scratchType]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, items.length - 2));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.max(1, items.length - 2)) % Math.max(1, items.length - 2));
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="flex gap-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-20 h-16 bg-muted rounded-lg"></div>
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
            🎁 Galeria de Prêmios
          </h3>
          <p className="text-xs text-muted-foreground">
            Estilo 5: Layout Dinâmico em Linha
          </p>
        </div>

        <div className="relative">
          {/* Carrossel horizontal */}
          <div className="flex items-center gap-3 overflow-hidden">
            <button 
              onClick={prevSlide}
              className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/30 flex items-center justify-center transition-colors"
              disabled={items.length <= 3}
            >
              <ChevronLeft className="w-4 h-4 text-primary" />
            </button>

            <div className="flex-1 overflow-hidden">
              <div 
                className="flex gap-3 transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 25}%)` }}
              >
                {items.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex-shrink-0 w-20 group cursor-pointer"
                  >
                    <div className="bg-gradient-to-br from-background/80 to-background/40 border border-border/50 rounded-lg p-3 hover:border-primary/50 transition-all duration-300 text-center">
                      <div className="w-12 h-12 mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
                        <img 
                          src={item.image_url || '/placeholder.svg'} 
                          alt={item.name}
                          className="w-full h-full object-contain rounded"
                        />
                      </div>
                      
                      <h4 className="text-xs font-semibold text-foreground mb-1 line-clamp-1" title={item.name}>
                        {item.name}
                      </h4>
                      
                      <p className="text-xs font-bold text-primary">
                        R$ {item.base_value.toFixed(0)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={nextSlide}
              className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/30 flex items-center justify-center transition-colors"
              disabled={items.length <= 3}
            >
              <ChevronRight className="w-4 h-4 text-primary" />
            </button>
          </div>

          {/* Indicadores */}
          {items.length > 3 && (
            <div className="flex justify-center gap-1 mt-3">
              {Array.from({ length: Math.max(1, items.length - 2) }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-primary' : 'bg-primary/30'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {items.length === 0 && (
          <div className="text-center py-6">
            <div className="text-3xl mb-2">🎁</div>
            <p className="text-sm text-muted-foreground">
              Nenhum prêmio configurado
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PrizeShowcaseStyleFive;