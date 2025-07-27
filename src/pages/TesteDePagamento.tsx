import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CreditCard, TestTube, CheckCircle, XCircle, ArrowLeft, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useKirvanoTest } from '@/hooks/useKirvanoTest';
import { useMercadoPago } from '@/hooks/useMercadoPago';
import PixTestModal from '@/components/PixTestModal';
import { toast } from 'sonner';

const TesteDePagamento = () => {
  const navigate = useNavigate();
  const { createTestPayment, processTestPayment, isLoading, showPixModal, setShowPixModal, pixData } = useKirvanoTest();
  const { processPayment: mercadoPagoPayment, loading: mercadoPagoLoading } = useMercadoPago();
  const [testAmount, setTestAmount] = useState(50);

  const handleKirvanoTest = async () => {
    await createTestPayment(testAmount);
  };

  const handleMercadoPagoTest = async () => {
    await mercadoPagoPayment(testAmount, `Teste MercadoPago - R$ ${testAmount}`);
  };

  const handleAbactepayTest = () => {
    toast.info('Abactepay ainda não implementado - Em desenvolvimento');
  };

  const quickAmounts = [10, 25, 50, 100, 200];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-primary/20">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
              <TestTube className="w-8 h-8" />
            </div>
            <CardTitle className="text-3xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Centro de Testes de Pagamento
            </CardTitle>
            <p className="text-muted-foreground">
              Teste diferentes métodos de pagamento e integrações
            </p>
            <Badge variant="outline" className="mx-auto">
              AMBIENTE DE TESTES
            </Badge>
          </CardHeader>
        </Card>

        {/* Valor do Teste */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-xl">Valor para Teste</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-5 gap-2">
              {quickAmounts.map(amount => (
                <Button
                  key={amount}
                  variant={testAmount === amount ? "default" : "outline"}
                  onClick={() => setTestAmount(amount)}
                  className="h-12"
                >
                  R$ {amount}
                </Button>
              ))}
            </div>
            <div className="text-center text-lg font-semibold text-primary">
              Valor selecionado: R$ {testAmount.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        {/* Métodos de Pagamento */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Kirvano Test */}
          <Card className="border-green-500/20 bg-gradient-to-br from-green-50/5 to-emerald-100/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-green-600">Kirvano PIX</CardTitle>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  TESTE
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Simula PIX com QR Code real da Kirvano
                </p>
                <div className="bg-green-50/10 p-3 rounded border border-green-500/20">
                  <p className="text-xs text-green-600">
                    ✓ QR Code gerado pela API
                  </p>
                  <p className="text-xs text-green-600">
                    ✓ Simulação de webhook
                  </p>
                  <p className="text-xs text-green-600">
                    ✓ Atualização de saldo de teste
                  </p>
                </div>
              </div>
              <Button 
                onClick={handleKirvanoTest}
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isLoading ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Gerando PIX...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Testar Kirvano PIX
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* MercadoPago */}
          <Card className="border-blue-500/20 bg-gradient-to-br from-blue-50/5 to-sky-100/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-blue-600">MercadoPago</CardTitle>
                <Badge variant="outline" className="text-blue-600 border-blue-600">
                  PRODUÇÃO
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Teste de pagamento real via MercadoPago
                </p>
                <div className="bg-blue-50/10 p-3 rounded border border-blue-500/20">
                  <p className="text-xs text-blue-600">
                    ✓ PIX, Cartão e Boleto
                  </p>
                  <p className="text-xs text-blue-600">
                    ✓ Webhook automático
                  </p>
                  <p className="text-xs text-blue-600">
                    ✓ Atualização de saldo real
                  </p>
                </div>
              </div>
              <Button 
                onClick={handleMercadoPagoTest}
                disabled={mercadoPagoLoading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {mercadoPagoLoading ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Testar MercadoPago
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Abactepay */}
          <Card className="border-purple-500/20 bg-gradient-to-br from-purple-50/5 to-violet-100/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-purple-600">Abactepay</CardTitle>
                <Badge variant="outline" className="text-orange-600 border-orange-600">
                  EM BREVE
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Gateway de pagamento Abactepay
                </p>
                <div className="bg-purple-50/10 p-3 rounded border border-purple-500/20">
                  <p className="text-xs text-purple-600">
                    🚧 PIX instantâneo
                  </p>
                  <p className="text-xs text-purple-600">
                    🚧 Taxas reduzidas
                  </p>
                  <p className="text-xs text-purple-600">
                    🚧 API em desenvolvimento
                  </p>
                </div>
              </div>
              <Button 
                onClick={handleAbactepayTest}
                disabled
                variant="outline"
                className="w-full border-purple-500/50 text-purple-600"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Em Desenvolvimento
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Status de Sistemas */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-xl">Status dos Sistemas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-semibold">Sistemas de Pagamento</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded border">
                    <span className="text-sm">MercadoPago Webhook</span>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Ativo
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded border">
                    <span className="text-sm">Kirvano Test API</span>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Ativo
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded border">
                    <span className="text-sm">Abactepay API</span>
                    <Badge variant="outline" className="text-orange-600 border-orange-600">
                      <Clock className="w-3 h-3 mr-1" />
                      Pendente
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold">Funcionalidades</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded border">
                    <span className="text-sm">Carteira de Usuário</span>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Ativo
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded border">
                    <span className="text-sm">Compra de Baús</span>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Ativo
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded border">
                    <span className="text-sm">Retirada de Prêmios</span>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Ativo
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navegação */}
        <div className="flex justify-center">
          <Button 
            onClick={() => navigate('/')}
            variant="outline"
            className="w-full md:w-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Início
          </Button>
        </div>
      </div>

      {/* PIX Test Modal */}
      <PixTestModal
        isOpen={showPixModal}
        onClose={() => setShowPixModal(false)}
        pixData={pixData}
        onProcess={processTestPayment}
      />
    </div>
  );
};

export default TesteDePagamento;