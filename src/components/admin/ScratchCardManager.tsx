import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, BarChart3 } from 'lucide-react';
import { useItemManagement } from '@/hooks/useItemManagement';
import ScratchCardProbabilityManager from './ScratchCardProbabilityManager';
import ScratchCardFinancialControl from './scratch-card-probability/ScratchCardFinancialControl';

const ScratchCardManager = () => {
  const { items, isAdmin, refetchItems } = useItemManagement();

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Acesso restrito a administradores.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="manage" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manage" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Gerenciar Itens
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Controle 90/10
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manage">
          <ScratchCardProbabilityManager 
            items={items} 
            onRefresh={refetchItems} 
          />
        </TabsContent>

        <TabsContent value="financial">
          <ScratchCardFinancialControl />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScratchCardManager;