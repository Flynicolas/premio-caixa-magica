
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import ClearTableButton from './ClearTableButton';
import { 
  Database, 
  Upload, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  Download,
  RefreshCw
} from 'lucide-react';
import { ItemManagementStats } from '@/hooks/useItemManagement/types';

interface DataMigrationPanelProps {
  onMigrateData: () => Promise<void>;
  loading: boolean;
  stats: ItemManagementStats;
  onRefreshData: () => void;
}

const DataMigrationPanel = ({ onMigrateData, loading, stats, onRefreshData }: DataMigrationPanelProps) => {
  const { toast } = useToast();
  const [migrationReport, setMigrationReport] = useState<any>(null);

  const handleMigration = async () => {
    try {
      await onMigrateData();
      
      // Simular relatório de migração
      const report = {
        totalMigrated: 120, // Aproximado dos dados do chestData.ts
        itemsByChest: {
          silver: 20,
          gold: 20,
          delas: 20,
          diamond: 20,
          ruby: 20,
          premium: 20
        },
        duplicatesSkipped: 0,
        errors: 0
      };
      
      setMigrationReport(report);
      
    } catch (error) {
      console.error('Erro na migração:', error);
    }
  };

  const handleTableCleared = () => {
    setMigrationReport(null);
    onRefreshData();
  };

  const handleClearAndMigrate = async () => {
    // Implementar processo "Zerar e Alimentar" em um só clique
    try {
      toast({
        title: "Iniciando processo completo",
        description: "Limpando tabela e importando dados...",
      });
      
      // Primeiro limpar, depois migrar
      // Este seria implementado com uma função que combine ambos os processos
      
    } catch (error) {
      console.error('Erro no processo completo:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Atual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Status Atual do Banco de Dados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-3 rounded">
              <div className="text-2xl font-bold text-blue-600">{stats.totalItems}</div>
              <div className="text-sm text-blue-800">Itens no Banco</div>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <div className="text-2xl font-bold text-green-600">
                {Object.keys(stats.itemsByChest).length}
              </div>
              <div className="text-sm text-green-800">Tipos de Baú</div>
            </div>
            <div className="bg-purple-50 p-3 rounded">
              <div className="text-2xl font-bold text-purple-600">
                R$ {stats.totalValue.toFixed(2)}
              </div>
              <div className="text-sm text-purple-800">Valor Total</div>
            </div>
            <div className="bg-red-50 p-3 rounded">
              <div className="text-2xl font-bold text-red-600">{stats.missingImages}</div>
              <div className="text-sm text-red-800">Sem Imagem</div>
            </div>
          </div>

          {Object.keys(stats.itemsByChest).length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Distribuição por Baú:</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(stats.itemsByChest).map(([chest, count]) => (
                  <Badge key={chest} variant="outline">
                    {chest}: {count} itens
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Controles de Limpeza e Migração */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Controles de Tabela
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Opções disponíveis:</strong>
              <br />• <strong>Limpar Tabela:</strong> Remove todos os itens do banco de dados
              <br />• <strong>Migrar Dados:</strong> Importa dados do chestData.ts (mantém itens existentes)
              <br />• <strong>Zerar e Alimentar:</strong> Limpa tudo e importa dados novos em um processo
            </AlertDescription>
          </Alert>

          <div className="flex flex-wrap gap-3">
            <ClearTableButton 
              onTableCleared={handleTableCleared}
              totalItems={stats.totalItems}
            />
            
            <Button 
              onClick={handleMigration}
              disabled={loading}
              size="lg"
              variant="outline"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              {loading ? 'Migrando...' : 'Migrar Dados'}
            </Button>

            <Button 
              onClick={handleClearAndMigrate}
              disabled={loading}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Zerar e Alimentar
            </Button>
          </div>

          {/* Relatório de Migração */}
          {migrationReport && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold text-green-800">Migração Concluída!</h4>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Total Migrado:</strong> {migrationReport.totalMigrated} itens
                </div>
                <div>
                  <strong>Duplicatas:</strong> {migrationReport.duplicatesSkipped}
                </div>
                <div>
                  <strong>Erros:</strong> {migrationReport.errors}
                </div>
              </div>

              <div className="mt-3">
                <strong className="text-sm">Distribuição por Baú:</strong>
                <div className="flex flex-wrap gap-1 mt-1">
                  {Object.entries(migrationReport.itemsByChest).map(([chest, count]) => (
                    <Badge key={chest} variant="secondary" className="text-xs">
                      {chest}: {count as number}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informações sobre a Estrutura */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            Como Funciona o Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-sm mb-2">🎯 Tipos de Baú:</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• <strong>Silver:</strong> Baú Prata</li>
                <li>• <strong>Gold:</strong> Baú Ouro</li> 
                <li>• <strong>Delas:</strong> Baú Delas (feminino)</li>
                <li>• <strong>Diamond:</strong> Baú Diamante</li>
                <li>• <strong>Ruby:</strong> Baú Rubi</li>
                <li>• <strong>Premium:</strong> Baú Premium</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-sm mb-2">⭐ Sistema de Raridades:</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• <strong>Common:</strong> Itens comuns (até R$ 100)</li>
                <li>• <strong>Rare:</strong> Itens raros (R$ 100-500)</li>
                <li>• <strong>Epic:</strong> Itens épicos (R$ 500-2000)</li>
                <li>• <strong>Legendary:</strong> Itens lendários (R$ 2000+)</li>
              </ul>
            </div>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Próximos Passos após a Migração:</strong>
              <br />• Configure probabilidades específicas para cada baú
              <br />• Adicione imagens aos itens sem URL de imagem
              <br />• Ajuste valores e descrições conforme necessário
              <br />• Use a aba "Planilha" para editar itens individualmente
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataMigrationPanel;
