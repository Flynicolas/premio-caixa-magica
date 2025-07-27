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
      
      // Mostrar modal do PIX simulado
      setPixData({
        ...data,
        amount,
        pixCode: `00020126360014BR.GOV.BCB.PIX0114+5511999999999520400005303986540${amount.toFixed(2)}5802BR5925KIRVANO TESTE PAGAMENTO6009SAO PAULO62290525TESTE${data.transaction_id.slice(0, 8)}6304`,
        qrCode: `data:image/svg+xml,${encodeURIComponent(`
          <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
            <rect width="200" height="200" fill="white"/>
            <rect x="20" y="20" width="20" height="20" fill="black"/>
            <rect x="60" y="20" width="20" height="20" fill="black"/>
            <rect x="100" y="20" width="20" height="20" fill="black"/>
            <rect x="140" y="20" width="20" height="20" fill="black"/>
            <rect x="20" y="60" width="20" height="20" fill="black"/>
            <rect x="100" y="60" width="20" height="20" fill="black"/>
            <rect x="160" y="60" width="20" height="20" fill="black"/>
            <rect x="40" y="100" width="20" height="20" fill="black"/>
            <rect x="80" y="100" width="20" height="20" fill="black"/>
            <rect x="120" y="100" width="20" height="20" fill="black"/>
            <rect x="160" y="100" width="20" height="20" fill="black"/>
            <rect x="60" y="140" width="20" height="20" fill="black"/>
            <rect x="100" y="140" width="20" height="20" fill="black"/>
            <rect x="140" y="140" width="20" height="20" fill="black"/>
            <rect x="20" y="180" width="20" height="20" fill="black"/>
            <rect x="80" y="180" width="20" height="20" fill="black"/>
            <rect x="160" y="180" width="20" height="20" fill="black"/>
            <text x="100" y="195" text-anchor="middle" font-size="8" fill="black">PIX TESTE</text>
          </svg>
        `)}`
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