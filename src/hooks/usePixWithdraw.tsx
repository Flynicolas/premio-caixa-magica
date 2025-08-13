import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

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

  const createWithdraw = useCallback(async (data: WithdrawData) => {
    setIsLoading(true);
    try {
      // Placeholder para integração FBank
      // POST /fbank/payouts
      const response = await fetch('/api/fbank/payouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount_cents: data.amount * 100, // Converter para centavos
          pix_key: data.pixKey,
          pix_key_type: data.pixKeyType,
          description: `Saque PIX de R$ ${data.amount.toFixed(2)}`
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao processar saque');
      }

      // Simular resposta por enquanto
      const mockWithdrawResponse: WithdrawResponse = {
        id: `withdraw_${Date.now()}`,
        status: 'requested',
        estimated_completion: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas
      };

      setLastWithdraw(mockWithdrawResponse);
      
      return mockWithdrawResponse;
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
  }, [toast]);

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