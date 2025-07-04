
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

interface PaymentPreference {
  preference_id: string;
  transaction_id: string;
  init_point: string;
  sandbox_init_point: string;
}

export const useMercadoPago = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const createPayment = async (amount: number, description?: string): Promise<PaymentPreference | null> => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não logado.",
        variant: "destructive"
      });
      return null;
    }

    if (amount <= 0) {
      toast({
        title: "Erro",
        description: "Valor inválido para pagamento.",
        variant: "destructive"
      });
      return null;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          amount,
          description: description || 'Adicionar Saldo'
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Link de pagamento criado!",
        description: "Você será redirecionado para o Mercado Pago.",
        variant: "default"
      });

      return data as PaymentPreference;
    } catch (error: any) {
      console.error('Erro ao criar pagamento:', error);
      toast({
        title: "Erro ao criar pagamento",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const redirectToPayment = (paymentData: PaymentPreference) => {
    // Em produção, usar init_point. Em desenvolvimento, pode usar sandbox_init_point
    const paymentUrl = paymentData.init_point || paymentData.sandbox_init_point;
    
    if (paymentUrl) {
      window.open(paymentUrl, '_blank');
    } else {
      toast({
        title: "Erro",
        description: "URL de pagamento não encontrada.",
        variant: "destructive"
      });
    }
  };

  const processPayment = async (amount: number, description?: string) => {
    const paymentData = await createPayment(amount, description);
    if (paymentData) {
      redirectToPayment(paymentData);
      return paymentData;
    }
    return null;
  };

  return {
    createPayment,
    redirectToPayment,
    processPayment,
    loading
  };
};
