
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useChestItemCount = (chestType: string) => {
  const [itemCount, setItemCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItemCount = async () => {
      try {
        setLoading(true);
        const { count, error } = await supabase
          .from('chest_item_probabilities')
          .select('*', { count: 'exact', head: true })
          .eq('chest_type', chestType)
          .eq('is_active', true);

        if (error) {
          console.error('❌ [useChestItemCount] Erro ao contar itens do baú:', error);
          setItemCount(0);
        } else {
          setItemCount(count || 0);
        }
      } catch (error) {
        console.error('❌ [useChestItemCount] Erro crítico ao buscar contagem de itens:', error);
        setItemCount(0);
      } finally {
        setLoading(false);
      }
    };

    if (chestType) {
      fetchItemCount();
    }
  }, [chestType]);

  const hasMinimumItems = itemCount >= 10;

  return {
    itemCount,
    hasMinimumItems,
    loading
  };
};
