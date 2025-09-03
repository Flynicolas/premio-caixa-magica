import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings2, Package, Calculator, Save, TrendingUp } from 'lucide-react';
import { useRTPControl } from '@/hooks/useRTPControl';
import { useAdvancedScratchCard } from '@/hooks/useAdvancedScratchCard';
import { scratchCardTypes } from '@/types/scratchCard';
import SimplifiedRTPControls from './SimplifiedRTPControls';
import { ProfitabilityCalculator } from './ProfitabilityCalculator';
import { ScenarioSimulator } from './ScenarioSimulator';
import { TooltipHelper } from './TooltipHelper';

export function AdvancedScratchControlPanel() {
  const { 
    rtpSettings,
    rtpMetrics,
    loading: rtpLoading,
    updateTargetRTP,
    toggleRTPEnabled
  } = useRTPControl();
  
  const { 
    scratchCards, 
    loading: advancedLoading,
    updateScratchCard,
    applySafeDefaults
  } = useAdvancedScratchCard();
  
  const [activeTab, setActiveTab] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [changes, setChanges] = useState<Record<string, any>>({});

  const loading = rtpLoading || advancedLoading;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando configurações avançadas...</div>
        </CardContent>
      </Card>
    );
  }

  // Usar os tipos do banco de dados RTP quando disponíveis, senão usar os do frontend
  const availableTypes = rtpSettings.length > 0 
    ? rtpSettings.map(st => ({
        value: st.scratch_type,
        label: st.name,
        price: 0, // Will be set from scratchCardTypes
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
            Controle RTP Simplificado
            <TooltipHelper content="Sistema pot-based onde RTP controla diretamente quanto vai para prêmios (0-100%)" />
          </h2>
          <p className="text-muted-foreground">
            Gerencie RTP (Return to Player) com sistema pot-based
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => {
              // Apply safe RTP defaults to all scratch types
              availableTypes.forEach(type => {
                updateTargetRTP(type.value, 30); // Safe 30% RTP
                toggleRTPEnabled(type.value, true);
              });
            }}
            variant="outline"
            className="gap-2 border-green-200 text-green-700 hover:bg-green-50"
          >
            🛡️ RTP Seguro (30%)
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

      {/* Alert de Sistema RTP */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-green-800">Sistema RTP Pot-Based</h3>
              <p className="text-sm text-green-700 mt-1">
                <strong>Controle direto:</strong> O RTP define exatamente quanto vai para o "pote" de prêmios. 
                RTP 0% = Nenhum prêmio (lucro 100%). RTP 50% = Metade vai para prêmios (lucro 50%).
              </p>
              <p className="text-xs text-green-600 mt-2">
                💡 Controle total: Ajuste RTP de 0% (máximo lucro) até 100% (nenhum lucro)
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
                {/* Controles RTP Simplificados */}
                <SimplifiedRTPControls
                  scratchType={type.value}
                  settings={rtpSettings.find(s => s.scratch_type === type.value)}
                  currentRTP={rtpMetrics.find(m => m.scratch_type === type.value)?.current_rtp || 0}
                  onRTPChange={updateTargetRTP}
                  onToggleRTP={toggleRTPEnabled}
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