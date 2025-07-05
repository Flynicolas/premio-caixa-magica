
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DatabaseItem } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export const useRealtimeItems = () => {
  const [items, setItems] = useState<DatabaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Buscar itens iniciais
  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('base_value', { ascending: false });

      if (error) throw error;
      
      const typedData = (data || []).map(item => ({
        ...item,
        rarity: item.rarity as 'common' | 'rare' | 'epic' | 'legendary',
        delivery_type: item.delivery_type as 'digital' | 'physical'
      }));
      
      setItems(typedData);
    } catch (error: any) {
      console.error('Erro ao buscar itens:', error);
      toast({
        title: "Erro ao carregar itens",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Configurar atualizações em tempo real
  useEffect(() => {
    fetchItems();

    // Configurar canal de tempo real
    const channel = supabase
      .channel('items-realtime')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'items' },
        (payload) => {
          console.log('Mudança em tempo real nos itens:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newItem = {
              ...payload.new,
              rarity: payload.new.rarity as 'common' | 'rare' | 'epic' | 'legendary',
              delivery_type: payload.new.delivery_type as 'digital' | 'physical'
            } as DatabaseItem;
            
            setItems(prev => [newItem, ...prev]);
            
            toast({
              title: "Novo item adicionado!",
              description: `${newItem.name} foi adicionado ao sistema`,
            });
          }
          
          if (payload.eventType === 'UPDATE') {
            const updatedItem = {
              ...payload.new,
              rarity: payload.new.rarity as 'common' | 'rare' | 'epic' | 'legendary',
              delivery_type: payload.new.delivery_type as 'digital' | 'physical'
            } as DatabaseItem;
            
            setItems(prev => prev.map(item => 
              item.id === updatedItem.id ? updatedItem : item
            ));
            
            toast({
              title: "Item atualizado!",
              description: `${updatedItem.name} foi modificado`,
            });
          }
          
          if (payload.eventType === 'DELETE') {
            setItems(prev => prev.filter(item => item.id !== payload.old.id));
            
            toast({
              title: "Item removido!",
              description: "Um item foi removido do sistema",
              variant: "destructive"
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Atualizar item em tempo real
  const updateItemRealtime = async (id: string, updates: Partial<DatabaseItem>) => {
    try {
      const { error } = await supabase
        .from('items')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      // A atualização será refletida via realtime
      return { success: true };
    } catch (error: any) {
      console.error('Erro ao atualizar item:', error);
      toast({
        title: "Erro ao atualizar item",
        description: error.message,
        variant: "destructive"
      });
      return { success: false, error: error.message };
    }
  };

  return {
    items,
    loading,
    updateItemRealtime,
    refreshItems: fetchItems
  };
};
