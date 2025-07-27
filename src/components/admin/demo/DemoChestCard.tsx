import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus } from 'lucide-react';

interface DemoProbability {
  item_id: string;
  item_name: string;
  item_image: string | null;
  rarity: string;
  base_value: number;
  probability_weight: number;
}

interface DatabaseItem {
  id: string;
  name: string;
  image_url: string | null;
  rarity: string;
  base_value: number;
  chest_types: string[];
  is_active: boolean;
}

interface ChestType {
  value: string;
  label: string;
  color: string;
  price: number;
}

interface DemoChestCardProps {
  chestType: ChestType;
  probabilities: DemoProbability[];
  availableItems: DatabaseItem[];
  onAddItem: (itemId: string, chestType: string) => void;
  onUpdateWeight: (chestType: string, itemId: string, newWeight: number) => void;
  onRemoveItem: (chestType: string, itemId: string) => void;
  demoSettings: any;
}

const DemoChestCard = ({
  chestType,
  probabilities,
  availableItems,
  onAddItem,
  onUpdateWeight,
  onRemoveItem,
  demoSettings
}: DemoChestCardProps) => {
  const [selectedItemId, setSelectedItemId] = useState<string>('');

  const rarityColors = {
    common: 'bg-gray-500',
    uncommon: 'bg-green-500',
    rare: 'bg-blue-500',
    epic: 'bg-purple-500',
    legendary: 'bg-orange-500'
  };

  const getRarityName = (rarity: string) => {
    const rarityMap: Record<string, string> = {
      common: 'Comum',
      uncommon: 'Incomum',
      rare: 'Raro',
      epic: 'Épico',
      legendary: 'Lendário'
    };
    return rarityMap[rarity] || rarity;
  };

  const calculateTotalWeight = () => {
    return probabilities.reduce((sum, prob) => sum + prob.probability_weight, 0);
  };

  const getItemProbabilityPercentage = (weight: number) => {
    const total = calculateTotalWeight();
    if (total === 0) return '0%';
    return ((weight / total) * 100).toFixed(1) + '%';
  };

  const handleAddItem = () => {
    if (selectedItemId) {
      onAddItem(selectedItemId, chestType.value);
      setSelectedItemId('');
    }
  };

  const chestConfig = demoSettings?.probabilidades_chest?.[chestType.value];
  const winRate = ((chestConfig?.win_rate || 0.8) * 100).toFixed(0);
  const rareRate = ((chestConfig?.rare_rate || 0.3) * 100).toFixed(0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded ${chestType.color}`}></div>
            {chestType.label}
          </div>
          <div className="flex gap-2">
            <Badge variant="outline">R$ {chestType.price.toFixed(2)}</Badge>
            <Badge variant="outline">{probabilities.length} itens</Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Configurações de Taxa */}
        <div className="p-3 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Configurações Demo</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span>Taxa de Vitória:</span>
              <Badge variant="secondary">{winRate}%</Badge>
            </div>
            <div className="flex justify-between">
              <span>Taxa de Raros:</span>
              <Badge variant="secondary">{rareRate}%</Badge>
            </div>
          </div>
        </div>

        {/* Adicionar Item */}
        {availableItems.length > 0 && (
          <div className="flex gap-2">
            <Select value={selectedItemId} onValueChange={setSelectedItemId}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Selecionar item..." />
              </SelectTrigger>
              <SelectContent>
                {availableItems.map(item => (
                  <SelectItem key={item.id} value={item.id}>
                    <div className="flex items-center gap-2">
                      <img 
                        src={item.image_url || '/placeholder.svg'} 
                        alt={item.name}
                        className="w-6 h-6 object-cover rounded"
                      />
                      <span>{item.name}</span>
                      <Badge 
                        className={`text-white text-xs ${rarityColors[item.rarity as keyof typeof rarityColors] || 'bg-gray-500'}`}
                      >
                        {getRarityName(item.rarity)}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={handleAddItem} 
              disabled={!selectedItemId}
              size="sm"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Lista de Itens */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {probabilities.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Nenhum item configurado para este baú
            </p>
          ) : (
            probabilities.map(prob => (
              <div key={prob.item_id} className="flex items-center gap-3 p-3 border rounded-lg">
                <img 
                  src={prob.item_image || '/placeholder.svg'} 
                  alt={prob.item_name}
                  className="w-10 h-10 object-cover rounded"
                />
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{prob.item_name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge 
                      className={`text-white text-xs ${rarityColors[prob.rarity as keyof typeof rarityColors] || 'bg-gray-500'}`}
                    >
                      {getRarityName(prob.rarity)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      R$ {prob.base_value.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">Peso:</span>
                      <Input
                        type="number"
                        value={prob.probability_weight}
                        onChange={(e) => onUpdateWeight(chestType.value, prob.item_id, parseInt(e.target.value) || 0)}
                        className="w-16 h-8 text-xs"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {getItemProbabilityPercentage(prob.probability_weight)}
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRemoveItem(chestType.value, prob.item_id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {probabilities.length > 0 && (
          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            Peso total: {calculateTotalWeight()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DemoChestCard;