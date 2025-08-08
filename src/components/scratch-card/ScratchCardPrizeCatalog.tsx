import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScratchCardType } from '@/types/scratchCard';
import { supabase } from '@/integrations/supabase/client';
import { Star, Diamond, Sparkles, Gift, X } from 'lucide-react';

interface ScratchItem {
  id: string;
  name: string;
  image_url?: string | null;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'special';
  base_value: number;
  probability_weight: number;
}

interface ScratchCardPrizeCatalogProps {
  isOpen: boolean;
  onClose: () => void;
  scratchType: ScratchCardType;
}

const ScratchCardPrizeCatalog = ({ isOpen, onClose, scratchType }: ScratchCardPrizeCatalogProps) => {
  const [items, setItems] = useState<ScratchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRarity, setSelectedRarity] = useState<string>('all');

  useEffect(() => {
    if (isOpen) {
      fetchScratchItems();
    }
  }, [isOpen, scratchType]);

  const fetchScratchItems = async () => {
    try {
      setLoading(true);
      
      // Buscar probabilidades primeiro
      const { data: probabilities, error: probError } = await supabase
        .from('scratch_card_probabilities')
        .select('item_id, probability_weight')
        .eq('scratch_type', scratchType)
        .eq('is_active', true);

      if (probError) {
        console.error('Erro ao buscar probabilidades:', probError);
        return;
      }

      // Filtrar apenas itens com peso > 0
      const filteredProbs = (probabilities || []).filter(p => (p as any).probability_weight > 0);
      if (filteredProbs.length === 0) {
        setItems([]);
        return;
      }

      // Buscar itens pelos IDs
      const itemIds = filteredProbs.map(p => p.item_id);
      const { data: itemsData, error: itemsError } = await supabase
        .from('items')
        .select('id, name, image_url, rarity, base_value')
        .in('id', itemIds)
        .eq('is_active', true);

      if (itemsError) {
        console.error('Erro ao buscar itens:', itemsError);
        return;
      }

      // Combinar dados
      const processedItems = itemsData
        .map(item => {
          const probability = (probabilities || []).find(p => p.item_id === item.id);
          return {
            id: item.id,
            name: item.name,
            image_url: item.image_url,
            rarity: item.rarity as 'common' | 'rare' | 'epic' | 'legendary' | 'special',
            base_value: item.base_value,
            probability_weight: probability?.probability_weight || 1
          };
        })
        .filter(i => i.probability_weight > 0)
        .sort((a, b) => b.base_value - a.base_value); // Ordenar por valor

      setItems(processedItems);
    } catch (error) {
      console.error('Erro ao buscar itens:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-orange-500';
      case 'special': return 'bg-pink-500';
      default: return 'bg-gray-500';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'common': return Star;
      case 'rare': return Star;
      case 'epic': return Diamond;
      case 'legendary': return Sparkles;
      case 'special': return Gift;
      default: return Star;
    }
  };

  const filteredItems = selectedRarity === 'all' 
    ? items 
    : items.filter(item => item.rarity === selectedRarity);

  const rarities = [
    { value: 'all', label: 'Todos', count: items.length },
    { value: 'common', label: 'Comum', count: items.filter(i => i.rarity === 'common').length },
    { value: 'rare', label: 'Raro', count: items.filter(i => i.rarity === 'rare').length },
    { value: 'epic', label: 'Épico', count: items.filter(i => i.rarity === 'epic').length },
    { value: 'legendary', label: 'Lendário', count: items.filter(i => i.rarity === 'legendary').length },
    { value: 'special', label: 'Especial', count: items.filter(i => i.rarity === 'special').length }
  ].filter(r => r.count > 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary" />
              Catálogo de Prêmios
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Filtros por raridade */}
          <Tabs value={selectedRarity} onValueChange={setSelectedRarity}>
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
              {rarities.map((rarity) => (
                <TabsTrigger 
                  key={rarity.value} 
                  value={rarity.value}
                  className="text-xs"
                >
                  {rarity.label}
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {rarity.count}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Lista de itens */}
          <div className="max-h-[60vh] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2 text-muted-foreground">Carregando prêmios...</span>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Gift className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum prêmio encontrado nesta categoria</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map((item) => {
                  const RarityIcon = getRarityIcon(item.rarity);
                  return (
                    <Card key={item.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {/* Imagem do item */}
                          <div className="flex-shrink-0">
                            {item.image_url ? (
                              <img 
                                src={item.image_url} 
                                alt={item.name}
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                                <Gift className="w-6 h-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          
                          {/* Informações do item */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm truncate" title={item.name}>
                              {item.name}
                            </h3>
                            
                            {/* Raridade */}
                            <div className="flex items-center gap-1 mt-1">
                              <RarityIcon className={`w-3 h-3 ${getRarityColor(item.rarity).replace('bg-', 'text-')}`} />
                              <span className="text-xs text-muted-foreground capitalize">
                                {item.rarity}
                              </span>
                            </div>
                            
                            {/* Valor */}
                            <div className="mt-2">
                              <Badge variant="outline" className="text-xs">
                                R$ {item.base_value.toFixed(2)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Informação sobre as chances */}
          <div className="border-t pt-4">
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground text-center">
                💡 <strong>Dica:</strong> Todos os prêmios têm chance de aparecer na sua raspadinha. 
                Quanto maior o valor, mais raro o prêmio!
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScratchCardPrizeCatalog;