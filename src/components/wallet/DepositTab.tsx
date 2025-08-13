import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { usePixPayment } from '@/hooks/usePixPayment';
import { QRCodeDisplay } from './QRCodeDisplay';
import { PaymentInstructions } from './PaymentInstructions';
import { Plus, CreditCard, Loader2 } from 'lucide-react';

export const DepositTab = () => {
  const [amount, setAmount] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { paymentData, createPayment, isLoading: pixLoading } = usePixPayment();

  const quickAmounts = [10, 25, 50, 100, 200, 500];
  const minAmount = 5;
  const maxAmount = 10000;

  const handleAmountChange = (value: string) => {
    // Remove caracteres não numéricos
    const numericValue = value.replace(/\D/g, '');
    setAmount(numericValue);
  };

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
  };

  const validateAmount = () => {
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount)) {
      toast({
        title: "Valor inválido",
        description: "Por favor, digite um valor válido",
        variant: "destructive"
      });
      return false;
    }
    
    if (numAmount < minAmount) {
      toast({
        title: "Valor muito baixo",
        description: `O valor mínimo é R$ ${minAmount}`,
        variant: "destructive"
      });
      return false;
    }
    
    if (numAmount > maxAmount) {
      toast({
        title: "Valor muito alto",
        description: `O valor máximo é R$ ${maxAmount}`,
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };

  const handleGeneratePix = async () => {
    if (!validateAmount()) return;
    
    setIsGenerating(true);
    try {
      await createPayment(parseFloat(amount));
      toast({
        title: "PIX gerado com sucesso",
        description: "Escaneie o QR Code ou use o código PIX para pagar",
      });
    } catch (error) {
      toast({
        title: "Erro ao gerar PIX",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (paymentData) {
    return (
      <div className="space-y-6">
        <PaymentInstructions amount={parseFloat(amount)} />
        <QRCodeDisplay 
          qrCode={paymentData.qrcode}
          pixCode={paymentData.brcode}
          amount={parseFloat(amount)}
          paymentId={paymentData.id}
          expiresAt={paymentData.expires_at}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Adicionar Saldo</h3>
        <p className="text-muted-foreground">Recarregue sua carteira via PIX de forma rápida e segura</p>
      </div>

      <Card className="p-6 bg-secondary/20 border-primary/20">
        <div className="space-y-4">
          <div>
            <Label htmlFor="amount" className="text-base font-medium">
              Valor do Depósito
            </Label>
            <div className="mt-2">
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  R$
                </span>
                <Input
                  id="amount"
                  type="text"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="0,00"
                  className="pl-10 text-lg h-12 border-primary/30"
                />
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Mín: R$ {minAmount} | Máx: R$ {maxAmount.toLocaleString()}
              </p>
            </div>
          </div>

          <div>
            <Label className="text-base font-medium mb-3 block">
              Valores Rápidos
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {quickAmounts.map((value) => (
                <Button
                  key={value}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAmount(value)}
                  className="border-primary/30 hover:border-primary hover:bg-primary/10"
                >
                  R$ {value}
                </Button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleGeneratePix}
            disabled={!amount || isGenerating || pixLoading}
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
          >
            {isGenerating || pixLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Gerando PIX...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Gerar PIX
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};