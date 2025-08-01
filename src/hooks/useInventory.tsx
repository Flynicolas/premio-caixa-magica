
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';
import { DatabaseItem, UserChestInventory, UserInventory, ChestItemProbability } from '@/types/database';

// ==============================================
// HOOK PARA GERENCIAR INVENTÁRIO DO USUÁRIO
// ==============================================

export const useInventory = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Estados do inventário
  const [userChests, setUserChests] = useState<UserChestInventory[]>([]);
  const [userItems, setUserItems] = useState<UserInventory[]>([]);

  const [availableItems, setAvailableItems] = useState<DatabaseItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Buscar baús do usuário
  const fetchUserChests = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await (supabase as any)
        .from('user_chest_inventory')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserChests(data || []);
    } catch (error) {
      console.error('Erro ao buscar baús:', error);
    }
  };

  // Buscar itens do usuário
const fetchUserItems = async () => {
  if (!user) return;
  console.log("estou sendo chamado")
  try {
    const { data, error } = await supabase
      .from('user_inventory')
      .select(`
        *,
        item:items(*)
      `)
      .eq('user_id', user.id)
      .order('won_at', { ascending: false });

    if (error) throw error;

    const allowedRarities = ['common', 'rare', 'epic', 'legendary'];
    const safeData = (data || []).filter(item => allowedRarities.includes(item.rarity));
    setUserItems(safeData as UserInventory[]);

  } catch (error) {
    console.error('Erro ao buscar prêmios:', error);
  }
};


  // Buscar todos os itens disponíveis
  const fetchAvailableItems = async () => {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('❌ [useInventory] Erro ao buscar itens disponíveis:', error);
        // Fallback para evitar crash
        setAvailableItems([]);
        return;
      }
      
      setAvailableItems((data || []) as DatabaseItem[]);
    } catch (error) {
      console.error('❌ [useInventory] Erro crítico ao buscar itens disponíveis:', error);
      setAvailableItems([]);
    }
  };

  // Buscar itens de um baú específico com probabilidades
  const getChestItems = async (chestType: string): Promise<ChestItemProbability[]> => {
    try {
      const { data, error } = await supabase
        .from('chest_item_probabilities')
        .select(`
          *,
          item:items(*)
        `)
        .eq('chest_type', chestType)
        .eq('is_active', true);

      if (error) {
        console.error('❌ [useInventory] Erro ao buscar itens do baú:', error);
        return [];
      }
      
      return (data || []) as ChestItemProbability[];
    } catch (error) {
      console.error('❌ [useInventory] Erro crítico ao buscar itens do baú:', error);
      return [];
    }
  };

  // Adicionar baú ao inventário (quando comprar)
  const addChestToInventory = async (chestType: string, quantity: number = 1) => {
    if (!user) return { error: 'Usuário não logado' };

    try {
      const { error } = await (supabase as any)
        .from('user_chest_inventory')
        .insert({
          user_id: user.id,
          chest_type: chestType,
          quantity,
          acquired_from: 'purchase'
        });

      if (error) throw error;
      
      await fetchUserChests();
      
      toast({
        title: "Baú adicionado!",
        description: `${quantity}x Baú adicionado ao seu inventário`,
        variant: "default"
      });

      return { error: null };
    } catch (error: any) {
      console.error('Erro ao adicionar baú:', error);
      return { error: error.message };
    }
  };

  // Abrir baú (sortear item)
  const openChest = async (chestType: string): Promise<{ item: DatabaseItem | null, error: string | null }> => {
    if (!user) return { item: null, error: 'Usuário não logado' };

    try {
      // Verificar se o usuário tem o baú
      const userChest = userChests.find(chest => 
        chest.chest_type === chestType && chest.quantity > 0
      );

      if (!userChest) {
        return { item: null, error: 'Você não possui este baú' };
      }

      // Chamar função do banco para sortear item
      const { data: drawnItemId, error: drawError } = await (supabase as any)
        .rpc('draw_item_from_chest', { chest_type_param: chestType });

      if (drawError) throw drawError;

      // Buscar dados completos do item sorteado
      const { data: item, error: itemError } = await (supabase as any)
        .from('items')
        .select('*')
        .eq('id', drawnItemId)
        .single();

      if (itemError) throw itemError;

      // Criar abertura de baú
      const { data: chestOpening, error: openingError } = await (supabase as any)
        .from('chest_openings')
        .insert({
          user_id: user.id,
          chest_type: chestType,
          amount_paid: 0, // Será atualizado quando implementarmos compras
          prize_id: drawnItemId
        })
        .select()
        .single();

      if (openingError) throw openingError;

      // Adicionar item ao inventário do usuário
      const { error: inventoryError } = await (supabase as any)
        .from('user_item_inventory')
        .insert({
          user_id: user.id,
          item_id: drawnItemId,
          quantity: 1,
          chest_opening_id: chestOpening?.id
        });

      if (inventoryError) throw inventoryError;

      // Remover baú do inventário
      if (userChest.quantity === 1) {
        await (supabase as any)
          .from('user_chest_inventory')
          .delete()
          .eq('id', userChest.id);
      } else {
        await (supabase as any)
          .from('user_chest_inventory')
          .update({ quantity: userChest.quantity - 1 })
          .eq('id', userChest.id);
      }

      // Atualizar estados
      await Promise.all([ fetchUserItems()]);

      return { item, error: null };
    } catch (error: any) {
      console.error('Erro ao abrir baú:', error);
      return { item: null, error: error.message };
    }
  };

  // Agrupar baús por tipo para exibição
  const getChestCounts = () => {
    const counts: Record<string, number> = {
      silver: 0,
      gold: 0,
      delas: 0,
      diamond: 0,
      ruby: 0,
      premium: 0
    };

    userChests.forEach(chest => {
      counts[chest.chest_type] = (counts[chest.chest_type] || 0) + chest.quantity;
    });

    return counts;
  };

  // Agrupar itens por categoria para exibição
  const getItemsByCategory = () => {
    return userItems.reduce((acc, userItem) => {
      const category = userItem.item?.category || 'unknown';
      if (!acc[category]) acc[category] = [];
      acc[category].push(userItem);
      return acc;
    }, {} as Record<string, UserInventory[]>);
  };

  // Carregar dados iniciais
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchAvailableItems(),
        // user ? fetchUserChests() : Promise.resolve(),
        user ? fetchUserItems() : Promise.resolve()
      ]);
      setLoading(false);
    };

    loadData();
  }, [user]);

  return {
    // Estados
    userChests,
    userItems,
    availableItems,
    loading,
    
    // Funções
    getChestItems,
    addChestToInventory,
    openChest,
    getChestCounts,
    getItemsByCategory,
    
    // Funções de refresh
    refreshInventory: () => Promise.all([fetchUserItems()]),
    refreshItems: fetchAvailableItems
  };
};
