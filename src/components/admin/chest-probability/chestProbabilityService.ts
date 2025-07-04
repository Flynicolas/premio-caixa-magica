
import { supabase } from '@/integrations/supabase/client';
import { ChestItemProbability } from '@/types/database';

export const chestProbabilityService = {
  async fetchProbabilities(): Promise<ChestItemProbability[]> {
    const { data, error } = await supabase
      .from('chest_item_probabilities')
      .select(`
        *,
        item:items(*)
      `)
      .order('chest_type')
      .order('probability_weight', { ascending: false });

    if (error) throw error;

    // Type cast para garantir que os tipos correspondam às interfaces
    return (data || []).map(prob => ({
      ...prob,
      chest_type: prob.chest_type as 'silver' | 'gold' | 'delas' | 'diamond' | 'ruby' | 'premium',
      item: prob.item ? {
        ...prob.item,
        rarity: prob.item.rarity as 'common' | 'rare' | 'epic' | 'legendary',
        delivery_type: prob.item.delivery_type as 'digital' | 'physical'
      } : undefined
    }));
  },

  async addItemToChest(itemId: string, chestType: string): Promise<void> {
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
  },

  async updateProbabilityWeight(probabilityId: string, newWeight: number): Promise<void> {
    const { error } = await supabase
      .from('chest_item_probabilities')
      .update({ probability_weight: newWeight })
      .eq('id', probabilityId);

    if (error) throw error;
  },

  async removeItemFromChest(probabilityId: string): Promise<void> {
    const { error } = await supabase
      .from('chest_item_probabilities')
      .update({ is_active: false })
      .eq('id', probabilityId);

    if (error) throw error;
  }
};
