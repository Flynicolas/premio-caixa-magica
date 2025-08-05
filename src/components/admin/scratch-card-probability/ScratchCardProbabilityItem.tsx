import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Edit3, Check, X, Percent, Eye } from 'lucide-react';

interface ScratchCardProbabilityItemProps {
  probability: {
    id: string;
    scratch_type: string;
    item_id: string;
    probability_weight: number;
    min_quantity: number;
    max_quantity: number;
    is_active: boolean;
    item?: {
      id: string;
      name: string;
      base_value: number;
      rarity: string;
      image_url?: string;
      category: string;
    } | null;
  };
  editingValue?: number;
  onProbabilityChange: (probId: string, newValue: number) => void;
  onRemoveItem: (probId: string, itemName: string) => void;
  totalWeight: number;
}

const rarityColors = {
  common: 'bg-gray-100 text-gray-800',
  uncommon: 'bg-green-100 text-green-800',
  rare: 'bg-blue-100 text-blue-800',
  epic: 'bg-purple-100 text-purple-800',
  legendary: 'bg-yellow-100 text-yellow-800'
};

const ScratchCardProbabilityItem = ({
  probability,
  editingValue,
  onProbabilityChange,
  onRemoveItem,
  totalWeight
}: ScratchCardProbabilityItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(probability.probability_weight);

  const item = probability.item;
  const currentWeight = editingValue ?? probability.probability_weight;
  const probability_percentage = totalWeight > 0 ? ((currentWeight / totalWeight) * 100) : 0;
  const isExcludedFromDraw = currentWeight === 0;

  const handleSave = () => {
    if (tempValue !== probability.probability_weight) {
      onProbabilityChange(probability.id, tempValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempValue(probability.probability_weight);
    setIsEditing(false);
  };

  if (!item) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
              <span className="text-xs text-muted-foreground">N/A</span>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-destructive">Item não encontrado</h4>
              <p className="text-sm text-muted-foreground">ID: {probability.item_id}</p>
            </div>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onRemoveItem(probability.id, 'Item não encontrado')}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Imagem do item */}
          <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
            {item.image_url ? (
              <img 
                src={item.image_url} 
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                Sem imagem
              </div>
            )}
          </div>

          {/* Informações do item */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium truncate">{item.name}</h4>
              <Badge className={rarityColors[item.rarity as keyof typeof rarityColors] || rarityColors.common}>
                {item.rarity}
              </Badge>
              {isExcludedFromDraw && (
                <Badge variant="outline" className="gap-1 text-xs">
                  <Eye className="w-3 h-3" />
                  Apenas Visual
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>R$ {item.base_value.toFixed(2)}</span>
              <span>•</span>
              <span className="capitalize">{item.category}</span>
            </div>
          </div>

          {/* Probabilidade */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      max="1000"
                      value={tempValue}
                      onChange={(e) => setTempValue(parseInt(e.target.value) || 0)}
                      className="w-20 h-8"
                    />
                    <Button size="sm" variant="ghost" onClick={handleSave}>
                      <Check className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={handleCancel}>
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="font-medium">Peso: {currentWeight}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Percent className="w-3 h-3" />
                        {probability_percentage.toFixed(1)}%
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setTempValue(currentWeight);
                        setIsEditing(true);
                      }}
                    >
                      <Edit3 className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Botão remover */}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onRemoveItem(probability.id, item.name)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Indicador de mudança */}
        {editingValue !== undefined && editingValue !== probability.probability_weight && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                Alteração pendente
              </Badge>
              <span className="text-muted-foreground">
                {probability.probability_weight} → {editingValue}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ScratchCardProbabilityItem;