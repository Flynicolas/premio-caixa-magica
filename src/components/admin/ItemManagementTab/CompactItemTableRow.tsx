import React, { useState, useEffect } from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Image, Settings, Package, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DatabaseItem } from '@/types/database';
import ItemChestAssignment from '../ItemChestAssignment';
import { supabase } from '@/integrations/supabase/client';

interface ItemUsage {
  usedInChests: boolean;
  usedInScratch: string[];
  totalUsages: number;
}

interface CompactItemTableRowProps {
  item: DatabaseItem;
  onEdit: (item: DatabaseItem) => void;
  onDelete: (id: string, name: string) => void;
  onToggleActive: (item: DatabaseItem) => void;
  onUpdate: () => void;
  density: 'compact' | 'normal' | 'comfortable';
}

const CompactItemTableRow: React.FC<CompactItemTableRowProps> = ({
  item,
  onEdit,
  onDelete,
  onToggleActive,
  onUpdate,
  density
}) => {
  const [usage, setUsage] = useState<ItemUsage>({
    usedInChests: false,
    usedInScratch: [],
    totalUsages: 0
  });
  const [loadingUsage, setLoadingUsage] = useState(true);

  // Load item usage information
  const loadItemUsage = async () => {
    try {
      setLoadingUsage(true);
      
      // Check chest usage
      const { data: chestUsage } = await supabase
        .from('chest_item_probabilities')
        .select('id')
        .eq('item_id', item.id)
        .eq('is_active', true);

      // Check scratch card usage
      const { data: scratchUsage } = await supabase
        .from('scratch_card_probabilities')
        .select('scratch_type')
        .eq('item_id', item.id)
        .eq('is_active', true);

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

  const getImageSize = () => {
    switch (density) {
      case 'compact': return 'w-8 h-8';
      case 'normal': return 'w-10 h-10';
      case 'comfortable': return 'w-12 h-12';
    }
  };

  const getRowPadding = () => {
    switch (density) {
      case 'compact': return 'py-2';
      case 'normal': return 'py-3';
      case 'comfortable': return 'py-4';
    }
  };

  const renderUsageBadges = () => {
    if (loadingUsage) {
      return <Badge variant="outline" className="text-xs">...</Badge>;
    }

    if (usage.totalUsages === 0) {
      return <Badge variant="secondary" className="text-xs">Sem uso</Badge>;
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
            {usage.usedInScratch.length}x
          </Badge>
        )}
      </div>
    );
  };

  return (
    <TableRow className={getRowPadding()}>
      {/* Image + Name + Rarity (Consolidated) */}
      <TableCell className="min-w-[200px]">
        <div className="flex items-center gap-3">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              className={`${getImageSize()} object-cover rounded`}
            />
          ) : (
            <div className={`${getImageSize()} bg-muted rounded flex items-center justify-center`}>
              <Image className="w-4 h-4 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{item.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={`text-white text-xs ${getRarityColor(item.rarity)}`}>
                {item.rarity}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {formatCurrency(item.base_value)}
              </span>
            </div>
          </div>
        </div>
      </TableCell>

      {/* Usage + Chest Assignment (Consolidated) */}
      <TableCell>
        <div className="space-y-2">
          {renderUsageBadges()}
          {density !== 'compact' && (
            <ItemChestAssignment 
              itemId={item.id} 
              onUpdate={() => {
                onUpdate();
                loadItemUsage();
              }}
            />
          )}
        </div>
      </TableCell>

      {/* Status + Actions (Consolidated) */}
      <TableCell>
        <div className="flex items-center justify-between gap-3">
          <Switch
            checked={item.is_active}
            onCheckedChange={() => onToggleActive(item)}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(item)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              {density === 'compact' && (
                <DropdownMenuItem onClick={(e) => e.preventDefault()}>
                  <Package className="h-4 w-4 mr-2" />
                  <ItemChestAssignment 
                    itemId={item.id} 
                    onUpdate={() => {
                      onUpdate();
                      loadItemUsage();
                    }}
                  />
                </DropdownMenuItem>
              )}
              {usage.usedInScratch.length > 0 && (
                <DropdownMenuItem asChild>
                  <a href="/admin?tab=scratch&subtab=items">
                    <Settings className="h-4 w-4 mr-2" />
                    Gerenciar Raspadinhas
                  </a>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                onClick={() => onDelete(item.id, item.name)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default CompactItemTableRow;