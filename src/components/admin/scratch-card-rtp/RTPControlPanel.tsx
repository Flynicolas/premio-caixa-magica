import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRTPControl } from '@/hooks/useRTPControl';
import { RTPHealthMonitor } from './RTPHealthMonitor';
import { RTPSettingsPanel } from './RTPSettingsPanel';

export function RTPControlPanel() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="health" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="health">Monitor de Saúde RTP</TabsTrigger>
          <TabsTrigger value="settings">Configurações RTP</TabsTrigger>
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