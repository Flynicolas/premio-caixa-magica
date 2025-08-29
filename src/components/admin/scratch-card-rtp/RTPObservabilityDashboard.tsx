import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RefreshCw, Download, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { format, subDays } from 'date-fns';

interface RTPOverview {
  game_type: string;
  rtp_target: number;
  cap_enabled: boolean;
  cap_value: number;
  total_bet: number;
  total_paid: number;
  rtp_current: number;
  updated_at: string;
}

interface DailyRounds {
  game_type: string;
  d: string;
  plays: number;
  total_bet: number;
  total_paid: number;
  rtp: number;
}

export function RTPObservabilityDashboard() {
  const [rtpOverview, setRtpOverview] = useState<RTPOverview[]>([]);
  const [dailyRounds, setDailyRounds] = useState<DailyRounds[]>([]);
  const [selectedGameType, setSelectedGameType] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 7),
    to: new Date()
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [selectedGameType, dateRange]);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadRTPOverview(), loadDailyRounds()]);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadRTPOverview = async () => {
    const { data, error } = await supabase
      .from('v_rtp_overview')
      .select('*');

    if (error) throw error;
    setRtpOverview(data || []);
  };

  const loadDailyRounds = async () => {
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

    const { data, error } = await query
      .order('d', { ascending: false })
      .limit(50);

    if (error) throw error;
    setDailyRounds(data || []);
  };

  const exportToCsv = () => {
    const csvData = dailyRounds.map(row => ({
      'Tipo': row.game_type,
      'Data': row.d,
      'Jogadas': row.plays,
      'Total Apostado': row.total_bet,
      'Total Pago': row.total_paid,
      'RTP': `${(row.rtp * 100).toFixed(2)}%`
    }));

    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => row[header as keyof typeof row]).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `rtp-report-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const getRTPStatus = (current: number, target: number) => {
    const difference = Math.abs(current - target);
    if (difference <= 0.02) return { status: 'good', color: 'bg-green-500' };
    if (difference <= 0.05) return { status: 'warning', color: 'bg-yellow-500' };
    return { status: 'danger', color: 'bg-red-500' };
  };

  const getGameTypes = () => {
    return Array.from(new Set(rtpOverview.map(item => item.game_type)));
  };

  if (loading) {
    return <div className="flex justify-center p-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dashboard de Observabilidade RTP</CardTitle>
          <CardDescription>
            Monitore o desempenho do sistema RTP em tempo real
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1">
              <Select value={selectedGameType} onValueChange={setSelectedGameType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  {getGameTypes().map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <DatePickerWithRange
              date={dateRange}
              onDateChange={setDateRange}
            />
            
            <Button variant="outline" onClick={loadData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
            
            <Button variant="outline" onClick={exportToCsv}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rtpOverview.map((item) => {
          const rtpStatus = getRTPStatus(item.rtp_current, item.rtp_target);
          const rtpPercentage = (item.rtp_current / item.rtp_target) * 100;
          
          return (
            <Card key={item.game_type}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{item.game_type}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={rtpStatus.status === 'good' ? 'default' : rtpStatus.status === 'warning' ? 'secondary' : 'destructive'}>
                    {rtpStatus.status === 'good' ? 'Normal' : rtpStatus.status === 'warning' ? 'Atenção' : 'Crítico'}
                  </Badge>
                  {item.cap_enabled && (
                    <Badge variant="outline">
                      CAP R$ {item.cap_value.toFixed(2)}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>RTP Atual</span>
                      <span className="font-medium">
                        {(item.rtp_current * 100).toFixed(2)}%
                      </span>
                    </div>
                    <Progress value={rtpPercentage} className="mt-1" />
                    <div className="text-xs text-muted-foreground mt-1">
                      Alvo: {(item.rtp_target * 100).toFixed(0)}%
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-muted-foreground">Total Apostado</div>
                      <div className="font-medium">R$ {item.total_bet.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Total Pago</div>
                      <div className="font-medium">R$ {item.total_paid.toFixed(2)}</div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-muted-foreground text-xs">Lucro</div>
                    <div className={`font-medium flex items-center gap-1 ${item.total_bet - item.total_paid >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {item.total_bet - item.total_paid >= 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      R$ {(item.total_bet - item.total_paid).toFixed(2)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico Diário</CardTitle>
          <CardDescription>
            Desempenho diário do sistema RTP
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Jogadas</TableHead>
                <TableHead className="text-right">Apostado</TableHead>
                <TableHead className="text-right">Pago</TableHead>
                <TableHead className="text-right">RTP</TableHead>
                <TableHead className="text-right">Lucro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dailyRounds.map((row, index) => {
                const profit = row.total_bet - row.total_paid;
                const rtpOverviewItem = rtpOverview.find(item => item.game_type === row.game_type);
                const rtpTarget = rtpOverviewItem?.rtp_target || 0.5;
                const rtpStatus = getRTPStatus(row.rtp, rtpTarget);
                
                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{row.game_type}</TableCell>
                    <TableCell>{format(new Date(row.d), 'dd/MM/yyyy')}</TableCell>
                    <TableCell className="text-right font-mono">{row.plays}</TableCell>
                    <TableCell className="text-right font-mono">R$ {row.total_bet.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-mono">R$ {row.total_paid.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-mono">{(row.rtp * 100).toFixed(1)}%</span>
                        {rtpStatus.status !== 'good' && (
                          <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className={`text-right font-mono ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      R$ {profit.toFixed(2)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}