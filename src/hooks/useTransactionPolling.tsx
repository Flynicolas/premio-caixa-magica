import { useState, useEffect, useCallback } from 'react';

type TransactionStatus = 'pending' | 'processing' | 'paid' | 'expired' | 'failed';

export const useTransactionPolling = (paymentId: string | null, intervalMs: number = 5000) => {
  const [status, setStatus] = useState<TransactionStatus>('pending');
  const [isPolling, setIsPolling] = useState(false);

  const checkStatus = useCallback(async (id: string) => {
    try {
      // Placeholder para polling de status
      // GET /fbank/pix/charge/:id
      const response = await fetch(`/api/fbank/pix/charge/${id}`);
      
      if (!response.ok) {
        throw new Error('Erro ao verificar status');
      }

      const data = await response.json();
      
      // Simular mudança de status para demonstração
      // Em produção, isso viria da API real
      const mockStatuses: TransactionStatus[] = ['pending', 'processing', 'paid'];
      const randomStatus = mockStatuses[Math.floor(Math.random() * mockStatuses.length)];
      
      setStatus(data.status || randomStatus);
      
      return data.status || randomStatus;
    } catch (error) {
      console.error('Erro ao verificar status do pagamento:', error);
      return 'pending';
    }
  }, []);

  useEffect(() => {
    if (!paymentId) {
      setIsPolling(false);
      return;
    }

    setIsPolling(true);
    
    // Verificação inicial
    checkStatus(paymentId);

    // Configurar polling
    const interval = setInterval(() => {
      checkStatus(paymentId).then((newStatus) => {
        // Parar polling se status final for atingido
        if (newStatus === 'paid' || newStatus === 'expired' || newStatus === 'failed') {
          setIsPolling(false);
          clearInterval(interval);
        }
      });
    }, intervalMs);

    return () => {
      clearInterval(interval);
      setIsPolling(false);
    };
  }, [paymentId, intervalMs, checkStatus]);

  return {
    status,
    isPolling,
    checkStatus: () => paymentId ? checkStatus(paymentId) : Promise.resolve('pending')
  };
};