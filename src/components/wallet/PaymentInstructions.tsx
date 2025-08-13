import { Card } from '@/components/ui/card';
import { Smartphone, CreditCard, AlertTriangle } from 'lucide-react';

interface PaymentInstructionsProps {
  amount: number;
}

export const PaymentInstructions = ({ amount }: PaymentInstructionsProps) => {
  return (
    <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Smartphone className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-blue-800 mb-2">
          PIX Gerado com Sucesso!
        </h3>
        <p className="text-blue-600">
          Valor: <span className="font-bold text-lg">R$ {amount.toFixed(2)}</span>
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
          <Smartphone className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <h4 className="font-medium text-blue-800 mb-2">Pelo Celular</h4>
          <p className="text-sm text-blue-600">
            Escaneie o QR Code com a câmera do seu banco
          </p>
        </div>

        <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
          <CreditCard className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <h4 className="font-medium text-blue-800 mb-2">Pelo App/Site</h4>
          <p className="text-sm text-blue-600">
            Copie e cole o código PIX no seu banco
          </p>
        </div>
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-orange-800 mb-1">Atenção!</h4>
            <ul className="text-sm text-orange-700 space-y-1">
              <li>• Pague exatamente R$ {amount.toFixed(2)}</li>
              <li>• Não feche esta tela até o pagamento ser confirmado</li>
              <li>• O PIX expira em 15 minutos</li>
              <li>• Seu saldo será atualizado automaticamente</li>
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
};