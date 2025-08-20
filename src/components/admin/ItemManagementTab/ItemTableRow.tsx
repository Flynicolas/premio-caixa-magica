
import React, { useState, useEffect } from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit, Trash2, Image, Save, Settings, Package } from 'lucide-react';
import { DatabaseItem } from '@/types/database';
import ItemChestAssignment from '../ItemChestAssignment';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ItemUsage {
  usedInChests: boolean;
  usedInScratch: string[];  // Array of scratch types where item is used
  totalUsages: number;
}

interface ItemTableRowProps {
  item: DatabaseItem;
  onEdit: (item: DatabaseItem) => void;
  onDelete: (id: string, name: string) => void;
  onToggleActive: (item: DatabaseItem) => void;
  onUpdate: () => void;
}

const ItemTableRow = ({ item, onEdit, onDelete, onToggleActive, onUpdate }: ItemTableRowProps) => {
  const [probability, setProbability] = useState(item.probability_weight || 0);
  const [isSaving, setIsSaving] = useState(false);
  const [usage, setUsage] = useState<ItemUsage>({
    usedInChests: false,
    usedInScratch: [],
    totalUsages: 0
  });
  const [loadingUsage, setLoadingUsage] = useState(true);

  // Carregar informações de uso do item
  const loadItemUsage = async () => {
    try {
      setLoadingUsage(true);
      
      // Verificar uso em baús (chest_item_probabilities)
      const { data: chestUsage } = await supabase
        .from('chest_item_probabilities')
        .select('id')
        .eq('item_id', item.id)
        .eq('is_active', true);

      // Verificar uso em raspadinhas (scratch_card_probabilities)
      const { data: scratchUsage } = await supabase
        .from('scratch_card_probabilities')
        .select('scratch_type')
        .eq('item_id', item.id)
        .eq('active', true);

      const scratchTypes = scratchUsage?.map(s => s.scratch_type) || [];
      
      setUsage({
        usedInChests: (chestUsage?.length || 0) > 0,
        usedInScratch: scratchTypes,
        totalUsages: (chestUsage?.length || 0) + scratchTypes.length
      });
    } catch (error) {
      console.error('Erro ao carregar uso do item:', error);
    } finally {
      setLoadingUsage(false);
    }
  };

  useEffect(() => {
    loadItemUsage();
  }, [item.id]);

  const handleProbabilityChange = (value: string) => {
    const numValue = parseInt(value) || 0;
    if (numValue >= 0 && numValue <= 100) {
      setProbability(numValue);
    }
  };

  const saveProbability = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('items')
        .update({ probability_weight: probability })
        .eq('id', item.id);

      if (error) throw error;
      
      toast.success('Probabilidade atualizada!');
      onUpdate();
    } catch (error) {
      console.error('Erro ao atualizar probabilidade:', error);
      toast.error('Erro ao atualizar probabilidade');
    } finally {
      setIsSaving(false);
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const renderUsageBadges = () => {
    if (loadingUsage) {
      return <Badge variant="outline">Carregando...</Badge>;
    }

    if (usage.totalUsages === 0) {
      return <Badge variant="secondary">Não usado</Badge>;
    }

    return (
      <div className="flex flex-wrap gap-1">
        {usage.usedInChests && (
          <Badge variant="outline" className="text-xs">
            <Package className="h-3 w-3 mr-1" />
            Baús
          </Badge>
        )}
        {usage.usedInScratch.length > 0 && (
          <Badge variant="outline" className="text-xs">
            <Settings className="h-3 w-3 mr-1" />
            {usage.usedInScratch.length} Raspadinha{usage.usedInScratch.length > 1 ? 's' : ''}
          </Badge>
        )}
      </div>
    );
  };

  return (
    <TableRow key={item.id}>
      <TableCell>
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-12 h-12 object-cover rounded"
          />
        ) : (
          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
            <Image className="w-6 h-6 text-gray-400" />
          </div>
        )}
      </TableCell>
      <TableCell className="font-medium">{item.name}</TableCell>
      <TableCell>{formatCurrency(item.base_value)}</TableCell>
      <TableCell>
        <Badge className={`text-white ${getRarityColor(item.rarity)}`}>
          {item.rarity}
        </Badge>
      </TableCell>
      <TableCell>
        {renderUsageBadges()}
      </TableCell>
      <TableCell>
        <ItemChestAssignment 
          itemId={item.id} 
          onUpdate={() => {
            onUpdate();
            loadItemUsage(); // Recarregar uso após atualização
          }}
        />
      </TableCell>
      <TableCell>
        <Switch
          checked={item.is_active}
          onCheckedChange={() => onToggleActive(item)}
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(item)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          {usage.usedInScratch.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              asChild
              title="Gerenciar em Raspadinhas"
            >
              <a href="/admin?tab=scratch&subtab=items">
                <Settings className="w-4 h-4" />
              </a>
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(item.id, item.name)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default ItemTableRow;
