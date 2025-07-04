
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatabaseItem, ChestItemProbability } from '@/types/database';
import { ChestProbabilityItem } from './ChestProbabilityItem';

interface ChestConfigurationCardProps {
  chestType: string;
  chestName: string;
  chestPrice: number;
  probabilities: ChestItemProbability[];
  availableItems: DatabaseItem[];
  onAddItem: (itemId: string, chestType: string) => void;
  onUpdateWeight: (probabilityId: string, newWeight: number) => void;
  onRemoveItem: (probabilityId: string) => void;
}

export const ChestConfigurationCard = ({
  chestType,
  chestName,
  chestPrice,
  probabilities,
  availableItems,
  onAddItem,
  onUpdateWeight,
  onRemoveItem
}: ChestConfigurationCardProps) => {
  const calculateTotalWeight = () => {
    return probabilities.reduce((sum, p) => sum + p.probability_weight, 0);
  };

  const getItemProbabilityPercentage = (weight: number) => {
    const total = calculateTotalWeight();
    return total > 0 ? ((weight / total) * 100).toFixed(1) : '0';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">{chestName}</h3>
          <p className="text-sm text-muted-foreground">
            R$ {chestPrice} • {probabilities.length} itens configurados
          </p>
        </div>
        {availableItems.length > 0 && (
          <Select onValueChange={(itemId) => onAddItem(itemId, chestType)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Adicionar item..." />
            </SelectTrigger>
            <SelectContent>
              {availableItems.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name} (R$ {item.base_value.toFixed(2)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="space-y-2">
        {probabilities.map((prob) => (
          <ChestProbabilityItem
            key={prob.id}
            probability={prob}
            probabilityPercentage={getItemProbabilityPercentage(prob.probability_weight)}
            onUpdateWeight={onUpdateWeight}
            onRemove={onRemoveItem}
          />
        ))}
        {probabilities.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhum item configurado para este baú.</p>
            <p className="text-sm">Use o seletor acima para adicionar itens.</p>
          </div>
        )}
      </div>
    </div>
  );
};
