import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Shield, Clock, Loader2 } from 'lucide-react';

interface WithdrawConfirmationProps {
  amount: number;
  pixKey: string;
  pixKeyType: string;
  fee: number;
  onConfirm: () => void;
  onBack: () => void;
  isLoading: boolean;
}

export const WithdrawConfirmation = ({
  amount,
  pixKey,
  pixKeyType,
  fee,
  onConfirm,
  onBack,
  isLoading
}: WithdrawConfirmationProps) => {
  
  const getPixKeyTypeLabel = (type: string) => {
    switch (type) {
      case 'cpf': return 'CPF';
      case 'cnpj': return 'CNPJ';
      case 'email': return 'E-mail';
      case 'telefone': return 'Telefone';
      case 'aleatoria': return 'Chave Aleatória';
      default: return type;
    }
  };

  const netAmount = amount - fee;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Confirmar Saque</h3>
        <p className="text-muted-foreground">Revise os dados antes de confirmar</p>
      </div>

      {/* Resumo do Saque */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <h4 className="font-semibold text-lg mb-4 text-center">Resumo do Saque</h4>
        
        <div className="space-y-4">
          {/* Chave PIX */}
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-muted-foreground">Chave PIX ({getPixKeyTypeLabel(pixKeyType)})</p>
              <p className="font-medium break-all">{pixKey}</p>
            </div>
          </div>

          <div className="border-t pt-4 space-y-3">
            {/* Valor solicitado */}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valor solicitado:</span>
              <span className="font-medium">R$ {amount.toFixed(2)}</span>
            </div>

            {/* Taxa */}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Taxa de saque:</span>
              <span className="font-medium text-orange-600">- R$ {fee.toFixed(2)}</span>
            </div>

            {/* Valor líquido */}
            <div className="flex justify-between text-lg font-bold border-t pt-3">
              <span>Valor a receber:</span>
              <span className="text-green-600">R$ {netAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Informações importantes */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Informações Importantes:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• O saque será processado em até 24 horas úteis</li>
              <li>• Verifique se a chave PIX está correta</li>
              <li>• Não será possível cancelar após a confirmação</li>
              <li>• Você receberá uma notificação quando for processado</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Botões de ação */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isLoading}
          className="flex-1 h-12"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        
        <Button
          onClick={onConfirm}
          disabled={isLoading}
          className="flex-1 h-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processando...
            </>
          ) : (
            <>
              <Shield className="w-4 h-4 mr-2" />
              Confirmar Saque
            </>
          )}
        </Button>
      </div>

      {/* Aviso de segurança */}
      <div className="text-center text-sm text-muted-foreground">
        <p>🔒 Transação segura e protegida</p>
      </div>
    </div>
  );
};