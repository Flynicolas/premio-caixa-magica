import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Brain, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  DollarSign,
  Target,
  Clock,
  Eye,
  BarChart3,
  Settings
} from 'lucide-react';

interface UserBehaviorData {
  id: string;
  user_id: string;
  behavior_score: number;
  eligibility_tier: string;
  play_pattern: string;
  engagement_level: string;
  days_since_last_win: number;
  win_frequency: number;
  total_games_played: number;
  total_spent: number;
  metadata: any;
}

interface DecisionLog {
  id: string;
  user_id: string;
  scratch_type: string;
  decision_type: string;
  decision_reason: string;
  probability_calculated: number;
  budget_available: number;
  user_score: number;
  financial_context: any;
  user_context: any;
  result_data: any;
  created_at: string;
}

interface ProgrammedPrize {
  id: string;
  scratch_type: string;
  item_id: string;
  priority: number;
  target_user_id?: string;
  scheduled_for?: string;
  expires_at: string;
  status: string;
  current_uses: number;
  max_uses: number;
  metadata: any;
  items?: {
    name: string;
    base_value: number;
    rarity: string;
  };
}

const AdvancedScratchDashboard = () => {
  const [behaviorData, setBehaviorData] = useState<UserBehaviorData[]>([]);
  const [decisionLogs, setDecisionLogs] = useState<DecisionLog[]>([]);
  const [programmedPrizes, setProgrammedPrizes] = useState<ProgrammedPrize[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');
  const { toast } = useToast();

  useEffect(() => {
    loadAllData();
    
    // Atualizar dados a cada 30 segundos
    const interval = setInterval(loadAllData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([
      loadBehaviorData(),
      loadDecisionLogs(),
      loadProgrammedPrizes()
    ]);
    setLoading(false);
  };

  const loadBehaviorData = async () => {
    try {
      const { data, error } = await supabase
        .from('user_behavior_analysis')
        .select('*')
        .eq('analysis_date', new Date().toISOString().split('T')[0])
        .order('behavior_score', { ascending: false })
        .limit(50);

      if (error) throw error;
      setBehaviorData(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar dados de comportamento:', error);
    }
  };

  const loadDecisionLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('scratch_decision_logs')
        .select('*')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setDecisionLogs(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar logs de decisão:', error);
    }
  };

  const loadProgrammedPrizes = async () => {
    try {
      const { data, error } = await supabase
        .from('programmed_prize_queue')
        .select(`
          *,
          items (
            name,
            base_value,
            rarity
          )
        `)
        .eq('status', 'pending')
        .order('priority', { ascending: true });

      if (error) throw error;
      setProgrammedPrizes(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar prêmios programados:', error);
    }
  };

  const getBehaviorStats = () => {
    const total = behaviorData.length;
    const vip = behaviorData.filter(u => u.eligibility_tier === 'vip').length;
    const priority = behaviorData.filter(u => u.eligibility_tier === 'priority').length;
    const whales = behaviorData.filter(u => u.play_pattern === 'whale').length;
    const avgScore = total > 0 ? behaviorData.reduce((sum, u) => sum + u.behavior_score, 0) / total : 0;

    return { total, vip, priority, whales, avgScore };
  };

  const getDecisionStats = () => {
    const total = decisionLogs.length;
    const wins = decisionLogs.filter(log => log.result_data?.has_win).length;
    const manualReleases = decisionLogs.filter(log => log.decision_type === 'manual_release').length;
    const programmed = decisionLogs.filter(log => log.decision_type === 'programmed_prize').length;
    const intelligent = decisionLogs.filter(log => log.decision_type === 'intelligent_win').length;
    const blackouts = decisionLogs.filter(log => log.decision_type === 'budget_block').length;

    return { total, wins, manualReleases, programmed, intelligent, blackouts };
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'vip': return 'bg-yellow-600';
      case 'priority': return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  };

  const getDecisionTypeColor = (type: string) => {
    switch (type) {
      case 'manual_release': return 'bg-purple-600';
      case 'programmed_prize': return 'bg-green-600';
      case 'intelligent_win': return 'bg-blue-600';
      case 'budget_block': return 'bg-red-600';
      case 'loss': return 'bg-gray-600';
      default: return 'bg-gray-500';
    }
  };

  const behaviorStats = getBehaviorStats();
  const decisionStats = getDecisionStats();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando dashboard avançado...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Dashboard Sistema 90/10 Avançado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <BarChart3 className="w-4 h-4" />
            <AlertDescription>
              Monitoramento em tempo real do sistema inteligente de controle, 
              análise comportamental de usuários e logs de decisões.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="behavior">Análise Comportamental</TabsTrigger>
          <TabsTrigger value="decisions">Logs de Decisões</TabsTrigger>
          <TabsTrigger value="programmed">Prêmios Programados</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Usuários Ativos</p>
                    <p className="text-2xl font-bold">{behaviorStats.total}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Score Médio</p>
                    <p className="text-2xl font-bold">{behaviorStats.avgScore.toFixed(0)}</p>
                  </div>
                  <Target className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Decisões (24h)</p>
                    <p className="text-2xl font-bold">{decisionStats.total}</p>
                  </div>
                  <Brain className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Taxa de Vitória</p>
                    <p className="text-2xl font-bold">
                      {decisionStats.total > 0 ? ((decisionStats.wins / decisionStats.total) * 100).toFixed(1) : '0'}%
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Distribuição de Usuários</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">VIP ({behaviorStats.vip})</span>
                  <Badge className="bg-yellow-600">
                    {behaviorStats.total > 0 ? ((behaviorStats.vip / behaviorStats.total) * 100).toFixed(1) : '0'}%
                  </Badge>
                </div>
                <Progress 
                  value={behaviorStats.total > 0 ? (behaviorStats.vip / behaviorStats.total) * 100 : 0} 
                  className="h-2" 
                />

                <div className="flex justify-between items-center">
                  <span className="text-sm">Priority ({behaviorStats.priority})</span>
                  <Badge className="bg-blue-600">
                    {behaviorStats.total > 0 ? ((behaviorStats.priority / behaviorStats.total) * 100).toFixed(1) : '0'}%
                  </Badge>
                </div>
                <Progress 
                  value={behaviorStats.total > 0 ? (behaviorStats.priority / behaviorStats.total) * 100 : 0} 
                  className="h-2" 
                />

                <div className="flex justify-between items-center">
                  <span className="text-sm">Whales ({behaviorStats.whales})</span>
                  <Badge className="bg-purple-600">
                    {behaviorStats.total > 0 ? ((behaviorStats.whales / behaviorStats.total) * 100).toFixed(1) : '0'}%
                  </Badge>
                </div>
                <Progress 
                  value={behaviorStats.total > 0 ? (behaviorStats.whales / behaviorStats.total) * 100 : 0} 
                  className="h-2" 
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tipos de Decisão (24h)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Vitórias Inteligentes</span>
                  <Badge className="bg-blue-600">{decisionStats.intelligent}</Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm">Liberações Manuais</span>
                  <Badge className="bg-purple-600">{decisionStats.manualReleases}</Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm">Prêmios Programados</span>
                  <Badge className="bg-green-600">{decisionStats.programmed}</Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm">Blackouts</span>
                  <Badge className="bg-red-600">{decisionStats.blackouts}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Usuários por Score Comportamental</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {behaviorData.slice(0, 10).map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge className={getTierColor(user.eligibility_tier)}>
                        {user.eligibility_tier.toUpperCase()}
                      </Badge>
                      <div>
                        <p className="font-medium">Score: {user.behavior_score}</p>
                        <p className="text-sm text-muted-foreground">
                          {user.total_games_played} jogos • R$ {user.total_spent.toFixed(2)} gastos
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{user.days_since_last_win} dias sem ganhar</p>
                      <p className="text-sm text-muted-foreground">
                        {user.win_frequency.toFixed(1)}% vitórias
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="decisions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Últimas Decisões do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {decisionLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge className={getDecisionTypeColor(log.decision_type)}>
                        {log.decision_type.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <div>
                        <p className="font-medium">{log.scratch_type.toUpperCase()}</p>
                        <p className="text-sm text-muted-foreground">
                          Score: {log.user_score} • Prob: {(log.probability_calculated * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{formatDateTime(log.created_at)}</p>
                      <p className="text-sm text-muted-foreground">
                        {log.result_data?.has_win ? '🏆 Vitória' : '❌ Derrota'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="programmed" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Fila de Prêmios Programados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {programmedPrizes.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum prêmio programado na fila
                  </p>
                ) : (
                  programmedPrizes.map((prize) => (
                    <div key={prize.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">
                          Prioridade {prize.priority}
                        </Badge>
                        <div>
                          <p className="font-medium">
                            {prize.items?.name || 'Item não encontrado'} - {prize.scratch_type.toUpperCase()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            R$ {prize.items?.base_value.toFixed(2)} • {prize.items?.rarity}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">
                          {prize.current_uses}/{prize.max_uses} usos
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Expira: {formatDateTime(prize.expires_at)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedScratchDashboard;