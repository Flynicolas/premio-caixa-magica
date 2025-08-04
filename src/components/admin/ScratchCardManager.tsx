import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ScratchCardAdminDashboard from './scratch-card-probability/ScratchCardAdminDashboard';
import ScratchCardFinancialControl from './scratch-card-probability/ScratchCardFinancialControl';
import ScratchCardProbabilityManager from './scratch-card-probability/ScratchCardProbabilityManager';
import ScratchCardIntelligentControl from './scratch-card-probability/ScratchCardIntelligentControl';
import ScratchCardManualReleaseSystem from './scratch-card-probability/ScratchCardManualReleaseSystem';

const ScratchCardManager = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Gerenciamento de Raspadinhas</h1>
      
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="probabilities">Probabilidades</TabsTrigger>
          <TabsTrigger value="financial">Controle Financeiro</TabsTrigger>
          <TabsTrigger value="intelligent">Sistema Inteligente</TabsTrigger>
          <TabsTrigger value="manual">Liberação Manual</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-6">
          <ScratchCardAdminDashboard />
        </TabsContent>
        
        <TabsContent value="probabilities" className="space-y-6">
          <ScratchCardProbabilityManager />
        </TabsContent>
        
        <TabsContent value="financial" className="space-y-6">
          <ScratchCardFinancialControl />
        </TabsContent>
        
        <TabsContent value="intelligent" className="space-y-6">
          <ScratchCardIntelligentControl />
        </TabsContent>
        
        <TabsContent value="manual" className="space-y-6">
          <ScratchCardManualReleaseSystem />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScratchCardManager;