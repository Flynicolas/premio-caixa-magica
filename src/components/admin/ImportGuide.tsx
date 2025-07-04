
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  FileSpreadsheet, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  Download,
  Upload,
  Settings,
  Eye
} from 'lucide-react';

const ImportGuide = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            Guia Completo: Como Importar Itens via Planilha
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Passo 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-500">Passo 1</Badge>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Download className="w-4 h-4" />
                Baixe o Template
              </h3>
            </div>
            <p className="text-gray-600">
              Clique em "Download Template" para baixar um arquivo Excel pré-formatado com exemplos.
              Este template já contém todas as colunas necessárias e exemplos de dados válidos.
            </p>
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Colunas do Template:</strong>
                <br />• Nome do Item (obrigatório)
                <br />• Valor em R$ (obrigatório) 
                <br />• Raridade (obrigatório): common, rare, epic, legendary
                <br />• Categoria (opcional): product, money, voucher
                <br />• Descrição (opcional)
                <br />• URL da Imagem (opcional)
                <br />• Tipo de Entrega (opcional): digital, physical
                <br />• Requer Endereço (opcional): true, false
                <br />• Tipos de Baú (opcional): silver,gold,diamond (separados por vírgula)
              </AlertDescription>
            </Alert>
          </div>

          <Separator />

          {/* Passo 2 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-green-500">Passo 2</Badge>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4" />
                Preencha Sua Planilha
              </h3>
            </div>
            <p className="text-gray-600">
              Edite o template ou crie sua própria planilha seguindo o formato. 
              Você pode usar Excel, Google Sheets ou qualquer editor de planilhas.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-green-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-green-700">✅ Formato Correto</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2 text-sm">
                  <p><strong>Nome:</strong> "iPhone 15 Pro"</p>
                  <p><strong>Valor:</strong> 800.00 ou 800,00</p>
                  <p><strong>Raridade:</strong> legendary</p>
                  <p><strong>Categoria:</strong> product</p>
                  <p><strong>Baús:</strong> gold,diamond,ruby</p>
                </CardContent>
              </Card>
              
              <Card className="border-red-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-red-700">❌ Formato Incorreto</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2 text-sm">
                  <p><strong>Nome:</strong> (vazio)</p>
                  <p><strong>Valor:</strong> "oitocentos reais"</p>
                  <p><strong>Raridade:</strong> "muito raro"</p>
                  <p><strong>Categoria:</strong> "eletrônicos"</p>
                  <p><strong>Baús:</strong> "baú de ouro"</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <Separator />

          {/* Passo 3 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-purple-500">Passo 3</Badge>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Faça o Upload
              </h3>
            </div>
            <p className="text-gray-600">
              Salve sua planilha e faça upload no sistema. Formatos aceitos: .xlsx, .xls, .csv
            </p>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                O sistema processa arquivos de até 10MB e milhares de linhas. 
                Para arquivos muito grandes, considere dividir em lotes menores.
              </AlertDescription>
            </Alert>
          </div>

          <Separator />

          {/* Passo 4 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-orange-500">Passo 4</Badge>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Configure o Mapeamento
              </h3>
            </div>
            <p className="text-gray-600">
              O sistema tentará mapear automaticamente suas colunas, mas você pode ajustar manualmente.
              Certifique-se de que os campos obrigatórios estejam mapeados corretamente.
            </p>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Campos Obrigatórios:</strong> Nome do Item, Valor e Raridade devem estar mapeados.
                Sem eles, a importação não funcionará.
              </AlertDescription>
            </Alert>
          </div>

          <Separator />

          {/* Passo 5 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-teal-500">Passo 5</Badge>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Visualize e Confirme
              </h3>
            </div>
            <p className="text-gray-600">
              Antes da importação final, você verá uma prévia dos primeiros 10 itens.
              Verifique se os dados estão corretos e clique em "Importar".
            </p>
          </div>

          <Separator />

          {/* Dicas Importantes */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-blue-700">💡 Dicas Importantes</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">📊 Sobre os Dados</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Use pontos ou vírgulas para decimais (15.50 ou 15,50)</li>
                  <li>• Raridades válidas: common, rare, epic, legendary</li>
                  <li>• Tipos de entrega: digital ou physical</li>
                  <li>• Para baús múltiplos, separe por vírgula</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">🖼️ Sobre as Imagens</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• URLs de imagens são opcionais na importação</li>
                  <li>• Você pode adicionar imagens depois manualmente</li>
                  <li>• Use URLs públicas (https://exemplo.com/img.jpg)</li>
                  <li>• Imagens locais devem ser uploaded separadamente</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Próximos Passos */}
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Após a Importação:</strong>
              <br />• Todos os itens aparecerão na aba "Planilha" para edição
              <br />• Você pode adicionar imagens individualmente
              <br />• Configure probabilidades de cada item nos baús
              <br />• Ative/desative itens conforme necessário
            </AlertDescription>
          </Alert>

        </CardContent>
      </Card>
    </div>
  );
};

export default ImportGuide;
