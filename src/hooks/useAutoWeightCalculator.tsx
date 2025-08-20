import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAutoWeightCalculator = () => {
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  const calculateAutoWeight = (value: number): number => {
    // Mesma lógica da função SQL para consistência
    if (value <= 10) return 100;
    if (value <= 25) return 50;
    if (value <= 50) return 25;
    if (value <= 100) return 10;
    if (value <= 200) return 5;
    if (value <= 500) return 2;
    return 1;
  };

  const applyAutoWeightsToScratchCards = async () => {
    setUpdating(true);
    try {
      // Buscar todos os itens ativos
      const { data: items, error: itemsError } = await supabase
        .from('items')
        .select('id, base_value')
        .eq('is_active', true);

      if (itemsError) throw itemsError;

      // Buscar todas as probabilidades ativas
      const { data: probabilities, error: probError } = await supabase
        .from('scratch_card_probabilities')
        .select('id, item_id')
        .eq('is_active', true);

      if (probError) throw probError;

      // Calcular novos pesos
      const updates = probabilities
        .map(prob => {
          const item = items?.find(i => i.id === prob.item_id);
          if (!item) return null;
          
          return {
            id: prob.id,
            probability_weight: calculateAutoWeight(item.base_value)
          };
        })
        .filter(Boolean);

      // Atualizar em lotes
      for (const update of updates) {
        if (update) {
          await supabase
            .from('scratch_card_probabilities')
            .update({ probability_weight: update.probability_weight })
            .eq('id', update.id);
        }
      }

      toast({
        title: "Sucesso",
        description: `Pesos automáticos aplicados a ${updates.length} configurações`,
      });

      return true;
    } catch (error) {
      console.error('Erro ao aplicar pesos automáticos:', error);
      toast({
        title: "Erro",
        description: "Falha ao aplicar pesos automáticos",
        variant: "destructive"
      });
      return false;
    } finally {
      setUpdating(false);
    }
  };

  const applyAutoWeightsToChests = async () => {
    setUpdating(true);
    try {
      // Buscar todos os itens ativos
      const { data: items, error: itemsError } = await supabase
        .from('items')
        .select('id, base_value')
        .eq('is_active', true);

      if (itemsError) throw itemsError;

      // Buscar todas as probabilidades ativas de baús
      const { data: probabilities, error: probError } = await supabase
        .from('chest_item_probabilities')
        .select('id, item_id')
        .eq('is_active', true);

      if (probError) throw probError;

      // Calcular novos pesos
      const updates = probabilities
        .map(prob => {
          const item = items?.find(i => i.id === prob.item_id);
          if (!item) return null;
          
          return {
            id: prob.id,
            probability_weight: calculateAutoWeight(item.base_value)
          };
        })
        .filter(Boolean);

      // Atualizar em lotes
      for (const update of updates) {
        if (update) {
          await supabase
            .from('chest_item_probabilities')
            .update({ probability_weight: update.probability_weight })
            .eq('id', update.id);
        }
      }

      toast({
        title: "Sucesso",
        description: `Pesos automáticos aplicados a ${updates.length} configurações de baús`,
      });

      return true;
    } catch (error) {
      console.error('Erro ao aplicar pesos automáticos aos baús:', error);
      toast({
        title: "Erro",
        description: "Falha ao aplicar pesos automáticos aos baús",
        variant: "destructive"
      });
      return false;
    } finally {
      setUpdating(false);
    }
  };

  const getWeightRecommendation = (value: number) => {
    const weight = calculateAutoWeight(value);
    let category = '';
    
    if (weight >= 50) category = 'Comum (alta chance)';
    else if (weight >= 10) category = 'Raro (média chance)';
    else if (weight >= 5) category = 'Épico (baixa chance)';
    else category = 'Lendário (chance mínima)';

    return { weight, category };
  };

  return {
    updating,
    calculateAutoWeight,
    applyAutoWeightsToScratchCards,
    applyAutoWeightsToChests,
    getWeightRecommendation
  };
};