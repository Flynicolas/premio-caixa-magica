import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
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
  const { user } = useAuth();
  const { profile } = useProfile();

  const createPayment = useCallback(async (amount: number) => {
    if (!user || !profile) {
      toast({
        title: "Erro de autenticação",
        description: "É necessário estar logado para gerar PIX",
        variant: "destructive"
      });
      return;
    }

    if (!profile.full_name || !profile.cpf) {
      toast({
        title: "Perfil incompleto",
        description: "Complete seu nome e CPF no perfil para gerar PIX",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('suitpay-request-qrcode', {
        body: {
          client_name: profile.full_name,
          client_document: profile.cpf.replace(/\D/g, ''), // Remove caracteres especiais do CPF
          amount: amount,
          webhookUrl: `${window.location.origin}/api/pix-webhook`
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
  }, [toast, user, profile]);

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