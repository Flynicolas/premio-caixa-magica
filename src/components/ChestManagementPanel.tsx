
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useChestManagement } from '@/hooks/useChestManagement';
import { TrendingUp, TrendingDown, Target, AlertTriangle, DollarSign } from 'lucide-react';

const ChestManagementPanel = () => {
  const { 
    alerts, 
    loading, 
    markAlertAsRead, 
    resetChestGoal, 
    getChestStats 
  } = useChestManagement();

  const chestTypes = ['silver', 'gold', 'delas', 'diamond', 'ruby', 'premium'];
  
  const chestNames = {
    silver: 'Baú de Prata',
    gold: 'Baú de Ouro', 
    delas: 'Baú Delas',
    diamond: 'Baú de Diamante',
    ruby: 'Baú de Rubi',
    premium: 'Baú Premium'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alertas */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Alertas ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.map((alert) => (
              <Alert key={alert.id} className="border-orange-200">
                <AlertDescription className="flex justify-between items-center">
                  <div>
                    <strong className="capitalize">{alert.chest_type}</strong>: {alert.message}
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(alert.triggered_at).toLocaleString('pt-BR')}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => markAlertAsRead(alert.id)}
                  >
                    Marcar como lido
                  </Button>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Grid de Estatísticas por Baú */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {chestTypes.map((chestType) => {
          const stats = getChestStats(chestType);
          const isProfit = stats.netProfit >= 0;
          const progressValue = Math.min(Math.max((stats.netProfit / stats.profitGoal) * 100, 0), 100);
          
          return (
            <Card key={chestType} className="relative">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  {chestNames[chestType as keyof typeof chestNames]}
                  {stats.goalReached && (
                    <Badge variant="default" className="bg-green-500">
                      Meta Atingida
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progresso da Meta */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso da Meta</span>
                    <span>{stats.profitPercentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={progressValue} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>R$ {stats.netProfit.toFixed(2)}</span>
                    <span>Meta: R$ {stats.profitGoal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Estatísticas */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-green-500" />
                      <span className="text-muted-foreground">Vendas</span>
                    </div>
                    <p className="font-semibold">R$ {stats.totalSales.toFixed(2)}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      <Target className="w-3 h-3 text-blue-500" />
                      <span className="text-muted-foreground">Prêmios</span>
                    </div>
                    <p className="font-semibold">R$ {stats.totalPrizes.toFixed(2)}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      {isProfit ? (
                        <TrendingUp className="w-3 h-3 text-green-500" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-red-500" />
                      )}
                      <span className="text-muted-foreground">Lucro</span>
                    </div>
                    <p className={`font-semibold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                      R$ {stats.netProfit.toFixed(2)}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Aberturas</span>
                    <p className="font-semibold">{stats.chestsOpened}</p>
                  </div>
                </div>

                {/* Ações */}
                {stats.goalReached && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => resetChestGoal(chestType)}
                  >
                    Resetar Meta
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Resumo Geral */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo do Dia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {(() => {
              const totalSales = chestTypes.reduce((sum, type) => sum + getChestStats(type).totalSales, 0);
              const totalPrizes = chestTypes.reduce((sum, type) => sum + getChestStats(type).totalPrizes, 0);
              const totalProfit = totalSales - totalPrizes;
              const totalOpenings = chestTypes.reduce((sum, type) => sum + getChestStats(type).chestsOpened, 0);
              
              return (
                <>
                  <div>
                    <p className="text-2xl font-bold text-green-600">R$ {totalSales.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">Total Vendas</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">R$ {totalPrizes.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">Total Prêmios</p>
                  </div>
                  <div>
                    <p className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      R$ {totalProfit.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">Lucro Total</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">#{totalOpenings}</p>
                    <p className="text-sm text-muted-foreground">Total Aberturas</p>
                  </div>
                </>
              );
            })()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChestManagementPanel;
