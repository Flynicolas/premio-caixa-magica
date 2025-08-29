import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings2, 
  BarChart3, 
  TrendingUp, 
  Sparkles, 
  AlertTriangle,
  Save,
  Shield,
  Target,
  Coins
} from 'lucide-react';
import { AdvancedScratchControlPanel } from './advanced-scratch-control/AdvancedScratchControlPanel';
import { useScratchCardManagement } from '@/hooks/useScratchCardManagement';
import { useScratchCardAdministration } from '@/hooks/useScratchCardAdministration';
import { useAdvancedScratchCard } from '@/hooks/useAdvancedScratchCard';
import { scratchCardTypes } from '@/types/scratchCard';

export function ScratchCardUnifiedAdmin() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { probabilities, loading: probLoading } = useScratchCardManagement();
  const { settings, loading: settingsLoading } = useScratchCardAdministration();
  const { scratchCards, loading: advancedLoading } = useAdvancedScratchCard();

  const loading = probLoading || settingsLoading || advancedLoading;

  // Calcular estatísticas dinâmicas
  const getDashboardStats = () => {
    const totalTypes = settings.length;
    const configuredTypes = probabilities.length > 0 ? new Set(probabilities.map(p => p.scratch_type)).size : 0;
    const totalItems = probabilities.length;
    
    // Calcular estatísticas de segurança
    const dangerousConfigs = scratchCards.filter(sc => 
      (sc.win_probability_global || 0) > 20 || ((sc as any).target_rtp || 0) > 60
    ).length;
    
    const healthyProfit = scratchCards.filter(sc => {
      const avgPrize = 10; // Estimativa
      const expectedProfit = (100 - sc.win_probability_global) / 100;
      return expectedProfit > 0.7; // Mais de 70% de lucro
    }).length;

    return {
      totalTypes,
      configuredTypes,
      totalItems,
      dangerousConfigs,
      healthyProfit,
      stats: settings.map(setting => {
        const typeProbs = probabilities.filter(p => p.scratch_type === setting.scratch_type);
        const frontendType = Object.entries(scratchCardTypes).find(
          ([key]) => key === setting.scratch_type
        );
        const scratchConfig = scratchCards.find(sc => sc.scratch_type === setting.scratch_type);
        
        return {
          value: setting.scratch_type,
          label: setting.name,
          price: setting.price,
          color: frontendType ? frontendType[1].bgColor : 'bg-gray-500',
          itemCount: typeProbs.length,
          isConfigured: typeProbs.length > 0,
          isActive: setting.is_active,
          winProbability: scratchConfig?.win_probability_global || 0,
          targetRTP: (scratchConfig as any)?.target_rtp || 0,
          isDangerous: scratchConfig ? ((scratchConfig.win_probability_global || 0) > 20 || ((scratchConfig as any).target_rtp || 0) > 60) : false
        };
      })
    };
  };

  const overview = getDashboardStats();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando sistema unificado...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Principal */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
            <Sparkles className="w-8 h-8" />
            Sistema Unificado - Raspadinhas
          </h1>
          <p className="text-muted-foreground mt-1">
            Painel completo para controle de probabilidades, RTP e lucratividade
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant={overview.dangerousConfigs > 0 ? "destructive" : "default"} className="gap-2">
            <Shield className="w-4 h-4" />
            {overview.dangerousConfigs === 0 ? 'Configurações Seguras' : `${overview.dangerousConfigs} Configs. Perigosas`}
          </Badge>
        </div>
      </div>

      {/* Alerta de Segurança */}
      {overview.dangerousConfigs > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <AlertDescription className="text-red-700">
            <strong>Atenção:</strong> Foram detectadas {overview.dangerousConfigs} configurações perigosas 
            que podem causar prejuízos. Acesse a aba "Controles Avançados" para corrigir.
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs Principais */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="advanced-controls" className="gap-2">
            <Settings2 className="w-4 h-4" />
            Controles Avançados
          </TabsTrigger>
          <TabsTrigger value="profitability" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Lucratividade
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="w-4 h-4" />
            Segurança
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Relatórios
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Principal */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Estatísticas Gerais */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{overview.totalTypes}</div>
                  <div className="text-sm text-muted-foreground">Tipos Total</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{overview.configuredTypes}</div>
                  <div className="text-sm text-muted-foreground">Configurados</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{overview.totalItems}</div>
                  <div className="text-sm text-muted-foreground">Itens Ativos</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${overview.dangerousConfigs === 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {overview.dangerousConfigs === 0 ? '✓' : overview.dangerousConfigs}
                  </div>
                  <div className="text-sm text-muted-foreground">Riscos</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Status por Tipo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {overview.stats.map((type) => (
              <Card key={type.value} className={`border-l-4 ${
                type.isDangerous ? 'border-l-red-500' : 
                type.isConfigured ? 'border-l-green-500' : 'border-l-orange-500'
              }`}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${type.color}`} />
                      {type.label}
                    </div>
                    <div className="flex gap-2">
                      {type.isDangerous && (
                        <Badge variant="destructive" className="text-xs">
                          Perigoso
                        </Badge>
                      )}
                      <Badge variant={type.isConfigured ? 'default' : 'secondary'}>
                        {type.isConfigured ? 'OK' : 'Pendente'}
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Preço:</span>
                      <span className="font-medium ml-2">R$ {type.price.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Itens:</span>
                      <span className="font-medium ml-2">{type.itemCount}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Win Prob:</span>
                      <span className={`font-medium ml-2 ${type.winProbability > 20 ? 'text-red-600' : 'text-green-600'}`}>
                        {type.winProbability.toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">RTP:</span>
                      <span className={`font-medium ml-2 ${type.targetRTP > 60 ? 'text-red-600' : 'text-green-600'}`}>
                        {type.targetRTP.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Controles Avançados */}
        <TabsContent value="advanced-controls">
          <AdvancedScratchControlPanel />
        </TabsContent>

        {/* Lucratividade */}
        <TabsContent value="profitability">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="w-5 h-5" />
                Análise de Lucratividade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Calculadora avançada de lucratividade em desenvolvimento</p>
                <p className="text-sm mt-2">
                  Use os "Controles Avançados" para simular cenários de lucratividade
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Segurança */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Sistema de Segurança
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription>
                    Sistema de validações de segurança implementado. 
                    Probabilidades limitadas entre 5-30% e RTPs entre configurações seguras.
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2">Validações Ativas</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>✓ Win Probability: 5-30%</li>
                        <li>✓ Caps de prêmio por tipo</li>
                        <li>✓ Monitoramento de prejuízos</li>
                        <li>✓ Alertas automáticos</li>
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2">Status do Sistema</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span>Configurações Seguras:</span>
                          <Badge variant={overview.dangerousConfigs === 0 ? "default" : "destructive"}>
                            {overview.totalTypes - overview.dangerousConfigs}/{overview.totalTypes}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span>Tipos Lucrativos:</span>
                          <Badge variant="default">
                            {overview.healthyProfit}/{overview.totalTypes}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Relatórios */}
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Relatórios e Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Sistema de relatórios avançados em desenvolvimento</p>
                <p className="text-sm mt-2">
                  Em breve: análises de performance, ROI e métricas de usuário
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}