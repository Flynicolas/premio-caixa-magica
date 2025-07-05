
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { DatabaseItem } from '@/types/database';
import { chestData } from '@/data/chestData';

export interface ItemManagementStats {
  totalItems: number;
  itemsByChest: Record<string, number>;
  itemsByRarity: Record<string, number>;
  totalValue: number;
  missingImages: number;
}

export const useItemManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [items, setItems] = useState<DatabaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState<ItemManagementStats>({
    totalItems: 0,
    itemsByChest: {},
    itemsByRarity: {},
    totalValue: 0,
    missingImages: 0
  });

  const checkAdminStatus = async () => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('role')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      const adminStatus = !!data;
      setIsAdmin(adminStatus);
      console.log('Status de admin verificado:', adminStatus);
      return adminStatus;
    } catch (error) {
      console.error('Erro ao verificar status admin:', error);
      return false;
    }
  };

  const calculateStats = (itemsList: DatabaseItem[]) => {
    const newStats: ItemManagementStats = {
      totalItems: itemsList.length,
      itemsByChest: {},
      itemsByRarity: {},
      totalValue: 0,
      missingImages: 0
    };

    itemsList.forEach(item => {
      newStats.itemsByRarity[item.rarity] = (newStats.itemsByRarity[item.rarity] || 0) + 1;
      newStats.totalValue += Number(item.base_value);
      
      if (!item.image_url) {
        newStats.missingImages++;
      }

      if (item.chest_types && Array.isArray(item.chest_types)) {
        item.chest_types.forEach(chestType => {
          newStats.itemsByChest[chestType] = (newStats.itemsByChest[chestType] || 0) + 1;
        });
      }
    });

    setStats(newStats);
  };

  const fetchItems = async () => {
    try {
      console.log('Buscando itens...');
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const typedData = (data || []).map(item => ({
        ...item,
        rarity: item.rarity as 'common' | 'rare' | 'epic' | 'legendary',
        delivery_type: item.delivery_type as 'digital' | 'physical'
      }));
      
      console.log('Itens carregados:', typedData.length);
      setItems(typedData);
      calculateStats(typedData);
    } catch (error: any) {
      console.error('Erro ao buscar itens:', error);
      toast({
        title: "Erro ao carregar itens",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const migrateChestData = async () => {
    try {
      setLoading(true);
      
      const allItems = Object.entries(chestData).flatMap(([chestType, chest]) =>
        chest.prizes.map(item => ({
          ...item,
          chest_type: chestType,
          value: parseFloat(item.value.replace('R$ ', '').replace('.', '').replace(',', '.'))
        }))
      );

      const { data, error } = await supabase.rpc('migrate_chest_data', {
        items_data: allItems
      });

      if (error) throw error;

      const result = data[0];
      
      toast({
        title: "Migração concluída!",
        description: `${result.migrated_count} itens migrados, ${result.updated_count} atualizados. ${result.error_count} erros.`,
      });

      await fetchItems();
    } catch (error: any) {
      console.error('Erro na migração:', error);
      toast({
        title: "Erro na migração",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (id: string, updates: Partial<DatabaseItem>) => {
    try {
      console.log('Atualizando item:', id, updates);
      const { error } = await supabase
        .from('items')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      // Atualizar estado local imediatamente
      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      ));

      toast({
        title: "Item atualizado!",
        description: "As alterações foram salvas com sucesso.",
      });
    } catch (error: any) {
      console.error('Erro ao atualizar item:', error);
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const createItem = async (itemData: Omit<DatabaseItem, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('Criando item:', itemData);
      const { data, error } = await supabase
        .from('items')
        .insert([itemData])
        .select()
        .single();

      if (error) throw error;

      const typedData = {
        ...data,
        rarity: data.rarity as 'common' | 'rare' | 'epic' | 'legendary',
        delivery_type: data.delivery_type as 'digital' | 'physical'
      };

      // Atualizar estado local imediatamente
      setItems(prev => [typedData, ...prev]);

      toast({
        title: "Item criado!",
        description: "Novo item adicionado com sucesso.",
      });

      return typedData;
    } catch (error: any) {
      console.error('Erro ao criar item:', error);
      toast({
        title: "Erro ao criar item",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      console.log('Deletando item:', id);
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Atualizar estado local imediatamente
      setItems(prev => prev.filter(item => item.id !== id));

      toast({
        title: "Item removido!",
        description: "Item deletado com sucesso.",
      });
    } catch (error: any) {
      console.error('Erro ao deletar item:', error);
      toast({
        title: "Erro ao deletar",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const bulkUpdateItems = async (itemIds: string[], updates: Partial<DatabaseItem>) => {
    try {
      console.log('Atualização em massa:', itemIds.length, 'itens');
      const { error } = await supabase
        .from('items')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .in('id', itemIds);

      if (error) throw error;

      // Atualizar estado local imediatamente
      setItems(prev => prev.map(item => 
        itemIds.includes(item.id) ? { ...item, ...updates } : item
      ));

      toast({
        title: "Itens atualizados!",
        description: `${itemIds.length} itens foram atualizados com sucesso.`,
      });
    } catch (error: any) {
      console.error('Erro no bulk update:', error);
      toast({
        title: "Erro na atualização em massa",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      if (!user) {
        setLoading(false);
        return;
      }

      const adminStatus = await checkAdminStatus();
      
      if (adminStatus) {
        await fetchItems();
      }
      
      setLoading(false);
    };

    loadData();
  }, [user]);

  // Configurar real-time updates
  useEffect(() => {
    if (!isAdmin) return;

    console.log('Configurando realtime para itens...');
    const channel = supabase
      .channel('item-management-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'items' },
        (payload) => {
          console.log('Mudança realtime detectada:', payload);
          // O fetchItems será chamado automaticamente pelo realtime
          fetchItems();
        }
      )
      .subscribe((status) => {
        console.log('Status do canal item-management:', status);
      });

    return () => {
      console.log('Removendo canal item-management');
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  return {
    items,
    stats,
    loading,
    isAdmin,
    migrateChestData,
    updateItem,
    createItem,
    deleteItem,
    bulkUpdateItems,
    refetchItems: fetchItems
  };
};
