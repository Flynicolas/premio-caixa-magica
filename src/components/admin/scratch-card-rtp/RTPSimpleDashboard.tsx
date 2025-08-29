import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { AlertTriangle, TrendingUp, Activity, RefreshCw, Zap, DollarSign, Target, Gauge } from 'lucide-react';
import { useRTPControl } from '@/hooks/useRTPControl';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function RTPSimpleDashboard() {
  const { rtpSettings, rtpMetrics, loading, updateTargetRTP, toggleRTPEnabled, resetRTPMetrics, executeAutoRefill } = useRTPControl();
  const [tempTargets, setTempTargets] = useState<Record<string, number>>({});
  const [initializing, setInitializing] = useState(false);
  const { toast } = useToast();

  const initializeFreshSystem = async () => {
    try {
      setInitializing(true);
      toast({
        title: "Inicializando sistema",
        description: "Configurando sistema RTP limpo..."
      });

      const { data, error } = await supabase.rpc('initialize_fresh_rtp_system');

      if (error) throw error;

      toast({
        title: "Sistema inicializado",
        description: `${data?.length || 0} tipos de raspadinha configurados`
      });

    } catch (error: any) {
      console.error('Initialization error:', error);
      toast({
        title: "Erro na inicialização",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setInitializing(false);
    }
  };

  const handleTargetUpdate = async (scratchType: string) => {
    const newTarget = tempTargets[scratchType];
    if (newTarget && newTarget >= 10 && newTarget <= 95) {
      await updateTargetRTP(scratchType, newTarget);
      setTempTargets(prev => ({ ...prev, [scratchType]: 0 }));
    }
  };

  const getStatusColor = (enabled: boolean, currentRtp?: number) => {
    if (!enabled) return 'text-muted-foreground';
    if (!currentRtp) return 'text-blue-500';
    if (currentRtp > 80) return 'text-red-500';
    if (currentRtp > 60) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getStatusText = (enabled: boolean, currentRtp?: number) => {
    if (!enabled) return 'Desativado';
    if (!currentRtp) return 'Aguardando dados';
    if (currentRtp > 80) return 'RTP Alto';
    if (currentRtp > 60) return 'RTP Moderado';
    return 'RTP OK';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">RTP Simples</h2>
          <p className="text-muted-foreground">
            Controle essencial do sistema RTP para uso diário
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={initializeFreshSystem}
            variant="outline"
            size="sm"
            disabled={initializing}
          >
            <Zap className="w-4 h-4 mr-2" />
            {initializing ? 'Inicializando...' : 'Inicializar Sistema'}
          </Button>
          <Button
            onClick={executeAutoRefill}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Auto Refill
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-4">
            <Activity className="w-8 h-8 mr-3 text-blue-500" />
            <div>
              <p className="text-sm font-medium">Tipos Ativos</p>
              <p className="text-2xl font-bold">{rtpSettings.filter(s => s.rtp_enabled).length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-4">
            <TrendingUp className="w-8 h-8 mr-3 text-green-500" />
            <div>
              <p className="text-sm font-medium">Total Jogos</p>
              <p className="text-2xl font-bold">{rtpMetrics.reduce((sum, m) => sum + m.total_games, 0)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-4">
            <DollarSign className="w-8 h-8 mr-3 text-yellow-500" />
            <div>
              <p className="text-sm font-medium">Vendas Hoje</p>
              <p className="text-2xl font-bold">
                R$ {rtpMetrics.reduce((sum, m) => sum + m.total_sales, 0).toFixed(0)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-4">
            <Target className="w-8 h-8 mr-3 text-purple-500" />
            <div>
              <p className="text-sm font-medium">RTP Médio</p>
              <p className="text-2xl font-bold">
                {rtpMetrics.length > 0 
                  ? (rtpMetrics.reduce((sum, m) => sum + m.current_rtp, 0) / rtpMetrics.length).toFixed(0)
                  : 0
                }%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scratch Cards Controls */}
      <div className="grid gap-4">
        {rtpSettings.map(setting => {
          const metrics = rtpMetrics.find(m => m.scratch_type === setting.scratch_type);
          
          return (
            <Card key={setting.id} className="relative">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Gauge className={`w-5 h-5 ${getStatusColor(setting.rtp_enabled, metrics?.current_rtp)}`} />
                    <div>
                      <CardTitle className="text-lg">{setting.name}</CardTitle>
                      <CardDescription>R$ {setting.price.toFixed(2)} por jogo</CardDescription>
                    </div>
                  </div>
                  
                  <Badge variant={setting.rtp_enabled ? 'default' : 'secondary'}>
                    {getStatusText(setting.rtp_enabled, metrics?.current_rtp)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                  {/* RTP Enable/Disable */}
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={setting.rtp_enabled}
                      onCheckedChange={(enabled) => toggleRTPEnabled(setting.scratch_type, enabled)}
                    />
                    <span className="text-sm font-medium">
                      {setting.rtp_enabled ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>

                  {/* Target RTP */}
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      placeholder={`${setting.target_rtp}%`}
                      value={tempTargets[setting.scratch_type] || ''}
                      onChange={(e) => setTempTargets(prev => ({
                        ...prev,
                        [setting.scratch_type]: parseInt(e.target.value) || 0
                      }))}
                      className="w-20"
                      min="10"
                      max="95"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleTargetUpdate(setting.scratch_type)}
                      disabled={!tempTargets[setting.scratch_type] || tempTargets[setting.scratch_type] < 10 || tempTargets[setting.scratch_type] > 95}
                    >
                      Ajustar
                    </Button>
                  </div>

                  {/* Current Metrics */}
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">RTP Atual</p>
                    <p className="font-bold text-lg">
                      {metrics?.current_rtp.toFixed(1) || '0.0'}%
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Jogos Hoje</p>
                    <p className="font-bold text-lg">
                      {metrics?.total_games || 0}
                    </p>
                  </div>

                  {/* Reset Action */}
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => resetRTPMetrics(setting.scratch_type)}
                    >
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Reset
                    </Button>
                  </div>
                </div>

                {/* Alert for high RTP */}
                {metrics && metrics.current_rtp > 70 && (
                  <div className="mt-4 flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm text-yellow-800">
                      RTP acima de 70% - considere ajustar ou resetar
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {rtpSettings.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Zap className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Sistema não inicializado</h3>
            <p className="text-muted-foreground text-center mb-4">
              Clique em "Inicializar Sistema" para configurar o RTP fresh start
            </p>
            <Button onClick={initializeFreshSystem} disabled={initializing}>
              <Zap className="w-4 h-4 mr-2" />
              {initializing ? 'Inicializando...' : 'Inicializar Sistema'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}