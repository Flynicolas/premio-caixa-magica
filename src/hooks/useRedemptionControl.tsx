import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ItemRedemptionStatus {
  canRedeem: boolean;
  isRedeemed: boolean;
  isPending: boolean;
  pendingSince?: Date;
  timeRemaining?: number; // em horas
}

export const useRedemptionControl = () => {
  const { user } = useAuth();
  const [redemptionCache, setRedemptionCache] = useState<Record<string, ItemRedemptionStatus>>({});

  // Verificar status de resgate de um item específico
  const checkItemRedemptionStatus = async (inventoryId: string): Promise<ItemRedemptionStatus> => {
    if (!user) {
      return { canRedeem: false, isRedeemed: false, isPending: false };
    }

    try {
      // Verificar se o item já foi resgatado no inventário
      const { data: inventoryItem, error: inventoryError } = await supabase
        .from('user_inventory')
        .select('is_redeemed')
        .eq('id', inventoryId)
        .eq('user_id', user.id)
        .single();

      if (inventoryError || !inventoryItem) {
        return { canRedeem: false, isRedeemed: false, isPending: false };
      }

      // Se já foi resgatado, não pode resgatar novamente
      if (inventoryItem.is_redeemed) {
        return { canRedeem: false, isRedeemed: true, isPending: false };
      }

      // Verificar se há algum pedido de retirada pendente nas últimas 24h
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

      const { data: withdrawals, error: withdrawalError } = await supabase
        .from('item_withdrawals')
        .select('created_at, payment_status')
        .eq('inventory_id', inventoryId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (withdrawalError) {
        console.error('Erro ao verificar retiradas:', withdrawalError);
        return { canRedeem: true, isRedeemed: false, isPending: false };
      }

      // Verificar se há pedido pendente recente
      const recentPendingWithdrawal = withdrawals?.find(w => 
        w.payment_status === 'pending' && 
        new Date(w.created_at) > twentyFourHoursAgo
      );

      if (recentPendingWithdrawal) {
        const pendingSince = new Date(recentPendingWithdrawal.created_at);
        const hoursElapsed = (Date.now() - pendingSince.getTime()) / (1000 * 60 * 60);
        const timeRemaining = Math.max(0, 24 - hoursElapsed);

        return {
          canRedeem: false,
          isRedeemed: false,
          isPending: true,
          pendingSince,
          timeRemaining
        };
      }

      // Se não há restrições, pode resgatar
      return { canRedeem: true, isRedeemed: false, isPending: false };

    } catch (error) {
      console.error('Erro ao verificar status de resgate:', error);
      return { canRedeem: true, isRedeemed: false, isPending: false };
    }
  };

  // Limpar pedidos expirados (mais de 24h pendentes)
  const cleanupExpiredWithdrawals = async () => {
    if (!user) return;

    try {
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

      // Buscar retiradas pendentes há mais de 24h
      const { data: expiredWithdrawals, error: fetchError } = await supabase
        .from('item_withdrawals')
        .select('id, inventory_id')
        .eq('user_id', user.id)
        .eq('payment_status', 'pending')
        .lt('created_at', twentyFourHoursAgo.toISOString());

      if (fetchError) {
        console.error('Erro ao buscar retiradas expiradas:', fetchError);
        return;
      }

      if (expiredWithdrawals && expiredWithdrawals.length > 0) {
        // Deletar retiradas expiradas
        const { error: deleteError } = await supabase
          .from('item_withdrawals')
          .delete()
          .in('id', expiredWithdrawals.map(w => w.id));

        if (deleteError) {
          console.error('Erro ao deletar retiradas expiradas:', deleteError);
        } else {
          console.log(`${expiredWithdrawals.length} retiradas expiradas foram removidas`);
          
          // Atualizar cache para os itens que foram liberados
          const updatedCache = { ...redemptionCache };
          expiredWithdrawals.forEach(w => {
            if (updatedCache[w.inventory_id]) {
              updatedCache[w.inventory_id] = {
                canRedeem: true,
                isRedeemed: false,
                isPending: false
              };
            }
          });
          setRedemptionCache(updatedCache);
        }
      }
    } catch (error) {
      console.error('Erro no cleanup de retiradas expiradas:', error);
    }
  };

  // Atualizar cache de um item específico
  const updateItemStatus = async (inventoryId: string) => {
    const status = await checkItemRedemptionStatus(inventoryId);
    setRedemptionCache(prev => ({
      ...prev,
      [inventoryId]: status
    }));
    return status;
  };

  // Executar cleanup periódico
  useEffect(() => {
    if (user) {
      cleanupExpiredWithdrawals();
      
      // Executar cleanup a cada 5 minutos
      const interval = setInterval(cleanupExpiredWithdrawals, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [user]);

  return {
    checkItemRedemptionStatus,
    updateItemStatus,
    cleanupExpiredWithdrawals,
    redemptionCache
  };
};