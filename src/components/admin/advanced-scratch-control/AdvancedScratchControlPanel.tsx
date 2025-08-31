import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings2, Package, Calculator, Save, TrendingUp } from 'lucide-react';
import { useScratchCardManagement } from '@/hooks/useScratchCardManagement';
import { useAdvancedScratchCard } from '@/hooks/useAdvancedScratchCard';
import { scratchCardTypes } from '@/types/scratchCard';
import { ProbabilityRTPControls } from './ProbabilityRTPControls';
import { ProfitabilityCalculator } from './ProfitabilityCalculator';
import { ScenarioSimulator } from './ScenarioSimulator';
import { TooltipHelper } from './TooltipHelper';

export function AdvancedScratchControlPanel() {
  const { 
    scratchTypes,
    loading: scratchLoading
  } = useScratchCardManagement();
  
  const { 
    scratchCards, 
    loading: advancedLoading,
    updateScratchCard,
    applySafeDefaults
  } = useAdvancedScratchCard();
  
  const [activeTab, setActiveTab] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [changes, setChanges] = useState<Record<string, any>>({});

  const loading = scratchLoading || advancedLoading;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando configurações avançadas...</div>
        </CardContent>
      </Card>
    );
  }

  // Usar os tipos do banco de dados quando disponíveis, senão usar os do frontend
  const availableTypes = scratchTypes.length > 0 
    ? scratchTypes.map(st => ({
        value: st.scratch_type,
        label: st.name,
        price: st.price,
        color: scratchCardTypes[st.scratch_type as keyof typeof scratchCardTypes]?.bgColor || 'bg-gray-500'
      }))
    : Object.entries(scratchCardTypes).map(([key, config]) => ({
        value: key,
        label: config.name,
        price: config.price,
        color: config.bgColor
      }));

  if (!activeTab && availableTypes.length > 0) {
    setActiveTab(availableTypes[0].value);
  }

  const handleSettingChange = (scratchType: string, field: string, value: any) => {
    setChanges(prev => ({
      ...prev,
      [scratchType]: {
        ...prev[scratchType],
        [field]: value
      }
    }));
  };

  const saveChanges = async () => {
    try {
      setSaving(true);
      
      for (const [scratchType, updates] of Object.entries(changes)) {
        if (Object.keys(updates).length > 0) {
          await updateScratchCard(scratchType, updates);
        }
      }
      
      setChanges({});
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = Object.keys(changes).length > 0;

  return (
    <div className="space-y-6">
      {/* Header com Botões de Ação */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Settings2 className="w-6 h-6" />
            Controle Avançado de Raspadinhas
            <TooltipHelper content="Sistema completo para controle independente de Win Probability e RTP com simulações de lucratividade" />
          </h2>
          <p className="text-muted-foreground">
            Gerencie probabilidades, RTP e simule cenários de lucratividade
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            onClick={applySafeDefaults}
            variant="outline"
            className="gap-2 border-green-200 text-green-700 hover:bg-green-50"
          >
            🛡️ Padrões Seguros
          </Button>
          
          {hasChanges && (
            <Button 
              onClick={saveChanges}
              disabled={saving}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              Salvar Alterações ({Object.keys(changes).length})
            </Button>
          )}
        </div>
      </div>

      {/* Alert de Sistema Sincronizado */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-800">Sistema Sincronizado Ativo</h3>
              <p className="text-sm text-blue-700 mt-1">
                <strong>Nova funcionalidade:</strong> Win Probability e RTP agora são sincronizados automaticamente. 
                Win Probability controla <strong>frequência</strong> (3-15%), 
                RTP controla <strong>valor retornado</strong> com limite máximo de <strong>Win_Probability × 4</strong>.
              </p>
              <p className="text-xs text-blue-600 mt-2">
                💡 Exemplo: Win Probability 10% → RTP máximo 40% | Isso garante sustentabilidade matemática
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs por tipo de raspadinha */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6 mb-6">
          {availableTypes.map((type) => (
            <TabsTrigger key={type.value} value={type.value} className="gap-2">
              <div className={`w-3 h-3 rounded-full ${type.color}`} />
              <span className="hidden sm:inline">{type.label}</span>
              <span className="sm:hidden">{type.value.toUpperCase()}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {availableTypes.map((type) => {
          const currentSettings = scratchCards.find(sc => sc.scratch_type === type.value);
          const pendingChanges = changes[type.value] || {};
          
          return (
            <TabsContent key={type.value} value={type.value}>
              <div className="space-y-6">
                {/* Controles de Probabilidade e RTP */}
                <ProbabilityRTPControls
                  scratchType={type.value}
                  settings={currentSettings}
                  pendingChanges={pendingChanges}
                  onSettingChange={handleSettingChange}
                />

                {/* Calculadora de Lucratividade */}
                <ProfitabilityCalculator
                  scratchType={type.value}
                  settings={currentSettings}
                  pendingChanges={pendingChanges}
                  gamePrice={type.price}
                />

                {/* Simulador de Cenários */}
                <ScenarioSimulator
                  scratchType={type.value}
                  settings={currentSettings}
                  pendingChanges={pendingChanges}
                  gamePrice={type.price}
                />
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}