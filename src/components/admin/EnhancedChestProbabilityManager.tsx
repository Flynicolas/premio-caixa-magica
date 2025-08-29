
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DatabaseItem, ChestItemProbability } from '@/types/database';
import { AlertCircle, Save, Crown, History } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ChestCard from './EnhancedChestProbabilityManager/ChestCard';
import ManualReleaseDialog from './ManualReleaseDialog';
import ManualReleaseHistory from './ManualReleaseHistory';
import CompactChestManager from './chest-probability/CompactChestManager';

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
  const [manualReleaseDialog, setManualReleaseDialog] = useState<{
    isOpen: boolean;
    probabilityId: string;
    itemName: string;
    chestType: string;
  }>({
    isOpen: false,
    probabilityId: '',
    itemName: '',
    chestType: ''
  });
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

  const handleManualRelease = async (probId: string, itemName: string, chestType: string) => {
    // Agora usando o novo sistema com modal de confirmação
    setManualReleaseDialog({
      isOpen: true,
      probabilityId: probId,
      itemName,
      chestType
    });
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

  const hasChanges = Object.keys(editingProbabilities).length > 0;

  return (
    <CompactChestManager items={items} onRefresh={onRefresh} />
  );
};

export default EnhancedChestProbabilityManager;
