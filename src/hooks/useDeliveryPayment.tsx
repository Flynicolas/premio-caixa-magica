import { useState } from 'react';
import { useAuth } from './useAuth';
import { useProfile } from './useProfile';
import { useToast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';

interface DeliveryPaymentData {
  id: string;
  qrcode: string;
  brcode: string;
  amount: number;
  expires_at: string;
  status: 'pending' | 'paid' | 'expired' | 'failed';
  withdrawalId: string;
}

export const useDeliveryPayment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { profile } = useProfile();

  const createDeliveryPayment = async (
    amount: number,
    withdrawalId: string,
    description: string
  ): Promise<DeliveryPaymentData | null> => {
    if (!user || !profile) {
      toast({
        title: "Erro de autenticação",
        description: "É necessário estar logado para gerar PIX",
        variant: "destructive"
      });
      return null;
    }

    if (!profile.full_name || !profile.cpf) {
      toast({
        title: "Perfil incompleto",
        description: "Complete seu nome e CPF no perfil para gerar PIX",
        variant: "destructive"
      });
      return null;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('suitpay-request-qrcode', {
        body: {
          client_name: profile.full_name,
          client_document: profile.cpf.replace(/\D/g, ''), // Remove caracteres especiais do CPF
          amount: amount,
          webhookUrl: 'https://jhbafgzfphiizpuoqksj.supabase.co/functions/v1/suitpay-webhook'
        }
      });

      if (error) {
        throw new Error(error.message || 'Erro ao gerar PIX');
      }

      if (!data?.success) {
        throw new Error(data?.message || 'Erro ao processar solicitação PIX');
      }

      const paymentData: DeliveryPaymentData = {
        id: data.data.idTransaction,
        qrcode: `data:image/png;base64,${data.data.paymentCodeBase64}`,
        brcode: data.data.paymentCode,
        amount,
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutos
        status: 'pending',
        withdrawalId
      };

      toast({
        title: "PIX gerado!",
        description: "Escaneie o código QR ou copie o código PIX para pagar a taxa de entrega.",
        variant: "default"
      });
      
      return paymentData;
    } catch (error) {
      console.error('Erro ao criar pagamento PIX para taxa de entrega:', error);
      toast({
        title: "Erro ao gerar PIX",
        description: error instanceof Error ? error.message : "Tente novamente em alguns instantes",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createDeliveryPayment,
    isLoading
  };
};