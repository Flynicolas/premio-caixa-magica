import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import WalletReportsPanel from './WalletReportsPanel';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Calendar,
  DollarSign,
  Target,
  Percent,
  Download,
  RefreshCw
} from 'lucide-react';

interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  chestSales: number;
  scratchSales: number;
  redemptions: number;
  activeUsers: number;
}

interface DailyData {
  date: string;
  revenue: number;
  expenses: number;
  profit: number;
  transactions: number;
}

interface ChestAnalysis {
  chest_type: string;
  total_sales: number;
  total_prizes: number;
  net_profit: number;
  profit_margin: number;
  units_sold: number;
}

const FinancialReportsPanel = () => {
  const [periodFilter, setPeriodFilter] = useState('month');
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [chestAnalysis, setChestAnalysis] = useState<ChestAnalysis[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchFinancialData();
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

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      const { start, end } = getPeriodDates();

      // Resumo Financeiro
      const { data: transactionData } = await supabase
        .from('transactions')
        .select('amount, type, status, created_at')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString())
        .eq('status', 'completed');

      const { data: walletData } = await supabase
        .from('wallet_transactions')
        .select('amount, type, created_at')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString());

      const { data: redemptionData } = await supabase
        .from('money_item_redemptions')
        .select('redemption_amount, created_at')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString())
        .eq('redemption_status', 'completed');

      // Calcular resumo
      const deposits = (transactionData || []).filter(t => t.type === 'deposit');
      const purchases = (walletData || []).filter(t => t.type === 'purchase');
      const redemptions = redemptionData || [];

      const totalRevenue = deposits.reduce((sum, t) => sum + t.amount, 0);
      const totalExpenses = redemptions.reduce((sum, r) => sum + r.redemption_amount, 0);
      const chestSales = Math.abs(purchases.reduce((sum, t) => sum + t.amount, 0));
      const netProfit = totalRevenue - totalExpenses;
      const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

      setSummary({
        totalRevenue,
        totalExpenses,
        netProfit,
        profitMargin,
        chestSales,
        scratchSales: 0, // TODO: Implementar quando houver dados de raspadinha
        redemptions: redemptions.length,
        activeUsers: 0 // TODO: Calcular usuários ativos
      });

      // Dados diários para gráfico
      const dailyMap = new Map<string, DailyData>();
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = format(d, 'yyyy-MM-dd');
        dailyMap.set(dateStr, {
          date: dateStr,
          revenue: 0,
          expenses: 0,
          profit: 0,
          transactions: 0
        });
      }

      // Processar depósitos
      deposits.forEach(t => {
        const dateStr = format(new Date(t.created_at), 'yyyy-MM-dd');
        const data = dailyMap.get(dateStr);
        if (data) {
          data.revenue += t.amount;
          data.transactions += 1;
        }
      });

      // Processar resgates
      redemptions.forEach(r => {
        const dateStr = format(new Date(r.created_at), 'yyyy-MM-dd');
        const data = dailyMap.get(dateStr);
        if (data) {
          data.expenses += r.redemption_amount;
        }
      });

      // Calcular lucro
      Array.from(dailyMap.values()).forEach(data => {
        data.profit = data.revenue - data.expenses;
      });

      setDailyData(Array.from(dailyMap.values()));

      // Análise por tipo de baú
      const { data: chestFinancialData } = await supabase
        .from('chest_financial_control')
        .select('*')
        .gte('date', format(start, 'yyyy-MM-dd'))
        .lte('date', format(end, 'yyyy-MM-dd'));

      if (chestFinancialData) {
        const chestMap = new Map<string, ChestAnalysis>();
        
        chestFinancialData.forEach(data => {
          const existing = chestMap.get(data.chest_type) || {
            chest_type: data.chest_type,
            total_sales: 0,
            total_prizes: 0,
            net_profit: 0,
            profit_margin: 0,
            units_sold: 0
          };
          
          existing.total_sales += data.total_sales || 0;
          existing.total_prizes += data.total_prizes_given || 0;
          existing.net_profit += data.net_profit || 0;
          existing.units_sold += data.chests_opened || 0;
          
          chestMap.set(data.chest_type, existing);
        });

        // Calcular margem de lucro
        Array.from(chestMap.values()).forEach(analysis => {
          analysis.profit_margin = analysis.total_sales > 0 
            ? (analysis.net_profit / analysis.total_sales) * 100 
            : 0;
        });

        setChestAnalysis(Array.from(chestMap.values()));
      }

    } catch (error: any) {
      console.error('Erro ao buscar dados financeiros:', error);
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const exportFinancialReport = () => {
    if (!summary) return;

    const reportData = {
      periodo: periodFilter,
      data_geracao: format(new Date(), 'dd/MM/yyyy HH:mm'),
      resumo: summary,
      dados_diarios: dailyData,
      analise_baus: chestAnalysis
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { 
      type: 'application/json;charset=utf-8;' 
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio_financeiro_${format(new Date(), 'dd-MM-yyyy')}.json`;
    link.click();
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
          <h3 className="text-lg font-semibold">Relatórios Financeiros</h3>
          <p className="text-muted-foreground">Análise detalhada da performance financeira</p>
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
          <Button onClick={fetchFinancialData} size="sm" variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={exportFinancialReport} size="sm" variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Cards de Resumo Financeiro */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-300">Receita Total</p>
                  <p className="text-2xl font-bold text-green-200">R$ {summary.totalRevenue.toFixed(2)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-900/20 to-red-800/20 border-red-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-300">Despesas Total</p>
                  <p className="text-2xl font-bold text-red-200">R$ {summary.totalExpenses.toFixed(2)}</p>
                </div>
                <TrendingDown className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className={`bg-gradient-to-br ${summary.netProfit >= 0 ? 'from-blue-900/20 to-blue-800/20 border-blue-500/30' : 'from-red-900/20 to-red-800/20 border-red-500/30'}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${summary.netProfit >= 0 ? 'text-blue-300' : 'text-red-300'}`}>Lucro Líquido</p>
                  <p className={`text-2xl font-bold ${summary.netProfit >= 0 ? 'text-blue-200' : 'text-red-200'}`}>
                    R$ {summary.netProfit.toFixed(2)}
                  </p>
                </div>
                <DollarSign className={`w-8 h-8 ${summary.netProfit >= 0 ? 'text-blue-400' : 'text-red-400'}`} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-purple-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-300">Margem de Lucro</p>
                  <p className="text-2xl font-bold text-purple-200">{summary.profitMargin.toFixed(1)}%</p>
                </div>
                <Percent className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gráfico de Performance Diária */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Performance Diária
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dailyData.slice(-14).map((day, index) => (
              <div key={day.date} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{format(new Date(day.date), 'dd/MM', { locale: ptBR })}</span>
                  <div className="flex gap-4">
                    <span className="text-green-600">+R$ {day.revenue.toFixed(0)}</span>
                    <span className="text-red-600">-R$ {day.expenses.toFixed(0)}</span>
                    <span className={`font-semibold ${day.profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      R$ {day.profit.toFixed(0)}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <div 
                    className={`h-2 rounded-full ${day.profit >= 0 ? 'bg-blue-600' : 'bg-red-600'}`}
                    style={{ 
                      width: `${Math.min(Math.abs(day.profit) / Math.max(...dailyData.map(d => Math.abs(d.profit))) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Análise por Tipo de Baú */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Análise por Tipo de Baú
          </CardTitle>
        </CardHeader>
        <CardContent>
          {chestAnalysis.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum dado de baú encontrado para o período</p>
            </div>
          ) : (
            <div className="space-y-4">
              {chestAnalysis.map((analysis) => (
                <div key={analysis.chest_type} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge className={`${getChestTypeColor(analysis.chest_type)} text-white`}>
                        Baú {analysis.chest_type}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {analysis.units_sold} unidades vendidas
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">R$ {analysis.net_profit.toFixed(2)}</p>
                      <p className={`text-sm ${analysis.profit_margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {analysis.profit_margin.toFixed(1)}% margem
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Vendas</p>
                      <p className="font-medium">R$ {analysis.total_sales.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Prêmios</p>
                      <p className="font-medium">R$ {analysis.total_prizes.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Lucro</p>
                      <p className={`font-medium ${analysis.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        R$ {analysis.net_profit.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  <Progress 
                    value={Math.min(Math.abs(analysis.profit_margin), 100)} 
                    className="mt-2"
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Painel de Relatórios de Carteira */}
      <WalletReportsPanel />
    </div>
  );
};

export default FinancialReportsPanel;