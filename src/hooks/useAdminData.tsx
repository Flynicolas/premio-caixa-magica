
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';
import { DatabaseItem } from '@/types/database';

export const useAdminData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [items, setItems] = useState<DatabaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Verificar se o usuário é admin
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
      return adminStatus;
    } catch (error) {
      console.error('Erro ao verificar status admin:', error);
      return false;
    }
  };

  // Buscar todos os itens (ativos e inativos para admin)
  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type cast para garantir que os tipos correspondam à interface
      const typedData = (data || []).map(item => ({
        ...item,
        rarity: item.rarity as 'common' | 'rare' | 'epic' | 'legendary'
      }));
      
      setItems(typedData);
    } catch (error: any) {
      console.error('Erro ao buscar itens:', error);
      toast({
        title: "Erro ao carregar itens",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Inicializar dados
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

    const channel = supabase
      .channel('admin-data-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'items' },
        () => fetchItems()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  return {
    items,
    loading,
    isAdmin,
    refreshItems: fetchItems,
    refreshData: () => Promise.all([fetchItems()])
  };
};
