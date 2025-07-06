
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DatabaseItem, ChestItemProbability } from '@/types/database';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus } from 'lucide-react';

interface ChestProbabilityManagerProps {
  items: DatabaseItem[];
  onRefresh: () => void;
}

const CHEST_TYPES = [
  { value: 'silver', label: 'Baú Prata' },
  { value: 'gold', label: 'Baú Ouro' },
  { value: 'delas', label: 'Baú Delas' },
  { value: 'diamond', label: 'Baú Diamante' },
  { value: 'ruby', label: 'Baú Ruby' },
  { value: 'premium', label: 'Baú Premium' }
];

const ChestProbabilityManager = ({ items, onRefresh }: ChestProbabilityManagerProps) => {
  const [probabilities, setProbabilities] = useState<Record<string, ChestItemProbability[]>>({});
  const [selectedChest, setSelectedChest] = useState<string>('silver');
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [probabilityWeight, setProbabilityWeight] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchProbabilities = async () => {
    try {
      const { data, error } = await supabase
        .from('chest_item_probabilities')
        .select(`
          *,
          item:items(*)
        `)
        .eq('is_active', true)
        .order('chest_type')
        .order('probability_weight', { ascending: false });

      if (error) throw error;

      // Agrupar por tipo de baú
      const grouped = (data || []).reduce((acc, prob) => {
        if (!acc[prob.chest_type]) {
          acc[prob.chest_type] = [];
        }
        acc[prob.chest_type].push(prob);
        return acc;
      }, {} as Record<string, ChestItemProbability[]>);

      setProbabilities(grouped);
    } catch (error: any) {
      console.error('Erro ao buscar probabilidades:', error);
      toast({
        title: "Erro ao carregar probabilidades",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const addItemToChest = async () => {
    if (!selectedItem) {
      toast({
        title: "Erro",
        description: "Selecione um item",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('chest_item_probabilities')
        .insert([{
          chest_type: selectedChest,
          item_id: selectedItem,
          probability_weight: probabilityWeight,
          min_quantity: 1,
          max_quantity: 1,
          is_active: true
        }]);

      if (error) throw error;

      toast({
        title: "Item adicionado!",
        description: "Item adicionado ao baú com sucesso",
      });

      setSelectedItem('');
      setProbabilityWeight(1);
      await fetchProbabilities();
      onRefresh();
    } catch (error: any) {
      console.error('Erro ao adicionar item:', error);
      toast({
        title: "Erro ao adicionar item",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const removeItemFromChest = async (probabilityId: string) => {
    if (!confirm('Tem certeza que deseja remover este item do baú?')) return;

    try {
      const { error } = await supabase
        .from('chest_item_probabilities')
        .update({ is_active: false })
        .eq('id', probabilityId);

      if (error) throw error;

      toast({
        title: "Item removido!",
        description: "Item removido do baú com sucesso",
      });

      await fetchProbabilities();
      onRefresh();
    } catch (error: any) {
      console.error('Erro ao remover item:', error);
      toast({
        title: "Erro ao remover item",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const clearAllChests = async () => {
    if (!confirm('Tem certeza que deseja limpar TODOS os baús? Esta ação não pode ser desfeita.')) return;

    try {
      const { error } = await supabase
        .from('chest_item_probabilities')
        .update({ is_active: false })
        .eq('is_active', true);

      if (error) throw error;

      toast({
        title: "Baús limpos!",
        description: "Todos os baús foram esvaziados com sucesso",
      });

      await fetchProbabilities();
      onRefresh();
    } catch (error: any) {
      console.error('Erro ao limpar baús:', error);
      toast({
        title: "Erro ao limpar baús",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchProbabilities();
  }, []);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Gerenciar Probabilidades dos Baús</CardTitle>
            <Button
              variant="destructive"
              onClick={clearAllChests}
              size="sm"
            >
              Limpar Todos os Baús
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <Label>Tipo de Baú</Label>
              <Select value={selectedChest} onValueChange={setSelectedChest}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHEST_TYPES.map(chest => (
                    <SelectItem key={chest.value} value={chest.value}>
                      {chest.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Item</Label>
              <Select value={selectedItem} onValueChange={setSelectedItem}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um item" />
                </SelectTrigger>
                <SelectContent>
                  {items.filter(item => item.is_active).map(item => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Peso da Probabilidade</Label>
              <Input
                type="number"
                min="1"
                value={probabilityWeight}
                onChange={(e) => setProbabilityWeight(parseInt(e.target.value) || 1)}
              />
            </div>

            <div className="flex items-end">
              <Button onClick={addItemToChest} disabled={loading}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CHEST_TYPES.map(chestType => (
              <Card key={chestType.value}>
                <CardHeader>
                  <CardTitle className="text-lg">{chestType.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {probabilities[chestType.value]?.length > 0 ? (
                      probabilities[chestType.value].map(prob => (
                        <div key={prob.id} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center space-x-2">
                            {prob.item?.image_url && (
                              <img
                                src={prob.item.image_url}
                                alt={prob.item.name}
                                className="w-8 h-8 object-cover rounded"
                              />
                            )}
                            <div>
                              <div className="font-medium text-sm">{prob.item?.name}</div>
                              <div className="flex items-center space-x-1">
                                <Badge className={`text-white ${getRarityColor(prob.item?.rarity || 'common')} text-xs`}>
                                  {prob.item?.rarity}
                                </Badge>
                                <span className="text-xs text-gray-500">Peso: {prob.probability_weight}</span>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItemFromChest(prob.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <p className="text-sm">Nenhum item configurado</p>
                        <p className="text-xs">Adicione itens para este baú</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChestProbabilityManager;
