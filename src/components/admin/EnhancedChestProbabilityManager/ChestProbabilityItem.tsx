
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Unlock } from 'lucide-react';
import { ChestItemProbability } from '@/types/database';

interface ChestProbabilityItemProps {
  probability: ChestItemProbability;
  editingValue?: number;
  onProbabilityChange: (probId: string, newValue: number) => void;
  onManualRelease: (probId: string, itemName: string) => void;
  onRemoveItem: (probabilityId: string, itemName: string) => void;
}

const ChestProbabilityItem = ({
  probability,
  editingValue,
  onProbabilityChange,
  onManualRelease,
  onRemoveItem
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

  const currentValue = editingValue ?? probability.probability_weight;
  const isExcludedFromDraw = currentValue === 0;

  return (
    <div className={`border rounded-lg p-3 space-y-2 ${isExcludedFromDraw ? 'border-orange-300 bg-orange-50' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {probability.item?.image_url && (
            <img
              src={probability.item.image_url}
              alt={probability.item.name}
              className="w-8 h-8 object-cover rounded"
            />
          )}
          <div>
            <div className="flex items-center space-x-2">
              <div className="font-medium text-sm">{probability.item?.name}</div>
              <Badge className={`text-white ${getRarityColor(probability.item?.rarity || 'common')} text-xs`}>
                {probability.item?.rarity}
              </Badge>
              {isExcludedFromDraw && (
                <Badge variant="outline" className="text-orange-600 border-orange-600 text-xs">
                  Apenas Visual
                </Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              R$ {probability.item?.base_value.toFixed(2)} • 
              {isExcludedFromDraw ? 'Excluído do sorteio' : `${currentValue}% chance`}
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemoveItem(probability.id, probability.item?.name || '')}
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
            min="0"
            max="100"
            value={currentValue}
            onChange={(e) => onProbabilityChange(probability.id, parseInt(e.target.value) || 0)}
            className="w-16 h-6 text-xs"
            placeholder="0-100"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Button
            size="sm"
            variant={probability.liberado_manual ? "secondary" : "outline"}
            onClick={() => onManualRelease(probability.id, probability.item?.name || '')}
            disabled={probability.liberado_manual}
            className="text-xs"
          >
            <Unlock className="w-3 h-3 mr-1" />
            {probability.liberado_manual ? 'Liberado' : 'Liberar'}
          </Button>
          
          {probability.sorteado_em && (
            <span className="text-xs text-green-600">
              Sorteado
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChestProbabilityItem;
