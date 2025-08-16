import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { ScratchCardType } from '@/types/scratchCard';
import { Trophy, Star, Crown, Gem } from 'lucide-react';

interface PrizeItem {
  id: string;
  name: string;
  image_url: string | null;
  rarity: string;
  base_value: number;
  probability_weight: number;
}

interface PrizeShowcaseStyleThreeProps {
  scratchType: ScratchCardType;
  className?: string;
}

const PrizeShowcaseStyleThree = ({ scratchType, className }: PrizeShowcaseStyleThreeProps) => {
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

  const getRarityConfig = (rarity: string, index: number) => {
    const configs = {
      common: { 
        bg: 'from-gray-500/20 to-gray-600/20', 
        border: 'border-gray-400/30',
        icon: Star,
        glow: 'shadow-gray-500/20'
      },
      uncommon: { 
        bg: 'from-green-500/20 to-green-600/20', 
        border: 'border-green-400/30',
        icon: Trophy,
        glow: 'shadow-green-500/20'
      },
      rare: { 
        bg: 'from-blue-500/20 to-blue-600/20', 
        border: 'border-blue-400/30',
        icon: Star,
        glow: 'shadow-blue-500/20'
      },
      epic: { 
        bg: 'from-purple-500/20 to-purple-600/20', 
        border: 'border-purple-400/30',
        icon: Crown,
        glow: 'shadow-purple-500/20'
      },
      legendary: { 
        bg: 'from-yellow-500/20 to-yellow-600/20', 
        border: 'border-yellow-400/30',
        icon: Gem,
        glow: 'shadow-yellow-500/20'
      }
    };
    return configs[rarity as keyof typeof configs] || configs.common;
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="text-center">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="aspect-square bg-muted rounded-xl"></div>
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
            💎 Galeria de Prêmios
          </h3>
          <p className="text-xs text-muted-foreground">
            Estilo 3: Grid Elegante - Cards Quadrados
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {items.map((item, index) => {
            const config = getRarityConfig(item.rarity, index);
            const IconComponent = config.icon;
            
            return (
              <div 
                key={item.id} 
                className={`
                  relative group cursor-pointer
                  bg-gradient-to-br ${config.bg}
                  border ${config.border}
                  rounded-xl p-3 
                  hover:scale-105 hover:${config.glow}
                  transition-all duration-300
                  backdrop-blur-sm
                  min-h-[120px] flex flex-col
                `}
              >
                {/* Rank badge */}
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold z-10">
                  {index + 1}
                </div>

                {/* Icon de raridade */}
                <div className="absolute top-2 left-2">
                  <IconComponent className="w-4 h-4 text-foreground/60" />
                </div>

                {/* Conteúdo central */}
                <div className="flex-1 flex flex-col items-center justify-center text-center mt-2">
                  <div className="w-12 h-12 mb-2 relative group-hover:scale-110 transition-transform duration-300">
                    <img 
                      src={item.image_url || '/placeholder.svg'} 
                      alt={item.name}
                      className="w-full h-full object-contain rounded"
                    />
                  </div>
                  
                  <h4 className="text-xs font-semibold text-foreground mb-1 line-clamp-2" title={item.name}>
                    {item.name}
                  </h4>
                </div>

                {/* Footer */}
                <div className="mt-auto space-y-1">
                  <Badge 
                    className={`w-full text-xs px-1 py-0 bg-gradient-to-r ${config.bg} border-0 text-foreground/80`}
                  >
                    {item.rarity.toUpperCase()}
                  </Badge>
                  
                  <p className="text-xs font-bold text-primary text-center">
                    R$ {item.base_value.toFixed(0)}
                  </p>
                </div>

                {/* Efeito de brilho para prêmios raros */}
                {(item.rarity === 'epic' || item.rarity === 'legendary') && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                )}
              </div>
            );
          })}
        </div>

        {items.length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🎁</div>
            <p className="text-sm text-muted-foreground">
              Nenhum prêmio configurado
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PrizeShowcaseStyleThree;