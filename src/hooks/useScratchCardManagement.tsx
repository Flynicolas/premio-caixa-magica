import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ScratchCardType {
  id: string;
  scratch_type: string;
  name: string;
  price: number;
  is_active: boolean;
  house_edge: number;
  win_probability: number;
  background_image?: string;
  created_at: string;
  updated_at: string;
}

export interface ScratchCardProbability {
  id: string;
  scratch_type: string;
  item_id: string;
  probability_weight: number;
  min_quantity: number;
  max_quantity: number;
  is_active: boolean;
  created_at: string;
  item?: {
    id: string;
    name: string;
    base_value: number;
    rarity: string;
    image_url?: string;
    category: string;
  } | null;
}

export const useScratchCardManagement = () => {
  const [scratchTypes, setScratchTypes] = useState<ScratchCardType[]>([]);
  const [probabilities, setProbabilities] = useState<ScratchCardProbability[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadScratchTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('scratch_card_settings')
        .select('*')
        .eq('is_active', true)
        .order('scratch_type');

      if (error) throw error;
      setScratchTypes(data || []);
    } catch (error) {
      console.error('Erro ao carregar tipos de raspadinha:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar tipos de raspadinha",
        variant: "destructive"
      });
    }
  };

  const loadProbabilities = async () => {
    try {
      const { data, error } = await supabase
        .from('scratch_card_probabilities')
        .select(`
          id,
          scratch_type,
          item_id,
          probability_weight,
          min_quantity,
          max_quantity,
          is_active,
          created_at
        `)
        .order('scratch_type')
        .order('probability_weight', { ascending: false });

      if (error) throw error;

      // Buscar informações dos itens separadamente
      const itemIds = data?.map(p => p.item_id) || [];
      const { data: itemsData } = await supabase
        .from('items')
        .select('id, name, base_value, rarity, image_url, category')
        .in('id', itemIds);

      // Combinar dados
      const enrichedData = data?.map(prob => ({
        ...prob,
        item: itemsData?.find(item => item.id === prob.item_id) || null
      })) || [];

      setProbabilities(enrichedData);
    } catch (error) {
      console.error('Erro ao carregar probabilidades:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar probabilidades",
        variant: "destructive"
      });
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([loadScratchTypes(), loadProbabilities()]);
    setLoading(false);
  };

  const addItemToScratchType = async (scratchType: string, itemId: string) => {
    try {
      // Verificar se item já existe para este tipo
      const existing = probabilities.find(
        p => p.scratch_type === scratchType && p.item_id === itemId
      );

      if (existing) {
        toast({
          title: "Aviso",
          description: "Item já configurado para este tipo de raspadinha",
          variant: "destructive"
        });
        return false;
      }

      // Peso padrão baseado no tipo de raspadinha
      let defaultWeight = 1;
      if (scratchType === 'pix') {
        defaultWeight = 30; // PIX tem mais chances de itens pequenos
      } else if (scratchType === 'sorte') {
        defaultWeight = 20;
      } else if (scratchType === 'dupla') {
        defaultWeight = 15;
      } else if (scratchType === 'ouro') {
        defaultWeight = 10;
      } else if (scratchType === 'diamante') {
        defaultWeight = 5;
      } else if (scratchType === 'premium') {
        defaultWeight = 3;
      }

      const { error } = await supabase
        .from('scratch_card_probabilities')
        .insert({
          scratch_type: scratchType,
          item_id: itemId,
          probability_weight: defaultWeight,
          min_quantity: 1,
          max_quantity: 1,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Item adicionado à raspadinha",
      });

      loadProbabilities();
      return true;
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      toast({
        title: "Erro",
        description: "Falha ao adicionar item",
        variant: "destructive"
      });
      return false;
    }
  };

  const removeItemFromScratchType = async (probId: string, itemName: string) => {
    try {
      const { error } = await supabase
        .from('scratch_card_probabilities')
        .delete()
        .eq('id', probId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `${itemName} removido da raspadinha`,
      });

      loadProbabilities();
      return true;
    } catch (error) {
      console.error('Erro ao remover item:', error);
      toast({
        title: "Erro",
        description: "Falha ao remover item",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateProbability = async (probId: string, newWeight: number) => {
    try {
      const { error } = await supabase
        .from('scratch_card_probabilities')
        .update({ probability_weight: newWeight })
        .eq('id', probId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao atualizar probabilidade:', error);
      return false;
    }
  };

  const getProbabilitiesByType = (scratchType: string) => {
    return probabilities.filter(p => p.scratch_type === scratchType);
  };

  const getTotalWeight = (scratchType: string) => {
    return getProbabilitiesByType(scratchType).reduce(
      (sum, prob) => sum + prob.probability_weight, 0
    );
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    scratchTypes,
    probabilities,
    loading,
    loadData,
    addItemToScratchType,
    removeItemFromScratchType,
    updateProbability,
    getProbabilitiesByType,
    getTotalWeight
  };
};