import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

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
      // Placeholder para integração FBank
      // POST /fbank/pix/charge
      const response = await fetch('/api/fbank/pix/charge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'fbank',
          amount: amount * 100, // Converter para centavos
          description: `Depósito de R$ ${amount.toFixed(2)}`
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao gerar PIX');
      }

      // Simular resposta por enquanto
      const mockPaymentData: PaymentData = {
        id: `pix_${Date.now()}`,
        qrcode: `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
          <rect width="200" height="200" fill="white"/>
          <rect x="50" y="50" width="100" height="100" fill="black"/>
          <text x="100" y="120" text-anchor="middle" fill="white" font-size="12">QR Code</text>
          <text x="100" y="135" text-anchor="middle" fill="white" font-size="8">R$ ${amount.toFixed(2)}</text>
        </svg>`,
        brcode: `00020126360014BR.GOV.BCB.PIX0114+55119999999995204000053039865802BR5925Empresa Exemplo Ltda6009SAO PAULO61080540900062070503***6304${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
        amount,
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutos
        status: 'pending'
      };

      setPaymentData(mockPaymentData);
      
      return mockPaymentData;
    } catch (error) {
      console.error('Erro ao criar pagamento PIX:', error);
      toast({
        title: "Erro ao gerar PIX",
        description: "Tente novamente em alguns instantes",
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