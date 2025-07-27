import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowLeft, Coins } from 'lucide-react';

const TesteSucesso = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-background to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8" />
          </div>
          <CardTitle className="text-2xl text-green-700">Teste Aprovado!</CardTitle>
          <Badge variant="outline" className="mx-auto bg-green-100 text-green-700 border-green-300">
            PAGAMENTO DE TESTE KIRVANO
          </Badge>
        </CardHeader>
        
        <CardContent className="space-y-4 text-center">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-green-800 font-medium mb-2">
              ✅ Pagamento processado com sucesso!
            </p>
            <p className="text-green-700 text-sm">
              Seu saldo de teste foi atualizado. Agora você pode usar o saldo para testar as rapadadas.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-muted-foreground text-sm">
              Este foi um teste de integração com a Kirvano. Nenhum valor real foi cobrado.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Button 
              onClick={() => navigate('/raspadinha')}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Coins className="w-4 h-4 mr-2" />
              Ir para Raspadinha
            </Button>
            
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

export default TesteSucesso;