
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
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
  const [editingWeight, setEditingWeight] = useState<number>(probability.probability_weight);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const handleWeightChange = (value: number) => {
    // Garantir que o valor esteja entre 0 e 100
    const clampedValue = Math.max(0, Math.min(100, value));
    setEditingWeight(clampedValue);
  };

  const handleSave = () => {
    onUpdateWeight(probability.id, editingWeight);
  };

  const handleConfirmSave = () => {
    onUpdateWeight(probability.id, editingWeight);
  };

  const isExcludedFromDraw = editingWeight === 0;

  return (
    <div className={`flex items-center justify-between p-3 border rounded ${isExcludedFromDraw ? 'border-orange-300 bg-orange-50' : ''}`}>
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
            {isExcludedFromDraw && (
              <Badge variant="outline" className="text-orange-600 border-orange-600 text-xs">
                Apenas Visual
              </Badge>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            R$ {probability.item?.base_value.toFixed(2)} • 
            {isExcludedFromDraw ? 'Excluído do sorteio' : `${probabilityPercentage}% chance`}
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Label className="text-xs">%:</Label>
        <Input
          type="number"
          min="0"
          max="100"
          value={editingWeight}
          onChange={(e) => handleWeightChange(parseInt(e.target.value) || 0)}
          className="w-16 h-8"
          placeholder="0-100"
        />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              disabled={editingWeight === probability.probability_weight}
            >
              Salvar
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar alteração</AlertDialogTitle>
              <AlertDialogDescription>
                Deseja alterar a probabilidade de "{probability.item?.name}" de {probability.probability_weight}% para {editingWeight}%?
                {editingWeight === 0 && (
                  <span className="block mt-2 text-orange-600 font-medium">
                    ⚠️ Com probabilidade 0%, este item será apenas visual na roleta e não poderá ser sorteado.
                  </span>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmSave}>Confirmar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onRemove(probability.id)}
          className="h-8 text-red-600 hover:text-red-700"
        >
          ✕
        </Button>
      </div>
    </div>
  );
};
