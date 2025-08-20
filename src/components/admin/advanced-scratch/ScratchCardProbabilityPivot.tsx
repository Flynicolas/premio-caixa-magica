import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Save, Plus, Trash2, Upload, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProbabilityItem {
  id: string;
  scratch_type: string;
  item_id: string;
  item_name: string;
  item_image_url?: string;
  item_category: string;
  item_rarity: string;
  probability_weight: number;
  min_quantity: number;
  max_quantity: number;
  active: boolean;
  amount?: number; // Para itens de dinheiro
}

export const ScratchCardProbabilityPivot: React.FC = () => {
  const [probabilities, setProbabilities] = useState<ProbabilityItem[]>([]);
  const [selectedScratchType, setSelectedScratchType] = useState<string>('');
  const [scratchTypes, setScratchTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItems, setEditingItems] = useState<Set<string>>(new Set());

  const loadData = async () => {
    try {
      setLoading(true);

      // Carregar tipos de raspadinha
      const { data: scratchData, error: scratchError } = await supabase
        .from('scratch_card_settings')
        .select('scratch_type')
        .eq('is_active', true);

      if (scratchError) throw scratchError;

      const types = scratchData?.map(s => s.scratch_type) || [];
      setScratchTypes(types);

      if (types.length > 0 && !selectedScratchType) {
        setSelectedScratchType(types[0]);
      }

      // Carregar probabilidades com dados dos itens
      if (selectedScratchType) {
        const { data: probData, error: probError } = await supabase
          .from('scratch_card_probabilities')
          .select(`
            *,
            items:item_id (
              name,
              image_url,
              category,
              rarity,
              base_value
            )
          `)
          .eq('scratch_type', selectedScratchType)
          .eq('active', true);

        if (probError) throw probError;

        const formattedData = probData?.map((prob: any) => ({
          id: prob.id,
          scratch_type: prob.scratch_type,
          item_id: prob.item_id,
          item_name: prob.items?.name || 'Item Desconhecido',
          item_image_url: prob.items?.image_url,
          item_category: prob.items?.category || 'unknown',
          item_rarity: prob.items?.rarity || 'common',
          probability_weight: prob.probability_weight || 0,
          min_quantity: prob.min_quantity || 0,
          max_quantity: prob.max_quantity || 0,
          active: prob.active || false,
          amount: prob.items?.base_value || 0
        })) || [];

        setProbabilities(formattedData);
      }

    } catch (error) {
      console.error('Erro ao carregar probabilidades:', error);
      toast.error('Erro ao carregar dados de probabilidades');
    } finally {
      setLoading(false);
    }
  };

  const updateProbability = async (probId: string, field: string, value: any) => {
    try {
      const { error } = await supabase
        .from('scratch_card_probabilities')
        .update({ [field]: value })
        .eq('id', probId);

      if (error) throw error;

      // Atualizar estado local
      setProbabilities(prev => prev.map(prob => 
        prob.id === probId ? { ...prob, [field]: value } : prob
      ));

      toast.success('Probabilidade atualizada');
    } catch (error) {
      console.error('Erro ao atualizar probabilidade:', error);
      toast.error('Erro ao atualizar probabilidade');
    }
  };

  const calculateTotalWeight = () => {
    return probabilities.reduce((sum, prob) => sum + prob.probability_weight, 0);
  };

  const calculateProbabilityPercentage = (weight: number) => {
    const totalWeight = calculateTotalWeight();
    return totalWeight > 0 ? ((weight / totalWeight) * 100).toFixed(2) : '0.00';
  };

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: 'bg-gray-100 text-gray-800',
      uncommon: 'bg-green-100 text-green-800',
      rare: 'bg-blue-100 text-blue-800',
      epic: 'bg-purple-100 text-purple-800',
      legendary: 'bg-yellow-100 text-yellow-800'
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  };

  useEffect(() => {
    loadData();
  }, [selectedScratchType]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Probabilidades por Raspadinha</CardTitle>
            <div className="flex items-center gap-3">
              <Select value={selectedScratchType} onValueChange={setSelectedScratchType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Selecione uma raspadinha" />
                </SelectTrigger>
                <SelectContent>
                  {scratchTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Importar CSV
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {selectedScratchType && (
            <>
              <div className="mb-4 p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span>Total de Itens: {probabilities.length}</span>
                  <span>Peso Total: {calculateTotalWeight()}</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Raridade</TableHead>
                      <TableHead>Peso</TableHead>
                      <TableHead>Probabilidade (%)</TableHead>
                      <TableHead>Qtd Mín</TableHead>
                      <TableHead>Qtd Máx</TableHead>
                      <TableHead>Valor (R$)</TableHead>
                      <TableHead>Ativo</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {probabilities.map((prob) => (
                      <TableRow key={prob.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {prob.item_image_url && (
                              <img 
                                src={prob.item_image_url} 
                                alt={prob.item_name}
                                className="w-8 h-8 rounded object-cover"
                              />
                            )}
                            <span className="font-medium">{prob.item_name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {prob.item_category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRarityColor(prob.item_rarity)}>
                            {prob.item_rarity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.0001"
                            value={prob.probability_weight}
                            onChange={(e) => updateProbability(prob.id, 'probability_weight', parseFloat(e.target.value) || 0)}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm">
                            {calculateProbabilityPercentage(prob.probability_weight)}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={prob.min_quantity}
                            onChange={(e) => updateProbability(prob.id, 'min_quantity', parseInt(e.target.value) || 0)}
                            className="w-16"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={prob.max_quantity}
                            onChange={(e) => updateProbability(prob.id, 'max_quantity', parseInt(e.target.value) || 0)}
                            className="w-16"
                          />
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm">
                            {prob.amount ? `R$ ${prob.amount.toFixed(2)}` : '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={prob.active}
                            onCheckedChange={(checked) => updateProbability(prob.id, 'active', checked)}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // Implementar remoção
                              updateProbability(prob.id, 'active', false);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {probabilities.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhum item configurado para esta raspadinha.</p>
                  <Button className="mt-4" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Item
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};