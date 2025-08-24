import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useRTPControl } from '@/hooks/useRTPControl';
import { useScratchCardProfitMonitoring } from '@/hooks/useScratchCardProfitMonitoring';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Download, 
  FileText,
  Target,
  DollarSign,
  Activity,
  Calendar,
  PieChart,
  LineChart
} from 'lucide-react';

const AnalyticsReports = () => {
  const { rtpSettings, rtpMetrics, loading: rtpLoading } = useRTPControl();
  const { profitData, summary, loading: profitLoading } = useScratchCardProfitMonitoring();
  const [selectedPeriod, setSelectedPeriod] = useState('24h');

  const loading = rtpLoading || profitLoading;

  // Simulação de dados históricos
  const historicalData = [
    { date: '2024-08-20', sales: 1250.00, rtp: 48.5, profit: 643.75 },
    { date: '2024-08-21', sales: 1420.00, rtp: 52.1, profit: 679.18 },
    { date: '2024-08-22', sales: 1100.00, rtp: 45.8, profit: 596.20 },
    { date: '2024-08-23', sales: 1680.00, rtp: 50.2, profit: 836.64 },
    { date: '2024-08-24', sales: 1950.00, rtp: 49.8, profit: 979.10 },
  ];

  const exportReport = (format: 'excel' | 'pdf') => {
    // Simulação da exportação
    console.log(`Exportando relatório em formato ${format}`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const totalRevenue = historicalData.reduce((sum, day) => sum + day.sales, 0);
  const totalProfit = historicalData.reduce((sum, day) => sum + day.profit, 0);
  const avgRtp = historicalData.reduce((sum, day) => sum + day.rtp, 0) / historicalData.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Relatórios & Análises
          </h2>
          <p className="text-muted-foreground">Performance detalhada e insights do negócio</p>
        </div>
        <div className="flex gap-2">
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="24h">Últimas 24h</option>
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
          </select>
          <Button variant="outline" onClick={() => exportReport('excel')}>
            <Download className="mr-2 h-4 w-4" />
            Excel
          </Button>
          <Button variant="outline" onClick={() => exportReport('pdf')}>
            <FileText className="mr-2 h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      <Tabs defaultValue="financial" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="financial">Performance Financeira</TabsTrigger>
          <TabsTrigger value="trends">Análise de Tendências</TabsTrigger>
          <TabsTrigger value="comparison">Comparativo de Tipos</TabsTrigger>
        </TabsList>

        {/* Performance Financeira */}
        <TabsContent value="financial" className="space-y-6">
          {/* Resumo Executivo */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ {totalRevenue.toFixed(2)}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                  +12.5% vs período anterior
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ {totalProfit.toFixed(2)}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <span>Margem: {((totalProfit / totalRevenue) * 100).toFixed(1)}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">RTP Médio</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgRtp.toFixed(1)}%</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <span>Meta: 50.0%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ROI</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(((totalProfit / (totalRevenue - totalProfit)) * 100)).toFixed(1)}%</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                  Excelente
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance por Tipo */}
          <Card>
            <CardHeader>
              <CardTitle>Performance por Tipo de Raspadinha</CardTitle>
              <CardDescription>Análise detalhada de cada categoria</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profitData.map((data) => {
                  const margin = data.total_sales > 0 ? ((data.total_sales - data.total_prizes_paid) / data.total_sales) * 100 : 0;
                  const targetMargin = 50; // Meta padrão
                  
                  return (
                    <div key={data.scratch_type} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium">{data.scratch_type}</div>
                          <Badge variant={margin >= targetMargin * 0.8 ? "default" : "secondary"}>
                            {margin.toFixed(1)}% margem
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Vendas</div>
                            <div className="font-medium">R$ {data.total_sales.toFixed(2)}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Prêmios</div>
                            <div className="font-medium">R$ {data.total_prizes_paid.toFixed(2)}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Lucro</div>
                            <div className="font-medium">R$ {(data.total_sales - data.total_prizes_paid).toFixed(2)}</div>
                          </div>
                        </div>
                        <Progress value={margin} className="mt-2" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Análise de Tendências */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                Tendências Históricas
              </CardTitle>
              <CardDescription>Evolução das métricas ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Gráfico simulado com dados tabulares */}
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
                    <div>Data</div>
                    <div>Vendas (R$)</div>
                    <div>RTP (%)</div>
                    <div>Lucro (R$)</div>
                  </div>
                  {historicalData.map((day, index) => (
                    <div key={index} className="grid grid-cols-4 gap-4 text-sm py-2 border-b">
                      <div className="font-medium">{new Date(day.date).toLocaleDateString('pt-BR')}</div>
                      <div className="flex items-center">
                        <span>R$ {day.sales.toFixed(2)}</span>
                        {index > 0 && (
                          <span className={`ml-2 text-xs ${
                            day.sales > historicalData[index - 1].sales ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {day.sales > historicalData[index - 1].sales ? '↗' : '↘'}
                          </span>
                        )}
                      </div>
                      <div className={`${day.rtp > 50 ? 'text-red-600' : 'text-green-600'}`}>
                        {day.rtp.toFixed(1)}%
                      </div>
                      <div className="text-green-600 font-medium">
                        R$ {day.profit.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Insights */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Insights Automáticos
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Crescimento de 56% nas vendas nos últimos 5 dias</li>
                    <li>• RTP mantido próximo à meta de 50%</li>
                    <li>• Melhor performance: 24/08 com R$ 1.950 em vendas</li>
                    <li>• Margem de lucro estável entre 48-54%</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comparativo de Tipos */}
        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Análise Comparativa
              </CardTitle>
              <CardDescription>Comparação detalhada entre diferentes tipos de raspadinha</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Comparação de Performance */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {rtpMetrics.map((metric) => {
                    const setting = rtpSettings.find(s => s.scratch_type === metric.scratch_type);
                    if (!setting) return null;

                    const profitMargin = metric.total_sales > 0 ? 
                      ((metric.total_sales - metric.total_prizes) / metric.total_sales) * 100 : 0;

                    return (
                      <Card key={metric.scratch_type} className="relative">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{metric.scratch_type}</CardTitle>
                            <Badge variant="outline">R$ {setting.price.toFixed(2)}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="text-muted-foreground">Vendas</div>
                              <div className="font-bold">R$ {metric.total_sales.toFixed(2)}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Jogos</div>
                              <div className="font-bold">{metric.total_games}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">RTP Atual</div>
                              <div className="font-bold">{metric.current_rtp.toFixed(1)}%</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Margem</div>
                              <div className="font-bold">{profitMargin.toFixed(1)}%</div>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span>Performance vs Target</span>
                              <span>{Math.abs(metric.current_rtp - setting.target_rtp).toFixed(1)}% desvio</span>
                            </div>
                            <Progress 
                              value={Math.min(100, (metric.current_rtp / setting.target_rtp) * 100)} 
                              className="h-2" 
                            />
                          </div>

                          <div className="flex justify-between items-center">
                            <Badge variant={
                              Math.abs(metric.current_rtp - setting.target_rtp) <= 5 ? "default" :
                              Math.abs(metric.current_rtp - setting.target_rtp) <= 15 ? "secondary" : "destructive"
                            }>
                              {Math.abs(metric.current_rtp - setting.target_rtp) <= 5 ? "Excelente" :
                               Math.abs(metric.current_rtp - setting.target_rtp) <= 15 ? "Atenção" : "Crítico"}
                            </Badge>
                            <div className="text-xs text-muted-foreground">
                              Target: {setting.target_rtp}%
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Ranking de Performance */}
                <Card>
                  <CardHeader>
                    <CardTitle>Ranking de Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                {rtpMetrics
                  .map(metric => {
                    const setting = rtpSettings.find(s => s.scratch_type === metric.scratch_type);
                    const profitMargin = metric.total_sales > 0 ? 
                      ((metric.total_sales - metric.total_prizes) / metric.total_sales) * 100 : 0;
                    return { ...metric, setting, profitMargin };
                  })
                        .filter(item => item.setting)
                        .sort((a, b) => b.profitMargin - a.profitMargin)
                        .map((item, index) => (
                          <div key={item.scratch_type} className="flex items-center justify-between p-3 border rounded">
                            <div className="flex items-center gap-3">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                index === 0 ? 'bg-yellow-500 text-white' :
                                index === 1 ? 'bg-gray-400 text-white' :
                                index === 2 ? 'bg-orange-500 text-white' : 'bg-muted'
                              }`}>
                                {index + 1}
                              </div>
                              <div>
                                <div className="font-medium">{item.scratch_type}</div>
                                <div className="text-sm text-muted-foreground">
                                  R$ {item.total_sales.toFixed(2)} • {item.total_games} jogos
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-green-600">
                                {item.profitMargin.toFixed(1)}%
                              </div>
                              <div className="text-xs text-muted-foreground">
                                RTP: {item.current_rtp.toFixed(1)}%
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsReports;