import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';

interface WithdrawData {
  amount: number;
  pixKey: string;
  pixKeyType: string;
}

interface WithdrawResponse {
  id: string;
  status: 'requested' | 'processing' | 'completed' | 'failed';
  estimated_completion: string;
}

export const usePixWithdraw = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastWithdraw, setLastWithdraw] = useState<WithdrawResponse | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { profile } = useProfile();

  const createWithdraw = useCallback(async (data: WithdrawData) => {
    if (!user || !profile) {
      toast({
        title: "Erro de autenticação",
        description: "É necessário estar logado para realizar saques",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Determinar a chave PIX baseada no tipo
      let pixKey = data.pixKey;
      if (data.pixKeyType === 'document' && profile.cpf) {
        pixKey = profile.cpf.replace(/\D/g, ''); // Remove caracteres especiais do CPF
      }

      const externalId = `withdraw_${user.id}_${Date.now()}`;

      const { data: response, error } = await supabase.functions.invoke('suitpay-withdrawal', {
        body: {
          value: data.amount,
          key: pixKey,
          typeKey: data.pixKeyType,
          externalId: externalId
        }
      });

      if (error) {
        throw new Error(error.message || 'Erro ao processar saque');
      }

      if (!response?.success) {
        throw new Error(response?.message || 'Erro ao processar solicitação de saque');
      }

      const withdrawResponse: WithdrawResponse = {
        id: response.data?.id || externalId,
        status: 'requested',
        estimated_completion: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas
      };

      setLastWithdraw(withdrawResponse);
      
      return withdrawResponse;
    } catch (error) {
      console.error('Erro ao criar saque:', error);
      toast({
        title: "Erro ao processar saque",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast, user, profile]);

  const checkWithdrawStatus = useCallback(async (withdrawId: string) => {
    try {
      // Placeholder para polling
      // GET /fbank/payouts/:id
      const response = await fetch(`/api/fbank/payouts/${withdrawId}`);
      
      if (!response.ok) {
        throw new Error('Erro ao verificar status');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao verificar status do saque:', error);
      return null;
    }
  }, []);

  return {
    createWithdraw,
    checkWithdrawStatus,
    lastWithdraw,
    isLoading
  };
};