import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RTPControlPanel } from './RTPControlPanel';
import SmartItemConfiguration from './SmartItemConfiguration';
import ScratchCardManualReleaseSystem from './scratch-card-probability/ScratchCardManualReleaseSystem';
import AnalyticsReports from './AnalyticsReports';
import { useItemManagement } from '@/hooks/useItemManagement';

const ScratchCardManager = () => {
  const { items, refetchItems } = useItemManagement();

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Sistema RTP - Raspadinhas</h1>
        <p className="text-muted-foreground">
          Controle completo do Return to Player (RTP) e gerenciamento de prêmios
        </p>
      </div>

      <Tabs defaultValue="rtp" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="rtp">RTP</TabsTrigger>
          <TabsTrigger value="items">Configurar Itens</TabsTrigger>
          <TabsTrigger value="manual">Liberação Manual</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>
        
        <TabsContent value="rtp" className="space-y-6">
          <RTPControlPanel />
        </TabsContent>
        
        <TabsContent value="items" className="space-y-6">
          <SmartItemConfiguration 
            items={items}
            onRefresh={refetchItems}
          />
        </TabsContent>

        <TabsContent value="manual" className="space-y-6">
          <ScratchCardManualReleaseSystem />
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-6">
          <AnalyticsReports />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScratchCardManager;