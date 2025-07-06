
import React, { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ItemChestAssignmentProps {
  itemId: string;
  onUpdate?: () => void;
}

const CHEST_TYPES = [
  { value: 'silver', label: 'Baú Prata', color: 'bg-gray-500' },
  { value: 'gold', label: 'Baú Ouro', color: 'bg-yellow-500' },
  { value: 'delas', label: 'Baú Delas', color: 'bg-green-500' },
  { value: 'diamond', label: 'Baú Diamante', color: 'bg-blue-500' },
  { value: 'ruby', label: 'Baú Ruby', color: 'bg-red-500' },
  { value: 'premium', label: 'Baú Premium', color: 'bg-purple-500' }
];

const ItemChestAssignment = ({ itemId, onUpdate }: ItemChestAssignmentProps) => {
  const [assignedChests, setAssignedChests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAssignedChests();
  }, [itemId]);

  const fetchAssignedChests = async () => {
    try {
      const { data, error } = await supabase
        .from('chest_item_probabilities')
        .select('chest_type')
        .eq('item_id', itemId)
        .eq('is_active', true);

      if (error) throw error;

      setAssignedChests(data?.map(d => d.chest_type) || []);
    } catch (error: any) {
      console.error('Erro ao buscar baús atribuídos:', error);
    }
  };

  const handleChestToggle = async (chestType: string, checked: boolean) => {
    setLoading(true);
    try {
      if (checked) {
        // Adicionar item ao baú
        const { error } = await supabase
          .from('chest_item_probabilities')
          .insert({
            chest_type: chestType,
            item_id: itemId,
            probability_weight: 1,
            min_quantity: 1,
            max_quantity: 1,
            is_active: true
          });

        if (error) throw error;
        setAssignedChests([...assignedChests, chestType]);
      } else {
        // Remover item do baú
        const { error } = await supabase
          .from('chest_item_probabilities')
          .update({ is_active: false })
          .eq('chest_type', chestType)
          .eq('item_id', itemId);

        if (error) throw error;
        setAssignedChests(assignedChests.filter(c => c !== chestType));
      }

      toast({
        title: "Baús atualizados!",
        description: `Item ${checked ? 'adicionado ao' : 'removido do'} baú com sucesso.`,
      });

      onUpdate?.();
    } catch (error: any) {
      console.error('Erro ao atualizar baús:', error);
      toast({
        title: "Erro ao atualizar baús",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Baús atribuídos ao item</Label>
      <div className="grid grid-cols-2 gap-3">
        {CHEST_TYPES.map(chest => (
          <div key={chest.value} className="flex items-center space-x-2">
            <Checkbox
              id={`chest-${chest.value}`}
              checked={assignedChests.includes(chest.value)}
              onCheckedChange={(checked) => handleChestToggle(chest.value, !!checked)}
              disabled={loading}
            />
            <Label htmlFor={`chest-${chest.value}`} className="flex items-center space-x-2">
              <Badge className={`text-white ${chest.color} text-xs`}>
                {chest.label}
              </Badge>
            </Label>
          </div>
        ))}
      </div>
      {assignedChests.length > 0 && (
        <div className="text-xs text-gray-500">
          Atribuído a {assignedChests.length} baú(s)
        </div>
      )}
    </div>
  );
};

export default ItemChestAssignment;
