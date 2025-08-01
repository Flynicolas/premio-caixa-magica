import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Crown, 
  Target, 
  Percent,
  Dice1,
  Dice2,
  Dice3,
  Dice4,
  Dice5,
  Dice6,
  Trophy,
  Star,
  RefreshCw,
  BarChart3
} from 'lucide-react';

interface CasinoStats {
  totalPlayers: number;
  totalChestsOpened: number;
  totalPrizesAwarded: number;
  averageSpendPerUser: number;
  houseEdge: number;
  returnToPlayer: number;
  popularChestType: string;
  biggestWin: number;
  activePlayersToday: number;
  newPlayersToday: number;
}

interface ChestStats {
  chest_type: string;
  total_opened: number;
  total_sales: number;
  total_prizes: number;
  house_edge: number;
  rtp: number;
  popularity_score: number;
}

interface PlayerPattern {
  user_id: string;
  email: string;
  full_name: string;
  total_spent: number;
  chests_opened: number;
  biggest_win: number;
  sessions_count: number;
  avg_session_value: number;
  risk_level: 'low' | 'medium' | 'high';
}

interface RarityStats {
  rarity: string;
  items_won: number;
  total_value: number;
  percentage: number;
}

const CasinoStatisticsPanel = () => {
  const [periodFilter, setPeriodFilter] = useState('month');
  const [loading, setLoading] = useState(true);
  const [casinoStats, setCasinoStats] = useState<CasinoStats | null>(null);
  const [chestStats, setChestStats] = useState<ChestStats[]>([]);
  const [playerPatterns, setPlayerPatterns] = useState<PlayerPattern[]>([]);
  const [rarityStats, setRarityStats] = useState<RarityStats[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchCasinoStatistics();
  }, [periodFilter]);

  const getPeriodDates = () => {
    const now = new Date();
    switch (periodFilter) {
      case 'week':
        return { start: subDays(now, 7), end: now };
      case 'month':
        return { start: subDays(now, 30), end: now };
      case 'quarter':
        return { start: subDays(now, 90), end: now };
      case 'year':
        return { start: subDays(now, 365), end: now };
      default:
        return { start: subDays(now, 30), end: now };
    }
  };

  const fetchCasinoStatistics = async () => {
    try {
      setLoading(true);
      const { start, end } = getPeriodDates();

      // Estatísticas gerais do casino
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, chests_opened, created_at, total_spent');

      const { data: inventoryData } = await supabase
        .from('user_inventory')
        .select('*')
        .gte('won_at', start.toISOString())
        .lte('won_at', end.toISOString());

      const { data: chestsData } = await supabase
        .from('user_chests')
        .select('*')
        .gte('purchased_at', start.toISOString())
        .lte('purchased_at', end.toISOString());

      const { data: financialData } = await supabase
        .from('chest_financial_control')
        .select('*')
        .gte('date', format(start, 'yyyy-MM-dd'))
        .lte('date', format(end, 'yyyy-MM-dd'));

      // Calcular estatísticas principais
      const totalPlayers = profilesData?.length || 0;
      const totalChestsOpened = chestsData?.filter(c => c.status === 'opened').length || 0;
      const totalPrizesAwarded = inventoryData?.length || 0;
      const averageSpendPerUser = profilesData?.reduce((sum, p) => sum + (p.total_spent || 0), 0) / Math.max(totalPlayers, 1) || 0;

      // Calcular house edge e RTP
      const totalSales = financialData?.reduce((sum, f) => sum + (f.total_sales || 0), 0) || 0;
      const totalPrizes = financialData?.reduce((sum, f) => sum + (f.total_prizes_given || 0), 0) || 0;
      const houseEdge = totalSales > 0 ? ((totalSales - totalPrizes) / totalSales) * 100 : 0;
      const returnToPlayer = 100 - houseEdge;

      // Baú mais popular
      const chestTypeCount = chestsData?.reduce((acc, chest) => {
        acc[chest.chest_type] = (acc[chest.chest_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};
      const popularChestType = Object.entries(chestTypeCount).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

      // Maior prêmio
      const { data: itemsData } = await supabase
        .from('items')
        .select('base_value')
        .order('base_value', { ascending: false })
        .limit(1);
      const biggestWin = itemsData?.[0]?.base_value || 0;

      // Jogadores ativos hoje
      const today = format(new Date(), 'yyyy-MM-dd');
      const activePlayersToday = profilesData?.filter(p => 
        p.created_at && format(new Date(p.created_at), 'yyyy-MM-dd') === today
      ).length || 0;

      setCasinoStats({
        totalPlayers,
        totalChestsOpened,
        totalPrizesAwarded,
        averageSpendPerUser,
        houseEdge,
        returnToPlayer,
        popularChestType,
        biggestWin,
        activePlayersToday,
        newPlayersToday: activePlayersToday
      });

      // Estatísticas por tipo de baú
      const chestStatsMap = new Map<string, ChestStats>();
      financialData?.forEach(data => {
        const existing = chestStatsMap.get(data.chest_type) || {
          chest_type: data.chest_type,
          total_opened: 0,
          total_sales: 0,
          total_prizes: 0,
          house_edge: 0,
          rtp: 0,
          popularity_score: 0
        };

        existing.total_opened += data.chests_opened || 0;
        existing.total_sales += data.total_sales || 0;
        existing.total_prizes += data.total_prizes_given || 0;
        
        chestStatsMap.set(data.chest_type, existing);
      });

      // Calcular métricas por baú
      const chestStatsArray = Array.from(chestStatsMap.values()).map(stats => {
        const houseEdge = stats.total_sales > 0 ? ((stats.total_sales - stats.total_prizes) / stats.total_sales) * 100 : 0;
        const rtp = 100 - houseEdge;
        const popularity_score = (stats.total_opened / Math.max(totalChestsOpened, 1)) * 100;

        return {
          ...stats,
          house_edge: houseEdge,
          rtp,
          popularity_score
        };
      });

      setChestStats(chestStatsArray);

      // Análise de padrões de jogadores
      const { data: topPlayersData } = await supabase
        .from('profiles')
        .select('id, email, full_name, total_spent, chests_opened')
        .order('total_spent', { ascending: false })
        .limit(20);

      const playerPatternsArray: PlayerPattern[] = (topPlayersData || []).map(player => {
        const riskLevel = player.total_spent > 1000 ? 'high' : player.total_spent > 500 ? 'medium' : 'low';
        return {
          user_id: player.id,
          email: player.email,
          full_name: player.full_name || 'Usuário',
          total_spent: player.total_spent || 0,
          chests_opened: player.chests_opened || 0,
          biggest_win: 0, // TODO: Calcular maior prêmio do usuário
          sessions_count: 0, // TODO: Implementar contagem de sessões
          avg_session_value: (player.total_spent || 0) / Math.max(player.chests_opened || 1, 1),
          risk_level: riskLevel
        };
      });

      setPlayerPatterns(playerPatternsArray);

      // Estatísticas de raridade
      const rarityCount = inventoryData?.reduce((acc, item) => {
        acc[item.rarity] = (acc[item.rarity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const rarityStatsArray: RarityStats[] = Object.entries(rarityCount).map(([rarity, count]) => ({
        rarity,
        items_won: count,
        total_value: 0, // TODO: Calcular valor total por raridade
        percentage: (count / Math.max(totalPrizesAwarded, 1)) * 100
      }));

      setRarityStats(rarityStatsArray);

    } catch (error: any) {
      console.error('Erro ao buscar estatísticas do casino:', error);
      toast({
        title: "Erro ao carregar estatísticas",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getChestTypeIcon = (chestType: string) => {
    const icons = {
      silver: Dice1,
      gold: Dice2,
      delas: Dice3,
      diamond: Dice4,
      ruby: Dice5,
      premium: Dice6
    };
    const IconComponent = icons[chestType as keyof typeof icons] || Dice1;
    return <IconComponent className="w-5 h-5" />;
  };

  const getChestTypeColor = (chestType: string) => {
    const colors = {
      silver: 'bg-gray-400',
      gold: 'bg-yellow-400',
      delas: 'bg-green-400',
      diamond: 'bg-blue-400',
      ruby: 'bg-red-400',
      premium: 'bg-purple-400'
    };
    return colors[chestType as keyof typeof colors] || 'bg-gray-400';
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'epic': return <Star className="w-4 h-4 text-purple-500" />;
      case 'rare': return <Trophy className="w-4 h-4 text-blue-500" />;
      default: return <Dice1 className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com controles */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Estatísticas do Casino</h3>
          <p className="text-muted-foreground">Métricas avançadas de performance e comportamento</p>
        </div>
        <div className="flex gap-2">
          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Última Semana</SelectItem>
              <SelectItem value="month">Último Mês</SelectItem>
              <SelectItem value="quarter">Último Trimestre</SelectItem>
              <SelectItem value="year">Último Ano</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchCasinoStatistics} size="sm" variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Cards de Estatísticas Principais */}
      {casinoStats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-300">Total de Jogadores</p>
                  <p className="text-2xl font-bold text-blue-200">{casinoStats.totalPlayers}</p>
                </div>
                <Users className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-300">House Edge</p>
                  <p className="text-2xl font-bold text-green-200">{casinoStats.houseEdge.toFixed(1)}%</p>
                </div>
                <Target className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-purple-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-300">RTP</p>
                  <p className="text-2xl font-bold text-purple-200">{casinoStats.returnToPlayer.toFixed(1)}%</p>
                </div>
                <Percent className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 border-yellow-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-300">Baús Abertos</p>
                  <p className="text-2xl font-bold text-yellow-200">{casinoStats.totalChestsOpened}</p>
                </div>
                <Dice1 className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-900/20 to-cyan-800/20 border-cyan-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-cyan-300">Gasto Médio</p>
                  <p className="text-xl font-bold text-cyan-200">R$ {casinoStats.averageSpendPerUser.toFixed(0)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-cyan-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Performance por Tipo de Baú */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Performance por Tipo de Baú
          </CardTitle>
        </CardHeader>
        <CardContent>
          {chestStats.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Dice1 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum dado de baú encontrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {chestStats.map((stats) => (
                <div key={stats.chest_type} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getChestTypeIcon(stats.chest_type)}
                      <Badge className={`${getChestTypeColor(stats.chest_type)} text-white`}>
                        Baú {stats.chest_type}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {stats.total_opened} abertos
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">RTP: {stats.rtp.toFixed(1)}%</p>
                      <p className="text-sm text-muted-foreground">
                        House Edge: {stats.house_edge.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 text-sm mb-2">
                    <div>
                      <p className="text-muted-foreground">Vendas</p>
                      <p className="font-medium">R$ {stats.total_sales.toFixed(0)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Prêmios</p>
                      <p className="font-medium">R$ {stats.total_prizes.toFixed(0)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Popularidade</p>
                      <p className="font-medium">{stats.popularity_score.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Lucro</p>
                      <p className="font-medium text-green-600">
                        R$ {(stats.total_sales - stats.total_prizes).toFixed(0)}
                      </p>
                    </div>
                  </div>
                  
                  <Progress value={Math.min(stats.popularity_score, 100)} className="mt-2" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Análise de Jogadores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Top Jogadores por Gasto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {playerPatterns.slice(0, 10).map((player, index) => (
                <div key={player.user_id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium">{player.full_name}</p>
                      <p className="text-xs text-muted-foreground">{player.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">R$ {player.total_spent.toFixed(0)}</p>
                    <div className="flex items-center gap-1">
                      <Badge className={`${getRiskLevelColor(player.risk_level)} text-white text-xs`}>
                        {player.risk_level}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              Distribuição de Raridade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rarityStats.map((rarity) => (
                <div key={rarity.rarity} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {getRarityIcon(rarity.rarity)}
                      <span className="text-sm font-medium capitalize">{rarity.rarity}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold">{rarity.items_won}</span>
                      <span className="text-xs text-muted-foreground ml-1">
                        ({rarity.percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <Progress value={rarity.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CasinoStatisticsPanel;