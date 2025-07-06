
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DatabaseItem, ChestItemProbability } from '@/types/database';
import { AlertCircle, Trash2, Plus, Save, Unlock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EnhancedChestProbabilityManagerProps {
  items: DatabaseItem[];
  onRefresh: () => void;
}

const CHEST_TYPES = [
  { value: 'silver', label: 'Baú Prata', color: 'bg-gray-500' },
  { value: 'gold', label: 'Baú Ouro', color: 'bg-yellow-500' },
  { value: 'delas', label: 'Baú Delas', color: 'bg-green-500' },
  { value: 'diamond', label: 'Baú Diamante', color: 'bg-blue-500' },
  { value: 'ruby', label: 'Baú Ruby', color: 'bg-red-500' },
  { value: 'premium', label: 'Baú Premium', color: 'bg-purple-500' }
];

const EnhancedChestProbabilityManager = ({ items, onRefresh }: EnhancedChestProbabilityManagerProps) => {
  const [probabilities, setProbabilities] = useState<Record<string, ChestItemProbability[]>>({});
  const [editingProbabilities, setEditingProbabilities] = useState<Record<string, number>>({});
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProbabilities();
    
    // Configurar realtime
    const channel = supabase
      .channel('chest-probabilities-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'chest_item_probabilities' },
        (payload) => {
          console.log('Atualização em tempo real:', payload);
          fetchProbabilities();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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

      const grouped = (data || []).reduce((acc, prob) => {
        const typedProb: ChestItemProbability = {
          ...prob,
          chest_type: prob.chest_type as 'silver' | 'gold' | 'delas' | 'diamond' | 'ruby' | 'premium',
          item: prob.item ? {
            ...prob.item,
            rarity: prob.item.rarity as 'common' | 'rare' | 'epic' | 'legendary',
            delivery_type: prob.item.delivery_type as 'digital' | 'physical'
          } : undefined
        };

        if (!acc[typedProb.chest_type]) {
          acc[typedProb.chest_type] = [];
        }
        acc[typedProb.chest_type].push(typedProb);
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

  const handleProbabilityChange = (probId: string, newValue: number) => {
    setEditingProbabilities(prev => ({
      ...prev,
      [probId]: newValue
    }));
  };

  const handleManualRelease = async (probId: string, itemName: string) => {
    if (!confirm(`Tem certeza que deseja liberar manualmente o item "${itemName}"?`)) return;

    try {
      const { error } = await supabase
        .from('chest_item_probabilities')
        .update({ 
          liberado_manual: true,
          sorteado_em: new Date().toISOString()
        })
        .eq('id', probId);

      if (error) throw error;

      toast({
        title: "Item liberado!",
        description: `O item "${itemName}" foi liberado manualmente.`,
      });

      fetchProbabilities();
      onRefresh();
    } catch (error: any) {
      console.error('Erro ao liberar item:', error);
      toast({
        title: "Erro ao liberar item",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      const updates = Object.entries(editingProbabilities).map(([probId, weight]) => 
        supabase
          .from('chest_item_probabilities')
          .update({ probability_weight: weight })
          .eq('id', probId)
      );

      await Promise.all(updates);

      toast({
        title: "Alterações salvas!",
        description: "Todas as probabilidades foram atualizadas com sucesso.",
      });

      setEditingProbabilities({});
      setShowSaveConfirmation(false);
      fetchProbabilities();
      onRefresh();
    } catch (error: any) {
      console.error('Erro ao salvar alterações:', error);
      toast({
        title: "Erro ao salvar alterações",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const removeItemFromChest = async (probabilityId: string, itemName: string) => {
    if (!confirm(`Tem certeza que deseja remover "${itemName}" do baú?`)) return;

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

      fetchProbabilities();
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

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const hasChanges = Object.keys(editingProbabilities).length > 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Gerenciar Probabilidades dos Baús</CardTitle>
            {hasChanges && (
              <Button onClick={() => setShowSaveConfirmation(true)} disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                Salvar Alterações
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {showSaveConfirmation && (
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Tem certeza que deseja salvar todas as alterações? Isso atualizará as probabilidades no banco de dados.
                <div className="flex space-x-2 mt-3">
                  <Button size="sm" onClick={handleSaveChanges} disabled={loading}>
                    {loading ? 'Salvando...' : 'Confirmar'}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowSaveConfirmation(false)}>
                    Cancelar
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CHEST_TYPES.map(chestType => (
              <Card key={chestType.value}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Badge className={`text-white ${chestType.color}`}>
                      {chestType.label}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {probabilities[chestType.value]?.length > 0 ? (
                      probabilities[chestType.value].map(prob => (
                        <div key={prob.id} className="border rounded-lg p-3 space-y-2">
                          <div className="flex items-center justify-between">
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
                                <Badge className={`text-white ${getRarityColor(prob.item?.rarity || 'common')} text-xs`}>
                                  {prob.item?.rarity}
                                </Badge>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItemFromChest(prob.id, prob.item?.name || '')}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Label className="text-xs">Probabilidade (%):</Label>
                              <Input
                                type="number"
                                min="1"
                                max="100"
                                value={editingProbabilities[prob.id] ?? prob.probability_weight}
                                onChange={(e) => handleProbabilityChange(prob.id, parseInt(e.target.value) || 1)}
                                className="w-16 h-6 text-xs"
                              />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <Button
                                size="sm"
                                variant={prob.liberado_manual ? "secondary" : "outline"}
                                onClick={() => handleManualRelease(prob.id, prob.item?.name || '')}
                                disabled={prob.liberado_manual}
                                className="text-xs"
                              >
                                <Unlock className="w-3 h-3 mr-1" />
                                {prob.liberado_manual ? 'Liberado' : 'Liberar'}
                              </Button>
                              
                              {prob.sorteado_em && (
                                <span className="text-xs text-green-600">
                                  Sorteado
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        <p className="text-sm">Nenhum item configurado</p>
                        <p className="text-xs">Adicione itens na aba "Itens"</p>
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

export default EnhancedChestProbabilityManager;
