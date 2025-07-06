
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { DatabaseItem } from '@/types/database';

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

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao verificar status admin:', error);
        return false;
      }
      
      const adminStatus = !!data;
      setIsAdmin(adminStatus);
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
    console.log('Buscando itens do banco de dados...');
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro na consulta:', error);
        throw error;
      }
      
      console.log('Itens encontrados:', data?.length || 0);
      
      const typedData = (data || []).map(item => ({
        ...item,
        rarity: item.rarity as 'common' | 'rare' | 'epic' | 'legendary',
        delivery_type: item.delivery_type as 'digital' | 'physical'
      }));
      
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

  const updateItem = async (id: string, updates: Partial<DatabaseItem>) => {
    console.log('Atualizando item:', id, updates);
    
    try {
      const { data, error } = await supabase
        .from('items')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar item:', error);
        throw error;
      }

      console.log('Item atualizado com sucesso:', data);

      // Atualizar o estado local imediatamente
      setItems(prev => prev.map(item => 
        item.id === id ? { 
          ...item, 
          ...updates,
          rarity: updates.rarity || item.rarity,
          delivery_type: updates.delivery_type || item.delivery_type 
        } : item
      ));

      // Recalcular estatísticas
      const updatedItems = items.map(item => 
        item.id === id ? { ...item, ...updates } : item
      );
      calculateStats(updatedItems);

      toast({
        title: "Item atualizado!",
        description: "As alterações foram salvas com sucesso.",
      });

      return data;
    } catch (error: any) {
      console.error('Erro ao atualizar item:', error);
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const createItem = async (itemData: Omit<DatabaseItem, 'id' | 'created_at' | 'updated_at'>) => {
    console.log('Criando novo item:', itemData);
    
    try {
      const { data, error } = await supabase
        .from('items')
        .insert([itemData])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar item:', error);
        throw error;
      }

      console.log('Item criado com sucesso:', data);

      const typedData = {
        ...data,
        rarity: data.rarity as 'common' | 'rare' | 'epic' | 'legendary',
        delivery_type: data.delivery_type as 'digital' | 'physical'
      };

      // Atualizar o estado local imediatamente
      setItems(prev => [typedData, ...prev]);
      
      // Recalcular estatísticas
      const updatedItems = [typedData, ...items];
      calculateStats(updatedItems);

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
    console.log('Deletando item:', id);
    
    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar item:', error);
        throw error;
      }

      console.log('Item deletado com sucesso');

      // Atualizar o estado local imediatamente
      const updatedItems = items.filter(item => item.id !== id);
      setItems(updatedItems);
      calculateStats(updatedItems);

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
      throw error;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      if (!user) {
        setLoading(false);
        return;
      }

      console.log('Verificando status de admin...');
      const adminStatus = await checkAdminStatus();
      console.log('Status admin:', adminStatus);
      
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

    console.log('Configurando atualizações em tempo real...');
    
    const channel = supabase
      .channel('item-management-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'items' },
        (payload) => {
          console.log('Mudança realtime detectada:', payload);
          fetchItems();
        }
      )
      .subscribe((status) => {
        console.log('Status do canal realtime:', status);
      });

    return () => {
      console.log('Removendo canal realtime');
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  return {
    items,
    stats,
    loading,
    isAdmin,
    updateItem,
    createItem,
    deleteItem,
    refetchItems: fetchItems
  };
};
