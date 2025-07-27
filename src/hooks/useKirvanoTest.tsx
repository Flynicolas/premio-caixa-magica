import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export const useKirvanoTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPixModal, setShowPixModal] = useState(false);
  const [pixData, setPixData] = useState<any>(null);
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
          description: 'Teste de pagamento Kirvano - PIX'
        }
      });

      if (error) {
        console.error('Erro ao criar pagamento de teste:', error);
        toast.error('Erro ao criar pagamento de teste');
        return null;
      }

      console.log('Pagamento de teste criado:', data);
      
      // Usar dados reais da Kirvano
      const kirvanoData = data.kirvano_response;
      
      setPixData({
        ...data,
        amount,
        pixCode: kirvanoData.payment.qrcode,
        qrCodeImage: kirvanoData.payment.qrcode_image,
        kirvanoData: kirvanoData,
        expiresAt: kirvanoData.payment.expires_at
      });
      
      setShowPixModal(true);
      toast.success('PIX de teste gerado!');

      return data;
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast.error('Erro inesperado ao criar pagamento');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const processTestPayment = async () => {
    if (!pixData) return;

    try {
      // Simular processamento do PIX
      const { error } = await supabase.functions.invoke('test-webhook-kirvano', {
        body: {
          payment_id: pixData.payment_id,
          transaction_id: pixData.transaction_id,
          status: 'approved',
          amount: pixData.amount
        }
      });

      if (error) {
        console.error('Erro ao processar webhook:', error);
        toast.error('Erro ao processar pagamento');
        return;
      }

      toast.success('Pagamento PIX processado com sucesso!');
      setShowPixModal(false);
      setPixData(null);

      // Recarregar dados da carteira
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      toast.error('Erro ao processar pagamento');
    }
  };

  return {
    createTestPayment,
    processTestPayment,
    isLoading,
    showPixModal,
    setShowPixModal,
    pixData
  };
};