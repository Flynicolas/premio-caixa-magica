import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { scratchCardTypes, ScratchCardType } from '@/types/scratchCard';
import { TrendingUp, Target, DollarSign, RotateCcw, Settings } from 'lucide-react';

interface ScratchCardStats {
  scratchType: string;
  totalSales: number;
  totalPrizesGiven: number;
  netProfit: number;
  cardsPlayed: number;
  profitGoal: number;
  goalReached: boolean;
  profitPercentage: number;
}

interface ScratchCardSettings {
  isEnabled: boolean;
  minBet: number;
  maxBet: number;
  winProbability: number;
  houseFee: number;
}

const ScratchCardManager = () => {
  const [stats, setStats] = useState<ScratchCardStats[]>([]);
  const [settings, setSettings] = useState<ScratchCardSettings>({
    isEnabled: true,
    minBet: 1,
    maxBet: 100,
    winProbability: 0.30,
    houseFee: 0.20
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchSettings();
  }, []);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('scratch_card_financial_control')
        .select('*')
        .order('scratch_type');

      if (error) throw error;

      const processedStats: ScratchCardStats[] = Object.keys(scratchCardTypes).map(type => {
        const typeStats = data?.find(s => s.scratch_type === type);
        const profitPercentage = typeStats?.profit_goal > 0 
          ? (typeStats.net_profit / typeStats.profit_goal) * 100 
          : 0;

        return {
          scratchType: type,
          totalSales: typeStats?.total_sales || 0,
          totalPrizesGiven: typeStats?.total_prizes_given || 0,
          netProfit: typeStats?.net_profit || 0,
          cardsPlayed: typeStats?.cards_played || 0,
          profitGoal: typeStats?.profit_goal || 100,
          goalReached: typeStats?.goal_reached || false,
          profitPercentage
        };
      });

      setStats(processedStats);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      toast.error('Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      // Buscar configurações gerais (implementar conforme necessário)
      // Por enquanto, manter valores padrão
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
    }
  };

  const updateProfitGoal = async (scratchType: string, newGoal: number) => {
    try {
      const { error } = await supabase
        .from('scratch_card_financial_control')
        .upsert({
          scratch_type: scratchType,
          profit_goal: newGoal,
          date: new Date().toISOString().split('T')[0]
        }, {
          onConflict: 'scratch_type,date'
        });

      if (error) throw error;

      toast.success('Meta de lucro atualizada');
      fetchStats();
    } catch (error) {
      console.error('Erro ao atualizar meta:', error);
      toast.error('Erro ao atualizar meta');
    }
  };

  const resetStats = async (scratchType: string) => {
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

      toast.success(`Estatísticas resetadas para ${scratchCardTypes[scratchType as ScratchCardType].name}`);
      fetchStats();
    } catch (error) {
      console.error('Erro ao resetar estatísticas:', error);
      toast.error('Erro ao resetar estatísticas');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalStats = stats.reduce((acc, stat) => ({
    sales: acc.sales + stat.totalSales,
    prizes: acc.prizes + stat.totalPrizesGiven,
    profit: acc.profit + stat.netProfit,
    cards: acc.cards + stat.cardsPlayed
  }), { sales: 0, prizes: 0, profit: 0, cards: 0 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gerenciamento de Raspadinhas</h2>
        <Badge variant="outline" className="flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          Lucro Total: R$ {totalStats.profit.toFixed(2)}
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
          <TabsTrigger value="goals">Metas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Estatísticas Gerais */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Vendas</p>
                    <p className="text-2xl font-bold">R$ {totalStats.sales.toFixed(2)}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Prêmios</p>
                    <p className="text-2xl font-bold">R$ {totalStats.prizes.toFixed(2)}</p>
                  </div>
                  <Target className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Lucro Líquido</p>
                    <p className="text-2xl font-bold text-green-600">R$ {totalStats.profit.toFixed(2)}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Jogos</p>
                    <p className="text-2xl font-bold">{totalStats.cards}</p>
                  </div>
                  <RotateCcw className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Estatísticas por Tipo */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Estatísticas por Tipo</h3>
            <div className="grid gap-4">
              {stats.map((stat) => {
                const config = scratchCardTypes[stat.scratchType as ScratchCardType];
                
                return (
                  <Card key={stat.scratchType}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${config.color}`} />
                          <CardTitle className="text-lg">{config.name}</CardTitle>
                          <Badge variant="outline">R$ {config.price}</Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => resetStats(stat.scratchType)}
                          >
                            <RotateCcw className="w-4 h-4 mr-1" />
                            Reset
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Vendas</p>
                          <p className="font-semibold">R$ {stat.totalSales.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Prêmios</p>
                          <p className="font-semibold">R$ {stat.totalPrizesGiven.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Lucro</p>
                          <p className="font-semibold text-green-600">R$ {stat.netProfit.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Jogos</p>
                          <p className="font-semibold">{stat.cardsPlayed}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Meta</p>
                          <p className="font-semibold">R$ {stat.profitGoal.toFixed(2)}</p>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progresso da Meta</span>
                          <span>{stat.profitPercentage.toFixed(1)}%</span>
                        </div>
                        <Progress value={Math.min(stat.profitPercentage, 100)} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configurações Gerais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minBet">Aposta Mínima (R$)</Label>
                  <Input
                    id="minBet"
                    type="number"
                    value={settings.minBet}
                    onChange={(e) => setSettings(prev => ({ ...prev, minBet: parseFloat(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="maxBet">Aposta Máxima (R$)</Label>
                  <Input
                    id="maxBet"
                    type="number"
                    value={settings.maxBet}
                    onChange={(e) => setSettings(prev => ({ ...prev, maxBet: parseFloat(e.target.value) }))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="winProb">Probabilidade de Vitória (%)</Label>
                  <Input
                    id="winProb"
                    type="number"
                    value={settings.winProbability * 100}
                    onChange={(e) => setSettings(prev => ({ ...prev, winProbability: parseFloat(e.target.value) / 100 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="houseFee">Taxa da Casa (%)</Label>
                  <Input
                    id="houseFee"
                    type="number"
                    value={settings.houseFee * 100}
                    onChange={(e) => setSettings(prev => ({ ...prev, houseFee: parseFloat(e.target.value) / 100 }))}
                  />
                </div>
              </div>
              
              <Button className="w-full">
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Metas de Lucro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.map((stat) => {
                  const config = scratchCardTypes[stat.scratchType as ScratchCardType];
                  
                  return (
                    <div key={stat.scratchType} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${config.color}`} />
                      <div className="flex-1">
                        <p className="font-medium">{config.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Lucro atual: R$ {stat.netProfit.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          className="w-24"
                          value={stat.profitGoal}
                          onChange={(e) => {
                            const newGoal = parseFloat(e.target.value);
                            if (newGoal > 0) {
                              updateProfitGoal(stat.scratchType, newGoal);
                            }
                          }}
                        />
                        <span className="text-sm text-muted-foreground">R$</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScratchCardManager;