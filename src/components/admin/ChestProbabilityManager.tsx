
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { DatabaseItem, ChestItemProbability } from '@/types/database';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings } from 'lucide-react';
import { ChestConfigurationCard } from './chest-probability/ChestConfigurationCard';
import { chestProbabilityService } from './chest-probability/chestProbabilityService';
import { chestTypes } from './chest-probability/chestTypes';

interface ChestProbabilityManagerProps {
  items: DatabaseItem[];
  onRefresh: () => void;
}

const ChestProbabilityManager = ({ items, onRefresh }: ChestProbabilityManagerProps) => {
  const { toast } = useToast();
  const [probabilities, setProbabilities] = useState<ChestItemProbability[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedChest, setSelectedChest] = useState('silver');

  const fetchProbabilities = async () => {
    try {
      const data = await chestProbabilityService.fetchProbabilities();
      setProbabilities(data);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar probabilidades",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchProbabilities();
  }, []);

  const getChestProbabilities = (chestType: string) => {
    return probabilities.filter(p => p.chest_type === chestType && p.is_active);
  };

  const addItemToChest = async (itemId: string, chestType: string) => {
    setLoading(true);
    try {
      await chestProbabilityService.addItemToChest(itemId, chestType);
      toast({
        title: "Sucesso",
        description: "Item adicionado ao baú com sucesso",
        variant: "default"
      });
      fetchProbabilities();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProbabilityWeight = async (probabilityId: string, newWeight: number) => {
    try {
      await chestProbabilityService.updateProbabilityWeight(probabilityId, newWeight);
      toast({
        title: "Sucesso",
        description: "Peso atualizado com sucesso",
        variant: "default"
      });
      fetchProbabilities();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const removeItemFromChest = async (probabilityId: string) => {
    try {
      await chestProbabilityService.removeItemFromChest(probabilityId);
      toast({
        title: "Sucesso",
        description: "Item removido do baú",
        variant: "default"
      });
      fetchProbabilities();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Configuração de Probabilidades dos Baús
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedChest} onValueChange={setSelectedChest}>
          <TabsList className="grid w-full grid-cols-6">
            {Object.entries(chestTypes).map(([key, chest]) => (
              <TabsTrigger key={key} value={key} className="text-xs">
                {chest.name.split(' ')[1]}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {Object.entries(chestTypes).map(([chestType, chestInfo]) => {
            const chestProbs = getChestProbabilities(chestType);
            const availableItems = items.filter(item => 
              item.is_active && !chestProbs.some(p => p.item_id === item.id)
            );

            return (
              <TabsContent key={chestType} value={chestType}>
                <ChestConfigurationCard
                  chestType={chestType}
                  chestName={chestInfo.name}
                  chestPrice={chestInfo.price}
                  probabilities={chestProbs}
                  availableItems={availableItems}
                  onAddItem={addItemToChest}
                  onUpdateWeight={updateProbabilityWeight}
                  onRemoveItem={removeItemFromChest}
                />
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ChestProbabilityManager;
