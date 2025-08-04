import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Settings2, 
  Clock,
  DollarSign,
  Target,
  Zap,
  Shield
} from 'lucide-react';

interface DynamicConfig {
  id: string;
  scratch_type: string;
  dynamic_probability_enabled: boolean;
  base_win_probability: number;
  max_win_probability: number;
  min_win_probability: number;
  budget_threshold_high: number;
  budget_threshold_low: number;
  time_based_adjustment: boolean;
  peak_hours_start: number;
  peak_hours_end: number;
  peak_hours_multiplier: number;
  security_limits_enabled: boolean;
  max_wins_per_hour: number;
  max_value_per_win: number;
  cooldown_after_big_win: number;
  blackout_periods: string[];
  created_at: string;
  updated_at: string;
}

interface ProbabilityHistory {
  timestamp: string;
  scratch_type: string;
  current_probability: number;
  budget_remaining: number;
  trigger_reason: string;
  adjustment_factor: number;
}

const ScratchCard90TenAdvancedControl = () => {
  const [configs, setConfigs] = useState<DynamicConfig[]>([]);
  const [history, setHistory] = useState<ProbabilityHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('pix');
  const [editingConfig, setEditingConfig] = useState<Partial<DynamicConfig>>({});
  const { toast } = useToast();

  const scratchTypes = [
    { id: 'pix', name: 'PIX R$ 1,00', color: 'bg-green-600' },
    { id: 'sorte', name: 'Sorte R$ 5,00', color: 'bg-blue-600' },
    { id: 'dupla', name: 'Dupla R$ 10,00', color: 'bg-purple-600' },
    { id: 'ouro', name: 'Ouro R$ 25,00', color: 'bg-yellow-600' },
    { id: 'diamante', name: 'Diamante R$ 50,00', color: 'bg-pink-600' },
    { id: 'premium', name: 'Premium R$ 100,00', color: 'bg-red-600' }
  ];

  useEffect(() => {
    loadConfigurations();
    loadProbabilityHistory();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(() => {
      loadProbabilityHistory();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadConfigurations = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('scratch_card_dynamic_config')
        .select('*')
        .order('scratch_type');

      if (error) throw error;

      // Criar configs padrão se não existirem
      const existingTypes = new Set(data?.map(c => c.scratch_type) || []);
      const allConfigs = [...(data || [])];

      for (const type of scratchTypes) {
        if (!existingTypes.has(type.id)) {
          const defaultConfig = {
            scratch_type: type.id,
            dynamic_probability_enabled: true,
            base_win_probability: 0.30,
            max_win_probability: 0.50,
            min_win_probability: 0.05,
            budget_threshold_high: 100,
            budget_threshold_low: 10,
            time_based_adjustment: false,
            peak_hours_start: 18,
            peak_hours_end: 23,
            peak_hours_multiplier: 1.2,
            security_limits_enabled: true,
            max_wins_per_hour: 10,
            max_value_per_win: 500,
            cooldown_after_big_win: 300,
            blackout_periods: []
          };

          const { data: newConfig, error: createError } = await supabase
            .from('scratch_card_dynamic_config')
            .insert(defaultConfig)
            .select()
            .single();

          if (!createError && newConfig) {
            allConfigs.push(newConfig);
          }
        }
      }

      setConfigs(allConfigs);
    } catch (error: any) {
      console.error('Erro ao carregar configurações:', error);
      toast({
        title: "Erro ao carregar configurações",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadProbabilityHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('scratch_card_probability_history')
        .select('*')
        .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) throw error;
      setHistory(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const updateConfiguration = async (scratchType: string, updates: Partial<DynamicConfig>) => {
    try {
      const { error } = await supabase
        .from('scratch_card_dynamic_config')
        .update(updates)
        .eq('scratch_type', scratchType);

      if (error) throw error;

      toast({
        title: "Configuração atualizada",
        description: `Configurações de ${scratchType} atualizadas com sucesso`,
      });

      await loadConfigurations();
    } catch (error: any) {
      console.error('Erro ao atualizar configuração:', error);
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const triggerManualAdjustment = async (scratchType: string, newProbability: number, reason: string) => {
    try {
      // Registrar ajuste no histórico
      await supabase
        .from('scratch_card_probability_history')
        .insert({
          scratch_type: scratchType,
          current_probability: newProbability,
          budget_remaining: 0,
          trigger_reason: `Manual: ${reason}`,
          adjustment_factor: 1.0
        });

      // Atualizar edge function para usar nova probabilidade
      const { error } = await supabase.functions.invoke('update-scratch-probability', {
        body: {
          scratchType,
          probability: newProbability,
          duration: 3600 // 1 hora
        }
      });

      if (error) throw error;

      toast({
        title: "Ajuste manual aplicado",
        description: `Probabilidade de ${scratchType} ajustada para ${(newProbability * 100).toFixed(1)}% por 1 hora`,
      });

      await loadProbabilityHistory();
    } catch (error: any) {
      console.error('Erro no ajuste manual:', error);
      toast({
        title: "Erro no ajuste",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const currentConfig = configs.find(c => c.scratch_type === selectedType);
  const typeHistory = history.filter(h => h.scratch_type === selectedType);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando controle avançado...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Sistema Avançado de Probabilidades Dinâmicas 90/10
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Shield className="w-4 h-4" />
            <AlertDescription>
              Este sistema ajusta automaticamente as probabilidades de vitória baseado no orçamento disponível, 
              horários de pico, e limites de segurança para manter o equilíbrio financeiro 90/10.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Tabs value={selectedType} onValueChange={setSelectedType}>
        <TabsList className="grid w-full grid-cols-6">
          {scratchTypes.map(type => (
            <TabsTrigger key={type.id} value={type.id} className="text-xs">
              {type.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {scratchTypes.map(type => (
          <TabsContent key={type.id} value={type.id} className="space-y-6">
            {currentConfig && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Configurações Básicas */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Settings2 className="w-4 h-4" />
                      Configurações Básicas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={currentConfig.dynamic_probability_enabled}
                        onCheckedChange={(checked) => updateConfiguration(type.id, { dynamic_probability_enabled: checked })}
                      />
                      <Label>Probabilidade Dinâmica</Label>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-xs">Min (%)</Label>
                        <Input
                          type="number"
                          value={(currentConfig.min_win_probability * 100).toFixed(1)}
                          onChange={(e) => setEditingConfig({
                            ...editingConfig,
                            min_win_probability: Number(e.target.value) / 100
                          })}
                          onBlur={() => updateConfiguration(type.id, editingConfig)}
                          className="h-8"
                          step="0.1"
                          min="0"
                          max="100"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Base (%)</Label>
                        <Input
                          type="number"
                          value={(currentConfig.base_win_probability * 100).toFixed(1)}
                          onChange={(e) => setEditingConfig({
                            ...editingConfig,
                            base_win_probability: Number(e.target.value) / 100
                          })}
                          onBlur={() => updateConfiguration(type.id, editingConfig)}
                          className="h-8"
                          step="0.1"
                          min="0"
                          max="100"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Max (%)</Label>
                        <Input
                          type="number"
                          value={(currentConfig.max_win_probability * 100).toFixed(1)}
                          onChange={(e) => setEditingConfig({
                            ...editingConfig,
                            max_win_probability: Number(e.target.value) / 100
                          })}
                          onBlur={() => updateConfiguration(type.id, editingConfig)}
                          className="h-8"
                          step="0.1"
                          min="0"
                          max="100"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs">Limite Alto (R$)</Label>
                        <Input
                          type="number"
                          value={currentConfig.budget_threshold_high}
                          onChange={(e) => setEditingConfig({
                            ...editingConfig,
                            budget_threshold_high: Number(e.target.value)
                          })}
                          onBlur={() => updateConfiguration(type.id, editingConfig)}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Limite Baixo (R$)</Label>
                        <Input
                          type="number"
                          value={currentConfig.budget_threshold_low}
                          onChange={(e) => setEditingConfig({
                            ...editingConfig,
                            budget_threshold_low: Number(e.target.value)
                          })}
                          onBlur={() => updateConfiguration(type.id, editingConfig)}
                          className="h-8"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Configurações de Segurança */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Limites de Segurança
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={currentConfig.security_limits_enabled}
                        onCheckedChange={(checked) => updateConfiguration(type.id, { security_limits_enabled: checked })}
                      />
                      <Label>Limites Ativos</Label>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs">Max Vitórias/Hora</Label>
                        <Input
                          type="number"
                          value={currentConfig.max_wins_per_hour}
                          onChange={(e) => setEditingConfig({
                            ...editingConfig,
                            max_wins_per_hour: Number(e.target.value)
                          })}
                          onBlur={() => updateConfiguration(type.id, editingConfig)}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Max Valor/Vitória (R$)</Label>
                        <Input
                          type="number"
                          value={currentConfig.max_value_per_win}
                          onChange={(e) => setEditingConfig({
                            ...editingConfig,
                            max_value_per_win: Number(e.target.value)
                          })}
                          onBlur={() => updateConfiguration(type.id, editingConfig)}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Cooldown Pós-Premio (seg)</Label>
                        <Input
                          type="number"
                          value={currentConfig.cooldown_after_big_win}
                          onChange={(e) => setEditingConfig({
                            ...editingConfig,
                            cooldown_after_big_win: Number(e.target.value)
                          })}
                          onBlur={() => updateConfiguration(type.id, editingConfig)}
                          className="h-8"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Configurações de Horário */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Ajustes por Horário
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={currentConfig.time_based_adjustment}
                        onCheckedChange={(checked) => updateConfiguration(type.id, { time_based_adjustment: checked })}
                      />
                      <Label>Ajuste por Horário</Label>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-xs">Início Pico</Label>
                        <Input
                          type="number"
                          value={currentConfig.peak_hours_start}
                          onChange={(e) => setEditingConfig({
                            ...editingConfig,
                            peak_hours_start: Number(e.target.value)
                          })}
                          onBlur={() => updateConfiguration(type.id, editingConfig)}
                          className="h-8"
                          min="0"
                          max="23"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Fim Pico</Label>
                        <Input
                          type="number"
                          value={currentConfig.peak_hours_end}
                          onChange={(e) => setEditingConfig({
                            ...editingConfig,
                            peak_hours_end: Number(e.target.value)
                          })}
                          onBlur={() => updateConfiguration(type.id, editingConfig)}
                          className="h-8"
                          min="0"
                          max="23"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Multiplicador</Label>
                        <Input
                          type="number"
                          value={currentConfig.peak_hours_multiplier}
                          onChange={(e) => setEditingConfig({
                            ...editingConfig,
                            peak_hours_multiplier: Number(e.target.value)
                          })}
                          onBlur={() => updateConfiguration(type.id, editingConfig)}
                          className="h-8"
                          step="0.1"
                          min="0.1"
                          max="3.0"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Controles Manuais */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Controles Manuais
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Button
                        onClick={() => triggerManualAdjustment(type.id, 0.05, 'Blackout temporário')}
                        variant="destructive"
                        size="sm"
                        className="w-full"
                      >
                        Ativar Blackout (5%)
                      </Button>
                      <Button
                        onClick={() => triggerManualAdjustment(type.id, 0.50, 'Evento especial')}
                        variant="default"
                        size="sm"
                        className="w-full"
                      >
                        Evento Especial (50%)
                      </Button>
                      <Button
                        onClick={() => triggerManualAdjustment(type.id, currentConfig.base_win_probability, 'Reset manual')}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        Resetar para Base
                      </Button>
                    </div>

                    <div className="text-center text-sm text-muted-foreground">
                      Ajustes manuais duram 1 hora
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Histórico de Probabilidades */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Histórico de Ajustes (24h)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {typeHistory.length === 0 ? (
                    <div className="text-center text-muted-foreground py-4">
                      Nenhum ajuste registrado nas últimas 24h
                    </div>
                  ) : (
                    typeHistory.map((record, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <div className="text-sm">
                          <div className="font-medium">
                            {new Date(record.timestamp).toLocaleString()}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {record.trigger_reason}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={record.current_probability > 0.30 ? "default" : "destructive"}>
                            {(record.current_probability * 100).toFixed(1)}%
                          </Badge>
                          <div className="text-xs text-muted-foreground">
                            R$ {record.budget_remaining?.toFixed(2) || '0.00'}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ScratchCard90TenAdvancedControl;