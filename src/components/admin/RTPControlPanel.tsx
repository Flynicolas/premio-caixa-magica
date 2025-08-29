import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RTPHealthMonitor } from './scratch-card-rtp/RTPHealthMonitor';
import { RTPSettingsPanel } from './scratch-card-rtp/RTPSettingsPanel';
import { RTPObservabilityDashboard } from './scratch-card-rtp/RTPObservabilityDashboard';
import { ScratchPrizeManager } from './scratch-card-rtp/ScratchPrizeManager';
import { RTPMigrationPanel } from './scratch-card-rtp/RTPMigrationPanel';
import { RTPAdvancedReports } from './scratch-card-rtp/RTPAdvancedReports';
import { RTPAlertsPanel } from './scratch-card-rtp/RTPAlertsPanel';

export function RTPControlPanel() {
  const [selectedGameType, setSelectedGameType] = useState('');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Sistema RTP - Controle Completo</h2>
        <p className="text-muted-foreground">
          Monitoramento e configuração do Return To Player das raspadinhas
        </p>
      </div>

      <Tabs defaultValue="migration" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="migration">Migração</TabsTrigger>
          <TabsTrigger value="observability">Observabilidade</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="prizes">Prêmios</TabsTrigger>
          <TabsTrigger value="health">Monitor</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>
        
        <TabsContent value="migration" className="space-y-6">
          <RTPMigrationPanel />
        </TabsContent>
        
        <TabsContent value="observability" className="space-y-6">
          <RTPObservabilityDashboard />
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-6">
          <RTPAdvancedReports />
        </TabsContent>
        
        <TabsContent value="alerts" className="space-y-6">
          <RTPAlertsPanel />
        </TabsContent>
        
        <TabsContent value="prizes" className="space-y-6">
          <ScratchPrizeManager 
            selectedGameType={selectedGameType}
            onGameTypeChange={setSelectedGameType}
          />
        </TabsContent>
        
        <TabsContent value="health" className="space-y-6">
          <RTPHealthMonitor />
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-6">
          <RTPSettingsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}