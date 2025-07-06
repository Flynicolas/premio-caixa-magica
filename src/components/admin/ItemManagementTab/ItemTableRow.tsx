
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Image } from 'lucide-react';
import { DatabaseItem } from '@/types/database';
import ItemChestAssignment from '../ItemChestAssignment';

interface ItemTableRowProps {
  item: DatabaseItem;
  onEdit: (item: DatabaseItem) => void;
  onDelete: (id: string, name: string) => void;
  onToggleActive: (item: DatabaseItem) => void;
  onUpdate: () => void;
}

const ItemTableRow = ({ item, onEdit, onDelete, onToggleActive, onUpdate }: ItemTableRowProps) => {
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
        <ItemChestAssignment 
          itemId={item.id} 
          onUpdate={onUpdate}
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
