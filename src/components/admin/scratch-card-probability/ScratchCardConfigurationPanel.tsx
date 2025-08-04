import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings2, Package, Percent, Save } from 'lucide-react';
import { useScratchCardManagement } from '@/hooks/useScratchCardManagement';
import { scratchCardTypes } from '@/types/scratchCard';
import ScratchCardProbabilityItem from './ScratchCardProbabilityItem';

export function ScratchCardConfigurationPanel() {
  const { 
    scratchTypes,
    probabilities,
    loading,
    addItemToScratchType,
    removeItemFromScratchType,
    updateProbability,
    getProbabilitiesByType,
    getTotalWeight
  } = useScratchCardManagement();
  
  const [editingProbabilities, setEditingProbabilities] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);

  const handleProbabilityChange = (probId: string, newValue: number) => {
    setEditingProbabilities(prev => ({
      ...prev,
      [probId]: newValue
    }));
  };

  const saveProbabilities = async () => {
    try {
      setSaving(true);
      
      const updates = Object.entries(editingProbabilities);
      if (updates.length === 0) return;

      for (const [id, weight] of updates) {
        await updateProbability(id, weight);
      }

      setEditingProbabilities({});
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando configurações...</div>
        </CardContent>
      </Card>
    );
  }

  // Usar os tipos do banco de dados quando disponíveis, senão usar os do frontend
  const availableTypes = scratchTypes.length > 0 
    ? scratchTypes.map(st => ({
        value: st.scratch_type,
        label: st.name,
        price: st.price,
        color: scratchCardTypes[st.scratch_type as keyof typeof scratchCardTypes]?.bgColor || 'bg-gray-500'
      }))
    : Object.entries(scratchCardTypes).map(([key, config]) => ({
        value: key,
        label: config.name,
        price: config.price,
        color: config.bgColor
      }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Package className="w-6 h-6" />
            Configuração de Itens e Probabilidades
          </h2>
          <p className="text-muted-foreground">
            Gerencie itens e suas probabilidades para cada tipo de raspadinha
          </p>
        </div>
        
        {Object.keys(editingProbabilities).length > 0 && (
          <Button 
            onClick={saveProbabilities}
            disabled={saving}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            Salvar Alterações ({Object.keys(editingProbabilities).length})
          </Button>
        )}
      </div>

      {/* Tabs por tipo de raspadinha */}
      <Tabs defaultValue={availableTypes[0]?.value} className="w-full">
        <TabsList className="grid w-full grid-cols-6 mb-6">
          {availableTypes.map((type) => (
            <TabsTrigger key={type.value} value={type.value} className="gap-2">
              <div className={`w-3 h-3 rounded-full ${type.color}`} />
              <span className="hidden sm:inline">{type.label}</span>
              <span className="sm:hidden">{type.value.toUpperCase()}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {availableTypes.map((type) => {
          const typeProbs = getProbabilitiesByType(type.value);
          const totalWeight = getTotalWeight(type.value);
          
          return (
            <TabsContent key={type.value} value={type.value}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${type.color}`} />
                      {type.label}
                      <Badge variant="outline">
                        R$ {type.price.toFixed(2)}
                      </Badge>
                    </CardTitle>
                    
                    <div className="flex items-center gap-3">
                      <Badge className="bg-blue-100 text-blue-800">
                        <Percent className="w-3 h-3 mr-1" />
                        {typeProbs.length} itens
                      </Badge>
                      <Badge className="bg-green-100 text-green-800">
                        Peso Total: {totalWeight}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {typeProbs.length > 0 ? (
                    <div className="space-y-3">
                      {typeProbs.map(prob => (
                        <ScratchCardProbabilityItem
                          key={prob.id}
                          probability={prob}
                          editingValue={editingProbabilities[prob.id]}
                          onProbabilityChange={handleProbabilityChange}
                          onRemoveItem={removeItemFromScratchType}
                          totalWeight={totalWeight}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>Nenhum item configurado para {type.label}</p>
                      <p className="text-sm">Use o dashboard principal para adicionar itens</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}