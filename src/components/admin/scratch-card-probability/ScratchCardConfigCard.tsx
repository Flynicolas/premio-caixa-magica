import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DatabaseItem } from '@/types/database';
import { ScratchCardType } from '@/types/scratchCard';
import { Plus, Trash2, Edit3 } from 'lucide-react';

interface ScratchCardProbability {
  id: string;
  item_id: string;
  scratch_type: ScratchCardType;
  probability_weight: number;
  min_quantity: number;
  max_quantity: number;
  is_active: boolean;
  item?: DatabaseItem;
}

interface ScratchCardConfigCardProps {
  scratchType: ScratchCardType;
  config: {
    name: string;
    price: number;
    color: string;
    bgColor: string;
    textColor: string;
  };
  probabilities: ScratchCardProbability[];
  availableItems: DatabaseItem[];
  editingProbabilities: Record<string, number>;
  onProbabilityChange: (probId: string, newValue: number) => void;
  onAddItem: (itemId: string, scratchType: ScratchCardType, weight: number) => void;
  onRemoveItem: (probabilityId: string, itemName: string) => void;
}

const ScratchCardConfigCard = ({
  scratchType,
  config,
  probabilities,
  availableItems,
  editingProbabilities,
  onProbabilityChange,
  onAddItem,
  onRemoveItem
}: ScratchCardConfigCardProps) => {
  const [showAddItem, setShowAddItem] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [newWeight, setNewWeight] = useState<number>(1);

  const handleAddItem = () => {
    if (selectedItemId && newWeight > 0) {
      onAddItem(selectedItemId, scratchType, newWeight);
      setSelectedItemId('');
      setNewWeight(1);
      setShowAddItem(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const totalWeight = probabilities.reduce((sum, prob) => 
    sum + (editingProbabilities[prob.id] ?? prob.probability_weight), 0
  );

  const calculateProbability = (weight: number) => {
    if (totalWeight === 0) return 0;
    return ((weight / totalWeight) * 100);
  };

  // Filtrar itens disponíveis (que não estão já nesta raspadinha)
  const usedItemIds = probabilities.map(p => p.item_id);
  const filteredItems = availableItems.filter(item => 
    !usedItemIds.includes(item.id) && item.is_active
  );

  return (
    <Card className="h-fit">
      <CardHeader className={`${config.bgColor} text-white rounded-t-lg`}>
        <CardTitle className="text-lg font-bold">
          {config.name}
        </CardTitle>
        <div className="text-sm opacity-90">
          R$ {config.price.toFixed(2)} | {probabilities.length} itens
        </div>
      </CardHeader>
      
      <CardContent className="p-4 space-y-4">
        {/* Adicionar novo item */}
        <div className="border-b pb-4">
          {!showAddItem ? (
            <Button
              onClick={() => setShowAddItem(true)}
              size="sm"
              variant="outline"
              className="w-full"
              disabled={filteredItems.length === 0}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Item
            </Button>
          ) : (
            <div className="space-y-2">
              <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar item..." />
                </SelectTrigger>
                <SelectContent>
                  {filteredItems.map(item => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} - {item.rarity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Peso"
                  value={newWeight}
                  onChange={(e) => setNewWeight(Number(e.target.value))}
                  min="1"
                  className="flex-1"
                />
                <Button onClick={handleAddItem} size="sm" disabled={!selectedItemId}>
                  Adicionar
                </Button>
                <Button onClick={() => setShowAddItem(false)} size="sm" variant="outline">
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Lista de itens */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {probabilities.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Nenhum item configurado
            </div>
          ) : (
            probabilities.map((prob) => {
              const currentWeight = editingProbabilities[prob.id] ?? prob.probability_weight;
              const probability = calculateProbability(currentWeight);
              
              return (
                <div
                  key={prob.id}
                  className="flex items-center gap-2 p-2 border rounded-lg bg-muted/30"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm truncate">
                        {prob.item?.name || 'Item não encontrado'}
                      </span>
                      <Badge
                        className={`${getRarityColor(prob.item?.rarity || 'common')} text-white text-xs`}
                      >
                        {prob.item?.rarity}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Edit3 className="w-3 h-3" />
                        <Input
                          type="number"
                          value={currentWeight}
                          onChange={(e) => onProbabilityChange(prob.id, Number(e.target.value))}
                          className="w-16 h-6 text-xs"
                          min="0"
                        />
                      </div>
                      
                      <span className="text-xs text-muted-foreground">
                        {probability.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => onRemoveItem(prob.id, prob.item?.name || 'Item')}
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              );
            })
          )}
        </div>

        {/* Resumo */}
        {probabilities.length > 0 && (
          <div className="border-t pt-4">
            <div className="text-sm text-muted-foreground">
              Total de peso: {totalWeight}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ScratchCardConfigCard;