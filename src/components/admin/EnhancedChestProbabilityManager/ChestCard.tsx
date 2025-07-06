
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChestItemProbability } from '@/types/database';
import ChestProbabilityItem from './ChestProbabilityItem';

interface ChestCardProps {
  chestType: {
    value: string;
    label: string;
    color: string;
  };
  probabilities: ChestItemProbability[];
  editingProbabilities: Record<string, number>;
  onProbabilityChange: (probId: string, newValue: number) => void;
  onManualRelease: (probId: string, itemName: string) => void;
  onRemoveItem: (probabilityId: string, itemName: string) => void;
}

const ChestCard = ({
  chestType,
  probabilities,
  editingProbabilities,
  onProbabilityChange,
  onManualRelease,
  onRemoveItem
}: ChestCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center space-x-2">
          <Badge className={`text-white ${chestType.color}`}>
            {chestType.label}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {probabilities.length > 0 ? (
            probabilities.map(prob => (
              <ChestProbabilityItem
                key={prob.id}
                probability={prob}
                editingValue={editingProbabilities[prob.id]}
                onProbabilityChange={onProbabilityChange}
                onManualRelease={onManualRelease}
                onRemoveItem={onRemoveItem}
              />
            ))
          ) : (
            <div className="text-center py-6 text-gray-500">
              <p className="text-sm">Nenhum item configurado</p>
              <p className="text-xs">Adicione itens na aba "Itens"</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChestCard;
