import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PaymentData {
  id: string;
  qrcode: string;
  brcode: string;
  amount: number;
  expires_at: string;
  status: 'pending' | 'paid' | 'expired' | 'failed';
}

export const usePixPayment = () => {
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const createPayment = useCallback(async (amount: number) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('suitpay-request-qrcode', {
        body: {
          client_name: "Usuário Baú Premiado",
          client_document: "00000000000", // Será configurado depois com dados do usuário
          amount: amount,
          webhookUrl: "https://0ab8a7ca7a39.ngrok-free.app/webhook"
        },
        headers: {
          'HEADER_SECRET': '671e0639-f911-401d-9de6-0fd975d1ce51'
        }
      });

      if (error) {
        throw new Error(error.message || 'Erro ao gerar PIX');
      }

      if (!data?.success) {
        throw new Error(data?.message || 'Erro ao processar solicitação PIX');
      }

      const paymentData: PaymentData = {
        id: data.data.idTransaction,
        qrcode: `data:image/png;base64,${data.data.paymentCodeBase64}`,
        brcode: data.data.paymentCode,
        amount,
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutos
        status: 'pending'
      };

      setPaymentData(paymentData);
      
      return paymentData;
    } catch (error) {
      console.error('Erro ao criar pagamento PIX:', error);
      toast({
        title: "Erro ao gerar PIX",
        description: error instanceof Error ? error.message : "Tente novamente em alguns instantes",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const clearPayment = useCallback(() => {
    setPaymentData(null);
  }, []);

  return {
    paymentData,
    createPayment,
    clearPayment,
    isLoading
  };
};