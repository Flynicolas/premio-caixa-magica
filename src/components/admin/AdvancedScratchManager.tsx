import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Package, DollarSign, FileText } from 'lucide-react';
import { useAdvancedScratchCard } from '@/hooks/useAdvancedScratchCard';
import { ScratchCardConfigForm } from './advanced-scratch/ScratchCardConfigForm';
import { ScratchCardItemManagement } from './advanced-scratch/ScratchCardItemManagement';
import { ScratchCardBankControl } from './advanced-scratch/ScratchCardBankControl';
import { ScratchCardEventLogs } from './advanced-scratch/ScratchCardEventLogs';
import { ScratchCardPresetManager } from './advanced-scratch/ScratchCardPresetManager';

export const AdvancedScratchManager: React.FC = () => {
  const { loading } = useAdvancedScratchCard();
  const [activeTab, setActiveTab] = useState('config');

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando sistema de raspadinhas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Gerenciamento de Raspadinhas
              </CardTitle>
              <CardDescription>
                Controle completo das configurações, itens, probabilidades e operação das raspadinhas
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Interface Principal */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
          <TabsTrigger value="items" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Gestão de Itens
          </TabsTrigger>
          <TabsTrigger value="bank" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Controle Financeiro
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Logs & Auditoria
          </TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="mt-6">
          <ScratchCardConfigForm />
        </TabsContent>

        <TabsContent value="items" className="mt-6">
          <ScratchCardItemManagement />
        </TabsContent>

        <TabsContent value="bank" className="mt-6">
          <ScratchCardBankControl />
        </TabsContent>

        <TabsContent value="logs" className="mt-6">
          <ScratchCardEventLogs />
        </TabsContent>
      </Tabs>

      {/* Preset Manager integrado */}
      <ScratchCardPresetManager />
    </div>
  );
};