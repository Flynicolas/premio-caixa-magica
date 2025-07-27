import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const TestePagamento = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentProcessed, setPaymentProcessed] = useState(false);

  const paymentId = searchParams.get('payment_id');
  const transactionId = searchParams.get('transaction_id');
  const amount = searchParams.get('amount');

  useEffect(() => {
    // Simular um pequeno delay para mostrar o carregamento
    const timer = setTimeout(() => {
      setIsProcessing(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleApprovePayment = async () => {
    if (!paymentId || !transactionId) return;

    setIsProcessing(true);
    
    try {
      // Simular webhook de aprovação
      const { error } = await supabase.functions.invoke('test-webhook-kirvano', {
        body: {
          payment_id: paymentId,
          transaction_id: transactionId,
          status: 'approved',
          amount: parseFloat(amount || '0')
        }
      });

      if (error) {
        console.error('Erro ao processar webhook:', error);
        toast.error('Erro ao processar pagamento');
        navigate('/teste-erro');
        return;
      }

      setPaymentProcessed(true);
      toast.success('Pagamento de teste aprovado!');
      
      // Redirecionar para página de sucesso após 2 segundos
      setTimeout(() => {
        navigate('/teste-sucesso');
      }, 2000);

    } catch (error) {
      console.error('Erro inesperado:', error);
      toast.error('Erro inesperado');
      navigate('/teste-erro');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectPayment = () => {
    toast.error('Pagamento cancelado');
    navigate('/teste-erro');
  };

  if (!paymentId || !transactionId || !amount) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Erro nos Parâmetros</h2>
            <p className="text-muted-foreground mb-4">
              Parâmetros de pagamento inválidos ou ausentes.
            </p>
            <Button onClick={() => navigate('/')} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8" />
          </div>
          <CardTitle className="text-2xl">Pagamento de Teste Kirvano</CardTitle>
          <Badge variant="outline" className="mx-auto">
            SIMULAÇÃO
          </Badge>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-secondary/50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valor:</span>
              <span className="font-medium">R$ {parseFloat(amount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">ID do Pagamento:</span>
              <span className="font-mono text-sm">{paymentId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Transação:</span>
              <span className="font-mono text-sm">{transactionId.slice(0, 8)}...</span>
            </div>
          </div>

          {!paymentProcessed ? (
            <div className="space-y-3">
              <p className="text-center text-muted-foreground text-sm">
                Esta é uma simulação do checkout da Kirvano. Escolha o resultado do pagamento:
              </p>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleApprovePayment}
                  disabled={isProcessing}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {isProcessing ? 'Processando...' : 'Aprovar'}
                </Button>
                
                <Button 
                  onClick={handleRejectPayment}
                  disabled={isProcessing}
                  variant="destructive"
                  className="flex-1"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-3">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
              <p className="text-green-600 font-medium">
                Pagamento aprovado! Redirecionando...
              </p>
            </div>
          )}
          
          <div className="pt-4 border-t">
            <Button 
              onClick={() => navigate('/')}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Início
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestePagamento;