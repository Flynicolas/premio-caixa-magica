
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DatabaseItem } from '@/types/database';

export const useItemOperations = (
  items: DatabaseItem[],
  setItems: React.Dispatch<React.SetStateAction<DatabaseItem[]>>,
  calculateStats: (items: DatabaseItem[]) => void
) => {
  const { toast } = useToast();

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

  return {
    updateItem,
    createItem,
    deleteItem
  };
};
