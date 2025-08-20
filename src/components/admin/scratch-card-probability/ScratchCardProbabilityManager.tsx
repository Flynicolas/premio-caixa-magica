import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Plus, Save, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ScratchCardProbabilityItem from './ScratchCardProbabilityItem';
import { useItemManagement } from '@/hooks/useItemManagement';

interface ScratchCardProbability {
  id: string;
  scratch_type: string;
  item_id: string;
  probability_weight: number;
  min_quantity: number;
  max_quantity: number;
  is_active: boolean;
  created_at: string;
  item?: {
    id: string;
    name: string;
    base_value: number;
    rarity: string;
    image_url?: string;
    category: string;
  } | null;
}

const SCRATCH_TYPES = [
  { value: 'pix', label: 'Raspadinha do PIX', color: 'bg-cyan-500' },
  { value: 'sorte', label: 'Raspadinha da Sorte', color: 'bg-green-500' },
  { value: 'dupla', label: 'Raspadinha Dupla', color: 'bg-green-600' },
  { value: 'ouro', label: 'Raspadinha de Ouro', color: 'bg-yellow-500' },
  { value: 'diamante', label: 'Raspadinha Diamante', color: 'bg-blue-500' },
  { value: 'premium', label: 'Raspadinha Premium', color: 'bg-purple-500' }
];

const ScratchCardProbabilityManager = () => {
  const [probabilities, setProbabilities] = useState<ScratchCardProbability[]>([]);
  const [editingProbabilities, setEditingProbabilities] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { items } = useItemManagement();

  useEffect(() => {
    loadProbabilities();
  }, []);

  const loadProbabilities = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('scratch_card_probabilities')
        .select(`
          id,
          scratch_type,
          item_id,
          probability_weight,
          min_quantity,
          max_quantity,
          is_active,
          created_at
        `)
        .order('scratch_type')
        .order('probability_weight', { ascending: false });

      if (error) throw error;

      // Buscar informações dos itens separadamente
      const itemIds = data?.map(p => p.item_id) || [];
      const { data: itemsData } = await supabase
        .from('items')
        .select('id, name, base_value, rarity, image_url, category')
        .in('id', itemIds);

      // Combinar dados
      const enrichedData = data?.map(prob => ({
        ...prob,
        item: itemsData?.find(item => item.id === prob.item_id) || null
      })) || [];

      setProbabilities(enrichedData);
    } catch (error) {
      console.error('Erro ao carregar probabilidades:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar probabilidades das raspadinhas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProbabilityChange = (probId: string, newValue: number) => {
    setEditingProbabilities(prev => ({
      ...prev,
      [probId]: newValue
    }));
  };

  const saveProbabilities = async () => {
    try {
      setSaving(true);
      
      const updates = Object.entries(editingProbabilities).map(([id, weight]) => ({
        id,
        probability_weight: weight
      }));

      if (updates.length === 0) {
        toast({
          title: "Aviso",
          description: "Nenhuma alteração para salvar",
        });
        return;
      }

      for (const update of updates) {
        const { error } = await supabase
          .from('scratch_card_probabilities')
          .update({ probability_weight: update.probability_weight })
          .eq('id', update.id);

        if (error) throw error;
      }

      toast({
        title: "Sucesso",
        description: `${updates.length} probabilidade(s) atualizada(s)`,
      });

      setEditingProbabilities({});
      loadProbabilities();
    } catch (error) {
      console.error('Erro ao salvar probabilidades:', error);
      toast({
        title: "Erro",
        description: "Falha ao salvar probabilidades",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const addItemToScratchType = async (scratchType: string, itemId: string) => {
    try {
      // Verificar se item já existe para este tipo
      const existing = probabilities.find(
        p => p.scratch_type === scratchType && p.item_id === itemId
      );

      if (existing) {
        toast({
          title: "Aviso",
          description: "Item já configurado para este tipo de raspadinha",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('scratch_card_probabilities')
        .insert({
          scratch_type: scratchType,
          item_id: itemId,
          probability_weight: 1,
          min_quantity: 1,
          max_quantity: 1,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Item adicionado à raspadinha",
      });

      loadProbabilities();
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      toast({
        title: "Erro",
        description: "Falha ao adicionar item",
        variant: "destructive"
      });
    }
  };

  const removeItemFromScratchType = async (probId: string, itemName: string) => {
    try {
      const { error } = await supabase
        .from('scratch_card_probabilities')
        .update({ is_active: false })
        .eq('id', probId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `${itemName} removido da raspadinha`,
      });

      loadProbabilities();
    } catch (error) {
      console.error('Erro ao remover item:', error);
      toast({
        title: "Erro",
        description: "Falha ao remover item",
        variant: "destructive"
      });
    }
  };

  const getProbabilitiesByType = (scratchType: string) => {
    return probabilities.filter(p => p.scratch_type === scratchType);
  };

  const getTotalWeight = (scratchType: string) => {
    return getProbabilitiesByType(scratchType).reduce(
      (sum, prob) => sum + prob.probability_weight, 0
    );
  };

  const getAvailableItems = (scratchType: string) => {
    const usedItemIds = getProbabilitiesByType(scratchType).map(p => p.item_id);
    return items.filter(item => !usedItemIds.includes(item.id));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando probabilidades...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com ações globais */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary">
            Gerenciamento de Probabilidades - Raspadinha
          </h2>
          <p className="text-muted-foreground">
            Configure itens e probabilidades para cada tipo de raspadinha
          </p>
        </div>
        
        <div className="flex gap-3">
          {Object.keys(editingProbabilities).length > 0 && (
            <Button 
              onClick={saveProbabilities}
              disabled={saving}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              Salvar Alterações ({Object.keys(editingProbabilities).length})
            </Button>
          )}
        </div>
      </div>

      {/* Abas por tipo de raspadinha */}
      <Tabs defaultValue="pix" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          {SCRATCH_TYPES.map((type) => (
            <TabsTrigger key={type.value} value={type.value} className="gap-2">
              <div className={`w-3 h-3 rounded-full ${type.color}`} />
              {type.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {SCRATCH_TYPES.map((scratchType) => (
          <TabsContent key={scratchType.value} value={scratchType.value}>
            <ScratchTypeCard
              scratchType={scratchType}
              probabilities={getProbabilitiesByType(scratchType.value)}
              editingProbabilities={editingProbabilities}
              onProbabilityChange={handleProbabilityChange}
              onRemoveItem={removeItemFromScratchType}
              onAddItem={(itemId) => addItemToScratchType(scratchType.value, itemId)}
              availableItems={getAvailableItems(scratchType.value)}
              totalWeight={getTotalWeight(scratchType.value)}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

interface ScratchTypeCardProps {
  scratchType: { value: string; label: string; color: string };
  probabilities: ScratchCardProbability[];
  editingProbabilities: Record<string, number>;
  onProbabilityChange: (probId: string, newValue: number) => void;
  onRemoveItem: (probId: string, itemName: string) => void;
  onAddItem: (itemId: string) => void;
  availableItems: any[];
  totalWeight: number;
}

const ScratchTypeCard = ({
  scratchType,
  probabilities,
  editingProbabilities,
  onProbabilityChange,
  onRemoveItem,
  onAddItem,
  availableItems,
  totalWeight
}: ScratchTypeCardProps) => {
  const [showAddItem, setShowAddItem] = useState(false);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full ${scratchType.color}`} />
            {scratchType.label}
            <Badge variant="outline" className="ml-2">
              {probabilities.length} itens
            </Badge>
          </CardTitle>
          
          <div className="flex items-center gap-3">
            <Badge className="bg-blue-100 text-blue-800">
              <BarChart3 className="w-3 h-3 mr-1" />
              Peso Total: {totalWeight}
            </Badge>
            
            <Button
              size="sm"
              onClick={() => setShowAddItem(!showAddItem)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar Item
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Selector de itens */}
        {showAddItem && (
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <h4 className="font-medium mb-3">Adicionar Novo Item</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                {availableItems.map((item) => (
                  <Button
                    key={item.id}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onAddItem(item.id);
                      setShowAddItem(false);
                    }}
                    className="justify-start h-auto p-2"
                  >
                    <div className="text-left">
                      <div className="font-medium text-xs truncate">{item.name}</div>
                      <div className="text-xs text-muted-foreground">
                        R$ {item.base_value?.toFixed(2)} • {item.rarity}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
              {availableItems.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Todos os itens já foram adicionados a esta raspadinha
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Lista de itens configurados */}
        <div className="space-y-3">
          {probabilities.length > 0 ? (
            probabilities.map(prob => (
              <ScratchCardProbabilityItem
                key={prob.id}
                probability={prob}
                editingValue={editingProbabilities[prob.id]}
                onProbabilityChange={onProbabilityChange}
                onRemoveItem={onRemoveItem}
                totalWeight={totalWeight}
              />
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Nenhum item configurado para esta raspadinha</p>
              <p className="text-sm">Clique em "Adicionar Item" para começar</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ScratchCardProbabilityManager;