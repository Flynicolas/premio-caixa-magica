import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  FileText, 
  Download, 
  Filter, 
  Calendar as CalendarIcon, 
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  Target,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { scratchCardTypes } from '@/types/scratchCard';
import { useToast } from '@/hooks/use-toast';

interface ReportData {
  period: {
    start: Date;
    end: Date;
  };
  summary: {
    totalSales: number;
    totalPrizes: number;
    netProfit: number;
    totalGames: number;
    uniqueUsers: number;
    houseEdge: number;
  };
  byType: Array<{
    type: string;
    name: string;
    sales: number;
    prizes: number;
    games: number;
    users: number;
    margin: number;
  }>;
  byDay: Array<{
    date: string;
    sales: number;
    prizes: number;
    profit: number;
    games: number;
  }>;
  topPerformers: Array<{
    type: string;
    name: string;
    metric: number;
    category: 'sales' | 'profit' | 'games';
  }>;
  alerts: Array<{
    type: string;
    level: 'low' | 'medium' | 'high';
    message: string;
    value: number;
  }>;
}

const ScratchCardAdvancedReports = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<{start: Date | undefined, end: Date | undefined}>({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 dias atrás
    end: new Date()
  });
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [reportType, setReportType] = useState('complete');
  const { toast } = useToast();

  useEffect(() => {
    generateReport();
  }, [selectedPeriod, selectedTypes]);

  const generateReport = async () => {
    if (!selectedPeriod.start || !selectedPeriod.end) return;

    setLoading(true);
    try {
      const startDate = format(selectedPeriod.start, 'yyyy-MM-dd');
      const endDate = format(selectedPeriod.end, 'yyyy-MM-dd');

      // Buscar dados financeiros
      let query = supabase
        .from('scratch_card_financial_control')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate);

      if (selectedTypes.length > 0) {
        query = query.in('scratch_type', selectedTypes);
      }

      const { data: financialData, error: financialError } = await query;
      if (financialError) throw financialError;

      // Buscar dados de jogos
      const { data: gamesData, error: gamesError } = await supabase
        .from('scratch_card_games')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate + ' 23:59:59');

      if (gamesError) throw gamesError;

      // Processar dados
      const processedData = processReportData(financialData || [], gamesData || []);
      setReportData(processedData);

    } catch (error: any) {
      console.error('Erro ao gerar relatório:', error);
      toast({
        title: "Erro ao gerar relatório",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const processReportData = (financialData: any[], gamesData: any[]): ReportData => {
    // Calcular resumo geral
    const summary = financialData.reduce((acc, item) => ({
      totalSales: acc.totalSales + (item.total_sales || 0),
      totalPrizes: acc.totalPrizes + (item.total_prizes_given || 0),
      totalGames: acc.totalGames + (item.cards_played || 0),
      netProfit: acc.netProfit + ((item.total_sales || 0) - (item.total_prizes_given || 0))
    }), { totalSales: 0, totalPrizes: 0, totalGames: 0, netProfit: 0 });

    const uniqueUsers = new Set(gamesData.map(game => game.user_id)).size;
    const houseEdge = summary.totalSales > 0 ? (summary.netProfit / summary.totalSales) * 100 : 0;

    // Agrupar por tipo
    const typeGroups = financialData.reduce((acc, item) => {
      const type = item.scratch_type;
      if (!acc[type]) {
        acc[type] = {
          type,
          name: scratchCardTypes[type as keyof typeof scratchCardTypes]?.name || type,
          sales: 0,
          prizes: 0,
          games: 0,
          users: 0
        };
      }
      acc[type].sales += item.total_sales || 0;
      acc[type].prizes += item.total_prizes_given || 0;
      acc[type].games += item.cards_played || 0;
      return acc;
    }, {} as any);

    // Contar usuários únicos por tipo
    gamesData.forEach(game => {
      if (typeGroups[game.scratch_type]) {
        typeGroups[game.scratch_type].users = new Set([
          ...(typeGroups[game.scratch_type].userSet || []), 
          game.user_id
        ]).size;
      }
    });

    const byType = Object.values(typeGroups).map((group: any) => ({
      ...group,
      margin: group.sales > 0 ? ((group.sales - group.prizes) / group.sales) * 100 : 0
    }));

    // Agrupar por dia
    const dayGroups = financialData.reduce((acc, item) => {
      const date = item.date;
      if (!acc[date]) {
        acc[date] = { date, sales: 0, prizes: 0, profit: 0, games: 0 };
      }
      acc[date].sales += item.total_sales || 0;
      acc[date].prizes += item.total_prizes_given || 0;
      acc[date].profit += (item.total_sales || 0) - (item.total_prizes_given || 0);
      acc[date].games += item.cards_played || 0;
      return acc;
    }, {} as any);

    const byDay = Object.values(dayGroups) as Array<{
      date: string;
      sales: number;
      prizes: number;
      profit: number;
      games: number;
    }>;
    byDay.sort((a, b) => a.date.localeCompare(b.date));

    // Top performers
    const topPerformers = [
      ...byType.slice(0, 3).map(item => ({
        type: item.type,
        name: item.name,
        metric: item.sales,
        category: 'sales' as const
      })),
      ...byType.sort((a, b) => (b.sales - b.prizes) - (a.sales - a.prizes)).slice(0, 3).map(item => ({
        type: item.type,
        name: item.name,
        metric: item.sales - item.prizes,
        category: 'profit' as const
      }))
    ];

    // Alertas
    const alerts = byType.reduce((acc: any[], item) => {
      if (item.margin < 70) {
        acc.push({
          type: item.type,
          level: 'high' as const,
          message: `Margem muito baixa em ${item.name}`,
          value: item.margin
        });
      } else if (item.margin < 85) {
        acc.push({
          type: item.type,
          level: 'medium' as const,
          message: `Margem abaixo do esperado em ${item.name}`,
          value: item.margin
        });
      }
      return acc;
    }, []);

    return {
      period: {
        start: selectedPeriod.start!,
        end: selectedPeriod.end!
      },
      summary: {
        ...summary,
        uniqueUsers,
        houseEdge
      },
      byType,
      byDay,
      topPerformers,
      alerts
    };
  };

  const exportReport = async (format: 'csv' | 'json') => {
    if (!reportData) return;

    setExporting(true);
    try {
      let content = '';
      let filename = '';

      if (format === 'csv') {
        // Gerar CSV
        const headers = ['Tipo', 'Nome', 'Vendas', 'Prêmios', 'Lucro', 'Margem %', 'Jogos', 'Usuários'];
        const rows = reportData.byType.map(item => [
          item.type,
          item.name,
          item.sales.toFixed(2),
          item.prizes.toFixed(2),
          (item.sales - item.prizes).toFixed(2),
          item.margin.toFixed(2),
          item.games.toString(),
          item.users.toString()
        ]);

        content = [headers, ...rows].map(row => row.join(',')).join('\n');
        filename = `raspadinhas-report-${new Date().toISOString().split('T')[0]}.csv`;
      } else {
        // Gerar JSON
        content = JSON.stringify(reportData, null, 2);
        filename = `raspadinhas-report-${new Date().toISOString().split('T')[0]}.json`;
      }

      // Download
      const blob = new Blob([content], { type: format === 'csv' ? 'text/csv' : 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Relatório exportado",
        description: `Relatório salvo como ${filename}`,
      });

    } catch (error: any) {
      console.error('Erro ao exportar relatório:', error);
      toast({
        title: "Erro ao exportar",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
            <FileText className="w-8 h-8" />
            Relatórios Avançados
          </h1>
          <p className="text-muted-foreground mt-1">
            Análises detalhadas e exportação de dados
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            onClick={() => exportReport('csv')}
            disabled={!reportData || exporting}
            variant="outline"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
          <Button
            onClick={() => exportReport('json')}
            disabled={!reportData || exporting}
            variant="outline"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar JSON
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros de Relatório
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Data Inicial</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedPeriod.start ? format(selectedPeriod.start, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecione'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedPeriod.start}
                    onSelect={(date) => setSelectedPeriod(prev => ({ ...prev, start: date }))}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Data Final</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedPeriod.end ? format(selectedPeriod.end, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecione'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedPeriod.end}
                    onSelect={(date) => setSelectedPeriod(prev => ({ ...prev, end: date }))}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Tipo de Relatório</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="complete">Relatório Completo</SelectItem>
                  <SelectItem value="financial">Apenas Financeiro</SelectItem>
                  <SelectItem value="performance">Apenas Performance</SelectItem>
                  <SelectItem value="security">Apenas Segurança</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Button
                onClick={generateReport}
                disabled={loading || !selectedPeriod.start || !selectedPeriod.end}
                className="w-full mt-6"
              >
                {loading ? <Clock className="w-4 h-4 mr-2 animate-spin" /> : <BarChart3 className="w-4 h-4 mr-2" />}
                Gerar Relatório
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Relatório */}
      {reportData && (
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="summary">Resumo</TabsTrigger>
            <TabsTrigger value="by-type">Por Tipo</TabsTrigger>
            <TabsTrigger value="by-day">Por Dia</TabsTrigger>
            <TabsTrigger value="analysis">Análise</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    Resumo Financeiro
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Vendas Totais:</span>
                      <span className="font-semibold text-green-600">
                        R$ {reportData.summary.totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Prêmios Pagos:</span>
                      <span className="font-semibold text-red-600">
                        R$ {reportData.summary.totalPrizes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Lucro Líquido:</span>
                      <span className="font-semibold text-blue-600">
                        R$ {reportData.summary.netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">House Edge:</span>
                      <span className="font-semibold">{reportData.summary.houseEdge.toFixed(2)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Estatísticas de Uso
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total de Jogos:</span>
                      <span className="font-semibold">{reportData.summary.totalGames.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Usuários Únicos:</span>
                      <span className="font-semibold">{reportData.summary.uniqueUsers.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Jogos por Usuário:</span>
                      <span className="font-semibold">
                        {reportData.summary.uniqueUsers > 0 ? 
                          (reportData.summary.totalGames / reportData.summary.uniqueUsers).toFixed(1) : '0'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Valor Médio/Jogo:</span>
                      <span className="font-semibold">
                        R$ {reportData.summary.totalGames > 0 ? 
                          (reportData.summary.totalSales / reportData.summary.totalGames).toFixed(2) : '0.00'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-600" />
                    Período do Relatório
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Data Inicial:</span>
                      <span className="font-semibold">
                        {format(reportData.period.start, 'dd/MM/yyyy', { locale: ptBR })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Data Final:</span>
                      <span className="font-semibold">
                        {format(reportData.period.end, 'dd/MM/yyyy', { locale: ptBR })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Dias Analisados:</span>
                      <span className="font-semibold">
                        {Math.ceil((reportData.period.end.getTime() - reportData.period.start.getTime()) / (1000 * 60 * 60 * 24)) + 1}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Alertas */}
            {reportData.alerts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                    Alertas e Observações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {reportData.alerts.map((alert, index) => (
                      <div key={index} className={`p-3 rounded border-l-4 ${
                        alert.level === 'high' ? 'border-l-red-500 bg-red-50' :
                        alert.level === 'medium' ? 'border-l-yellow-500 bg-yellow-50' :
                        'border-l-blue-500 bg-blue-50'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{alert.message}</span>
                          <Badge variant={
                            alert.level === 'high' ? 'destructive' :
                            alert.level === 'medium' ? 'secondary' : 'default'
                          }>
                            {alert.value.toFixed(1)}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="by-type" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {reportData.byType.map((type) => (
                <Card key={type.type}>
                  <CardHeader>
                    <CardTitle className="text-lg">{type.name}</CardTitle>
                    <Badge className={
                      type.margin >= 90 ? 'bg-green-100 text-green-800' :
                      type.margin >= 80 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }>
                      Margem: {type.margin.toFixed(1)}%
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Vendas:</span>
                        <span className="font-semibold">R$ {type.sales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Prêmios:</span>
                        <span className="font-semibold">R$ {type.prizes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Lucro:</span>
                        <span className="font-semibold">R$ {(type.sales - type.prizes).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Jogos:</span>
                        <span className="font-semibold">{type.games.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Usuários:</span>
                        <span className="font-semibold">{type.users.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="by-day" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Diária</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {reportData.byDay.map((day, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-4">
                        <span className="font-medium">
                          {format(new Date(day.date), 'dd/MM/yyyy', { locale: ptBR })}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {day.games} jogos
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-green-600">
                          Vendas: R$ {day.sales.toFixed(2)}
                        </span>
                        <span className="text-red-600">
                          Prêmios: R$ {day.prizes.toFixed(2)}
                        </span>
                        <span className="text-blue-600 font-semibold">
                          Lucro: R$ {day.profit.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Top Performers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reportData.topPerformers.slice(0, 5).map((performer, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{performer.name}</span>
                          <Badge variant="outline" className="ml-2">
                            {performer.category === 'sales' ? 'Vendas' : 
                             performer.category === 'profit' ? 'Lucro' : 'Jogos'}
                          </Badge>
                        </div>
                        <span className="font-semibold">
                          {performer.category === 'games' ? 
                            performer.metric.toLocaleString() :
                            `R$ ${performer.metric.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                          }
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Recomendações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reportData.summary.houseEdge > 95 && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-sm text-blue-800">
                          House Edge muito alto ({reportData.summary.houseEdge.toFixed(1)}%). 
                          Considere aumentar prêmios para melhorar a experiência do usuário.
                        </p>
                      </div>
                    )}
                    
                    {reportData.summary.houseEdge < 85 && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded">
                        <p className="text-sm text-red-800">
                          House Edge baixo ({reportData.summary.houseEdge.toFixed(1)}%). 
                          Revise as probabilidades para melhorar a lucratividade.
                        </p>
                      </div>
                    )}

                    {reportData.summary.uniqueUsers > 0 && 
                     reportData.summary.totalGames / reportData.summary.uniqueUsers > 10 && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded">
                        <p className="text-sm text-green-800">
                          Boa retenção de usuários! Média de {(reportData.summary.totalGames / reportData.summary.uniqueUsers).toFixed(1)} jogos por usuário.
                        </p>
                      </div>
                    )}

                    <div className="p-3 bg-gray-50 border border-gray-200 rounded">
                      <p className="text-sm text-gray-800">
                        Para otimizar ainda mais, monitore os horários de pico e ajuste 
                        as promoções de acordo com a demanda.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default ScratchCardAdvancedReports;