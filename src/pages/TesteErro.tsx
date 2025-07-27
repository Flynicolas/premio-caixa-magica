import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { XCircle, ArrowLeft, RotateCcw } from 'lucide-react';

const TesteErro = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-background to-red-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8" />
          </div>
          <CardTitle className="text-2xl text-red-700">Teste Cancelado</CardTitle>
          <Badge variant="outline" className="mx-auto bg-red-100 text-red-700 border-red-300">
            PAGAMENTO DE TESTE KIRVANO
          </Badge>
        </CardHeader>
        
        <CardContent className="space-y-4 text-center">
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <p className="text-red-800 font-medium mb-2">
              ❌ Pagamento não foi processado
            </p>
            <p className="text-red-700 text-sm">
              O teste de pagamento foi cancelado ou ocorreu um erro durante o processamento.
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
              className="w-full"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Tentar Novamente
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

export default TesteErro;