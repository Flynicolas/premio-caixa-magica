
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DatabaseItem, ChestItemProbability } from '@/types/database';
import { ChestConfigurationCard } from './ChestConfigurationCard';

interface ChestProbabilityManagerProps {
  items: DatabaseItem[];
  onRefresh: () => void;
}

const CHEST_TYPES = [
  { value: 'silver', label: 'Baú Prata', price: 5.0 },
  { value: 'gold', label: 'Baú Ouro', price: 10.0 },
  { value: 'delas', label: 'Baú Delas', price: 15.0 },
  { value: 'diamond', label: 'Baú Diamante', price: 25.0 },
  { value: 'ruby', label: 'Baú Ruby', price: 50.0 },
  { value: 'premium', label: 'Baú Premium', price: 100.0 }
];

export const ChestProbabilityManager = ({ items, onRefresh }: ChestProbabilityManagerProps) => {
  const [probabilities, setProbabilities] = useState<Record<string, ChestItemProbability[]>>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProbabilities();
    
    const channel = supabase
      .channel('chest-probabilities-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'chest_item_probabilities' },
        () => fetchProbabilities()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchProbabilities = async () => {
    try {
      const { data, error } = await supabase
        .from('chest_item_probabilities')
        .select(`
          *,
          item:items(*)
        `)
        .eq('is_active', true)
        .order('chest_type')
        .order('probability_weight', { ascending: false });

      if (error) throw error;

      const grouped = (data || []).reduce((acc, prob) => {
        const typedProb: ChestItemProbability = {
          ...prob,
          chest_type: prob.chest_type as 'silver' | 'gold' | 'delas' | 'diamond' | 'ruby' | 'premium',
          item: prob.item ? {
            ...prob.item,
            rarity: prob.item.rarity as 'common' | 'rare' | 'epic' | 'legendary',
            delivery_type: prob.item.delivery_type as 'digital' | 'physical'
          } : undefined
        };

        if (!acc[typedProb.chest_type]) {
          acc[typedProb.chest_type] = [];
        }
        acc[typedProb.chest_type].push(typedProb);
        return acc;
      }, {} as Record<string, ChestItemProbability[]>);

      setProbabilities(grouped);
    } catch (error: any) {
      console.error('Erro ao buscar probabilidades:', error);
      toast({
        title: "Erro ao carregar probabilidades",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const addItemToChest = async (itemId: string, chestType: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('chest_item_probabilities')
        .insert([{
          chest_type: chestType,
          item_id: itemId,
          probability_weight: 1,
          min_quantity: 1,
          max_quantity: 1,
          is_active: true
        }]);

      if (error) throw error;

      toast({
        title: "Item adicionado!",
        description: "Item adicionado ao baú com sucesso",
      });

      await fetchProbabilities();
      onRefresh();
    } catch (error: any) {
      console.error('Erro ao adicionar item:', error);
      toast({
        title: "Erro ao adicionar item",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProbabilityWeight = async (probabilityId: string, newWeight: number) => {
    try {
      const { error } = await supabase
        .from('chest_item_probabilities')
        .update({ probability_weight: newWeight })
        .eq('id', probabilityId);

      if (error) throw error;

      toast({
        title: "Peso atualizado!",
        description: newWeight === 0 ? "Item removido do sorteio (apenas liberação manual)" : "Peso da probabilidade atualizado",
      });

      await fetchProbabilities();
      onRefresh();
    } catch (error: any) {
      console.error('Erro ao atualizar peso:', error);
      toast({
        title: "Erro ao atualizar peso",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const removeItemFromChest = async (probabilityId: string) => {
    if (!confirm('Tem certeza que deseja remover este item do baú?')) return;

    try {
      const { error } = await supabase
        .from('chest_item_probabilities')
        .update({ is_active: false })
        .eq('id', probabilityId);

      if (error) throw error;

      toast({
        title: "Item removido!",
        description: "Item removido do baú com sucesso",
      });

      await fetchProbabilities();
      onRefresh();
    } catch (error: any) {
      console.error('Erro ao remover item:', error);
      toast({
        title: "Erro ao remover item",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getAvailableItemsForChest = (chestType: string) => {
    const chestItems = probabilities[chestType] || [];
    const usedItemIds = chestItems.map(p => p.item_id);
    return items.filter(item => item.is_active && !usedItemIds.includes(item.id));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Probabilidades dos Baús</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CHEST_TYPES.map(chestType => (
              <ChestConfigurationCard
                key={chestType.value}
                chestType={chestType.value}
                chestName={chestType.label}
                chestPrice={chestType.price}
                probabilities={probabilities[chestType.value] || []}
                availableItems={getAvailableItemsForChest(chestType.value)}
                onAddItem={addItemToChest}
                onUpdateWeight={updateProbabilityWeight}
                onRemoveItem={removeItemFromChest}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChestProbabilityManager;
