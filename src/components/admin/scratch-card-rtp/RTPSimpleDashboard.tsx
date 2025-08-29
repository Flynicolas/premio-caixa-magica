import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRTPControl } from '@/hooks/useRTPControl';
import { Play, RotateCcw, RefreshCw, AlertTriangle, CheckCircle, TrendingUp, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function RTPSimpleDashboard() {
  const { rtpSettings, rtpMetrics, loading, updateTargetRTP, toggleRTPEnabled, resetRTPMetrics, executeAutoRefill } = useRTPControl();
  const [targetInputs, setTargetInputs] = useState<Record<string, number>>({});
  const [initializing, setInitializing] = useState(false);

  // Inicialização do sistema RTP
  const initializeSystem = async () => {
    try {
      setInitializing(true);
      
      toast.loading("Inicializando sistema RTP limpo...", { id: 'init-rtp' });

      const { data, error } = await supabase.rpc('initialize_fresh_rtp_system');

      if (error) throw error;

      toast.success(`Sistema RTP inicializado para ${data?.length || 0} tipos de jogo`, { id: 'init-rtp' });
      
      // Recarregar dados
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error: any) {
      console.error('Erro ao inicializar:', error);
      toast.error(`Erro na inicialização: ${error.message}`, { id: 'init-rtp' });
    } finally {
      setInitializing(false);
    }
  };

  // Obter RTP atual para um tipo
  const getCurrentRTP = (scratchType: string) => {
    const metric = rtpMetrics.find(m => m.scratch_type === scratchType);
    return metric?.current_rtp || 0;
  };

  // Obter cor do status baseado no RTP
  const getRTPStatusColor = (scratchType: string, targetRTP: number) => {
    const currentRTP = getCurrentRTP(scratchType);
    if (currentRTP === 0) return 'text-muted-foreground';
    if (Math.abs(currentRTP - targetRTP) <= 5) return 'text-green-600';
    if (Math.abs(currentRTP - targetRTP) <= 15) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Atualizar RTP target com input local
  const handleUpdateRTP = async (scratchType: string) => {
    const newTarget = targetInputs[scratchType];
    if (newTarget && newTarget >= 30 && newTarget <= 95) {
      await updateTargetRTP(scratchType, newTarget);
      setTargetInputs(prev => ({ ...prev, [scratchType]: 0 }));
    } else {
      toast.error('RTP deve estar entre 30% e 95%');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        <span>Carregando sistema RTP...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com botão de inicialização */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Controle RTP Simplificado</h3>
          <p className="text-sm text-muted-foreground">
            Configuração rápida do Return To Player para operação diária
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={executeAutoRefill}
            disabled={initializing}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refill Automático
          </Button>
          
          <Button 
            variant="secondary" 
            size="sm"
            onClick={initializeSystem}
            disabled={initializing}
          >
            <Play className="w-4 h-4 mr-2" />
            {initializing ? 'Inicializando...' : 'Sistema Limpo'}
          </Button>
        </div>
      </div>

      {/* Alertas críticos */}
      {rtpSettings.some(s => !s.rtp_enabled) && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Atenção:</strong> Alguns tipos de raspadinha estão com RTP desabilitado.
          </AlertDescription>
        </Alert>
      )}

      {/* Cards por tipo de raspadinha */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rtpSettings.map((setting) => {
          const currentRTP = getCurrentRTP(setting.scratch_type);
          const metric = rtpMetrics.find(m => m.scratch_type === setting.scratch_type);
          
          return (
            <Card key={setting.scratch_type} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{setting.name}</CardTitle>
                  <Badge variant={setting.rtp_enabled ? 'default' : 'secondary'}>
                    {setting.rtp_enabled ? 'Ativo' : 'Pausado'}
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  R$ {setting.price.toFixed(2)} • {setting.scratch_type}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Status RTP */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">RTP Atual</div>
                    <div className={`font-mono font-medium ${getRTPStatusColor(setting.scratch_type, setting.target_rtp)}`}>
                      {currentRTP > 0 ? `${currentRTP.toFixed(1)}%` : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Target</div>
                    <div className="font-mono font-medium">
                      {setting.target_rtp.toFixed(0)}%
                    </div>
                  </div>
                </div>

                {/* Métricas básicas */}
                {metric && (
                  <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                    <div>
                      <span className="block">Jogadas: </span>
                      <span className="font-mono">{metric.total_games}</span>
                    </div>
                    <div>
                      <span className="block">Vendas: </span>
                      <span className="font-mono">R$ {metric.total_sales.toFixed(0)}</span>
                    </div>
                  </div>
                )}

                {/* Controles inline */}
                <div className="space-y-3 pt-2 border-t">
                  {/* Toggle RTP */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm">RTP Ativo</span>
                    <Switch
                      checked={setting.rtp_enabled}
                      onCheckedChange={(enabled) => toggleRTPEnabled(setting.scratch_type, enabled)}
                    />
                  </div>

                  {/* Ajuste de Target */}
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder={`${setting.target_rtp}`}
                      value={targetInputs[setting.scratch_type] || ''}
                      onChange={(e) => setTargetInputs(prev => ({ 
                        ...prev, 
                        [setting.scratch_type]: Number(e.target.value) 
                      }))}
                      className="text-xs h-8"
                      min="30"
                      max="95"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateRTP(setting.scratch_type)}
                      disabled={!targetInputs[setting.scratch_type]}
                      className="h-8 px-2"
                    >
                      <Settings className="w-3 h-3" />
                    </Button>
                  </div>

                  {/* Ações rápidas */}
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => resetRTPMetrics(setting.scratch_type)}
                      className="h-7 text-xs flex-1"
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Reset
                    </Button>
                  </div>
                </div>
              </CardContent>

              {/* Indicador visual de status */}
              <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${
                setting.rtp_enabled 
                  ? (Math.abs(currentRTP - setting.target_rtp) <= 10 ? 'bg-green-500' : 'bg-yellow-500')
                  : 'bg-gray-400'
              }`} />
            </Card>
          );
        })}
      </div>

      {/* Painel de status geral */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Status Geral do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Tipos Ativos</div>
              <div className="font-medium">
                {rtpSettings.filter(s => s.rtp_enabled).length} / {rtpSettings.length}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Jogadas Hoje</div>
              <div className="font-medium font-mono">
                {rtpMetrics.reduce((sum, m) => sum + m.total_games, 0)}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Vendas Hoje</div>
              <div className="font-medium font-mono">
                R$ {rtpMetrics.reduce((sum, m) => sum + m.total_sales, 0).toFixed(0)}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Sistema</div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span className="font-medium">Operacional</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instruções rápidas */}
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground space-y-2">
            <div><strong>Controle Diário:</strong></div>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Toggle para ativar/pausar RTP por tipo</li>
              <li>Ajuste target RTP entre 30% e 95%</li>
              <li>Reset limpa métricas dos últimos 30 dias</li>
              <li>Sistema Limpo reinicializa tudo do zero</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}