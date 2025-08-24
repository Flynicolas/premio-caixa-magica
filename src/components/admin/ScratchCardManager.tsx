import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RTPDashboard from './RTPDashboard';
import { RTPControlPanel } from './RTPControlPanel';
import IntelligentManagement from './IntelligentManagement';
import AnalyticsReports from './AnalyticsReports';
import OptimizedSettings from './OptimizedSettings';
import ScratchCard90TenStatus from './ScratchCard90TenStatus';

const ScratchCardManager = () => {
  return (
    <div className="container mx-auto p-6">
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard RTP</TabsTrigger>
          <TabsTrigger value="control">Controle RTP</TabsTrigger>
          <TabsTrigger value="intelligent">Gestão Inteligente</TabsTrigger>
          <TabsTrigger value="analytics">Relatórios & Análises</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
          <TabsTrigger value="legacy">Sistema Legado</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-6">
          <RTPDashboard />
        </TabsContent>
        
        <TabsContent value="control" className="space-y-6">
          <RTPControlPanel />
        </TabsContent>
        
        <TabsContent value="intelligent" className="space-y-6">
          <IntelligentManagement />
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-6">
          <AnalyticsReports />
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-6">
          <OptimizedSettings />
        </TabsContent>
        
        <TabsContent value="legacy" className="space-y-6">
          <ScratchCard90TenStatus />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScratchCardManager;