
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ChestItemProbability } from '@/types/database';

interface ChestProbabilityItemProps {
  probability: ChestItemProbability;
  probabilityPercentage: string;
  onUpdateWeight: (probabilityId: string, newWeight: number) => void;
  onRemove: (probabilityId: string) => void;
}

export const ChestProbabilityItem = ({
  probability,
  probabilityPercentage,
  onUpdateWeight,
  onRemove
}: ChestProbabilityItemProps) => {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="flex items-center justify-between p-3 border rounded">
      <div className="flex items-center space-x-3">
        {probability.item?.image_url && (
          <img
            src={probability.item.image_url}
            alt={probability.item.name}
            className="w-8 h-8 object-cover rounded"
          />
        )}
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-medium">{probability.item?.name}</span>
            <Badge className={`text-white text-xs ${getRarityColor(probability.item?.rarity || 'common')}`}>
              {probability.item?.rarity}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground">
            R$ {probability.item?.base_value.toFixed(2)} • 
            {probabilityPercentage}% chance
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Label className="text-xs">Peso:</Label>
        <Input
          type="number"
          min="1"
          max="100"
          value={probability.probability_weight}
          onChange={(e) => {
            const newWeight = parseInt(e.target.value) || 1;
            onUpdateWeight(probability.id, newWeight);
          }}
          className="w-16 h-8"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => onRemove(probability.id)}
          className="h-8"
        >
          ✕
        </Button>
      </div>
    </div>
  );
};
