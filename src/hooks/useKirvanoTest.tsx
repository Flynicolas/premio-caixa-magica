import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export const useKirvanoTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const createTestPayment = async (amount: number = 50) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return null;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('test-payment-kirvano', {
        body: {
          amount,
          description: 'Teste de pagamento Kirvano'
        }
      });

      if (error) {
        console.error('Erro ao criar pagamento de teste:', error);
        toast.error('Erro ao criar pagamento de teste');
        return null;
      }

      console.log('Pagamento de teste criado:', data);
      toast.success('Pagamento de teste criado com sucesso!');

      // Simular redirecionamento para página de pagamento
      const testPaymentUrl = `/teste-pagamento?payment_id=${data.payment_id}&transaction_id=${data.transaction_id}&amount=${amount}`;
      window.open(testPaymentUrl, '_blank');

      return data;
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast.error('Erro inesperado ao criar pagamento');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createTestPayment,
    isLoading
  };
};