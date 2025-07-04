
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DatabaseItem, ChestItemProbability } from '@/types/database';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Settings } from 'lucide-react';

interface ChestProbabilityManagerProps {
  items: DatabaseItem[];
  onRefresh: () => void;
}

const ChestProbabilityManager = ({ items, onRefresh }: ChestProbabilityManagerProps) => {
  const { toast } = useToast();
  const [probabilities, setProbabilities] = useState<ChestItemProbability[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedChest, setSelectedChest] = useState('silver');

  const chestTypes = {
    silver: { name: 'Baú de Prata', price: 10 },
    gold: { name: 'Baú de Ouro', price: 25 },
    delas: { name: 'Baú Delas', price: 50 },
    diamond: { name: 'Baú de Diamante', price: 100 },
    ruby: { name: 'Baú de Rubi', price: 250 },
    premium: { name: 'Baú Premium', price: 500 }
  };

  const fetchProbabilities = async () => {
    try {
      const { data, error } = await supabase
        .from('chest_item_probabilities')
        .select(`
          *,
          item:items(*)
        `)
        .order('chest_type')
        .order('probability_weight', { ascending: false });

      if (error) throw error;
      
      // Type cast para garantir que os tipos correspondam às interfaces
      const typedData = (data || []).map(prob => ({
        ...prob,
        chest_type: prob.chest_type as 'silver' | 'gold' | 'delas' | 'diamond' | 'ruby' | 'premium',
        item: prob.item ? {
          ...prob.item,
          rarity: prob.item.rarity as 'common' | 'rare' | 'epic' | 'legendary',
          delivery_type: prob.item.delivery_type as 'digital' | 'physical'
        } : undefined
      }));
      
      setProbabilities(typedData);
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

  const calculateTotalWeight = (chestType: string) => {
    return getChestProbabilities(chestType).reduce((sum, p) => sum + p.probability_weight, 0);
  };

  const getItemProbabilityPercentage = (weight: number, chestType: string) => {
    const total = calculateTotalWeight(chestType);
    return total > 0 ? ((weight / total) * 100).toFixed(1) : '0';
  };

  const addItemToChest = async (itemId: string, chestType: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('chest_item_probabilities')
        .insert([{
          chest_type: chestType,
          item_id: itemId,
          probability_weight: 1,
          min_quantity: 1,
          max_quantity: 1,
          is_active: true
        }]);

      if (error) throw error;

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
      const { error } = await supabase
        .from('chest_item_probabilities')
        .update({ probability_weight: newWeight })
        .eq('id', probabilityId);

      if (error) throw error;

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
      const { error } = await supabase
        .from('chest_item_probabilities')
        .update({ is_active: false })
        .eq('id', probabilityId);

      if (error) throw error;

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

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const ChestConfiguration = ({ chestType }: { chestType: string }) => {
    const chestProbs = getChestProbabilities(chestType);
    const availableItems = items.filter(item => 
      item.is_active && !chestProbs.some(p => p.item_id === item.id)
    );

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">
              {chestTypes[chestType as keyof typeof chestTypes].name}
            </h3>
            <p className="text-sm text-muted-foreground">
              R$ {chestTypes[chestType as keyof typeof chestTypes].price} • 
              {chestProbs.length} itens configurados
            </p>
          </div>
          {availableItems.length > 0 && (
            <Select onValueChange={(itemId) => addItemToChest(itemId, chestType)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Adicionar item..." />
              </SelectTrigger>
              <SelectContent>
                {availableItems.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name} (R$ {item.base_value.toFixed(2)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="space-y-2">
          {chestProbs.map((prob) => (
            <div key={prob.id} className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center space-x-3">
                {prob.item?.image_url && (
                  <img
                    src={prob.item.image_url}
                    alt={prob.item.name}
                    className="w-8 h-8 object-cover rounded"
                  />
                )}
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{prob.item?.name}</span>
                    <Badge className={`text-white text-xs ${getRarityColor(prob.item?.rarity || 'common')}`}>
                      {prob.item?.rarity}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    R$ {prob.item?.base_value.toFixed(2)} • 
                    {getItemProbabilityPercentage(prob.probability_weight, chestType)}% chance
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Label className="text-xs">Peso:</Label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={prob.probability_weight}
                  onChange={(e) => {
                    const newWeight = parseInt(e.target.value) || 1;
                    updateProbabilityWeight(prob.id, newWeight);
                  }}
                  className="w-16 h-8"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeItemFromChest(prob.id)}
                  className="h-8"
                >
                  ✕
                </Button>
              </div>
            </div>
          ))}
          {chestProbs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhum item configurado para este baú.</p>
              <p className="text-sm">Use o seletor acima para adicionar itens.</p>
            </div>
          )}
        </div>
      </div>
    );
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
          
          {Object.keys(chestTypes).map((chestType) => (
            <TabsContent key={chestType} value={chestType}>
              <ChestConfiguration chestType={chestType} />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ChestProbabilityManager;
