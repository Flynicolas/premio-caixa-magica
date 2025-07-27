import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface DemoInventoryItem {
  id: string;
  item_id: string | null;
  item_name: string;
  item_image: string | null;
  chest_type: string;
  rarity: string;
  won_at: string;
  is_redeemed: boolean;
  redeemed_at: string | null;
}

export const useDemoInventory = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<DemoInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDemoInventory = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('demo_inventory')
        .select('*')
        .eq('user_id', user.id)
        .order('won_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar inventário demo:', error);
        return;
      }

      setItems(data || []);
    } catch (error) {
      console.error('Erro ao buscar inventário demo:', error);
    } finally {
      setLoading(false);
    }
  };

  const addDemoItem = async (itemData: {
    item_name: string;
    item_image?: string;
    chest_type: string;
    rarity: string;
    item_id?: string;
  }) => {
    if (!user) return { error: 'Usuário não autenticado' };

    try {
      const { data, error } = await supabase
        .from('demo_inventory')
        .insert({
          user_id: user.id,
          ...itemData
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao adicionar item demo:', error);
        return { error: 'Erro ao adicionar item' };
      }

      setItems(prev => [data, ...prev]);
      return { error: null, data };
    } catch (error) {
      console.error('Erro ao adicionar item demo:', error);
      return { error: 'Erro interno' };
    }
  };

  const redeemDemoItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('demo_inventory')
        .update({ 
          is_redeemed: true, 
          redeemed_at: new Date().toISOString() 
        })
        .eq('id', itemId)
        .eq('user_id', user?.id);

      if (error) {
        console.error('Erro ao resgatar item demo:', error);
        return { error: 'Erro ao resgatar item' };
      }

      setItems(prev => 
        prev.map(item => 
          item.id === itemId 
            ? { ...item, is_redeemed: true, redeemed_at: new Date().toISOString() }
            : item
        )
      );

      return { error: null };
    } catch (error) {
      console.error('Erro ao resgatar item demo:', error);
      return { error: 'Erro interno' };
    }
  };

  useEffect(() => {
    fetchDemoInventory();
  }, [user]);

  return {
    items,
    loading,
    addDemoItem,
    redeemDemoItem,
    refreshInventory: fetchDemoInventory
  };
};