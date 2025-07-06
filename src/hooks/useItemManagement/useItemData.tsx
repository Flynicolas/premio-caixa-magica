
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DatabaseItem } from '@/types/database';
import { ItemManagementStats } from './types';

export const useItemData = (isAdmin: boolean) => {
  const { toast } = useToast();
  const [items, setItems] = useState<DatabaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ItemManagementStats>({
    totalItems: 0,
    itemsByChest: {},
    itemsByRarity: {},
    totalValue: 0,
    missingImages: 0
  });

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

  useEffect(() => {
    if (isAdmin) {
      fetchItems();
    }
    setLoading(false);
  }, [isAdmin]);

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
    setItems,
    stats,
    loading,
    fetchItems,
    calculateStats
  };
};
