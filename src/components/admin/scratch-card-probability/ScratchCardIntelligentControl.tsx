import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Brain, 
  Zap, 
  Shield, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Clock,
  AlertTriangle,
  Target,
  Settings
} from 'lucide-react';

interface FinancialData {
  id: string;
  scratch_type: string;
  date: string;
  total_sales: number;
  total_prizes_given: number;
  net_profit: number;
  cards_played: number;
  profit_goal: number;
  goal_reached: boolean;
  percentage_profit: number;
  percentage_prizes: number;
  daily_budget_prizes: number;
  remaining_budget: number;
}

interface SmartConfig {
  scratch_type: string;
  intelligent_mode: boolean;
  target_profit_margin: number;
  max_budget_per_hour: number;
  emergency_stop_threshold: number;
  auto_adjust_probability: boolean;
  blackout_mode: boolean;
  event_mode: boolean;
  last_updated: string;
}

const ScratchCardIntelligentControl = () => {
  const [financialData, setFinancialData] = useState<FinancialData[]>([]);
  const [configs, setConfigs] = useState<SmartConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('pix');
  const { toast } = useToast();

  const scratchTypes = [
    { id: 'pix', name: 'PIX R$ 1,00', color: 'bg-green-600', price: 1 },
    { id: 'sorte', name: 'Sorte R$ 5,00', color: 'bg-blue-600', price: 5 },
    { id: 'dupla', name: 'Dupla R$ 10,00', color: 'bg-purple-600', price: 10 },
    { id: 'ouro', name: 'Ouro R$ 25,00', color: 'bg-yellow-600', price: 25 },
    { id: 'diamante', name: 'Diamante R$ 50,00', color: 'bg-pink-600', price: 50 },
    { id: 'premium', name: 'Premium R$ 100,00', color: 'bg-red-600', price: 100 }
  ];

  useEffect(() => {
    loadAllData();
    
    // Atualizar dados a cada 30 segundos
    const interval = setInterval(loadFinancialData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([
      loadFinancialData(),
      loadConfigs()
    ]);
    setLoading(false);
  };

  const loadFinancialData = async () => {
    try {
      const { data, error } = await supabase
        .from('scratch_card_financial_control')
        .select('*')
        .eq('date', new Date().toISOString().split('T')[0])
        .order('scratch_type');

      if (error) throw error;

      // Garantir que temos dados para todos os tipos
      const existingTypes = new Set(data?.map(d => d.scratch_type) || []);
      const allData = [...(data || [])];

      for (const type of scratchTypes) {
        if (!existingTypes.has(type.id)) {
          const defaultData = {
            scratch_type: type.id,
            date: new Date().toISOString().split('T')[0],
            total_sales: 0,
            total_prizes_given: 0,
            net_profit: 0,
            cards_played: 0,
            profit_goal: type.price * 10, // Meta baseada no preço
            goal_reached: false,
            percentage_profit: 0.90,
            percentage_prizes: 0.10,
            daily_budget_prizes: type.price * 5, // Orçamento inicial
            remaining_budget: type.price * 5
          };

          const { data: newData, error: createError } = await supabase
            .from('scratch_card_financial_control')
            .insert(defaultData)
            .select()
            .single();

          if (!createError && newData) {
            allData.push(newData);
          }
        }
      }

      setFinancialData(allData);
    } catch (error: any) {
      console.error('Erro ao carregar dados financeiros:', error);
    }
  };

  const loadConfigs = async () => {
    // Simular configurações usando localStorage por enquanto
    const storedConfigs = localStorage.getItem('scratch_smart_configs');
    if (storedConfigs) {
      setConfigs(JSON.parse(storedConfigs));
    } else {
      // Criar configurações padrão
      const defaultConfigs = scratchTypes.map(type => ({
        scratch_type: type.id,
        intelligent_mode: true,
        target_profit_margin: 85, // 85% de lucro (15% para prêmios)
        max_budget_per_hour: type.price * 20,
        emergency_stop_threshold: 5, // Parar se orçamento < R$ 5
        auto_adjust_probability: true,
        blackout_mode: false,
        event_mode: false,
        last_updated: new Date().toISOString()
      }));
      setConfigs(defaultConfigs);
      localStorage.setItem('scratch_smart_configs', JSON.stringify(defaultConfigs));
    }
  };

  const updateConfig = async (scratchType: string, updates: Partial<SmartConfig>) => {
    try {
      const newConfigs = configs.map(config => 
        config.scratch_type === scratchType 
          ? { ...config, ...updates, last_updated: new Date().toISOString() }
          : config
      );
      
      setConfigs(newConfigs);
      localStorage.setItem('scratch_smart_configs', JSON.stringify(newConfigs));

      // Aplicar mudanças imediatamente no controle financeiro
      if (updates.blackout_mode !== undefined || updates.event_mode !== undefined) {
        await applyIntelligentAdjustment(scratchType);
      }

      toast({
        title: "Configuração atualizada",
        description: `Controle inteligente de ${scratchType} foi atualizado`,
      });
    } catch (error: any) {
      console.error('Erro ao atualizar configuração:', error);
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const applyIntelligentAdjustment = async (scratchType: string) => {
    try {
      const config = configs.find(c => c.scratch_type === scratchType);
      const financial = financialData.find(f => f.scratch_type === scratchType);
      
      if (!config || !financial) return;

      let newPercentagePrizes = 0.10; // Padrão 10%
      let newBudget = financial.remaining_budget;

      if (config.blackout_mode) {
        // Modo blackout: sem prêmios
        newPercentagePrizes = 0.02; // Apenas 2%
        newBudget = Math.min(newBudget, 5); // Máximo R$ 5
      } else if (config.event_mode) {
        // Modo evento: mais prêmios
        newPercentagePrizes = 0.25; // 25% para prêmios
        newBudget = financial.daily_budget_prizes * 2; // Dobrar orçamento
      } else if (config.intelligent_mode && config.auto_adjust_probability) {
        // Modo inteligente: ajustar baseado na performance
        const currentMargin = financial.total_sales > 0 
          ? ((financial.total_sales - financial.total_prizes_given) / financial.total_sales) * 100
          : 0;

        if (currentMargin > config.target_profit_margin + 10) {
          // Lucro muito alto, dar mais prêmios
          newPercentagePrizes = 0.15;
        } else if (currentMargin < config.target_profit_margin - 10) {
          // Lucro baixo, reduzir prêmios
          newPercentagePrizes = 0.05;
        }

        // Ajustar orçamento baseado no limite por hora
        const hoursRemaining = 24 - new Date().getHours();
        newBudget = Math.min(newBudget, config.max_budget_per_hour * hoursRemaining);
      }

      // Aplicar emergency stop
      if (financial.remaining_budget <= config.emergency_stop_threshold) {
        newPercentagePrizes = 0.01; // Quase nenhum prêmio
        newBudget = config.emergency_stop_threshold;
      }

      // Atualizar no banco
      const { error } = await supabase
        .from('scratch_card_financial_control')
        .update({
          percentage_prizes: newPercentagePrizes,
          percentage_profit: 1 - newPercentagePrizes,
          remaining_budget: newBudget,
          updated_at: new Date().toISOString()
        })
        .eq('scratch_type', scratchType)
        .eq('date', new Date().toISOString().split('T')[0]);

      if (error) throw error;

      await loadFinancialData();
    } catch (error: any) {
      console.error('Erro no ajuste inteligente:', error);
    }
  };

  const triggerEmergencyStop = async (scratchType: string) => {
    try {
      const { error } = await supabase
        .from('scratch_card_financial_control')
        .update({
          percentage_prizes: 0.01,
          remaining_budget: 0,
          updated_at: new Date().toISOString()
        })
        .eq('scratch_type', scratchType)
        .eq('date', new Date().toISOString().split('T')[0]);

      if (error) throw error;

      toast({
        title: "Parada de emergência ativada!",
        description: `Prêmios suspensos para ${scratchType}`,
        variant: "destructive"
      });

      await loadFinancialData();
    } catch (error: any) {
      console.error('Erro na parada de emergência:', error);
    }
  };

  const currentData = financialData.find(d => d.scratch_type === selectedType);
  const currentConfig = configs.find(c => c.scratch_type === selectedType);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando sistema inteligente...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Sistema Inteligente de Controle 90/10
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Zap className="w-4 h-4" />
            <AlertDescription>
              O sistema inteligente ajusta automaticamente as probabilidades e orçamentos para manter 
              a lucratividade de 90/10, com controles de emergência e modos especiais.
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
            {currentData && currentConfig && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Status Atual */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Status Atual - {type.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-xl font-bold text-green-600">
                          R$ {currentData.total_sales.toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">Vendas</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-red-600">
                          R$ {currentData.total_prizes_given.toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">Prêmios</div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm">Margem de Lucro</span>
                        <span className="font-bold">
                          {currentData.total_sales > 0 
                            ? (((currentData.total_sales - currentData.total_prizes_given) / currentData.total_sales) * 100).toFixed(1)
                            : '0'
                          }%
                        </span>
                      </div>
                      <Progress 
                        value={currentData.total_sales > 0 
                          ? ((currentData.total_sales - currentData.total_prizes_given) / currentData.total_sales) * 100
                          : 0
                        } 
                        className="h-2" 
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm">Orçamento Restante</span>
                        <span className="font-bold">R$ {currentData.remaining_budget.toFixed(2)}</span>
                      </div>
                      <Progress 
                        value={(currentData.remaining_budget / currentData.daily_budget_prizes) * 100} 
                        className="h-2" 
                      />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {currentConfig.intelligent_mode && (
                        <Badge variant="default"><Brain className="w-3 h-3 mr-1" />Inteligente</Badge>
                      )}
                      {currentConfig.blackout_mode && (
                        <Badge variant="destructive"><Shield className="w-3 h-3 mr-1" />Blackout</Badge>
                      )}
                      {currentConfig.event_mode && (
                        <Badge variant="secondary"><Zap className="w-3 h-3 mr-1" />Evento</Badge>
                      )}
                      {currentData.remaining_budget <= currentConfig.emergency_stop_threshold && (
                        <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Emergência</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Configurações Inteligentes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Configurações Inteligentes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={currentConfig.intelligent_mode}
                        onCheckedChange={(checked) => updateConfig(type.id, { intelligent_mode: checked })}
                      />
                      <Label>Modo Inteligente</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={currentConfig.auto_adjust_probability}
                        onCheckedChange={(checked) => updateConfig(type.id, { auto_adjust_probability: checked })}
                      />
                      <Label>Auto-ajuste de Probabilidade</Label>
                    </div>

                    <div>
                      <Label className="text-sm">Meta de Lucro (%)</Label>
                      <Input
                        type="number"
                        value={currentConfig.target_profit_margin}
                        onChange={(e) => updateConfig(type.id, { target_profit_margin: Number(e.target.value) })}
                        className="h-8"
                        min="70"
                        max="95"
                      />
                    </div>

                    <div>
                      <Label className="text-sm">Orçamento Max/Hora (R$)</Label>
                      <Input
                        type="number"
                        value={currentConfig.max_budget_per_hour}
                        onChange={(e) => updateConfig(type.id, { max_budget_per_hour: Number(e.target.value) })}
                        className="h-8"
                        min="5"
                        step="5"
                      />
                    </div>

                    <div>
                      <Label className="text-sm">Limite Emergência (R$)</Label>
                      <Input
                        type="number"
                        value={currentConfig.emergency_stop_threshold}
                        onChange={(e) => updateConfig(type.id, { emergency_stop_threshold: Number(e.target.value) })}
                        className="h-8"
                        min="0"
                        step="1"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Modos Especiais */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Modos Especiais
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Modo Blackout</div>
                          <div className="text-xs text-muted-foreground">Reduz prêmios drasticamente</div>
                        </div>
                        <Switch
                          checked={currentConfig.blackout_mode}
                          onCheckedChange={(checked) => updateConfig(type.id, { blackout_mode: checked, event_mode: false })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Modo Evento</div>
                          <div className="text-xs text-muted-foreground">Aumenta prêmios temporariamente</div>
                        </div>
                        <Switch
                          checked={currentConfig.event_mode}
                          onCheckedChange={(checked) => updateConfig(type.id, { event_mode: checked, blackout_mode: false })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Button
                        onClick={() => applyIntelligentAdjustment(type.id)}
                        size="sm"
                        className="w-full"
                      >
                        <Brain className="w-3 h-3 mr-1" />
                        Aplicar Ajuste Inteligente
                      </Button>

                      <Button
                        onClick={() => triggerEmergencyStop(type.id)}
                        variant="destructive"
                        size="sm"
                        className="w-full"
                      >
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Parada de Emergência
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Histórico e Analytics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {currentData.cards_played}
                      </div>
                      <div className="text-sm text-muted-foreground">Cards Jogados Hoje</div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Percentual Prêmios:</span>
                        <span className="font-medium">{(currentData.percentage_prizes * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Percentual Lucro:</span>
                        <span className="font-medium">{(currentData.percentage_profit * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Meta Atingida:</span>
                        <span className={`font-medium ${currentData.goal_reached ? 'text-green-600' : 'text-red-600'}`}>
                          {currentData.goal_reached ? 'Sim' : 'Não'}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground text-center">
                      Última atualização: {new Date(currentConfig.last_updated).toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ScratchCardIntelligentControl;