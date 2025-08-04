import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ScratchCardAdminDashboard from './scratch-card-probability/ScratchCardAdminDashboard';
import ScratchCardFinancialControl from './scratch-card-probability/ScratchCardFinancialControl';
import ScratchCardProbabilityManager from './scratch-card-probability/ScratchCardProbabilityManager';

const ScratchCardManager = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Gerenciamento de Raspadinhas</h1>
      
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="probabilities">Probabilidades</TabsTrigger>
          <TabsTrigger value="financial">Controle Financeiro</TabsTrigger>
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
      </Tabs>
    </div>
  );
};

export default ScratchCardManager;