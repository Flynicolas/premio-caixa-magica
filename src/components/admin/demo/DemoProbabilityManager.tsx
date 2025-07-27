import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Crown, Save, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import DemoChestCard from './DemoChestCard';

interface DatabaseItem {
  id: string;
  name: string;
  image_url: string | null;
  rarity: string;
  base_value: number;
  chest_types: string[];
  is_active: boolean;
}

interface DemoProbability {
  item_id: string;
  item_name: string;
  item_image: string | null;
  rarity: string;
  base_value: number;
  probability_weight: number;
}

const CHEST_TYPES = [
  { value: 'basic', label: 'Baú Básico', color: 'bg-gray-500', price: 5.0 },
  { value: 'silver', label: 'Baú Prata', color: 'bg-slate-400', price: 10.0 },
  { value: 'gold', label: 'Baú Ouro', color: 'bg-yellow-500', price: 25.0 },
  { value: 'diamond', label: 'Baú Diamante', color: 'bg-blue-500', price: 50.0 }
];

const DemoProbabilityManager = () => {
  const [items, setItems] = useState<DatabaseItem[]>([]);
  const [demoSettings, setDemoSettings] = useState<any>(null);
  const [demoProbabilities, setDemoProbabilities] = useState<Record<string, DemoProbability[]>>({});
  const [editingWeights, setEditingWeights] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Buscar itens ativos
      const { data: itemsData, error: itemsError } = await supabase
        .from('items')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (itemsError) throw itemsError;

      // Buscar configurações demo
      const { data: settingsData, error: settingsError } = await supabase
        .from('demo_settings')
        .select('*')
        .limit(1)
        .single();

      if (settingsError && settingsError.code !== 'PGRST116') throw settingsError;

      setItems(itemsData || []);
      setDemoSettings(settingsData);
      
      // Processar probabilidades demo
      if (settingsData?.probabilidades_chest) {
        const demoProbs: Record<string, DemoProbability[]> = {};
        
        CHEST_TYPES.forEach(chest => {
          const chestConfig = settingsData.probabilidades_chest[chest.value];
          if (chestConfig?.items) {
            demoProbs[chest.value] = chestConfig.items.map((item: any) => ({
              item_id: item.item_id,
              item_name: item.item_name,
              item_image: item.item_image,
              rarity: item.rarity,
              base_value: item.base_value,
              probability_weight: item.probability_weight || 1
            }));
          } else {
            demoProbs[chest.value] = [];
          }
        });
        
        setDemoProbabilities(demoProbs);
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addItemToChest = async (itemId: string, chestType: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const newProb: DemoProbability = {
      item_id: item.id,
      item_name: item.name,
      item_image: item.image_url,
      rarity: item.rarity,
      base_value: item.base_value,
      probability_weight: 1
    };

    setDemoProbabilities(prev => ({
      ...prev,
      [chestType]: [...(prev[chestType] || []), newProb]
    }));

    toast({
      title: "Item adicionado",
      description: `${item.name} foi adicionado ao ${CHEST_TYPES.find(c => c.value === chestType)?.label}`,
    });
  };

  const updateWeight = (chestType: string, itemId: string, newWeight: number) => {
    const key = `${chestType}-${itemId}`;
    setEditingWeights(prev => ({
      ...prev,
      [key]: newWeight
    }));

    setDemoProbabilities(prev => ({
      ...prev,
      [chestType]: prev[chestType].map(item => 
        item.item_id === itemId 
          ? { ...item, probability_weight: newWeight }
          : item
      )
    }));
  };

  const removeItem = (chestType: string, itemId: string) => {
    setDemoProbabilities(prev => ({
      ...prev,
      [chestType]: prev[chestType].filter(item => item.item_id !== itemId)
    }));

    const itemName = demoProbabilities[chestType]?.find(i => i.item_id === itemId)?.item_name;
    toast({
      title: "Item removido",
      description: `${itemName} foi removido do baú`,
    });
  };

  const saveChanges = async () => {
    setSaving(true);
    try {
      // Preparar dados para salvar
      const updatedProbabilities: Record<string, any> = {};
      
      CHEST_TYPES.forEach(chest => {
        const chestProbs = demoProbabilities[chest.value] || [];
        updatedProbabilities[chest.value] = {
          win_rate: demoSettings?.probabilidades_chest?.[chest.value]?.win_rate || 0.8,
          rare_rate: demoSettings?.probabilidades_chest?.[chest.value]?.rare_rate || 0.3,
          items: chestProbs
        };
      });

      // Atualizar ou criar configurações demo
      if (demoSettings?.id) {
        const { error } = await supabase
          .from('demo_settings')
          .update({
            probabilidades_chest: updatedProbabilities,
            updated_at: new Date().toISOString()
          })
          .eq('id', demoSettings.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('demo_settings')
          .insert({
            saldo_inicial: 1000,
            tempo_reset_horas: 24,
            probabilidades_chest: updatedProbabilities,
            itens_demo: []
          });

        if (error) throw error;
      }

      setEditingWeights({});
      toast({
        title: "Alterações salvas!",
        description: "Configurações de probabilidade demo atualizadas com sucesso",
      });

      await fetchData();
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

  const getAvailableItems = (chestType: string) => {
    const usedItemIds = demoProbabilities[chestType]?.map(p => p.item_id) || [];
    return items.filter(item => 
      item.chest_types.includes(chestType) && 
      !usedItemIds.includes(item.id)
    );
  };

  const hasChanges = Object.keys(editingWeights).length > 0 || 
    Object.values(demoProbabilities).some(probs => probs.length > 0);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5" />
            Probabilidades Demo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Carregando...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5" />
              Gerenciar Probabilidades Demo
            </CardTitle>
            {hasChanges && (
              <Button onClick={saveChanges} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {hasChanges && (
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Você tem alterações não salvas. Clique em "Salvar Alterações" para aplicar as modificações.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {CHEST_TYPES.map(chest => (
              <DemoChestCard
                key={chest.value}
                chestType={chest}
                probabilities={demoProbabilities[chest.value] || []}
                availableItems={getAvailableItems(chest.value)}
                onAddItem={addItemToChest}
                onUpdateWeight={updateWeight}
                onRemoveItem={removeItem}
                demoSettings={demoSettings}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DemoProbabilityManager;