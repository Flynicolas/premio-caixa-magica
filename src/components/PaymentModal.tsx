
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { CreditCard, X } from 'lucide-react';
import { useState } from 'react';
import { useMercadoPago } from '@/hooks/useMercadoPago';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredAmount?: number;
  title?: string;
  description?: string;
}

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  requiredAmount,
  title = "Adicionar Saldo",
  description = "Escolha o valor para adicionar à sua carteira"
}: PaymentModalProps) => {
  const [amount, setAmount] = useState(requiredAmount?.toString() || '');
  const { processPayment, loading } = useMercadoPago();

  const quickAmounts = [10, 25, 50, 100, 200, 500];

  const handlePayment = async () => {
    const paymentAmount = parseFloat(amount);
    if (paymentAmount > 0) {
      const result = await processPayment(paymentAmount);
      if (result) {
        onClose();
      }
    }
  };

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-card border-primary/20">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center text-xl text-primary">
              <CreditCard className="w-5 h-5 mr-2" />
              {title}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              {description}
            </p>
            
            {requiredAmount && (
              <Card className="p-4 bg-red-500/10 border-red-500/20 mb-4">
                <p className="text-sm text-red-400">
                  Valor mínimo necessário: <span className="font-bold">R$ {requiredAmount.toFixed(2)}</span>
                </p>
              </Card>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Valor a adicionar</label>
              <Input
                type="number"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-center text-lg font-bold bg-secondary border-primary/20 focus:border-primary"
                min="1"
                step="0.01"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              {quickAmounts.map(quickAmount => (
                <Button
                  key={quickAmount}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAmount(quickAmount)}
                  className="border-primary/20 hover:border-primary hover:bg-primary/10"
                >
                  R$ {quickAmount}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handlePayment}
              disabled={!amount || parseFloat(amount) <= 0 || loading}
              className="w-full gold-gradient text-black font-bold hover:opacity-90 h-12"
            >
              {loading ? (
                "Processando..."
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pagar com Mercado Pago - R$ {parseFloat(amount || '0').toFixed(2)}
                </>
              )}
            </Button>

            <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
              <span>💳 PIX</span>
              <span>💳 Cartão</span>
              <span>💳 Boleto</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
