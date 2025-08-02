import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Settings, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useScratchCardManagement } from '@/hooks/useScratchCardManagement';
import { useScratchCardAdministration } from '@/hooks/useScratchCardAdministration';
import { useItemManagement } from '@/hooks/useItemManagement';

export const ScratchCardConfigurationPanel = () => {
  const { items } = useItemManagement();
  const { 
    probabilities, 
    addItemToScratchType, 
    removeItemFromScratchType, 
    updateProbability,
    getProbabilitiesByType,
    getTotalWeight
  } = useScratchCardManagement();
  const { settings } = useScratchCardAdministration();
  
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [isAddingItems, setIsAddingItems] = useState(false);

  // Filtrar itens disponíveis (que não estão no tipo selecionado)
  const getAvailableItems = (scratchType: string) => {
    const configuredItems = getProbabilitiesByType(scratchType).map(p => p.item_id);
    return items.filter(item => !configuredItems.includes(item.id));
  };

  // Sugerir itens baseado no tipo e valor
  const getSuggestedItems = (scratchType: string) => {
    const setting = settings.find(s => s.scratch_type === scratchType);
    if (!setting) return [];

    const maxValue = setting.price * 5; // Máximo 5x o preço da raspadinha
    const minValue = setting.price * 0.1; // Mínimo 10% do preço
    
    return getAvailableItems(scratchType).filter(item => 
      item.base_value >= minValue && item.base_value <= maxValue
    );
  };

  // Adicionar múltiplos itens sugeridos
  const addSuggestedItems = async (scratchType: string) => {
    const suggested = getSuggestedItems(scratchType);
    let added = 0;
    
    setIsAddingItems(true);
    
    for (const item of suggested.slice(0, 10)) { // Adicionar no máximo 10 itens
      try {
        await addItemToScratchType(scratchType, item.id);
        added++;
      } catch (error) {
        console.error(`Erro ao adicionar item ${item.name}:`, error);
      }
    }
    
    setIsAddingItems(false);
    
    if (added > 0) {
      toast.success(`${added} itens adicionados com sucesso!`);
    }
  };

  // Adicionar item individual
  const handleAddItem = async () => {
    if (!selectedType || !selectedItem) {
      toast.error('Selecione um tipo de raspadinha e um item');
      return;
    }

    const success = await addItemToScratchType(selectedType, selectedItem);
    if (success) {
      setSelectedItem('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Configuração de Tipos
          </h2>
          <p className="text-muted-foreground mt-1">
            Configure itens e probabilidades para cada tipo de raspadinha
          </p>
        </div>
      </div>

      {/* Seletor de Tipo */}
      <Card>
        <CardHeader>
          <CardTitle>Selecionar Tipo de Raspadinha</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {settings.map((setting) => {
              const typeProbs = getProbabilitiesByType(setting.scratch_type);
              const isConfigured = typeProbs.length > 0;
              const suggested = getSuggestedItems(setting.scratch_type);
              
              return (
                <Card 
                  key={setting.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedType === setting.scratch_type ? 'ring-2 ring-primary' : ''
                  } ${!isConfigured ? 'border-orange-200' : 'border-green-200'}`}
                  onClick={() => setSelectedType(setting.scratch_type)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{setting.name}</h3>
                      <Badge variant={isConfigured ? 'default' : 'secondary'}>
                        {isConfigured ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
                        {isConfigured ? 'OK' : 'Pendente'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div>Preço: R$ {setting.price.toFixed(2)}</div>
                      <div>Itens: {typeProbs.length}</div>
                      <div>Peso total: {getTotalWeight(setting.scratch_type)}</div>
                      <div>Sugeridos: {suggested.length}</div>
                    </div>

                    {!isConfigured && (
                      <Alert className="mt-2">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          Nenhum item configurado
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Configuração do Tipo Selecionado */}
      {selectedType && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Configurar: {settings.find(s => s.scratch_type === selectedType)?.name}</span>
              <div className="flex gap-2">
                <Button
                  onClick={() => addSuggestedItems(selectedType)}
                  disabled={isAddingItems || getSuggestedItems(selectedType).length === 0}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Sugeridos ({getSuggestedItems(selectedType).length})
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Adicionar Item Manual */}
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="item-select">Adicionar Item</Label>
                <Select value={selectedItem} onValueChange={setSelectedItem}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um item..." />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableItems(selectedType).map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name} - R$ {item.base_value.toFixed(2)} ({item.rarity})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={handleAddItem} disabled={!selectedItem}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            </div>

            {/* Lista de Itens Configurados */}
            <div>
              <Label>Itens Configurados</Label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {getProbabilitiesByType(selectedType).map((prob) => (
                  <div key={prob.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {prob.item?.image_url && (
                        <img 
                          src={prob.item.image_url} 
                          alt={prob.item.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                      )}
                      <div>
                        <div className="font-medium">{prob.item?.name || 'Item não encontrado'}</div>
                        <div className="text-sm text-muted-foreground">
                          R$ {prob.item?.base_value.toFixed(2)} • {prob.item?.rarity}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <Label htmlFor={`weight-${prob.id}`} className="text-xs">Peso</Label>
                        <Input
                          id={`weight-${prob.id}`}
                          type="number"
                          min="1"
                          max="100"
                          value={prob.probability_weight}
                          onChange={(e) => updateProbability(prob.id, parseInt(e.target.value) || 1)}
                          className="w-20 text-center"
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeItemFromScratchType(prob.id, prob.item?.name || 'Item')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {getProbabilitiesByType(selectedType).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum item configurado</p>
                    <p className="text-sm">Adicione itens para começar</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};