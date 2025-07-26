import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Target, 
  TrendingUp, 
  Settings, 
  RefreshCw, 
  AlertCircle,
  DollarSign,
  Activity,
  Award
} from 'lucide-react';
import { scratchCardTypes, ScratchCardType } from '@/types/scratchCard';

interface ScratchCardStats {
  chestType: string;
  totalSales: number;
  totalPrizes: number;
  netProfit: number;
  cardsGenerated: number;
  profitGoal: number;
  goalReached: boolean;
  profitPercentage: number;
}

interface ScratchCardSettings {
  isEnabled: boolean;
  minBetAmount: number;
  maxBetAmount: number;
  winProbability: number;
  houseFee: number;
}

const ScratchCardManager = () => {
  const [stats, setStats] = useState<ScratchCardStats[]>([]);
  const [settings, setSettings] = useState<ScratchCardSettings>({
    isEnabled: true,
    minBetAmount: 1,
    maxBetAmount: 250,
    winProbability: 30,
    houseFee: 20
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchStats();
    fetchSettings();
  }, []);

  const fetchStats = async () => {
    try {
      // Buscar estatísticas da raspadinha
      const { data: financialData, error } = await supabase
        .from('chest_financial_control')
        .select('*')
        .in('chest_type', Object.keys(scratchCardTypes));

      if (error) throw error;

      const statsData = Object.keys(scratchCardTypes).map(chestType => {
        const typeData = financialData?.find(d => d.chest_type === chestType);
        return {
          chestType,
          totalSales: typeData?.total_sales || 0,
          totalPrizes: typeData?.total_prizes_given || 0,
          netProfit: typeData?.net_profit || 0,
          cardsGenerated: typeData?.chests_opened || 0,
          profitGoal: typeData?.profit_goal || 100,
          goalReached: typeData?.goal_reached || false,
          profitPercentage: typeData?.net_profit && typeData?.profit_goal 
            ? (typeData.net_profit / typeData.profit_goal) * 100 
            : 0
        };
      });

      setStats(statsData);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar estatísticas da raspadinha',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    // Aqui você pode buscar configurações específicas do banco se necessário
    // Por ora, usando valores padrão
  };

  const updateProfitGoal = async (chestType: string, newGoal: number) => {
    try {
      const { error } = await supabase
        .from('chest_financial_control')
        .upsert({
          chest_type: chestType,
          profit_goal: newGoal,
          date: new Date().toISOString().split('T')[0]
        });

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Meta atualizada com sucesso!'
      });

      fetchStats();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar meta',
        variant: 'destructive'
      });
    }
  };

  const resetStats = async (chestType: string) => {
    try {
      const { error } = await supabase
        .from('chest_financial_control')
        .update({
          total_sales: 0,
          total_prizes_given: 0,
          net_profit: 0,
          chests_opened: 0,
          goal_reached: false
        })
        .eq('chest_type', chestType);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Estatísticas resetadas com sucesso!'
      });

      fetchStats();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao resetar estatísticas',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Administração de Raspadinha</h2>
          <p className="text-muted-foreground">Gerencie configurações, metas e estatísticas</p>
        </div>
        <Button onClick={fetchStats} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
          <TabsTrigger value="goals">Metas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Cards de Estatísticas Gerais */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <DollarSign className="w-4 h-4 mr-2 text-green-500" />
                  Vendas Totais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {stats.reduce((acc, stat) => acc + stat.totalSales, 0).toFixed(2)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Award className="w-4 h-4 mr-2 text-blue-500" />
                  Prêmios Pagos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {stats.reduce((acc, stat) => acc + stat.totalPrizes, 0).toFixed(2)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-green-600" />
                  Lucro Líquido
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {stats.reduce((acc, stat) => acc + stat.netProfit, 0).toFixed(2)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Activity className="w-4 h-4 mr-2 text-purple-500" />
                  Cards Gerados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.reduce((acc, stat) => acc + stat.cardsGenerated, 0)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Estatísticas por Tipo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.map((stat) => (
              <Card key={stat.chestType}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{scratchCardTypes[stat.chestType as ScratchCardType].name}</span>
                    <Badge variant={stat.goalReached ? "default" : "secondary"}>
                      {stat.goalReached ? "Meta Atingida" : "Ativo"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Vendas:</span>
                    <span className="font-medium">R$ {stat.totalSales.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Prêmios:</span>
                    <span className="font-medium">R$ {stat.totalPrizes.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Lucro:</span>
                    <span className="font-medium text-green-600">R$ {stat.netProfit.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Cards:</span>
                    <span className="font-medium">{stat.cardsGenerated}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Meta de Lucro:</span>
                      <span className="font-medium">R$ {stat.profitGoal.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${Math.min(stat.profitPercentage, 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground text-center">
                      {stat.profitPercentage.toFixed(1)}% da meta
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => resetStats(stat.chestType)}
                    className="w-full"
                  >
                    Resetar Estatísticas
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minBet">Aposta Mínima (R$)</Label>
                  <Input
                    id="minBet"
                    type="number"
                    value={settings.minBetAmount}
                    onChange={(e) => setSettings({...settings, minBetAmount: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxBet">Aposta Máxima (R$)</Label>
                  <Input
                    id="maxBet"
                    type="number"
                    value={settings.maxBetAmount}
                    onChange={(e) => setSettings({...settings, maxBetAmount: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="winProb">Probabilidade de Vitória (%)</Label>
                  <Input
                    id="winProb"
                    type="number"
                    value={settings.winProbability}
                    onChange={(e) => setSettings({...settings, winProbability: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="houseFee">Taxa da Casa (%)</Label>
                  <Input
                    id="houseFee"
                    type="number"
                    value={settings.houseFee}
                    onChange={(e) => setSettings({...settings, houseFee: Number(e.target.value)})}
                  />
                </div>
              </div>
              <Button className="w-full">
                <Settings className="w-4 h-4 mr-2" />
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurar Metas de Lucro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.map((stat) => (
                  <div key={stat.chestType} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{scratchCardTypes[stat.chestType as ScratchCardType].name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Lucro atual: R$ {stat.netProfit.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        defaultValue={stat.profitGoal}
                        placeholder="Meta de lucro"
                        className="w-32"
                        onBlur={(e) => {
                          if (e.target.value && Number(e.target.value) !== stat.profitGoal) {
                            updateProfitGoal(stat.chestType, Number(e.target.value));
                          }
                        }}
                      />
                      <Badge variant={stat.goalReached ? "default" : "secondary"}>
                        {stat.goalReached ? "✓" : "Pendente"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScratchCardManager;