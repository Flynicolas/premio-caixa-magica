import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DatabaseItem } from '@/types/database';
import { Settings, Package } from 'lucide-react';
import UnifiedScratchCardManager from './UnifiedScratchCardManager';
import ScratchCardFinancialControl from './scratch-card-probability/ScratchCardFinancialControl';
import ScratchCardProfitDashboard from './ScratchCardProfitDashboard';

interface ScratchCardProbabilityManagerProps {
  items: DatabaseItem[];
  onRefresh: () => void;
}

const ScratchCardProbabilityManager = ({ items, onRefresh }: ScratchCardProbabilityManagerProps) => {

  return (
    <div className="space-y-6">
      <Tabs defaultValue="manage" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="manage" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Gerenciar Raspadinhas
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Controle Financeiro 90/10
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Monitoramento de Lucro
          </TabsTrigger>
        </TabsList>

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