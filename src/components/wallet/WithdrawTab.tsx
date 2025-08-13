import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/hooks/useWalletProvider';
import { usePixWithdraw } from '@/hooks/usePixWithdraw';
import { PixKeyForm } from './PixKeyForm';
import { WithdrawConfirmation } from './WithdrawConfirmation';
import { Download, AlertCircle, Loader2 } from 'lucide-react';

type WithdrawStep = 'form' | 'confirmation' | 'processing';

export const WithdrawTab = () => {
  const [step, setStep] = useState<WithdrawStep>('form');
  const [amount, setAmount] = useState('');
  const [pixKeyType, setPixKeyType] = useState<string>('');
  const [pixKey, setPixKey] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const { toast } = useToast();
  const { walletData } = useWallet();
  const { createWithdraw, isLoading } = usePixWithdraw();

  const balance = walletData?.balance || 0;
  const withdrawFee = 2.5; // Taxa fixa de R$ 2,50
  const minWithdraw = 10;
  const maxWithdraw = Math.min(balance - withdrawFee, 5000); // Limite de R$ 5.000 ou saldo disponível

  const handleAmountChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    setAmount(numericValue);
  };

  const validateForm = () => {
    const numAmount = parseFloat(amount);
    
    if (!amount || isNaN(numAmount)) {
      toast({
        title: "Valor inválido",
        description: "Por favor, digite um valor válido",
        variant: "destructive"
      });
      return false;
    }

    if (numAmount < minWithdraw) {
      toast({
        title: "Valor muito baixo",
        description: `O valor mínimo para saque é R$ ${minWithdraw}`,
        variant: "destructive"
      });
      return false;
    }

    if (numAmount + withdrawFee > balance) {
      toast({
        title: "Saldo insuficiente",
        description: `Você precisa de R$ ${(numAmount + withdrawFee).toFixed(2)} (incluindo taxa)`,
        variant: "destructive"
      });
      return false;
    }

    if (!pixKeyType || !pixKey) {
      toast({
        title: "Chave PIX obrigatória",
        description: "Por favor, selecione o tipo e digite sua chave PIX",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleContinue = () => {
    if (!validateForm()) return;
    setStep('confirmation');
  };

  const handleConfirmWithdraw = async () => {
    setIsProcessing(true);
    try {
      await createWithdraw({
        amount: parseFloat(amount),
        pixKey,
        pixKeyType
      });
      
      toast({
        title: "Saque solicitado",
        description: "Seu saque será processado em até 24 horas",
      });
      
      // Reset form
      setAmount('');
      setPixKey('');
      setPixKeyType('');
      setStep('form');
    } catch (error) {
      toast({
        title: "Erro ao processar saque",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (step === 'confirmation') {
    return (
      <WithdrawConfirmation
        amount={parseFloat(amount)}
        pixKey={pixKey}
        pixKeyType={pixKeyType}
        fee={withdrawFee}
        onConfirm={handleConfirmWithdraw}
        onBack={() => setStep('form')}
        isLoading={isProcessing}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-red-400 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Download className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Sacar Saldo</h3>
        <p className="text-muted-foreground">Transfira seu saldo para sua conta via PIX</p>
      </div>

      {/* Saldo Disponível */}
      <Card className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Saldo Disponível</p>
          <p className="text-2xl font-bold text-primary">
            {balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
      </Card>

      {/* Formulário */}
      <Card className="p-6 bg-secondary/20 border-primary/20">
        <div className="space-y-4">
          {/* Chave PIX */}
          <PixKeyForm
            pixKeyType={pixKeyType}
            pixKey={pixKey}
            onPixKeyTypeChange={setPixKeyType}
            onPixKeyChange={setPixKey}
          />

          {/* Valor */}
          <div>
            <Label htmlFor="withdraw-amount" className="text-base font-medium">
              Valor do Saque
            </Label>
            <div className="mt-2">
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  R$
                </span>
                <Input
                  id="withdraw-amount"
                  type="text"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="0,00"
                  className="pl-10 text-lg h-12 border-primary/30"
                />
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Mín: R$ {minWithdraw} | Máx: R$ {maxWithdraw.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Resumo de Taxas */}
          {amount && parseFloat(amount) >= minWithdraw && (
            <Card className="p-4 bg-orange-500/10 border-orange-500/30">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Valor solicitado:</span>
                  <span>R$ {parseFloat(amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Taxa de saque:</span>
                  <span>R$ {withdrawFee.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Valor líquido:</span>
                  <span>R$ {(parseFloat(amount) - withdrawFee).toFixed(2)}</span>
                </div>
              </div>
            </Card>
          )}

          {/* Avisos */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p className="font-medium mb-1">Informações importantes:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Saques são processados em até 24 horas</li>
                  <li>Taxa fixa de R$ {withdrawFee.toFixed(2)} por saque</li>
                  <li>Verifique se sua chave PIX está correta</li>
                  <li>Não é possível cancelar após confirmação</li>
                </ul>
              </div>
            </div>
          </div>

          <Button
            onClick={handleContinue}
            disabled={!amount || !pixKey || !pixKeyType || isLoading}
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Continuar
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};