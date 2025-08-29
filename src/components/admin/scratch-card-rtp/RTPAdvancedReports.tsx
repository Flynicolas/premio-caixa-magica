import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Download, TrendingUp, TrendingDown, AlertCircle, Activity, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { format, subDays } from 'date-fns';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts';

interface AdvancedReport {
  game_type: string;
  rtp_target: number;
  total_bet: number;
  total_paid: number;
  rtp_current: number;
  profit: number;
  plays_last_7_days: number;
  bet_last_7_days: number;
  paid_last_7_days: number;
  rtp_last_7_days: number;
  plays_last_30_days: number;
  bet_last_30_days: number;
  paid_last_30_days: number;
  rtp_last_30_days: number;
  active_alerts: number;
  critical_alerts: number;
  updated_at: string;
}

interface RTCConvergenceData {
  game_type: string;
  date: string;
  rtp: number;
  target: number;
  plays: number;
  convergence_score: number;
}

export function RTPAdvancedReports() {
  const [reports, setReports] = useState<AdvancedReport[]>([]);
  const [convergenceData, setConvergenceData] = useState<RTCConvergenceData[]>([]);
  const [selectedGameType, setSelectedGameType] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState<'summary' | 'convergence' | 'performance'>('summary');
  const { toast } = useToast();

  useEffect(() => {
    loadAdvancedReports();
  }, [selectedGameType]);

  useEffect(() => {
    if (reportType === 'convergence') {
      loadConvergenceAnalysis();
    }
  }, [reportType, selectedGameType, dateRange]);

  const loadAdvancedReports = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('v_rtp_advanced_reports')
        .select('*');

      if (error) throw error;
      setReports(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar relatórios",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadConvergenceAnalysis = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('v_rounds_daily')
        .select('*');

      if (selectedGameType !== 'all') {
        query = query.eq('game_type', selectedGameType);
      }

      if (dateRange?.from) {
        query = query.gte('d', format(dateRange.from, 'yyyy-MM-dd'));
      }

      if (dateRange?.to) {
        query = query.lte('d', format(dateRange.to, 'yyyy-MM-dd'));
      }

      const { data: dailyData, error } = await query
        .order('d', { ascending: true })
        .limit(100);

      if (error) throw error;

      // Get RTP targets
      const { data: rtpTargets, error: rtpError } = await supabase
        .from('rtp_pots')
        .select('game_type, rtp_target');

      if (rtpError) throw rtpError;

      const targetMap = new Map(rtpTargets?.map(t => [t.game_type, t.rtp_target]) || []);

      // Calculate convergence scores
      const convergenceData = (dailyData || []).map(row => {
        const target = targetMap.get(row.game_type) || 0.5;
        const deviation = Math.abs(row.rtp - target);
        const convergence_score = Math.max(0, 100 - (deviation * 1000)); // Score de 0-100

        return {
          game_type: row.game_type,
          date: row.d,
          rtp: row.rtp,
          target,
          plays: row.plays,
          convergence_score
        };
      });

      setConvergenceData(convergenceData);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar análise de convergência",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const exportDetailedReport = () => {
    const csvData = reports.map(row => ({
      'Tipo': row.game_type,
      'RTP Alvo': `${(row.rtp_target * 100).toFixed(1)}%`,
      'RTP Atual': `${(row.rtp_current * 100).toFixed(2)}%`,
      'RTP 7 dias': `${(row.rtp_last_7_days * 100).toFixed(2)}%`,
      'RTP 30 dias': `${(row.rtp_last_30_days * 100).toFixed(2)}%`,
      'Total Apostado': `R$ ${row.total_bet.toFixed(2)}`,
      'Total Pago': `R$ ${row.total_paid.toFixed(2)}`,
      'Lucro Total': `R$ ${row.profit.toFixed(2)}`,
      'Jogadas 7d': row.plays_last_7_days,
      'Jogadas 30d': row.plays_last_30_days,
      'Alertas Ativos': row.active_alerts,
      'Alertas Críticos': row.critical_alerts,
      'Status': row.critical_alerts > 0 ? 'CRÍTICO' : row.active_alerts > 0 ? 'ATENÇÃO' : 'NORMAL'
    }));

    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => row[header as keyof typeof row]).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `rtp-advanced-report-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const getConvergenceColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getHealthStatus = (report: AdvancedReport) => {
    if (report.critical_alerts > 0) return { status: 'Crítico', color: 'destructive', icon: AlertCircle };
    if (report.active_alerts > 0) return { status: 'Atenção', color: 'secondary', icon: AlertCircle };
    const rtpDeviation = Math.abs(report.rtp_current - report.rtp_target);
    if (rtpDeviation <= 0.02) return { status: 'Excelente', color: 'default', icon: Activity };
    if (rtpDeviation <= 0.05) return { status: 'Bom', color: 'secondary', icon: Activity };
    return { status: 'Regular', color: 'secondary', icon: AlertCircle };
  };

  const gameTypes = Array.from(new Set(reports.map(r => r.game_type)));

  if (loading) {
    return <div className="flex justify-center p-8">Carregando relatórios avançados...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Relatórios Avançados RTP
          </CardTitle>
          <CardDescription>
            Análise detalhada de performance, convergência e alertas do sistema RTP
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1">
              <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de relatório" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Resumo Executivo</SelectItem>
                  <SelectItem value="convergence">Análise de Convergência</SelectItem>
                  <SelectItem value="performance">Performance Detalhada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <Select value={selectedGameType} onValueChange={setSelectedGameType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  {gameTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {reportType === 'convergence' && (
              <DatePickerWithRange
                date={dateRange}
                onDateChange={setDateRange}
              />
            )}
            
            <Button onClick={exportDetailedReport} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {reportType === 'summary' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports
            .filter(r => selectedGameType === 'all' || r.game_type === selectedGameType)
            .map((report) => {
              const health = getHealthStatus(report);
              const StatusIcon = health.icon;
              
              return (
                <Card key={report.game_type}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center justify-between">
                      {report.game_type}
                      <Badge variant={health.color as any}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {health.status}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>RTP Atual vs Alvo</span>
                          <span className="font-mono">
                            {(report.rtp_current * 100).toFixed(1)}% / {(report.rtp_target * 100).toFixed(0)}%
                          </span>
                        </div>
                        <Progress 
                          value={(report.rtp_current / report.rtp_target) * 100} 
                          className="h-2" 
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <div className="text-muted-foreground">Lucro Total</div>
                          <div className={`font-medium flex items-center gap-1 ${report.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {report.profit >= 0 ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            R$ {Math.abs(report.profit).toFixed(0)}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Jogadas 30d</div>
                          <div className="font-medium">{report.plays_last_30_days}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">RTP 7d</div>
                          <div className="font-mono">{(report.rtp_last_7_days * 100).toFixed(1)}%</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">RTP 30d</div>
                          <div className="font-mono">{(report.rtp_last_30_days * 100).toFixed(1)}%</div>
                        </div>
                      </div>
                      
                      {(report.active_alerts > 0 || report.critical_alerts > 0) && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-xs">
                          <div className="font-medium text-yellow-800">Alertas Ativos:</div>
                          <div className="text-yellow-700">
                            {report.critical_alerts > 0 && `${report.critical_alerts} críticos`}
                            {report.critical_alerts > 0 && report.active_alerts > report.critical_alerts && ', '}
                            {report.active_alerts > report.critical_alerts && `${report.active_alerts - report.critical_alerts} normais`}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </div>
      )}

      {reportType === 'convergence' && convergenceData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Análise de Convergência RTP</CardTitle>
            <CardDescription>
              Avaliação de como o RTP está convergindo para o alvo ao longo do tempo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-96 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={convergenceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => format(new Date(value), 'dd/MM')}
                  />
                  <YAxis 
                    domain={[0, 1]}
                    tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                  />
                  <Tooltip 
                    labelFormatter={(value) => format(new Date(value), 'dd/MM/yyyy')}
                    formatter={(value: any, name) => [
                      name === 'rtp' || name === 'target' ? `${(value * 100).toFixed(2)}%` : value,
                      name === 'rtp' ? 'RTP Atual' : name === 'target' ? 'RTP Alvo' : name
                    ]}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="rtp" stroke="#2563eb" strokeWidth={2} name="RTP Atual" />
                  <Line type="monotone" dataKey="target" stroke="#dc2626" strokeWidth={2} strokeDasharray="5 5" name="RTP Alvo" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">Score de Convergência por Tipo</h4>
              {Array.from(new Set(convergenceData.map(d => d.game_type)))
                .filter(type => selectedGameType === 'all' || type === selectedGameType)
                .map(gameType => {
                  const typeData = convergenceData.filter(d => d.game_type === gameType);
                  const avgScore = typeData.reduce((sum, d) => sum + d.convergence_score, 0) / typeData.length;
                  
                  return (
                    <div key={gameType} className="flex items-center gap-4">
                      <div className="w-32 font-medium">{gameType}</div>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Score de Convergência</span>
                          <span>{avgScore.toFixed(1)}/100</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getConvergenceColor(avgScore)}`}
                            style={{ width: `${avgScore}%` }}
                          />
                        </div>
                      </div>
                      <Badge variant={avgScore >= 80 ? 'default' : avgScore >= 60 ? 'secondary' : 'destructive'}>
                        {avgScore >= 80 ? 'Excelente' : avgScore >= 60 ? 'Bom' : 'Necessita Ajuste'}
                      </Badge>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {reportType === 'performance' && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Detalhada</CardTitle>
            <CardDescription>
              Análise completa de performance por tipo de jogo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">RTP Target</TableHead>
                  <TableHead className="text-right">RTP Atual</TableHead>
                  <TableHead className="text-right">Desvio</TableHead>
                  <TableHead className="text-right">Lucro Total</TableHead>
                  <TableHead className="text-right">Jogadas 30d</TableHead>
                  <TableHead className="text-right">RTP 30d</TableHead>
                  <TableHead>Alertas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports
                  .filter(r => selectedGameType === 'all' || r.game_type === selectedGameType)
                  .map((report) => {
                    const health = getHealthStatus(report);
                    const deviation = ((report.rtp_current - report.rtp_target) * 100);
                    
                    return (
                      <TableRow key={report.game_type}>
                        <TableCell className="font-medium">{report.game_type}</TableCell>
                        <TableCell>
                          <Badge variant={health.color as any}>
                            {health.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {(report.rtp_target * 100).toFixed(1)}%
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {(report.rtp_current * 100).toFixed(2)}%
                        </TableCell>
                        <TableCell className={`text-right font-mono ${deviation > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {deviation > 0 ? '+' : ''}{deviation.toFixed(2)}%
                        </TableCell>
                        <TableCell className={`text-right font-mono ${report.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          R$ {report.profit.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {report.plays_last_30_days}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {(report.rtp_last_30_days * 100).toFixed(2)}%
                        </TableCell>
                        <TableCell>
                          {report.active_alerts > 0 ? (
                            <div className="flex gap-1">
                              {report.critical_alerts > 0 && (
                                <Badge variant="destructive" className="text-xs">
                                  {report.critical_alerts} críticos
                                </Badge>
                              )}
                              {report.active_alerts > report.critical_alerts && (
                                <Badge variant="secondary" className="text-xs">
                                  {report.active_alerts - report.critical_alerts} normais
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <Badge variant="outline" className="text-xs">Nenhum</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}