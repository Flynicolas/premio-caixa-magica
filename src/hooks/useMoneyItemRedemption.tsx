import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface RedemptionResult {
  success: boolean;
  message: string;
  requires_approval?: boolean;
  redemption_id?: string;
}

export const useMoneyItemRedemption = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const redeemMoneyItem = async (
    itemId: string,
    inventoryId: string,
    redemptionAmount: number
  ): Promise<RedemptionResult> => {
    if (!user) {
      return { success: false, message: 'Usuário não autenticado' };
    }

    setLoading(true);
    try {
      // Usar a função do banco para processar o resgate
      const { data, error } = await supabase.rpc('process_money_item_redemption', {
        p_user_id: user.id,
        p_item_id: itemId,
        p_inventory_id: inventoryId,
        p_redemption_amount: redemptionAmount
      });

      if (error) {
        console.error('Erro ao processar resgate:', error);
        return { success: false, message: error.message };
      }

      const result = data?.[0];
      if (!result) {
        return { success: false, message: 'Resposta inválida do servidor' };
      }

      if (result.status === 'error') {
        return { success: false, message: result.message };
      }

      if (result.status === 'pending_approval') {
        toast({
          title: "Resgate em análise",
          description: "Seu resgate será analisado pela equipe e processado em breve.",
          variant: "default"
        });
        
        return { 
          success: true, 
          message: result.message,
          requires_approval: true,
          redemption_id: result.redemption_id
        };
      }

      if (result.status === 'completed') {
        toast({
          title: "Resgate realizado!",
          description: `R$ ${redemptionAmount.toFixed(2)} foi adicionado à sua carteira.`,
          variant: "default"
        });
        
        return { 
          success: true, 
          message: result.message,
          requires_approval: false,
          redemption_id: result.redemption_id
        };
      }

      return { success: false, message: 'Status de resgate desconhecido' };
    } catch (error) {
      console.error('Erro inesperado ao resgatar item:', error);
      return { success: false, message: 'Erro inesperado. Tente novamente.' };
    } finally {
      setLoading(false);
    }
  };

  const validateMoneyItemRedemption = async (
    itemId: string,
    redemptionAmount: number
  ) => {
    if (!user) {
      return { is_valid: false, error_message: 'Usuário não autenticado' };
    }

    try {
      const { data, error } = await supabase.rpc('validate_money_item_redemption', {
        p_user_id: user.id,
        p_item_id: itemId,
        p_redemption_amount: redemptionAmount
      });

      if (error) {
        console.error('Erro ao validar resgate:', error);
        return { is_valid: false, error_message: error.message };
      }

      return data?.[0] || { is_valid: false, error_message: 'Resposta inválida' };
    } catch (error) {
      console.error('Erro inesperado ao validar resgate:', error);
      return { is_valid: false, error_message: 'Erro inesperado. Tente novamente.' };
    }
  };

  return {
    redeemMoneyItem,
    validateMoneyItemRedemption,
    loading
  };
};