
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  Upload, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  ArrowRight,
  FileSpreadsheet
} from 'lucide-react';
import { chestData } from '@/data/chestData';

interface DataMigrationPanelProps {
  onMigrateData: () => Promise<void>;
  loading: boolean;
  stats: {
    totalItems: number;
    itemsByChest: Record<string, number>;
    itemsByRarity: Record<string, number>;
    totalValue: number;
    missingImages: number;
  };
}

const DataMigrationPanel: React.FC<DataMigrationPanelProps> = ({
  onMigrateData,
  loading,
  stats
}) => {
  const [showAnalysis, setShowAnalysis] = useState(false);

  // Analisar dados do chestData.ts
  const analyzeChestData = () => {
    const analysis = {
      totalItems: 0,
      itemsByChest: {} as Record<string, number>,
      itemsByRarity: {} as Record<string, number>,
      totalValue: 0,
      itemsWithImages: 0,
      itemsWithoutImages: 0
    };

    Object.entries(chestData).forEach(([chestType, items]) => {
      analysis.itemsByChest[chestType] = items.length;
      analysis.totalItems += items.length;

      items.forEach(item => {
        analysis.itemsByRarity[item.rarity] = (analysis.itemsByRarity[item.rarity] || 0) + 1;
        analysis.totalValue += item.value;
        
        if (item.image) {
          analysis.itemsWithImages++;
        } else {
          analysis.itemsWithoutImages++;
        }
      });
    });

    return analysis;
  };

  const chestAnalysis = analyzeChestData();
  const dbHasData = stats.totalItems > 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5" />
            <span>Migração de Dados</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status atual */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dados do chestData.ts */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center space-x-2">
                <FileSpreadsheet className="w-4 h-4" />
                <span>Dados do Sistema (chestData.ts)</span>
              </h3>
              <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>Total de Itens:</span>
                  <Badge variant="secondary">{chestAnalysis.totalItems}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Valor Total:</span>
                  <span className="font-medium">R$ {chestAnalysis.totalValue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Com Imagens:</span>
                  <Badge className="bg-green-100 text-green-800">
                    {chestAnalysis.itemsWithImages}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Sem Imagens:</span>
                  <Badge className="bg-red-100 text-red-800">
                    {chestAnalysis.itemsWithoutImages}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Dados do banco */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center space-x-2">
                <Database className="w-4 h-4" />
                <span>Dados do Banco</span>
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>Total de Itens:</span>
                  <Badge variant="secondary">{stats.totalItems}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Valor Total:</span>
                  <span className="font-medium">R$ {stats.totalValue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sem Imagens:</span>
                  <Badge className="bg-red-100 text-red-800">
                    {stats.missingImages}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge variant={dbHasData ? "default" : "outline"}>
                    {dbHasData ? "Com Dados" : "Vazio"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Detalhamento por baú */}
          <div className="space-y-3">
            <Button
              variant="outline"
              onClick={() => setShowAnalysis(!showAnalysis)}
              className="w-full"
            >
              {showAnalysis ? 'Ocultar' : 'Ver'} Análise Detalhada
            </Button>

            {showAnalysis && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-3">Itens por Baú (chestData.ts)</h4>
                  <div className="space-y-2">
                    {Object.entries(chestAnalysis.itemsByChest).map(([chest, count]) => (
                      <div key={chest} className="flex justify-between items-center">
                        <span className="capitalize">{chest}</span>
                        <Badge variant="outline">{count} itens</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Itens por Raridade (chestData.ts)</h4>
                  <div className="space-y-2">
                    {Object.entries(chestAnalysis.itemsByRarity).map(([rarity, count]) => (
                      <div key={rarity} className="flex justify-between items-center">
                        <span className="capitalize">{rarity}</span>
                        <Badge variant="outline">{count} itens</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Alertas e informações */}
          <div className="space-y-3">
            {!dbHasData && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  O banco de dados está vazio. A migração transferirá todos os {chestAnalysis.totalItems} itens do sistema para o banco.
                </AlertDescription>
              </Alert>
            )}

            {dbHasData && stats.totalItems < chestAnalysis.totalItems && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  O banco tem {stats.totalItems} itens, mas o sistema tem {chestAnalysis.totalItems}. A migração sincronizará os dados.
                </AlertDescription>
              </Alert>
            )}

            {chestAnalysis.itemsWithoutImages > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {chestAnalysis.itemsWithoutImages} itens não possuem imagem associada. Você pode adicionar as imagens após a migração.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Ação de migração */}
          <div className="flex items-center justify-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold">Pronto para Migrar?</h3>
              <p className="text-gray-600 max-w-md">
                A migração transferirá todos os dados do chestData.ts para o banco de dados, 
                preservando a estrutura atual e permitindo gestão visual.
              </p>
              
              <Button
                onClick={onMigrateData}
                disabled={loading}
                size="lg"
                className="min-w-48"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Migrando...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Iniciar Migração
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataMigrationPanel;
