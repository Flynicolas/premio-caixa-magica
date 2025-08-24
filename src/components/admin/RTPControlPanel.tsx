import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { 
  Settings, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  Target
} from 'lucide-react';
import { useRTPControl } from '@/hooks/useRTPControl';
import { scratchCardTypes } from '@/types/scratchCard';

export function RTPControlPanel() {
  const { 
    rtpSettings, 
    rtpMetrics, 
    loading, 
    updateTargetRTP, 
    toggleRTPEnabled, 
    resetRTPMetrics,
    refreshData
  } = useRTPControl();

  const [editingRTP, setEditingRTP] = useState<Record<string, number>>({});

  const handleRTPChange = (scratchType: string, newRtp: number[]) => {
    setEditingRTP(prev => ({
      ...prev,
      [scratchType]: newRtp[0]
    }));
  };

  const saveRTPChanges = async (scratchType: string) => {
    const newRtp = editingRTP[scratchType];
    if (newRtp !== undefined) {
      await updateTargetRTP(scratchType, newRtp);
      setEditingRTP(prev => {
        const { [scratchType]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const getMetrics = (scratchType: string) => {
    return rtpMetrics.find(m => m.scratch_type === scratchType);
  };

  const getRTPStatus = (targetRtp: number, currentRtp: number) => {
    const diff = Math.abs(targetRtp - currentRtp);
    if (diff <= 5) return { status: 'good', color: 'text-green-600', icon: CheckCircle };
    if (diff <= 15) return { status: 'warning', color: 'text-yellow-600', icon: AlertTriangle };
    return { status: 'critical', color: 'text-red-600', icon: AlertTriangle };
  };

  const getScratchConfig = (scratchType: string) => {
    return scratchCardTypes[scratchType as keyof typeof scratchCardTypes] || {
      name: scratchType.toUpperCase(),
      bgColor: 'bg-gray-500'
    };
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 mx-auto animate-spin text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">Carregando controles RTP...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Target className="w-6 h-6" />
            Controle RTP Individual
          </h2>
          <p className="text-muted-foreground">
            Gerencie o Return to Player (RTP) individualmente para cada tipo de raspadinha
          </p>
        </div>
        
        <Button onClick={refreshData} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Atualizar
        </Button>
      </div>

      {/* Visão geral */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" />
              Total de Tipos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rtpSettings.length}</div>
            <p className="text-xs text-muted-foreground">
              {rtpSettings.filter(s => s.rtp_enabled).length} com RTP ativo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              RTP Médio Target
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rtpSettings.length > 0 
                ? (rtpSettings.reduce((acc, s) => acc + s.target_rtp, 0) / rtpSettings.length).toFixed(1)
                : '0'
              }%
            </div>
            <p className="text-xs text-muted-foreground">
              Média configurada
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Settings className="w-4 h-4 text-purple-500" />
              RTP Atual Médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rtpMetrics.length > 0 
                ? (rtpMetrics.reduce((acc, m) => acc + m.current_rtp, 0) / rtpMetrics.length).toFixed(1)
                : '0'
              }%
            </div>
            <p className="text-xs text-muted-foreground">
              Baseado nos últimos jogos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Controles por tipo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {rtpSettings.map((setting) => {
          const config = getScratchConfig(setting.scratch_type);
          const metrics = getMetrics(setting.scratch_type);
          const currentRtp = metrics?.current_rtp || 0;
          const rtpStatus = getRTPStatus(setting.target_rtp, currentRtp);
          const StatusIcon = rtpStatus.icon;
          const editingValue = editingRTP[setting.scratch_type];
          const hasChanges = editingValue !== undefined && editingValue !== setting.target_rtp;

          return (
            <Card key={setting.id} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${config.bgColor}`} />
                    <span>{config.name}</span>
                    <Badge variant="outline">
                      R$ {setting.price.toFixed(2)}
                    </Badge>
                  </CardTitle>
                  
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`rtp-${setting.scratch_type}`} className="text-sm">
                      RTP Ativo
                    </Label>
                    <Switch
                      id={`rtp-${setting.scratch_type}`}
                      checked={setting.rtp_enabled}
                      onCheckedChange={(checked) => 
                        toggleRTPEnabled(setting.scratch_type, checked)
                      }
                    />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Status RTP */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <StatusIcon className={`w-4 h-4 ${rtpStatus.color}`} />
                      <span className="text-sm font-medium">Status RTP</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Target: {setting.target_rtp}% | Atual: {currentRtp.toFixed(1)}%
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">
                      {currentRtp > setting.target_rtp ? (
                        <TrendingUp className="w-5 h-5 text-green-500" />
                      ) : currentRtp < setting.target_rtp ? (
                        <TrendingDown className="w-5 h-5 text-red-500" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Controle de RTP */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      RTP Target: {editingValue ?? setting.target_rtp}%
                    </Label>
                    {hasChanges && (
                      <Button 
                        size="sm" 
                        onClick={() => saveRTPChanges(setting.scratch_type)}
                        className="gap-1"
                      >
                        <CheckCircle className="w-3 h-3" />
                        Salvar
                      </Button>
                    )}
                  </div>
                  
                  <Slider
                    value={[editingValue ?? setting.target_rtp]}
                    onValueChange={(value) => handleRTPChange(setting.scratch_type, value)}
                    max={95}
                    min={5}
                    step={5}
                    disabled={!setting.rtp_enabled}
                    className="w-full"
                  />
                  
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>5%</span>
                    <span>50%</span>
                    <span>95%</span>
                  </div>
                </div>

                {/* Métricas */}
                {metrics && (
                  <div className="grid grid-cols-3 gap-3 pt-3 border-t">
                    <div className="text-center">
                      <div className="text-lg font-bold">{metrics.total_games}</div>
                      <div className="text-xs text-muted-foreground">Jogos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold">R$ {metrics.total_sales.toFixed(0)}</div>
                      <div className="text-xs text-muted-foreground">Vendas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold">R$ {metrics.total_prizes.toFixed(0)}</div>
                      <div className="text-xs text-muted-foreground">Prêmios</div>
                    </div>
                  </div>
                )}

                {/* Ações */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => resetRTPMetrics(setting.scratch_type)}
                    className="flex-1 gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Reset Métricas
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}