import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Settings, TrendingUp, RefreshCw, Target, DollarSign } from 'lucide-react';
import { useRTPControl } from '@/hooks/useRTPControl';

export function RTPSettingsPanel() {
  const { 
    rtpSettings, 
    rtpMetrics, 
    loading, 
    updateTargetRTP, 
    toggleRTPEnabled,
    resetRTPMetrics,
    executeAutoRefill 
  } = useRTPControl();
  
  const [editingTargets, setEditingTargets] = useState<Record<string, number>>({});

  const handleUpdateTarget = async (scratchType: string) => {
    const target = editingTargets[scratchType];
    if (!target || target < 0 || target > 100) return;
    
    await updateTargetRTP(scratchType, target);
    setEditingTargets(prev => {
      const { [scratchType]: _, ...rest } = prev;
      return rest;
    });
  };

  const getTypeDisplayName = (type: string) => {
    const names: Record<string, string> = {
      'pix': 'PIX',
      'sorte': 'Sorte',
      'dupla': 'Dupla Sorte',
      'ouro': 'Ouro',
      'diamante': 'Diamante',
      'premium': 'Premium'
    };
    return names[type] || type;
  };

  const getCurrentRTP = (scratchType: string) => {
    const metric = rtpMetrics.find(m => m.scratch_type === scratchType);
    return metric?.current_rtp || 0;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Carregando configurações RTP...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações do Sistema RTP
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Sistema de Return to Player ativo para controle inteligente de prêmios
              </p>
            </div>
            <Button onClick={executeAutoRefill} variant="outline" size="sm">
              <DollarSign className="h-4 w-4 mr-2" />
              Executar Recarga
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Configurações Individuais */}
      <div className="grid gap-6">
        {rtpSettings.map((setting) => {
          const currentRTP = getCurrentRTP(setting.scratch_type);
          const rtpDifference = currentRTP - setting.target_rtp;
          
          return (
            <Card key={setting.scratch_type} className="border-l-4 border-l-blue-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">
                      {getTypeDisplayName(setting.scratch_type)}
                    </h3>
                    <Badge variant="outline">
                      R$ {setting.price.toFixed(2)}
                    </Badge>
                    <Badge 
                      variant={setting.rtp_enabled ? "default" : "secondary"}
                      className={setting.rtp_enabled ? "bg-green-100 text-green-800" : ""}
                    >
                      {setting.rtp_enabled ? 'RTP ATIVO' : 'RTP INATIVO'}
                    </Badge>
                  </div>
                  <Switch
                    checked={setting.rtp_enabled}
                    onCheckedChange={(checked) => toggleRTPEnabled(setting.scratch_type, checked)}
                  />
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Status RTP Atual */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <TrendingUp className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                    <div className="text-lg font-semibold">{setting.target_rtp.toFixed(0)}%</div>
                    <p className="text-xs text-muted-foreground">RTP Target</p>
                  </div>
                  <div className="text-center">
                    <Target className="h-5 w-5 mx-auto mb-1 text-green-600" />
                    <div className="text-lg font-semibold">{currentRTP.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground">RTP Atual</p>
                  </div>
                  <div className="text-center">
                    <div className={`text-lg font-semibold ${
                      Math.abs(rtpDifference) <= 5 ? 'text-green-600' : 
                      Math.abs(rtpDifference) <= 15 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {rtpDifference > 0 ? '+' : ''}{rtpDifference.toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">Diferença</p>
                  </div>
                </div>

                <Separator />

                {/* Configurar Target RTP */}
                <div className="space-y-2">
                  <Label>RTP Target (%)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder={setting.target_rtp.toString()}
                      value={editingTargets[setting.scratch_type] || ''}
                      onChange={(e) => {
                        setEditingTargets(prev => ({
                          ...prev,
                          [setting.scratch_type]: Number(e.target.value)
                        }));
                      }}
                    />
                    <Button 
                      size="sm" 
                      onClick={() => handleUpdateTarget(setting.scratch_type)}
                      disabled={!editingTargets[setting.scratch_type]}
                    >
                      Atualizar
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Recomendado: 50% (R$ 100 vendas = R$ 50 prêmios)
                  </p>
                </div>

                {/* Status de Saúde */}
                {setting.rtp_enabled && (
                  <div className={`rounded-lg p-3 ${
                    Math.abs(rtpDifference) <= 5 
                      ? 'bg-green-50 border border-green-200' 
                      : Math.abs(rtpDifference) <= 15 
                      ? 'bg-yellow-50 border border-yellow-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className={`text-sm font-medium ${
                      Math.abs(rtpDifference) <= 5 
                        ? 'text-green-800' 
                        : Math.abs(rtpDifference) <= 15 
                        ? 'text-yellow-800' 
                        : 'text-red-800'
                    }`}>
                      {Math.abs(rtpDifference) <= 5 && '✅ RTP saudável - dentro da meta'}
                      {Math.abs(rtpDifference) > 5 && Math.abs(rtpDifference) <= 15 && '⚠️ RTP em atenção - pequeno desvio'}
                      {Math.abs(rtpDifference) > 15 && '🚨 RTP crítico - desvio significativo'}
                    </div>
                  </div>
                )}

                {/* Ações */}
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      if (confirm(`Resetar métricas RTP de ${getTypeDisplayName(setting.scratch_type)}?`)) {
                        resetRTPMetrics(setting.scratch_type);
                      }
                    }}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset Métricas
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Informações do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Como Funciona o RTP</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• <strong>RTP (Return to Player):</strong> Percentual que retorna aos jogadores</p>
          <p>• <strong>Target 50%:</strong> R$ 100 vendas → R$ 50 em prêmios (50% lucro)</p>
          <p>• <strong>Sistema Inteligente:</strong> Ajusta probabilidades automaticamente</p>
          <p>• <strong>Orçamento Automático:</strong> Recarrega quando necessário</p>
          <p>• <strong>Monitoramento:</strong> Alertas quando RTP sai da meta por mais de 15%</p>
        </CardContent>
      </Card>
    </div>
  );
}