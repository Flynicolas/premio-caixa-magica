import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Copy, QrCode, CheckCircle, Clock, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

interface PixTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProcess: () => void;
  pixData: any;
}

const PixTestModal = ({ isOpen, onClose, onProcess, pixData }: PixTestModalProps) => {
  const [countdown, setCountdown] = useState(8);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!isOpen || !pixData) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoProcess();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, pixData]);

  const handleAutoProcess = async () => {
    setIsProcessing(true);
    await onProcess();
    setIsProcessing(false);
  };

  const copyPixCode = () => {
    navigator.clipboard.writeText(pixData.pixCode);
    toast.success('Código PIX copiado!');
  };

  if (!pixData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 justify-center">
            <QrCode className="w-6 h-6 text-blue-600" />
            <DialogTitle className="text-xl">PIX Teste Kirvano</DialogTitle>
          </div>
          <DialogDescription className="text-center">
            <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
              SIMULAÇÃO - VALOR: R$ {pixData.amount?.toFixed(2)}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* QR Code Simulado */}
          <Card>
            <CardContent className="p-4 text-center">
              <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 mb-3">
                <img 
                  src={pixData.qrCode} 
                  alt="QR Code PIX Teste" 
                  className="w-32 h-32 mx-auto"
                />
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Escaneie o QR Code ou copie o código PIX
              </p>
              <Button 
                onClick={copyPixCode}
                variant="outline" 
                size="sm"
                className="w-full"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copiar Código PIX
              </Button>
            </CardContent>
          </Card>

          {/* Status e Countdown */}
          <div className="text-center space-y-2">
            {countdown > 0 && !isProcessing ? (
              <div className="flex items-center justify-center gap-2 text-blue-600">
                <Clock className="w-4 h-4" />
                <span className="font-medium">
                  Processamento automático em {countdown}s
                </span>
              </div>
            ) : isProcessing ? (
              <div className="flex items-center justify-center gap-2 text-green-600">
                <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                <span className="font-medium">Processando pagamento...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="font-medium">Pagamento processado!</span>
              </div>
            )}
          </div>

          {/* Detalhes do Pagamento */}
          <div className="bg-gray-50 p-3 rounded-lg space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">ID Transação:</span>
              <span className="font-mono">{pixData.transaction_id?.slice(0, 8)}...</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valor:</span>
              <span className="font-medium">R$ {pixData.amount?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Destino:</span>
              <span>Saldo de Teste</span>
            </div>
          </div>

          {/* Ações */}
          <div className="flex gap-2">
            <Button 
              onClick={handleAutoProcess}
              disabled={isProcessing || countdown === 0}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              {isProcessing ? 'Processando...' : 'Pagar Agora'}
            </Button>
            <Button 
              onClick={onClose}
              variant="outline"
              disabled={isProcessing}
            >
              Cancelar
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            ⚠️ Esta é uma simulação de PIX para testes. Nenhum valor real será cobrado.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PixTestModal;