import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Settings, Database, DollarSign, FileText, TestTube, AlertTriangle } from 'lucide-react';
import { useAdvancedScratchCard } from '@/hooks/useAdvancedScratchCard';
import { useAppSettings } from '@/hooks/useAppSettings';
import { ScratchCardConfigForm } from './advanced-scratch/ScratchCardConfigForm';
import { ScratchCardProbabilityPivot } from './advanced-scratch/ScratchCardProbabilityPivot';
import { ScratchCardBankControl } from './advanced-scratch/ScratchCardBankControl';
import { ScratchCardEventLogs } from './advanced-scratch/ScratchCardEventLogs';
import { ScratchCardPresetManager } from './advanced-scratch/ScratchCardPresetManager';

export const AdvancedScratchManager: React.FC = () => {
  const { getBooleanSetting, updateSetting, loading: settingsLoading } = useAppSettings();
  const { scratchCards, loading: dataLoading } = useAdvancedScratchCard();
  const [activeTab, setActiveTab] = useState('overview');

  const isEnabled = getBooleanSetting('enable_new_scratch_ui', false);
  const loading = settingsLoading || dataLoading;

  const handleToggleFeature = async (enabled: boolean) => {
    await updateSetting('enable_new_scratch_ui', enabled.toString());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando sistema avançado...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com Feature Flag */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Sistema Avançado de Raspadinhas
              </CardTitle>
              <CardDescription>
                Controle completo das configurações, probabilidades e operação das raspadinhas
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={isEnabled ? "default" : "secondary"}>
                {isEnabled ? "Ativo" : "Inativo"}
              </Badge>
              <Switch
                checked={isEnabled}
                onCheckedChange={handleToggleFeature}
              />
            </div>
          </div>
        </CardHeader>
        {!isEnabled && (
          <CardContent>
            <div className="flex items-center gap-2 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Sistema desabilitado por segurança. Ative apenas após validar todas as configurações.
              </p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Interface Principal */}
      {isEnabled && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="config" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configurações
            </TabsTrigger>
            <TabsTrigger value="probabilities" className="flex items-center gap-2">
              <TestTube className="h-4 w-4" />
              Probabilidades
            </TabsTrigger>
            <TabsTrigger value="bank" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Controle da Banca
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Logs & Eventos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {scratchCards.map((card) => (
                <Card key={card.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{card.name}</CardTitle>
                      <Badge variant={card.is_active ? "default" : "secondary"}>
                        {card.is_active ? "Ativa" : "Inativa"}
                      </Badge>
                    </div>
                    <CardDescription>{card.scratch_type}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Preço Vitrine</p>
                        <p className="font-semibold">R$ {card.price_display.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Custo Real</p>
                        <p className="font-semibold">R$ {card.backend_cost.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Prob. Global</p>
                        <p className="font-semibold">{card.win_probability_global}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Categoria</p>
                        <p className="font-semibold capitalize">{card.category}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="config" className="mt-6">
            <ScratchCardConfigForm />
          </TabsContent>

          <TabsContent value="probabilities" className="mt-6">
            <ScratchCardProbabilityPivot />
          </TabsContent>

          <TabsContent value="bank" className="mt-6">
            <ScratchCardBankControl />
          </TabsContent>

          <TabsContent value="logs" className="mt-6">
            <ScratchCardEventLogs />
          </TabsContent>
        </Tabs>
      )}

      {/* Preset Manager sempre visível para admins */}
      <ScratchCardPresetManager />
    </div>
  );
};