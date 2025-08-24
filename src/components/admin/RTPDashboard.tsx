import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useRTPControl } from '@/hooks/useRTPControl';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  AlertTriangle,
  Activity,
  Zap,
  Settings
} from 'lucide-react';

const RTPDashboard = () => {
  const { rtpSettings, rtpMetrics, loading, updateTargetRTP } = useRTPControl();

  if (loading) {
    return (
      <div className="grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
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

  const totalGames = rtpMetrics.reduce((sum, metric) => sum + metric.total_games, 0);
  const totalSales = rtpMetrics.reduce((sum, metric) => sum + metric.total_sales, 0);
  const totalPrizes = rtpMetrics.reduce((sum, metric) => sum + metric.total_prizes, 0);
  const globalRTP = totalSales > 0 ? (totalPrizes / totalSales) * 100 : 0;
  const averageTarget = rtpSettings.reduce((sum, setting) => sum + setting.target_rtp, 0) / rtpSettings.length;

  // Alertas críticos
  const criticalAlerts = rtpMetrics.filter(metric => {
    const setting = rtpSettings.find(s => s.scratch_type === metric.scratch_type);
    return setting && Math.abs(metric.current_rtp - setting.target_rtp) > 15;
  });

  const handleQuickAdjustRTP = async (scratchType: string, direction: 'up' | 'down') => {
    const setting = rtpSettings.find(s => s.scratch_type === scratchType);
    if (!setting) return;
    
    const adjustment = direction === 'up' ? 5 : -5;
    const newRtp = Math.max(10, Math.min(90, setting.target_rtp + adjustment));
    await updateTargetRTP(scratchType, newRtp);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Dashboard RTP</h2>
          <p className="text-muted-foreground">Visão geral consolidada do sistema</p>
        </div>
        <Button variant="outline" size="sm">
          <Activity className="mr-2 h-4 w-4" />
          Tempo Real
        </Button>
      </div>

      {/* Alertas Críticos */}
      {criticalAlerts.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {criticalAlerts.length} tipo(s) de raspadinha com RTP fora do alvo: {criticalAlerts.map(alert => alert.scratch_type).join(', ')}
          </AlertDescription>
        </Alert>
      )}

      {/* Métricas Globais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">RTP Global</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalRTP.toFixed(1)}%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span>Target: {averageTarget.toFixed(1)}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas Totais</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalSales.toFixed(2)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3" />
              {totalGames} jogos
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prêmios Pagos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalPrizes.toFixed(2)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span>Lucro: R$ {(totalSales - totalPrizes).toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tipos Ativos</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rtpSettings.filter(s => s.rtp_enabled).length}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span>de {rtpSettings.length} configurados</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mapa de Calor RTP */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Mapa de Calor RTP
          </CardTitle>
          <CardDescription>
            Status em tempo real de todos os tipos de raspadinha
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rtpMetrics.map((metric) => {
              const setting = rtpSettings.find(s => s.scratch_type === metric.scratch_type);
              if (!setting) return null;

              const deviation = Math.abs(metric.current_rtp - setting.target_rtp);
              const status = deviation <= 5 ? 'good' : deviation <= 15 ? 'warning' : 'critical';
              
              return (
                <Card key={metric.scratch_type} className={`relative ${
                  status === 'critical' ? 'border-destructive' : 
                  status === 'warning' ? 'border-warning' : 'border-success'
                }`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{metric.scratch_type}</CardTitle>
                      <Badge variant={
                        status === 'good' ? 'default' : 
                        status === 'warning' ? 'secondary' : 'destructive'
                      }>
                        {status === 'good' ? 'OK' : status === 'warning' ? 'ATENÇÃO' : 'CRÍTICO'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Atual: {metric.current_rtp.toFixed(1)}%</span>
                      <span>Target: {setting.target_rtp}%</span>
                    </div>
                    <Progress value={metric.current_rtp} className="h-2" />
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleQuickAdjustRTP(metric.scratch_type, 'down')}
                        className="flex-1"
                      >
                        <TrendingDown className="h-3 w-3 mr-1" />
                        -5%
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleQuickAdjustRTP(metric.scratch_type, 'up')}
                        className="flex-1"
                      >
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +5%
                      </Button>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      {metric.total_games} jogos • R$ {metric.total_sales.toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4">
              <div className="text-center">
                <Target className="h-6 w-6 mx-auto mb-2" />
                <div className="font-medium">Ajuste Automático</div>
                <div className="text-xs text-muted-foreground">Corrigir RTPs fora do alvo</div>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4">
              <div className="text-center">
                <Activity className="h-6 w-6 mx-auto mb-2" />
                <div className="font-medium">Reset Métricas</div>
                <div className="text-xs text-muted-foreground">Zerar dados do período</div>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4">
              <div className="text-center">
                <Settings className="h-6 w-6 mx-auto mb-2" />
                <div className="font-medium">Configurações</div>
                <div className="text-xs text-muted-foreground">Ajustes avançados</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RTPDashboard;