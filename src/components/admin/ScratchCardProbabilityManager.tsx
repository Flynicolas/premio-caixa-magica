import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DatabaseItem } from '@/types/database';
import { Settings, Package } from 'lucide-react';
import UnifiedScratchCardManager from './UnifiedScratchCardManager';
import ScratchCardFinancialControl from './scratch-card-probability/ScratchCardFinancialControl';
import ScratchCardProfitDashboard from './ScratchCardProfitDashboard';
import { SimplifiedPresetManager } from './SimplifiedPresetManager';

interface ScratchCardProbabilityManagerProps {
  items: DatabaseItem[];
  onRefresh: () => void;
}

const ScratchCardProbabilityManager = ({ items, onRefresh }: ScratchCardProbabilityManagerProps) => {

  return (
    <div className="space-y-6">
      <Tabs defaultValue="presets" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="presets" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Sistema 80/20
          </TabsTrigger>
          <TabsTrigger value="manage" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Gerenciar Itens
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Controles Avançados
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Relatórios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="presets">
          <SimplifiedPresetManager />
        </TabsContent>

        <TabsContent value="manage">
          <UnifiedScratchCardManager items={items} onRefresh={onRefresh} />
        </TabsContent>

        <TabsContent value="financial">
          <ScratchCardFinancialControl />
        </TabsContent>

        <TabsContent value="monitoring">
          <ScratchCardProfitDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScratchCardProbabilityManager;