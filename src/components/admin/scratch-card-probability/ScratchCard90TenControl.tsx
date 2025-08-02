import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, DollarSign, TrendingUp, Target, Settings, RefreshCw } from 'lucide-react';
import { useScratchCardAdministration } from '@/hooks/useScratchCardAdministration';
import { scratchCardTypes } from '@/types/scratchCard';

export function ScratchCard90TenControl() {
  const { 
    financialData, 
    settings, 
    loading, 
    updatePercentages, 
    updateProfitGoal, 
    resetStats,
    updateDailyBudget 
  } = useScratchCardAdministration();
  
  const [editingGoals, setEditingGoals] = useState<Record<string, number>>({});
  const [editingPercentages, setEditingPercentages] = useState<Record<string, { profit: number; prizes: number }>>({});
  const [editingBudgets, setEditingBudgets] = useState<Record<string, number>>({});

  const getTypeConfig = (scratchType: string) => {
    return scratchCardTypes[scratchType as keyof typeof scratchCardTypes];
  };

  const calculateProfitMargin = (sales: number, prizes: number) => {
    if (sales === 0) return 0;
    return ((sales - prizes) / sales) * 100;
  };

  const getGoalProgress = (current: number, goal: number) => {
    if (goal === 0) return 0;
    return Math.min((current / goal) * 100, 100);
  };

  const handleUpdatePercentages = async (scratchType: string) => {
    const percentages = editingPercentages[scratchType];
    if (!percentages) return;

    // Validar que somem 100%
    if (percentages.profit + percentages.prizes !== 1) {
      alert('Os percentuais devem somar 100%');
      return;
    }

    await updatePercentages(scratchType, percentages.profit, percentages.prizes);
    setEditingPercentages(prev => {
      const { [scratchType]: _, ...rest } = prev;
      return rest;
    });
  };

  const handleUpdateGoal = async (scratchType: string) => {
    const goal = editingGoals[scratchType];
    if (!goal || goal <= 0) return;

    await updateProfitGoal(scratchType, goal);
    setEditingGoals(prev => {
      const { [scratchType]: _, ...rest } = prev;
      return rest;
    });
  };

  const handleUpdateBudget = async (scratchType: string) => {
    const budget = editingBudgets[scratchType];
    if (budget === undefined || budget < 0) return;

    await updateDailyBudget(scratchType, budget);
    setEditingBudgets(prev => {
      const { [scratchType]: _, ...rest } = prev;
      return rest;
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Carregando dados do sistema 90/10...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calcular estatísticas gerais
  const totalSales = financialData.reduce((sum, item) => sum + item.total_sales, 0);
  const totalPrizes = financialData.reduce((sum, item) => sum + item.total_prizes_given, 0);
  const totalProfit = financialData.reduce((sum, item) => sum + item.net_profit, 0);
  const totalCards = financialData.reduce((sum, item) => sum + item.cards_played, 0);
  const overallMargin = calculateProfitMargin(totalSales, totalPrizes);

  return (
    <div className="space-y-6">
      {/* Header com Estatísticas Gerais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Sistema 90/10 - Controle Financeiro das Raspadinhas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">R$ {totalSales.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Vendas Totais</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">R$ {totalPrizes.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Prêmios Dados</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">R$ {totalProfit.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Lucro Líquido</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{totalCards}</p>
              <p className="text-sm text-muted-foreground">Cartas Jogadas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{overallMargin.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground">Margem Geral</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controles Individuais por Tipo */}
      <div className="grid gap-6">
        {financialData.map((item) => {
          const typeConfig = getTypeConfig(item.scratch_type);
          const setting = settings.find(s => s.scratch_type === item.scratch_type);
          const profitMargin = calculateProfitMargin(item.total_sales, item.total_prizes_given);
          const goalProgress = getGoalProgress(item.net_profit, item.profit_goal);
          
          return (
            <Card key={item.scratch_type} className="border-l-4" style={{ borderLeftColor: typeConfig?.bgColor || '#ccc' }}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded" 
                      style={{ backgroundColor: typeConfig?.bgColor || '#ccc' }}
                    />
                    {typeConfig?.name || item.scratch_type}
                    <Badge variant="outline">R$ {setting?.price.toFixed(2)}</Badge>
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge variant={goalProgress >= 100 ? "default" : "secondary"}>
                      Meta: {goalProgress.toFixed(1)}%
                    </Badge>
                    <Badge variant={profitMargin >= 85 ? "default" : profitMargin >= 70 ? "secondary" : "destructive"}>
                      Margem: {profitMargin.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Estatísticas */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <DollarSign className="h-5 w-5 mx-auto mb-1 text-green-600" />
                    <p className="text-lg font-semibold">R$ {item.total_sales.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Vendas</p>
                  </div>
                  <div className="text-center">
                    <TrendingUp className="h-5 w-5 mx-auto mb-1 text-red-600" />
                    <p className="text-lg font-semibold">R$ {item.total_prizes_given.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Prêmios</p>
                  </div>
                  <div className="text-center">
                    <Target className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                    <p className="text-lg font-semibold">R$ {item.net_profit.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Lucro</p>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">{item.cards_played}</div>
                    <p className="text-xs text-muted-foreground">Jogadas</p>
                  </div>
                </div>

                <Separator />

                {/* Configuração de Percentuais */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Sistema 90/10</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>% Lucro (atual: {(item.percentage_profit * 100).toFixed(0)}%)</Label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={editingPercentages[item.scratch_type]?.profit * 100 || item.percentage_profit * 100}
                          onChange={(e) => {
                            const value = Number(e.target.value) / 100;
                            setEditingPercentages(prev => ({
                              ...prev,
                              [item.scratch_type]: {
                                profit: value,
                                prizes: 1 - value
                              }
                            }));
                          }}
                        />
                        <Button 
                          size="sm" 
                          onClick={() => handleUpdatePercentages(item.scratch_type)}
                          disabled={!editingPercentages[item.scratch_type]}
                        >
                          Salvar
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label>% Prêmios (atual: {(item.percentage_prizes * 100).toFixed(0)}%)</Label>
                      <div className="text-sm text-muted-foreground">
                        Auto-calculado: {editingPercentages[item.scratch_type] ? 
                          (100 - (editingPercentages[item.scratch_type].profit * 100)).toFixed(0) : 
                          (item.percentage_prizes * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Meta de Lucro */}
                <div className="space-y-2">
                  <Label>Meta de Lucro Diária (R$)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder={item.profit_goal.toString()}
                      value={editingGoals[item.scratch_type] || ''}
                      onChange={(e) => {
                        setEditingGoals(prev => ({
                          ...prev,
                          [item.scratch_type]: Number(e.target.value)
                        }));
                      }}
                    />
                    <Button 
                      size="sm" 
                      onClick={() => handleUpdateGoal(item.scratch_type)}
                      disabled={!editingGoals[item.scratch_type]}
                    >
                      Atualizar
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Progresso: R$ {item.net_profit.toFixed(2)} / R$ {item.profit_goal.toFixed(2)} ({goalProgress.toFixed(1)}%)
                  </div>
                </div>

                <Separator />

                {/* Orçamento de Prêmios */}
                <div className="space-y-2">
                  <Label>Orçamento Diário para Prêmios (R$)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder={item.daily_budget_prizes.toString()}
                      value={editingBudgets[item.scratch_type] !== undefined ? editingBudgets[item.scratch_type] : ''}
                      onChange={(e) => {
                        setEditingBudgets(prev => ({
                          ...prev,
                          [item.scratch_type]: Number(e.target.value)
                        }));
                      }}
                    />
                    <Button 
                      size="sm" 
                      onClick={() => handleUpdateBudget(item.scratch_type)}
                      disabled={editingBudgets[item.scratch_type] === undefined}
                    >
                      Definir
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Restante: R$ {item.remaining_budget.toFixed(2)} / R$ {item.daily_budget_prizes.toFixed(2)}
                  </div>
                  {item.remaining_budget <= 0 && item.daily_budget_prizes > 0 && (
                    <div className="flex items-center gap-2 text-red-600 text-sm">
                      <AlertTriangle className="h-4 w-4" />
                      Orçamento de prêmios esgotado!
                    </div>
                  )}
                </div>

                {/* Botão de Reset */}
                <div className="flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      if (confirm(`Resetar todas as estatísticas de ${typeConfig?.name}?`)) {
                        resetStats(item.scratch_type);
                      }
                    }}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Resetar Estatísticas
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}