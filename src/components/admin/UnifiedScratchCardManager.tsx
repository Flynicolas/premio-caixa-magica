import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DatabaseItem } from '@/types/database';
import { ScratchCardType, scratchCardTypes } from '@/types/scratchCard';
import { Plus, Trash2, Save, Package, AlertCircle, Eye, Target } from 'lucide-react';

interface UnifiedScratchCardManagerProps {
  items: DatabaseItem[];
  onRefresh: () => void;
}

interface ScratchCardProbability {
  id: string;
  item_id: string;
  scratch_type: ScratchCardType;
  probability_weight: number;
  min_quantity: number;
  max_quantity: number;
  is_active: boolean;
  item?: DatabaseItem;
}

const UnifiedScratchCardManager = ({ items, onRefresh }: UnifiedScratchCardManagerProps) => {
  const [probabilities, setProbabilities] = useState<Record<ScratchCardType, ScratchCardProbability[]>>({} as Record<ScratchCardType, ScratchCardProbability[]>);
  const [editingWeights, setEditingWeights] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    loadProbabilities();
  }, []);

  const loadProbabilities = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('scratch_card_probabilities')
        .select('*')
        .eq('is_active', true)
        .order('scratch_type')
        .order('probability_weight', { ascending: false });

      if (error) throw error;

      const grouped = (data || []).reduce((acc, prob: any) => {
        const typedProb: ScratchCardProbability = {
          id: prob.id,
          item_id: prob.item_id,
          scratch_type: prob.scratch_type as ScratchCardType,
          probability_weight: prob.probability_weight,
          min_quantity: prob.min_quantity,
          max_quantity: prob.max_quantity,
          is_active: prob.is_active,
          item: items.find((it) => it.id === prob.item_id)
        };

        if (!acc[typedProb.scratch_type]) {
          acc[typedProb.scratch_type] = [];
        }
        acc[typedProb.scratch_type].push(typedProb);
        return acc;
      }, {} as Record<ScratchCardType, ScratchCardProbability[]>);

      setProbabilities(grouped);
    } catch (error: any) {
      console.error('Erro ao carregar probabilidades:', error);
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWeightChange = (probId: string, weight: number) => {
    setEditingWeights(prev => ({
      ...prev,
      [probId]: Math.max(0, weight)
    }));
  };

  const saveChanges = async () => {
    if (Object.keys(editingWeights).length === 0) return;
    
    setSaving(true);
    try {
      const updates = Object.entries(editingWeights).map(([probId, weight]) => 
        supabase
          .from('scratch_card_probabilities')
          .update({ probability_weight: weight })
          .eq('id', probId)
      );

      await Promise.all(updates);

      toast({
        title: "Alterações salvas!",
        description: "Pesos atualizados com sucesso.",
      });

      setEditingWeights({});
      loadProbabilities();
      onRefresh();
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const addItem = async (scratchType: ScratchCardType) => {
    if (!selectedItem) {
      toast({
        title: "Selecione um item",
        description: "Escolha um item para adicionar à raspadinha",
        variant: "destructive"
      });
      return;
    }

    // Verificar se item já existe
    const existing = probabilities[scratchType]?.find(p => p.item_id === selectedItem);
    if (existing) {
      toast({
        title: "Item já existe",
        description: "Este item já está configurado para esta raspadinha",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('scratch_card_probabilities')
        .insert({
          item_id: selectedItem,
          scratch_type: scratchType,
          probability_weight: 1, // Peso padrão = 1 (sorteável)
          min_quantity: 1,
          max_quantity: 1,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Item adicionado!",
        description: "Item adicionado à raspadinha com peso 1",
      });

      setSelectedItem('');
      loadProbabilities();
      onRefresh();
    } catch (error: any) {
      console.error('Erro ao adicionar item:', error);
      toast({
        title: "Erro ao adicionar",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const removeItem = async (probId: string, itemName: string) => {
    if (!confirm(`Remover "${itemName}" desta raspadinha?`)) return;

    try {
      const { error } = await supabase
        .from('scratch_card_probabilities')
        .update({ is_active: false })
        .eq('id', probId);

      if (error) throw error;

      toast({
        title: "Item removido!",
        description: "Item removido da raspadinha",
      });

      loadProbabilities();
      onRefresh();
    } catch (error: any) {
      console.error('Erro ao remover:', error);
      toast({
        title: "Erro ao remover",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getAvailableItems = (scratchType: ScratchCardType) => {
    const usedItemIds = probabilities[scratchType]?.map(p => p.item_id) || [];
    return items.filter(item => !usedItemIds.includes(item.id));
  };

  const getStats = (scratchType: ScratchCardType) => {
    const typeProbs = probabilities[scratchType] || [];
    const drawable = typeProbs.filter(p => (editingWeights[p.id] ?? p.probability_weight) > 0);
    const visual = typeProbs.filter(p => (editingWeights[p.id] ?? p.probability_weight) === 0);
    const totalWeight = typeProbs.reduce((sum, p) => sum + (editingWeights[p.id] ?? p.probability_weight), 0);
    
    return {
      total: typeProbs.length,
      drawable: drawable.length,
      visual: visual.length,
      totalWeight,
      hasDrawable: drawable.length > 0
    };
  };

  const hasChanges = Object.keys(editingWeights).length > 0;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando gerenciamento de raspadinhas...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Package className="w-6 h-6" />
            Gerenciamento de Raspadinhas
          </h2>
          <p className="text-muted-foreground">
            Peso 0 = Visual | Peso &gt; 0 = Sorteável
          </p>
        </div>
        
        {hasChanges && (
          <Button onClick={saveChanges} disabled={saving} className="gap-2">
            <Save className="w-4 h-4" />
            {saving ? 'Salvando...' : `Salvar (${Object.keys(editingWeights).length})`}
          </Button>
        )}
      </div>

      {/* Tabs por tipo de raspadinha */}
      <Tabs defaultValue="pix" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          {Object.entries(scratchCardTypes).map(([key, config]) => {
            const stats = getStats(key as ScratchCardType);
            return (
              <TabsTrigger key={key} value={key} className="flex flex-col gap-1">
                <span className="font-medium">{config.name}</span>
                <div className="flex gap-1 text-xs">
                  <Badge variant="secondary" className="px-1 py-0">
                    {stats.drawable}
                  </Badge>
                  <Badge variant="outline" className="px-1 py-0">
                    {stats.visual}
                  </Badge>
                </div>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {Object.entries(scratchCardTypes).map(([key, config]) => {
          const scratchType = key as ScratchCardType;
          const typeProbs = probabilities[scratchType] || [];
          const stats = getStats(scratchType);
          const availableItems = getAvailableItems(scratchType);

          return (
            <TabsContent key={key} value={key}>
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-3">
                      <span className={`w-4 h-4 rounded-full ${config.bgColor}`} />
                      {config.name}
                      <Badge>R$ {config.price.toFixed(2)}</Badge>
                    </CardTitle>
                    
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800 gap-1">
                        <Target className="w-3 h-3" />
                        {stats.drawable} Sorteáveis
                      </Badge>
                      <Badge className="bg-gray-100 text-gray-800 gap-1">
                        <Eye className="w-3 h-3" />
                        {stats.visual} Visuais
                      </Badge>
                      <Badge variant="outline">
                        Peso Total: {stats.totalWeight}
                      </Badge>
                    </div>
                  </div>
                  
                  {!stats.hasDrawable && stats.total > 0 && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Atenção: Todos os itens estão com peso 0 (apenas visuais). Ninguém pode ganhar!
                      </AlertDescription>
                    </Alert>
                  )}
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Adicionar Item */}
                  <div className="flex gap-2">
                    <Select value={selectedItem} onValueChange={setSelectedItem}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Selecionar item para adicionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableItems.map(item => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name} - R$ {item.base_value.toFixed(2)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      onClick={() => addItem(scratchType)}
                      disabled={!selectedItem || availableItems.length === 0}
                      className="gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar
                    </Button>
                  </div>

                  {/* Lista de Itens */}
                  <div className="space-y-3">
                    {typeProbs.length > 0 ? (
                      typeProbs.map(prob => {
                        const currentWeight = editingWeights[prob.id] ?? prob.probability_weight;
                        const isVisual = currentWeight === 0;
                        
                        return (
                          <div key={prob.id} className={`border rounded-lg p-3 ${isVisual ? 'bg-gray-50' : 'bg-white'}`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                {prob.item?.image_url && (
                                  <img
                                    src={prob.item.image_url}
                                    alt={prob.item.name}
                                    className="w-8 h-8 object-cover rounded"
                                  />
                                )}
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{prob.item?.name}</span>
                                    <Badge variant={isVisual ? "secondary" : "default"}>
                                      {isVisual ? 'Visual' : 'Sorteável'}
                                    </Badge>
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    R$ {prob.item?.base_value?.toFixed(2)} • {prob.item?.rarity}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-muted-foreground">Peso:</span>
                                  <Input
                                    type="number"
                                    min="0"
                                    value={currentWeight}
                                    onChange={(e) => handleWeightChange(prob.id, parseInt(e.target.value) || 0)}
                                    className="w-16 h-8 text-center"
                                  />
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeItem(prob.id, prob.item?.name || '')}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>Nenhum item configurado</p>
                        <p className="text-sm">Adicione itens usando o seletor acima</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};

export default UnifiedScratchCardManager;