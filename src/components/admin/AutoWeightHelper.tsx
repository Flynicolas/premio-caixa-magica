import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calculator, Sparkles, AlertCircle } from 'lucide-react';
import { useAutoWeightCalculator } from '@/hooks/useAutoWeightCalculator';
import { DatabaseItem } from '@/types/database';

interface AutoWeightHelperProps {
  items: DatabaseItem[];
  onRefresh: () => void;
}

const AutoWeightHelper = ({ items, onRefresh }: AutoWeightHelperProps) => {
  const { 
    updating, 
    applyAutoWeightsToScratchCards,
    applyAutoWeightsToChests,
    calculateAutoWeight,
    getWeightRecommendation
  } = useAutoWeightCalculator();

  const handleApplyToAll = async () => {
    const scratchSuccess = await applyAutoWeightsToScratchCards();
    const chestSuccess = await applyAutoWeightsToChests();
    
    if (scratchSuccess || chestSuccess) {
      onRefresh();
    }
  };

  const valueRanges = [
    { min: 0, max: 10, weight: 100, category: 'Comum', color: 'bg-gray-500' },
    { min: 10, max: 25, weight: 50, category: 'Comum+', color: 'bg-green-500' },
    { min: 25, max: 50, weight: 25, category: 'Raro', color: 'bg-blue-500' },
    { min: 50, max: 100, weight: 10, category: 'Raro+', color: 'bg-purple-500' },
    { min: 100, max: 200, weight: 5, category: 'Épico', color: 'bg-orange-500' },
    { min: 200, max: 500, weight: 2, category: 'Lendário', color: 'bg-red-500' },
    { min: 500, max: Infinity, weight: 1, category: 'Mítico', color: 'bg-yellow-500' }
  ];

  const itemsByCategory = items.reduce((acc, item) => {
    const recommendation = getWeightRecommendation(item.base_value);
    if (!acc[recommendation.category]) {
      acc[recommendation.category] = [];
    }
    acc[recommendation.category].push(item);
    return acc;
  }, {} as Record<string, DatabaseItem[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calculator className="w-6 h-6" />
            Sistema de Pesos Automáticos 90/10
          </h2>
          <p className="text-muted-foreground">
            Pesos automáticos baseados no valor dos itens para garantir 90% de lucro
          </p>
        </div>
        <Button 
          onClick={handleApplyToAll}
          disabled={updating}
          className="flex items-center gap-2"
        >
          {updating ? (
            <Calculator className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {updating ? 'Aplicando...' : 'Aplicar a Todos os Sistemas'}
        </Button>
      </div>

      <Alert>
        <AlertCircle className="w-4 h-4" />
        <AlertDescription>
          <strong>Sistema 90/10:</strong> Quanto maior o valor do item, menor o peso na sorte. 
          Isso garante que itens caros sejam raros e itens baratos sejam mais frequentes, 
          mantendo a margem de lucro de ~90%.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Faixas de Peso por Valor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {valueRanges.map((range, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${range.color}`} />
                    <div>
                      <p className="font-medium">{range.category}</p>
                      <p className="text-sm text-muted-foreground">
                        R$ {range.min} - {range.max === Infinity ? '∞' : `R$ ${range.max}`}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="font-mono">
                    Peso: {range.weight}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição Atual dos Itens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(itemsByCategory).map(([category, categoryItems]) => {
                const range = valueRanges.find(r => r.category === category);
                return (
                  <div key={category} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      {range && <div className={`w-3 h-3 rounded-full ${range.color}`} />}
                      <h3 className="font-medium">{category}</h3>
                      <Badge variant="secondary">{categoryItems.length}</Badge>
                    </div>
                    <div className="space-y-2">
                      {categoryItems.slice(0, 5).map(item => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="truncate mr-2">{item.name}</span>
                          <span className="text-muted-foreground">
                            R$ {item.base_value.toFixed(2)}
                          </span>
                        </div>
                      ))}
                      {categoryItems.length > 5 && (
                        <p className="text-xs text-muted-foreground">
                          +{categoryItems.length - 5} outros itens...
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AutoWeightHelper;