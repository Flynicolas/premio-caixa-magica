import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertTriangle, 
  Eye, 
  BarChart3,
  Users,
  DollarSign,
  Activity,
  Brain,
  Shield,
  FileText
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { scratchCardTypes } from '@/types/scratchCard';
import { useToast } from '@/hooks/use-toast';

interface DashboardMetrics {
  totalSales: number;
  totalPrizes: number;
  netProfit: number;
  totalGames: number;
  houseEdge: number;
  activeUsers: number;
  avgGameValue: number;
  profitGoalProgress: number;
}

interface TypePerformance {
  type: string;
  name: string;
  sales: number;
  prizes: number;
  games: number;
  margin: number;
  trend: 'up' | 'down' | 'stable';
  riskLevel: 'low' | 'medium' | 'high';
}

interface SecurityAlert {
  id: string;
  type: string;
  level: 'low' | 'medium' | 'high';
  message: string;
  timestamp: string;
  isResolved: boolean;
}

interface SuggestedAction {
  id: string;
  type: 'optimization' | 'risk' | 'opportunity';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  action: string;
}

const ScratchCardCentralDashboard = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [typePerformance, setTypePerformance] = useState<TypePerformance[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [suggestedActions, setSuggestedActions] = useState<SuggestedAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('today');
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
    
    const interval = setInterval(loadDashboardData, 30000); // Atualiza a cada 30s
    
    return () => clearInterval(interval);
  }, [selectedTimeRange]);

  const loadDashboardData = async () => {
    try {
      await Promise.all([
        loadMetrics(),
        loadTypePerformance(),
        loadSecurityAlerts(),
        generateSuggestedActions()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      toast({
        title: "Erro ao carregar dashboard",
        description: "Não foi possível carregar os dados do dashboard",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMetrics = async () => {
    const dateFilter = getDateFilter();
    
    const { data: financialData, error } = await supabase
      .from('scratch_card_financial_control')
      .select('*')
      .gte('date', dateFilter.start)
      .lte('date', dateFilter.end);

    if (error) throw error;

    const totals = financialData?.reduce((acc, item) => ({
      totalSales: acc.totalSales + (item.total_sales || 0),
      totalPrizes: acc.totalPrizes + (item.total_prizes_given || 0),
      totalGames: acc.totalGames + (item.cards_played || 0),
      totalGoal: acc.totalGoal + (item.profit_goal || 0)
    }), { totalSales: 0, totalPrizes: 0, totalGames: 0, totalGoal: 0 }) || 
    { totalSales: 0, totalPrizes: 0, totalGames: 0, totalGoal: 0 };

    const netProfit = totals.totalSales - totals.totalPrizes;
    const houseEdge = totals.totalSales > 0 ? (netProfit / totals.totalSales) * 100 : 0;
    const avgGameValue = totals.totalGames > 0 ? totals.totalSales / totals.totalGames : 0;
    const profitGoalProgress = totals.totalGoal > 0 ? (netProfit / totals.totalGoal) * 100 : 0;

    setMetrics({
      totalSales: totals.totalSales,
      totalPrizes: totals.totalPrizes,
      netProfit,
      totalGames: totals.totalGames,
      houseEdge,
      activeUsers: Math.floor(totals.totalGames * 0.7), // Estimativa
      avgGameValue,
      profitGoalProgress
    });
  };

  const loadTypePerformance = async () => {
    const dateFilter = getDateFilter();
    
    const { data, error } = await supabase
      .from('scratch_card_financial_control')
      .select('*')
      .gte('date', dateFilter.start)
      .lte('date', dateFilter.end)
      .order('total_sales', { ascending: false });

    if (error) throw error;

    const performance: TypePerformance[] = data?.map(item => {
      const margin = item.total_sales > 0 ? 
        ((item.total_sales - item.total_prizes_given) / item.total_sales) * 100 : 0;
      
      const config = scratchCardTypes[item.scratch_type as keyof typeof scratchCardTypes];
      
      return {
        type: item.scratch_type,
        name: config?.name || item.scratch_type,
        sales: item.total_sales || 0,
        prizes: item.total_prizes_given || 0,
        games: item.cards_played || 0,
        margin,
        trend: margin >= 90 ? 'up' : margin >= 80 ? 'stable' : 'down' as 'up' | 'down' | 'stable',
        riskLevel: margin < 70 ? 'high' : margin < 85 ? 'medium' : 'low' as 'low' | 'medium' | 'high'
      };
    }) || [];

    setTypePerformance(performance);
  };

  const loadSecurityAlerts = async () => {
    const { data, error } = await supabase
      .from('scratch_card_security_alerts')
      .select('*')
      .eq('is_resolved', false)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Erro ao carregar alertas:', error);
      return;
    }

    const alerts: SecurityAlert[] = data?.map(alert => ({
      id: alert.id,
      type: alert.alert_type,
      level: alert.alert_level as 'low' | 'medium' | 'high',
      message: `${alert.alert_type}: ${JSON.stringify(alert.alert_data)}`,
      timestamp: alert.created_at,
      isResolved: alert.is_resolved
    })) || [];

    setSecurityAlerts(alerts);
  };

  const generateSuggestedActions = async () => {
    const actions: SuggestedAction[] = [];

    // Analisar performance dos tipos
    typePerformance.forEach(perf => {
      if (perf.margin < 80) {
        actions.push({
          id: `risk-${perf.type}`,
          type: 'risk',
          priority: perf.margin < 70 ? 'high' : 'medium',
          title: `Margem baixa em ${perf.name}`,
          description: `Margem de lucro em ${perf.margin.toFixed(1)}%, abaixo do esperado`,
          action: 'Revisar probabilidades ou reduzir prêmios'
        });
      }

      if (perf.games > 100 && perf.margin > 95) {
        actions.push({
          id: `opportunity-${perf.type}`,
          type: 'opportunity',
          priority: 'medium',
          title: `Oportunidade em ${perf.name}`,
          description: `Alta demanda com margem excelente (${perf.margin.toFixed(1)}%)`,
          action: 'Considerar aumentar prêmios ou promoções'
        });
      }
    });

    setSuggestedActions(actions);
  };

  const getDateFilter = () => {
    const today = new Date();
    const start = new Date(today);
    
    switch (selectedTimeRange) {
      case 'week':
        start.setDate(today.getDate() - 7);
        break;
      case 'month':
        start.setMonth(today.getMonth() - 1);
        break;
      case 'today':
      default:
        // Hoje apenas
        break;
    }

    return {
      start: start.toISOString().split('T')[0],
      end: today.toISOString().split('T')[0]
    };
  };

  const getStatusColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-green-500 bg-green-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando dashboard central...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
            <Brain className="w-8 h-8" />
            Central de Inteligência - Raspadinhas
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitoramento em tempo real e gestão inteligente
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant={selectedTimeRange === 'today' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTimeRange('today')}
          >
            Hoje
          </Button>
          <Button
            variant={selectedTimeRange === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTimeRange('week')}
          >
            7 Dias
          </Button>
          <Button
            variant={selectedTimeRange === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTimeRange('month')}
          >
            30 Dias
          </Button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vendas Totais</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {metrics?.totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Lucro Líquido</p>
                <p className="text-2xl font-bold text-blue-600">
                  R$ {metrics?.netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">House Edge</p>
                <p className="text-2xl font-bold text-purple-600">
                  {metrics?.houseEdge.toFixed(1)}%
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Jogos Totais</p>
                <p className="text-2xl font-bold text-orange-600">{metrics?.totalGames}</p>
              </div>
              <Activity className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Conteúdo */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="performance">Performance por Tipo</TabsTrigger>
          <TabsTrigger value="security">Alertas de Segurança</TabsTrigger>
          <TabsTrigger value="intelligence">Sugestões Inteligentes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Progresso da Meta de Lucro
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Progresso Geral</span>
                    <span className="font-bold">{metrics?.profitGoalProgress.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics?.profitGoalProgress} className="h-3" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Estatísticas de Jogadores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Jogadores Ativos (estimado)</span>
                    <span className="font-semibold">{metrics?.activeUsers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Valor Médio por Jogo</span>
                    <span className="font-semibold">
                      R$ {metrics?.avgGameValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {typePerformance.map((perf) => (
              <Card key={perf.type} className={`border-l-4 ${
                perf.riskLevel === 'high' ? 'border-l-red-500' : 
                perf.riskLevel === 'medium' ? 'border-l-yellow-500' : 'border-l-green-500'
              }`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{perf.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(perf.riskLevel)}>
                        {perf.riskLevel === 'high' ? 'Alto Risco' : 
                         perf.riskLevel === 'medium' ? 'Médio Risco' : 'Baixo Risco'}
                      </Badge>
                      {perf.trend === 'up' ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : perf.trend === 'down' ? (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      ) : (
                        <Activity className="w-4 h-4 text-yellow-600" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Vendas:</span>
                      <span className="font-medium">R$ {perf.sales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Margem:</span>
                      <span className={`font-medium ${
                        perf.margin >= 90 ? 'text-green-600' : 
                        perf.margin >= 80 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {perf.margin.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Jogos:</span>
                      <span className="font-medium">{perf.games}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          {securityAlerts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Shield className="w-12 h-12 mx-auto mb-4 text-green-600" />
                <h3 className="text-lg font-medium text-green-600 mb-2">Sistema Seguro</h3>
                <p className="text-muted-foreground">Nenhum alerta de segurança ativo no momento</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {securityAlerts.map((alert) => (
                <Alert key={alert.id} className={
                  alert.level === 'high' ? 'border-red-500 bg-red-50' :
                  alert.level === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                  'border-blue-500 bg-blue-50'
                }>
                  <AlertTriangle className={`h-4 w-4 ${
                    alert.level === 'high' ? 'text-red-600' :
                    alert.level === 'medium' ? 'text-yellow-600' :
                    'text-blue-600'
                  }`} />
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <div>
                        <strong>{alert.type}</strong>
                        <p className="text-sm mt-1">{alert.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(alert.timestamp).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <Badge variant={
                        alert.level === 'high' ? 'destructive' :
                        alert.level === 'medium' ? 'secondary' : 'default'
                      }>
                        {alert.level.toUpperCase()}
                      </Badge>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="intelligence" className="space-y-4">
          {suggestedActions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Brain className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                <h3 className="text-lg font-medium text-blue-600 mb-2">Sistema Otimizado</h3>
                <p className="text-muted-foreground">Nenhuma sugestão de otimização no momento</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {suggestedActions.map((action) => (
                <Card key={action.id} className={`border-l-4 ${getPriorityColor(action.priority)}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{action.title}</CardTitle>
                      <Badge variant={
                        action.priority === 'high' ? 'destructive' :
                        action.priority === 'medium' ? 'secondary' : 'default'
                      }>
                        {action.priority === 'high' ? 'Alta' :
                         action.priority === 'medium' ? 'Média' : 'Baixa'} Prioridade
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{action.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="gap-1">
                        {action.type === 'optimization' && <BarChart3 className="w-3 h-3" />}
                        {action.type === 'risk' && <AlertTriangle className="w-3 h-3" />}
                        {action.type === 'opportunity' && <TrendingUp className="w-3 h-3" />}
                        {action.type === 'optimization' ? 'Otimização' :
                         action.type === 'risk' ? 'Risco' : 'Oportunidade'}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <Eye className="w-3 h-3 mr-1" />
                        Ver Detalhes
                      </Button>
                    </div>
                    <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                      <strong>Ação sugerida:</strong> {action.action}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScratchCardCentralDashboard;