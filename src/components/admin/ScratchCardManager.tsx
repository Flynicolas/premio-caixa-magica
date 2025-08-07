import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ScratchCardCentralDashboard from './scratch-card-probability/ScratchCardCentralDashboard';
import ScratchCardAdvancedReports from './scratch-card-probability/ScratchCardAdvancedReports';
import ScratchCardProbabilityManager from './scratch-card-probability/ScratchCardProbabilityManager';
import ScratchCardIntelligentControl from './scratch-card-probability/ScratchCardIntelligentControl';
import ScratchCardManualReleaseSystem from './scratch-card-probability/ScratchCardManualReleaseSystem';
import AdvancedScratchDashboard from './AdvancedScratchDashboard';

const ScratchCardManager = () => {
  return (
    <div className="container mx-auto p-6">
      <Tabs defaultValue="advanced" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="advanced">Sistema Avançado</TabsTrigger>
          <TabsTrigger value="central">Central Inteligente</TabsTrigger>
          <TabsTrigger value="probabilities">Probabilidades</TabsTrigger>
          <TabsTrigger value="intelligent">Sistema 90/10</TabsTrigger>
          <TabsTrigger value="manual">Liberação Manual</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>
        
        <TabsContent value="advanced" className="space-y-6">
          <AdvancedScratchDashboard />
        </TabsContent>
        
        <TabsContent value="central" className="space-y-6">
          <ScratchCardCentralDashboard />
        </TabsContent>
        
        <TabsContent value="probabilities" className="space-y-6">
          <ScratchCardProbabilityManager />
        </TabsContent>
        
        <TabsContent value="intelligent" className="space-y-6">
          <ScratchCardIntelligentControl />
        </TabsContent>
        
        <TabsContent value="manual" className="space-y-6">
          <ScratchCardManualReleaseSystem />
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-6">
          <ScratchCardAdvancedReports />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScratchCardManager;