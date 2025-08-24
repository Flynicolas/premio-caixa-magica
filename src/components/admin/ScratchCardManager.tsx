import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ScratchCardCentralDashboard from './scratch-card-probability/ScratchCardCentralDashboard';
import ScratchCardAdvancedReports from './scratch-card-probability/ScratchCardAdvancedReports';
import ScratchCardProbabilityManager from './scratch-card-probability/ScratchCardProbabilityManager';
import ScratchCardIntelligentControl from './scratch-card-probability/ScratchCardIntelligentControl';
import ScratchCardManualReleaseSystem from './scratch-card-probability/ScratchCardManualReleaseSystem';
import AdvancedScratchDashboard from './AdvancedScratchDashboard';
import ScratchCard90TenStatus from './ScratchCard90TenStatus';
import SimpleBannerManager from './SimpleBannerManager';
import { RTPControlPanel } from './RTPControlPanel';

const ScratchCardManager = () => {
  return (
    <div className="container mx-auto p-6">
      <Tabs defaultValue="rtp-control" className="w-full">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="rtp-control">Controle RTP</TabsTrigger>
          <TabsTrigger value="advanced">Sistema Avançado</TabsTrigger>
          <TabsTrigger value="central">Central Inteligente</TabsTrigger>
          <TabsTrigger value="probabilities">Probabilidades</TabsTrigger>
          <TabsTrigger value="manual">Liberação Manual</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
          <TabsTrigger value="banners">Banners</TabsTrigger>
          <TabsTrigger value="legacy">Sistema Legado</TabsTrigger>
        </TabsList>
        
        <TabsContent value="rtp-control" className="space-y-6">
          <RTPControlPanel />
        </TabsContent>
        
        <TabsContent value="advanced" className="space-y-6">
          <AdvancedScratchDashboard />
        </TabsContent>
        
        <TabsContent value="central" className="space-y-6">
          <ScratchCardCentralDashboard />
        </TabsContent>
        
        <TabsContent value="probabilities" className="space-y-6">
          <ScratchCardProbabilityManager />
        </TabsContent>
        
        <TabsContent value="legacy" className="space-y-6">
          <ScratchCard90TenStatus />
        </TabsContent>
        
        <TabsContent value="manual" className="space-y-6">
          <ScratchCardManualReleaseSystem />
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-6">
          <ScratchCardAdvancedReports />
        </TabsContent>
        
        <TabsContent value="banners" className="space-y-6">
          <SimpleBannerManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScratchCardManager;