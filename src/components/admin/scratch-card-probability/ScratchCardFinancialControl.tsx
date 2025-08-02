import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ScratchCardType, scratchCardTypes } from '@/types/scratchCard';
import { TrendingUp, TrendingDown, Target, AlertTriangle, Settings } from 'lucide-react';

interface FinancialStats {
  id: string;
  scratch_type: ScratchCardType;
  date: string;
  total_sales: number;
  total_prizes_given: number;
  net_profit: number;
  cards_played: number;
  profit_goal: number;
  goal_reached: boolean;
}

const ScratchCardFinancialControl = () => {
  const [stats, setStats] = useState<FinancialStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingGoals, setEditingGoals] = useState<Record<string, number>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchFinancialStats();
    
    // Setup realtime updates
    const channel = supabase
      .channel('scratch-financial-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'scratch_card_financial_control' },
        () => fetchFinancialStats()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchFinancialStats = async () => {
    try {
      const { data, error } = await supabase
        .from('scratch_card_financial_control')
        .select('*')
        .eq('date', new Date().toISOString().split('T')[0])
        .order('scratch_type');

      if (error) throw error;

      // Ensure we have stats for all scratch card types
      const existingTypes = new Set(data?.map(stat => stat.scratch_type) || []);
      const allStats: FinancialStats[] = [];

      // Add existing stats
      data?.forEach(stat => {
        allStats.push({
          ...stat,
          scratch_type: stat.scratch_type as ScratchCardType
        });
      });

      // Add missing types with default values
      Object.keys(scratchCardTypes).forEach(async (type) => {
        if (!existingTypes.has(type)) {
          // Create default entry
          const { data: newStat, error: createError } = await supabase
            .from('scratch_card_financial_control')
            .insert({
              scratch_type: type,
              date: new Date().toISOString().split('T')[0],
              total_sales: 0,
              total_prizes_given: 0,
              net_profit: 0,
              cards_played: 0,
              profit_goal: 100,
              goal_reached: false
            })
            .select()
            .single();

          if (!createError && newStat) {
            allStats.push({
              ...newStat,
              scratch_type: newStat.scratch_type as ScratchCardType
            });
          }
        }
      });

      setStats(allStats);
    } catch (error: any) {
      console.error('Erro ao buscar estatísticas financeiras:', error);
      toast({
        title: "Erro ao carregar estatísticas",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfitGoal = async (scratchType: ScratchCardType, newGoal: number) => {
    try {
      const { error } = await supabase
        .from('scratch_card_financial_control')
        .update({ profit_goal: newGoal })
        .eq('scratch_type', scratchType)
        .eq('date', new Date().toISOString().split('T')[0]);

      if (error) throw error;

      toast({
        title: "Meta atualizada!",
        description: `Meta de lucro para ${scratchCardTypes[scratchType].name} atualizada para R$ ${newGoal.toFixed(2)}`,
      });

      fetchFinancialStats();
    } catch (error: any) {
      console.error('Erro ao atualizar meta:', error);
      toast({
        title: "Erro ao atualizar meta",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const resetStats = async (scratchType: ScratchCardType) => {
    if (!confirm(`Tem certeza que deseja resetar as estatísticas de ${scratchCardTypes[scratchType].name}?`)) return;

    try {
      const { error } = await supabase
        .from('scratch_card_financial_control')
        .update({
          total_sales: 0,
          total_prizes_given: 0,
          net_profit: 0,
          cards_played: 0,
          goal_reached: false
        })
        .eq('scratch_type', scratchType)
        .eq('date', new Date().toISOString().split('T')[0]);

      if (error) throw error;

      toast({
        title: "Estatísticas resetadas!",
        description: `Estatísticas de ${scratchCardTypes[scratchType].name} foram resetadas`,
      });

      fetchFinancialStats();
    } catch (error: any) {
      console.error('Erro ao resetar estatísticas:', error);
      toast({
        title: "Erro ao resetar estatísticas",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const calculateProfitMargin = (sales: number, prizes: number) => {
    if (sales === 0) return 0;
    return ((sales - prizes) / sales) * 100;
  };

  const getGoalProgress = (profit: number, goal: number) => {
    if (goal === 0) return 0;
    return Math.min((profit / goal) * 100, 100);
  };

  // Calculate totals
  const totals = stats.reduce((acc, stat) => ({
    sales: acc.sales + stat.total_sales,
    prizes: acc.prizes + stat.total_prizes_given,
    profit: acc.profit + stat.net_profit,
    cards: acc.cards + stat.cards_played,
    goal: acc.goal + stat.profit_goal
  }), { sales: 0, prizes: 0, profit: 0, cards: 0, goal: 0 });

  const overallProfitMargin = calculateProfitMargin(totals.sales, totals.prizes);
  const overallGoalProgress = getGoalProgress(totals.profit, totals.goal);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando estatísticas financeiras...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumo Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Resumo Financeiro Geral - Sistema 90/10
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">R$ {totals.sales.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Total Vendas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">R$ {totals.prizes.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Total Prêmios</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">R$ {totals.profit.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Lucro Líquido</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{totals.cards}</div>
              <div className="text-sm text-muted-foreground">Cards Jogados</div>
            </div>
          </div>
          
          <div className="mt-6 space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Margem de Lucro Geral</span>
                <span className={`text-sm font-bold ${overallProfitMargin >= 90 ? 'text-green-600' : overallProfitMargin >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {overallProfitMargin.toFixed(1)}%
                </span>
              </div>
              <Progress value={overallProfitMargin} className="h-2" />
              <div className="text-xs text-muted-foreground mt-1">
                Meta: 90% lucro, 10% prêmios
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Progresso da Meta Geral</span>
                <span className="text-sm font-bold">
                  {overallGoalProgress.toFixed(1)}%
                </span>
              </div>
              <Progress value={overallGoalProgress} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards por Tipo de Raspadinha */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const config = scratchCardTypes[stat.scratch_type];
          const profitMargin = calculateProfitMargin(stat.total_sales, stat.total_prizes_given);
          const goalProgress = getGoalProgress(stat.net_profit, stat.profit_goal);
          
          return (
            <Card key={stat.scratch_type}>
              <CardHeader className={`${config.bgColor} text-white`}>
                <CardTitle className="text-lg">
                  {config.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={stat.goal_reached ? "secondary" : "destructive"}>
                    {stat.goal_reached ? "Meta Atingida" : "Meta Pendente"}
                  </Badge>
                  {profitMargin >= 90 ? (
                    <TrendingUp className="w-4 h-4 text-green-200" />
                  ) : profitMargin < 80 ? (
                    <AlertTriangle className="w-4 h-4 text-red-200" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-yellow-200" />
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Vendas</div>
                    <div className="font-bold text-green-600">R$ {stat.total_sales.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Prêmios</div>
                    <div className="font-bold text-red-600">R$ {stat.total_prizes_given.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Lucro</div>
                    <div className="font-bold text-blue-600">R$ {stat.net_profit.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Cards</div>
                    <div className="font-bold">{stat.cards_played}</div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium">Margem de Lucro</span>
                    <span className={`text-xs font-bold ${profitMargin >= 90 ? 'text-green-600' : profitMargin >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {profitMargin.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={profitMargin} className="h-1" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`goal-${stat.scratch_type}`} className="text-xs">
                    Meta de Lucro (R$)
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id={`goal-${stat.scratch_type}`}
                      type="number"
                      value={editingGoals[stat.scratch_type] ?? stat.profit_goal}
                      onChange={(e) => setEditingGoals(prev => ({
                        ...prev,
                        [stat.scratch_type]: Number(e.target.value)
                      }))}
                      className="h-8 text-xs"
                      step="0.01"
                      min="0"
                    />
                    <Button
                      onClick={() => updateProfitGoal(stat.scratch_type, editingGoals[stat.scratch_type] ?? stat.profit_goal)}
                      size="sm"
                      className="h-8 px-2"
                    >
                      <Target className="w-3 h-3" />
                    </Button>
                  </div>
                  <Progress value={goalProgress} className="h-1" />
                  <div className="text-xs text-muted-foreground">
                    {goalProgress.toFixed(1)}% da meta
                  </div>
                </div>

                <Button
                  onClick={() => resetStats(stat.scratch_type)}
                  size="sm"
                  variant="outline"
                  className="w-full text-xs"
                >
                  <Settings className="w-3 h-3 mr-1" />
                  Resetar Estatísticas
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ScratchCardFinancialControl;