
import React, { useState } from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { DatabaseItem } from '@/types/database';
import EditableItemField from '../EditableItemField';

interface ItemTableRowProps {
  item: DatabaseItem;
  onUpdate: (id: string, updates: Partial<DatabaseItem>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onEdit: (item: DatabaseItem) => void;
}

const ItemTableRow: React.FC<ItemTableRowProps> = ({
  item,
  onUpdate,
  onDelete,
  onEdit
}) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async (field: string, value: any) => {
    setIsUpdating(true);
    try {
      await onUpdate(item.id, { [field]: value });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleActive = async () => {
    await handleUpdate('is_active', !item.is_active);
  };

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: 'bg-gray-500',
      rare: 'bg-blue-500',
      epic: 'bg-purple-500',
      legendary: 'bg-orange-500',
      special: 'bg-pink-500'
    };
    return colors[rarity as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <TableRow className={`${!item.is_active ? 'opacity-60' : ''} hover:bg-muted/50`}>
      {/* Image */}
      <TableCell className="p-2 sm:p-4">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-lg overflow-hidden flex items-center justify-center">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-xs text-muted-foreground text-center">
              Sem imagem
            </div>
          )}
        </div>
      </TableCell>

      {/* Name */}
      <TableCell className="p-2 sm:p-4 min-w-0">
        <EditableItemField
          value={item.name}
          onSave={(value) => handleUpdate('name', value)}
          disabled={isUpdating}
          fieldName="Nome"
          className="font-medium truncate"
        />
      </TableCell>

      {/* Category */}
      <TableCell className="p-2 sm:p-4 hidden md:table-cell">
        <Badge variant="outline" className="text-xs">
          {item.category}
        </Badge>
      </TableCell>

      {/* Rarity */}
      <TableCell className="p-2 sm:p-4">
        <Badge className={`text-white text-xs ${getRarityColor(item.rarity)}`}>
          {item.rarity}
        </Badge>
      </TableCell>

      {/* Value */}
      <TableCell className="p-2 sm:p-4">
        <EditableItemField
          value={item.base_value.toString()}
          onSave={(value) => handleUpdate('base_value', parseFloat(value))}
          disabled={isUpdating}
          type="number"
          fieldName="Preço"
          className="text-right"
          prefix="R$ "
        />
      </TableCell>

      {/* Delivery Type */}
      <TableCell className="p-2 sm:p-4 hidden lg:table-cell">
        <Badge variant={item.delivery_type === 'physical' ? 'default' : 'secondary'} className="text-xs">
          {item.delivery_type === 'physical' ? 'Físico' : 'Digital'}
        </Badge>
      </TableCell>

      {/* Status */}
      <TableCell className="p-2 sm:p-4 hidden sm:table-cell">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleActive}
          disabled={isUpdating}
          className="h-8 w-8 p-0 touch-manipulation"
          style={{ minHeight: '44px', minWidth: '44px' }}
        >
          {item.is_active ? (
            <Eye className="h-4 w-4 text-green-600" />
          ) : (
            <EyeOff className="h-4 w-4 text-red-600" />
          )}
        </Button>
      </TableCell>

      {/* Actions */}
      <TableCell className="p-2 sm:p-4">
        <div className="flex space-x-1 sm:space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(item)}
            className="h-8 w-8 p-0 touch-manipulation"
            style={{ minHeight: '44px', minWidth: '44px' }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(item.id)}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 touch-manipulation"
            style={{ minHeight: '44px', minWidth: '44px' }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default ItemTableRow;
