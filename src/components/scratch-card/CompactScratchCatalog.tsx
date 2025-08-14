import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScratchCardType, scratchCardTypes } from '@/types/scratchCard';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface CompactItem {
  id: string;
  name: string;
  image_url?: string | null;
  base_value: number;
  rarity: string;
}

interface CompactScratchCatalogProps {
  currentType: ScratchCardType;
  onPlayType: (type: ScratchCardType) => void;
  className?: string;
}

const CompactScratchCatalog = ({ 
  currentType, 
  onPlayType, 
  className 
}: CompactScratchCatalogProps) => {
  const [items, setItems] = useState<Record<ScratchCardType, CompactItem[]>>({
    pix: [],
    sorte: [],
    dupla: [],
    ouro: [],
    diamante: [],
    premium: []
  });
  const [loading, setLoading] = useState(true);

  // Carregar itens de todos os tipos na inicialização
  useEffect(() => {
    loadAllItems();
  }, []);

  const loadAllItems = async () => {
    try {
      setLoading(true);
      const allItems: Record<ScratchCardType, CompactItem[]> = {
        pix: [],
        sorte: [],
        dupla: [],
        ouro: [],
        diamante: [],
        premium: []
      };

      // Carregar para cada tipo de raspadinha
      for (const type of Object.keys(scratchCardTypes) as ScratchCardType[]) {
        const typeItems = await loadItemsForType(type);
        allItems[type] = typeItems.slice(0, 6); // Limitar a 6 itens por tipo
      }

      setItems(allItems);
    } catch (error) {
      console.error('Erro ao carregar catálogo:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadItemsForType = async (type: ScratchCardType): Promise<CompactItem[]> => {
    try {
      // Buscar probabilidades primeiro
      const { data: probabilities } = await supabase
        .from('scratch_card_probabilities')
        .select('item_id, probability_weight')
        .eq('scratch_type', type)
        .eq('is_active', true)
        .gt('probability_weight', 0);

      if (!probabilities?.length) return [];

      // Buscar itens
      const itemIds = probabilities.map(p => p.item_id);
      const { data: itemsData } = await supabase
        .from('items')
        .select('id, name, image_url, base_value, rarity')
        .in('id', itemIds)
        .eq('is_active', true)
        .order('base_value', { ascending: false });

      return itemsData?.map(item => ({
        id: item.id,
        name: item.name,
        image_url: item.image_url,
        base_value: item.base_value,
        rarity: item.rarity
      })) || [];
    } catch (error) {
      console.error(`Erro ao carregar itens para ${type}:`, error);
      return [];
    }
  };

  const getScratchTypes = (): ScratchCardType[] => {
    return Object.keys(scratchCardTypes) as ScratchCardType[];
  };

  const truncateName = (name: string, maxLength: number = 20) => {
    return name.length > maxLength ? name.substring(0, maxLength) + '...' : name;
  };

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        <h3 className="text-lg font-semibold text-center">Outros Prêmios</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-3">
                <div className="w-16 h-16 bg-muted rounded mx-auto mb-2" />
                <div className="h-4 bg-muted rounded mb-1" />
                <div className="h-3 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-lg font-semibold text-center">Outras Raspadinhas</h3>
      
      {/* Grade responsiva de tipos de raspadinha */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {getScratchTypes()
          .filter(type => type !== currentType)
          .map((type) => {
            const config = scratchCardTypes[type];
            const typeItems = items[type] || [];
            const topItem = typeItems[0]; // Item mais valioso

            return (
              <Card 
                key={type} 
                className="hover:shadow-lg transition-all duration-200 cursor-pointer group"
                onClick={() => onPlayType(type)}
              >
                <CardContent className="p-3 text-center space-y-2">
                  {/* Thumbnail do item principal ou placeholder */}
                  <div className="w-16 h-16 mx-auto relative">
                    {topItem?.image_url ? (
                      <img
                        src={topItem.image_url}
                        alt={topItem.name}
                        className="w-full h-full object-contain rounded"
                      />
                    ) : (
                      <div className={cn(
                        "w-full h-full rounded flex items-center justify-center",
                        "bg-gradient-to-br", config.color
                      )}>
                        <span className="text-white text-xs font-bold">
                          {config.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Nome curto */}
                  <h4 className="text-sm font-medium line-clamp-1" title={config.name}>
                    {config.name.replace('Raspadinha', '').replace('do', '').replace('da', '').trim()}
                  </h4>

                  {/* Preço */}
                  <div className="text-xs text-muted-foreground">
                    R$ {config.price.toFixed(2)}
                  </div>

                  {/* Botão Jogar */}
                  <Button 
                    size="sm" 
                    className="w-full h-7 text-xs"
                    variant="outline"
                  >
                    Jogar
                  </Button>
                </CardContent>
              </Card>
            );
          })}
      </div>

      {/* Preview dos melhores prêmios do tipo atual */}
      {items[currentType].length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-center mb-3 text-muted-foreground">
            🏆 Principais prêmios desta raspadinha
          </h4>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {items[currentType].slice(0, 6).map((item) => (
              <div key={item.id} className="text-center">
                <div className="w-12 h-12 mx-auto mb-1">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-contain rounded"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted rounded flex items-center justify-center">
                      <span className="text-xs">?</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1" title={item.name}>
                  {truncateName(item.name, 15)}
                </p>
                <p className="text-xs font-medium">R$ {item.base_value.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CompactScratchCatalog;