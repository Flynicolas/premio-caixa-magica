import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, TrendingUp, RefreshCw, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RTPHealth {
  scratch_type: string;
  current_rtp: number;
  target_rtp: number;
  deviation: number;
  total_sales: number;
  total_prizes: number;
  health_status: string;
}

export function RTPHealthMonitor() {
  const [rtpData, setRtpData] = useState<RTPHealth[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefillLoading, setAutoRefillLoading] = useState(false);

  const loadRTPHealth = async () => {
    try {
      const { data, error } = await supabase.rpc('monitor_rtp_health');
      if (error) throw error;
      setRtpData(data || []);
    } catch (error) {
      console.error('Erro ao carregar saúde RTP:', error);
      toast.error('Erro ao carregar dados de RTP');
    }
  };

  const executeAutoRefill = async () => {
    try {
      setAutoRefillLoading(true);
      const { error } = await supabase.rpc('auto_refill_scratch_budgets');
      if (error) throw error;
      
      toast.success('Orçamentos recarregados automaticamente');
      await loadRTPHealth();
    } catch (error) {
      console.error('Erro ao executar recarga automática:', error);
      toast.error('Erro ao recarregar orçamentos');
    } finally {
      setAutoRefillLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await loadRTPHealth();
      setLoading(false);
    };
    loadData();

    // Auto-refresh a cada 30 segundos
    const interval = setInterval(loadRTPHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'HEALTHY': return 'bg-green-100 text-green-800 border-green-200';
      case 'WARNING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'HEALTHY': return <CheckCircle className="h-4 w-4" />;
      case 'WARNING': return <AlertTriangle className="h-4 w-4" />;
      case 'CRITICAL': return <AlertTriangle className="h-4 w-4" />;
      default: return <TrendingUp className="h-4 w-4" />;
    }
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

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Carregando saúde do RTP...</p>
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
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Monitor de Saúde RTP - Sistema Corrigido
            </CardTitle>
            <Button 
              onClick={executeAutoRefill} 
              disabled={autoRefillLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {autoRefillLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <DollarSign className="h-4 w-4 mr-2" />
              )}
              Recarregar Orçamentos
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Status Cards */}
      <div className="grid gap-4">
        {rtpData.map((item) => (
          <Card key={item.scratch_type} className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-lg">
                    {getTypeDisplayName(item.scratch_type)}
                  </h3>
                  <Badge className={getHealthColor(item.health_status)}>
                    {getHealthIcon(item.health_status)}
                    <span className="ml-1">
                      {item.health_status === 'HEALTHY' && 'Saudável'}
                      {item.health_status === 'WARNING' && 'Atenção'}
                      {item.health_status === 'CRITICAL' && 'Crítico'}
                      {item.health_status === 'INSUFFICIENT_DATA' && 'Poucos Dados'}
                    </span>
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">RTP Atual</div>
                  <div className="text-2xl font-bold">
                    {item.current_rtp.toFixed(1)}%
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Métricas RTP */}
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">RTP Target</div>
                  <div className="text-lg font-semibold text-blue-600">
                    {item.target_rtp.toFixed(0)}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Desvio</div>
                  <div className={`text-lg font-semibold ${
                    item.deviation <= 5 ? 'text-green-600' : 
                    item.deviation <= 15 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    ±{item.deviation.toFixed(1)}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Vendas</div>
                  <div className="text-lg font-semibold text-green-600">
                    R$ {item.total_sales.toFixed(2)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Prêmios</div>
                  <div className="text-lg font-semibold text-red-600">
                    R$ {item.total_prizes.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Barra de Progresso RTP */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>RTP Real vs Target</span>
                  <span>{item.current_rtp.toFixed(1)}% / {item.target_rtp.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${
                      Math.abs(item.current_rtp - item.target_rtp) <= 5 
                        ? 'bg-green-500' 
                        : Math.abs(item.current_rtp - item.target_rtp) <= 15 
                        ? 'bg-yellow-500' 
                        : 'bg-red-500'
                    }`}
                    style={{ 
                      width: `${Math.min((item.current_rtp / (item.target_rtp + 20)) * 100, 100)}%` 
                    }}
                  />
                </div>
              </div>

              {/* Alertas */}
              {item.health_status === 'CRITICAL' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      RTP crítico: desvio de {item.deviation.toFixed(1)}% do target
                    </span>
                  </div>
                </div>
              )}

              {item.health_status === 'WARNING' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      RTP em atenção: desvio de {item.deviation.toFixed(1)}% do target
                    </span>
                  </div>
                </div>
              )}

              {item.health_status === 'INSUFFICIENT_DATA' && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-gray-700">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm">
                      Dados insuficientes para análise
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sistema de Recarga Automática */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Sistema de Recarga Automática Ativo</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <ul className="space-y-1">
            <li>• Recarga automática quando orçamento menor que 10% do mínimo</li>
            <li>• PIX: R$ 5 → R$ 50 | Sorte: R$ 10 → R$ 100 | Ouro: R$ 40 → R$ 400</li>
            <li>• Diamante: R$ 80 → R$ 800 | Premium: R$ 200 → R$ 2000</li>
            <li>• Sistema RTP ativo com target de 50% para todas as raspadinhas</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}