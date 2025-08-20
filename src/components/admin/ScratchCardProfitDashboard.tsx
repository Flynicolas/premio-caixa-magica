import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useScratchCardProfitMonitoring } from '@/hooks/useScratchCardProfitMonitoring';

const ScratchCardProfitDashboard = () => {
  const { 
    profitData, 
    summary, 
    loading, 
    getMarginColor, 
    getMarginStatus 
  } = useScratchCardProfitMonitoring();

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const scratchTypeNames: Record<string, string> = {
    pix: 'PIX',
    sorte: 'Sorte',
    dupla: 'Dupla Sorte',
    ouro: 'Ouro',
    diamante: 'Diamante',
    premium: 'Premium'
  };

  return (
    <div className="space-y-6">
      {/* Resumo Geral */}
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Resumo Financeiro - Sistema 90/10
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Vendas Total</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {summary.totalSales.toFixed(2)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Prêmios Pagos</p>
                <p className="text-2xl font-bold text-red-600">
                  R$ {summary.totalPrizesPaid.toFixed(2)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Margem Geral</p>
                <p className={`text-2xl font-bold ${getMarginColor(summary.overallMargin)}`}>
                  {summary.overallMargin.toFixed(1)}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={summary.isHealthy ? "default" : "destructive"}>
                  {summary.isHealthy ? "Saudável" : "Atenção"}
                </Badge>
              </div>
            </div>
            
            {!summary.isHealthy && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="font-semibold">Alerta: Margem Abaixo do Esperado</span>
                </div>
                <p className="text-sm text-red-700 mt-1">
                  A margem de lucro está abaixo de 85%. Revisar configurações de probabilidades.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dados por Raspadinha */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {profitData.map((item) => {
          const marginColor = getMarginColor(item.profit_margin_percentage);
          const status = getMarginStatus(item.profit_margin_percentage);
          
          return (
            <Card key={item.id} className="relative">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  {scratchTypeNames[item.scratch_type] || item.scratch_type}
                  <Badge 
                    variant={item.is_healthy ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {status}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Vendas:</span>
                    <span className="font-medium text-green-600">
                      R$ {item.total_sales.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Prêmios:</span>
                    <span className="font-medium text-red-600">
                      R$ {item.total_prizes_paid.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Lucro:</span>
                    <span className="font-medium text-blue-600">
                      R$ {(item.total_sales - item.total_prizes_paid).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Margem de Lucro</span>
                    <span className={`font-bold ${marginColor}`}>
                      {item.profit_margin_percentage.toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(item.profit_margin_percentage, 100)} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Meta: {item.target_margin_percentage}%</span>
                    <span className="flex items-center gap-1">
                      {item.profit_margin_percentage >= item.target_margin_percentage ? (
                        <TrendingUp className="w-3 h-3 text-green-600" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-red-600" />
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {profitData.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              Nenhum dado de lucro disponível ainda.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Os dados aparecerão conforme as raspadinhas forem jogadas.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ScratchCardProfitDashboard;