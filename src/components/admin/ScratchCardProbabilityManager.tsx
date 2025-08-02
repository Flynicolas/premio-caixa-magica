import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DatabaseItem } from '@/types/database';
import { ScratchCardType, scratchCardTypes } from '@/types/scratchCard';
import { AlertCircle, Save, Sparkles, Settings } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ScratchCardConfigCard from './scratch-card-probability/ScratchCardConfigCard';
import ScratchCardFinancialControl from './scratch-card-probability/ScratchCardFinancialControl';

interface ScratchCardProbabilityManagerProps {
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

const ScratchCardProbabilityManager = ({ items, onRefresh }: ScratchCardProbabilityManagerProps) => {
  const [probabilities, setProbabilities] = useState<Record<ScratchCardType, ScratchCardProbability[]>>({} as Record<ScratchCardType, ScratchCardProbability[]>);
  const [editingProbabilities, setEditingProbabilities] = useState<Record<string, number>>({});
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProbabilities();
    
    // Configurar realtime
    const channel = supabase
      .channel('scratch-probabilities-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'scratch_card_probabilities' },
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
        .from('scratch_card_probabilities')
        .select(`
          *,
          item:items(*)
        `)
        .eq('is_active', true)
        .order('scratch_type')
        .order('probability_weight', { ascending: false });

      if (error) throw error;

      const grouped = (data || []).reduce((acc, prob) => {
        const typedProb: ScratchCardProbability = {
          id: prob.id,
          item_id: prob.item_id,
          scratch_type: prob.scratch_type as ScratchCardType,
          probability_weight: prob.probability_weight,
          min_quantity: prob.min_quantity,
          max_quantity: prob.max_quantity,
          is_active: prob.is_active,
          item: (prob.item && typeof prob.item === 'object' && prob.item !== null && 'id' in prob.item) ? prob.item as unknown as DatabaseItem : undefined
        };

        if (!acc[typedProb.scratch_type]) {
          acc[typedProb.scratch_type] = [];
        }
        acc[typedProb.scratch_type].push(typedProb);
        return acc;
      }, {} as Record<ScratchCardType, ScratchCardProbability[]>);

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

  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      const updates = Object.entries(editingProbabilities).map(([probId, weight]) => 
        supabase
          .from('scratch_card_probabilities')
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

  const addItemToScratchCard = async (itemId: string, scratchType: ScratchCardType, weight: number = 1) => {
    try {
      const { error } = await supabase
        .from('scratch_card_probabilities')
        .insert({
          item_id: itemId,
          scratch_type: scratchType,
          probability_weight: weight,
          min_quantity: 1,
          max_quantity: 1,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Item adicionado!",
        description: "Item adicionado à raspadinha com sucesso",
      });

      fetchProbabilities();
      onRefresh();
    } catch (error: any) {
      console.error('Erro ao adicionar item:', error);
      toast({
        title: "Erro ao adicionar item",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const removeItemFromScratchCard = async (probabilityId: string, itemName: string) => {
    if (!confirm(`Tem certeza que deseja remover "${itemName}" da raspadinha?`)) return;

    try {
      const { error } = await supabase
        .from('scratch_card_probabilities')
        .update({ is_active: false })
        .eq('id', probabilityId);

      if (error) throw error;

      toast({
        title: "Item removido!",
        description: "Item removido da raspadinha com sucesso",
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

  const hasChanges = Object.keys(editingProbabilities).length > 0;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="manage" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manage" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Gerenciar Raspadinhas
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Controle Financeiro 90/10
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manage">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Gerenciar Probabilidades das Raspadinhas</CardTitle>
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

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {Object.entries(scratchCardTypes).map(([key, config]) => (
                  <ScratchCardConfigCard
                    key={key}
                    scratchType={key as ScratchCardType}
                    config={config}
                    probabilities={probabilities[key as ScratchCardType] || []}
                    availableItems={items}
                    editingProbabilities={editingProbabilities}
                    onProbabilityChange={handleProbabilityChange}
                    onAddItem={addItemToScratchCard}
                    onRemoveItem={removeItemFromScratchCard}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial">
          <ScratchCardFinancialControl />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScratchCardProbabilityManager;