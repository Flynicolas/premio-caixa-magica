import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RTPHealthMonitor } from './scratch-card-rtp/RTPHealthMonitor';
import { RTPSettingsPanel } from './scratch-card-rtp/RTPSettingsPanel';

export function RTPControlPanel() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Sistema RTP - Controle Completo</h2>
        <p className="text-muted-foreground">
          Monitoramento e configuração do Return To Player das raspadinhas
        </p>
      </div>

      <Tabs defaultValue="health" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="health">Monitor de Saúde</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>
        
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