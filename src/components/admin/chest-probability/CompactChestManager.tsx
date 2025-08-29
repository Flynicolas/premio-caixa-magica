import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DatabaseItem, ChestItemProbability } from '@/types/database';
import { 
  Crown, Archive, Search, Settings, Trash2, Gift, Eye, Plus, 
  TrendingUp, Package, Coins, Filter, RefreshCw 
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ManualReleaseDialog from '../ManualReleaseDialog';
import CompactManualReleaseHistory from './CompactManualReleaseHistory';

interface CompactChestManagerProps {
  items: DatabaseItem[];
  onRefresh: () => void;
}

const CHEST_TYPES = [
  { value: 'silver', label: 'Prata', color: 'hsl(var(--muted-foreground))', bgColor: 'hsl(var(--muted))' },
  { value: 'gold', label: 'Ouro', color: 'hsl(45 93% 47%)', bgColor: 'hsl(45 93% 95%)' },
  { value: 'delas', label: 'Delas', color: 'hsl(142 76% 36%)', bgColor: 'hsl(142 76% 95%)' },
  { value: 'diamond', label: 'Diamante', color: 'hsl(221 83% 53%)', bgColor: 'hsl(221 83% 95%)' },
  { value: 'ruby', label: 'Ruby', color: 'hsl(0 84% 60%)', bgColor: 'hsl(0 84% 95%)' },
  { value: 'premium', label: 'Premium', color: 'hsl(271 91% 65%)', bgColor: 'hsl(271 91% 95%)' }
];

const CompactChestManager = ({ items, onRefresh }: CompactChestManagerProps) => {
  const [probabilities, setProbabilities] = useState<Record<string, ChestItemProbability[]>>({});
  const [editingValues, setEditingValues] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChest, setSelectedChest] = useState<string>('all');
  const [rarityFilter, setRarityFilter] = useState<string>('all');
  const [isCompactView, setIsCompactView] = useState(true);
  const [manualReleaseDialog, setManualReleaseDialog] = useState<{
    isOpen: boolean;
    probabilityId: string;
    itemName: string;
    chestType: string;
  }>({
    isOpen: false,
    probabilityId: '',
    itemName: '',
    chestType: ''
  });
  
  const { toast } = useToast();

  useEffect(() => {
    fetchProbabilities();
    
    const channel = supabase
      .channel('compact-chest-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'chest_item_probabilities' },
        () => fetchProbabilities()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchProbabilities = async () => {
    try {
      const { data, error } = await supabase
        .from('chest_item_probabilities')
        .select(`
          *,
          item:items(*)
        `)
        .eq('is_active', true)
        .order('chest_type')
        .order('probability_weight', { ascending: false });

      if (error) throw error;

      const grouped = (data || []).reduce((acc, prob) => {
        const typedProb: ChestItemProbability = {
          ...prob,
          chest_type: prob.chest_type as 'silver' | 'gold' | 'delas' | 'diamond' | 'ruby' | 'premium',
          item: prob.item ? {
            ...prob.item,
            rarity: prob.item.rarity as 'common' | 'rare' | 'epic' | 'legendary',
            delivery_type: prob.item.delivery_type as 'digital' | 'physical'
          } : undefined
        };

        if (!acc[typedProb.chest_type]) {
          acc[typedProb.chest_type] = [];
        }
        acc[typedProb.chest_type].push(typedProb);
        return acc;
      }, {} as Record<string, ChestItemProbability[]>);

      setProbabilities(grouped);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar probabilidades",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleProbabilityUpdate = async (probId: string, newWeight: number) => {
    try {
      const { error } = await supabase
        .from('chest_item_probabilities')
        .update({ probability_weight: newWeight })
        .eq('id', probId);

      if (error) throw error;

      toast({
        title: "Probabilidade atualizada",
        description: "Peso alterado com sucesso!",
      });

      fetchProbabilities();
      onRefresh();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleManualRelease = (probId: string, itemName: string, chestType: string) => {
    setManualReleaseDialog({
      isOpen: true,
      probabilityId: probId,
      itemName,
      chestType
    });
  };

  const removeItemFromChest = async (probabilityId: string, itemName: string) => {
    if (!confirm(`Remover "${itemName}" do baú?`)) return;

    try {
      const { error } = await supabase
        .from('chest_item_probabilities')
        .update({ is_active: false })
        .eq('id', probabilityId);

      if (error) throw error;

      toast({
        title: "Item removido",
        description: "Item removido do baú com sucesso",
      });

      fetchProbabilities();
      onRefresh();
    } catch (error: any) {
      toast({
        title: "Erro ao remover item",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getChestTypeInfo = (chestType: string) => {
    return CHEST_TYPES.find(t => t.value === chestType) || CHEST_TYPES[0];
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'hsl(var(--muted-foreground))';
      case 'rare': return 'hsl(221 83% 53%)';
      case 'epic': return 'hsl(271 91% 65%)';
      case 'legendary': return 'hsl(25 95% 53%)';
      default: return 'hsl(var(--muted-foreground))';
    }
  };

  // Filtrar dados
  const filteredData = Object.entries(probabilities).reduce((acc, [chestType, items]) => {
    if (selectedChest !== 'all' && chestType !== selectedChest) return acc;
    
    const filtered = items.filter(item => {
      const matchesSearch = item.item?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRarity = rarityFilter === 'all' || item.item?.rarity === rarityFilter;
      return matchesSearch && matchesRarity;
    });
    
    if (filtered.length > 0) {
      acc[chestType] = filtered;
    }
    return acc;
  }, {} as Record<string, ChestItemProbability[]>);

  // Calcular estatísticas rápidas
  const totalItems = Object.values(probabilities).flat().length;
  const totalValue = Object.values(probabilities).flat().reduce((sum, item) => sum + (item.item?.base_value || 0), 0);

  return (
    <div className="space-y-4">
      <Tabs defaultValue="manage" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="grid w-full max-w-[400px] grid-cols-2">
            <TabsTrigger value="manage" className="flex items-center gap-2">
              <Crown className="w-4 h-4" />
              Gerenciar
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Archive className="w-4 h-4" />
              Histórico
            </TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCompactView(!isCompactView)}
            >
              <Package className="w-4 h-4 mr-2" />
              {isCompactView ? 'Expandir' : 'Compactar'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchProbabilities}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <TabsContent value="manage" className="space-y-4">
          {/* Estatísticas Rápidas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Itens</p>
                  <p className="text-2xl font-bold">{totalItems}</p>
                </div>
                <Package className="w-6 h-6 text-primary" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Valor Total</p>
                  <p className="text-2xl font-bold">R$ {totalValue.toFixed(0)}</p>
                </div>
                <Coins className="w-6 h-6 text-primary" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Baús Ativos</p>
                  <p className="text-2xl font-bold">{Object.keys(probabilities).length}</p>
                </div>
                <Crown className="w-6 h-6 text-primary" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Valor Médio</p>
                  <p className="text-2xl font-bold">R$ {totalItems > 0 ? (totalValue / totalItems).toFixed(0) : '0'}</p>
                </div>
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
            </Card>
          </div>

          {/* Filtros */}
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar itens..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedChest} onValueChange={setSelectedChest}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por baú" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Baús</SelectItem>
                  {CHEST_TYPES.map(chest => (
                    <SelectItem key={chest.value} value={chest.value}>
                      {chest.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={rarityFilter} onValueChange={setRarityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por raridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Raridades</SelectItem>
                  <SelectItem value="common">Comum</SelectItem>
                  <SelectItem value="rare">Raro</SelectItem>
                  <SelectItem value="epic">Épico</SelectItem>
                  <SelectItem value="legendary">Lendário</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter className="w-4 h-4" />
                {Object.values(filteredData).flat().length} resultados
              </div>
            </div>
          </Card>

          {/* Tabela Compacta */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Configuração de Probabilidades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Baú</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Raridade</TableHead>
                      <TableHead className="text-center">Peso</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(filteredData).map(([chestType, items]) =>
                      items.map((prob) => {
                        const chestInfo = getChestTypeInfo(chestType);
                        const isExcluded = prob.probability_weight === 0;
                        const editingValue = editingValues[prob.id];
                        
                        return (
                          <TableRow key={prob.id} className={isExcluded ? "opacity-60" : ""}>
                            <TableCell>
                              {prob.item?.image_url && (
                                <img
                                  src={prob.item.image_url}
                                  alt={prob.item.name}
                                  className="w-8 h-8 object-cover rounded border"
                                />
                              )}
                            </TableCell>
                            
                            <TableCell>
                              <div>
                                <div className="font-medium text-sm">{prob.item?.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {prob.item?.category}
                                </div>
                              </div>
                            </TableCell>
                            
                            <TableCell>
                              <Badge 
                                style={{ 
                                  backgroundColor: chestInfo.bgColor,
                                  color: chestInfo.color,
                                  border: `1px solid ${chestInfo.color}`
                                }}
                              >
                                {chestInfo.label}
                              </Badge>
                            </TableCell>
                            
                            <TableCell className="font-medium">
                              R$ {prob.item?.base_value.toFixed(2)}
                            </TableCell>
                            
                            <TableCell>
                              <Badge 
                                variant="outline" 
                                style={{ color: getRarityColor(prob.item?.rarity || 'common') }}
                                className="capitalize text-xs"
                              >
                                {prob.item?.rarity}
                              </Badge>
                            </TableCell>
                            
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-2">
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={editingValue !== undefined ? editingValue : prob.probability_weight}
                                  onChange={(e) => setEditingValues(prev => ({ 
                                    ...prev, 
                                    [prob.id]: parseInt(e.target.value) || 0 
                                  }))}
                                  onBlur={() => {
                                    if (editingValue !== undefined && editingValue !== prob.probability_weight) {
                                      handleProbabilityUpdate(prob.id, editingValue);
                                      setEditingValues(prev => {
                                        const { [prob.id]: _, ...rest } = prev;
                                        return rest;
                                      });
                                    }
                                  }}
                                  className="w-16 h-8 text-center text-xs"
                                />
                                <span className="text-xs text-muted-foreground">%</span>
                              </div>
                            </TableCell>
                            
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {isExcluded ? (
                                  <Badge variant="secondary" className="text-xs">
                                    <Eye className="w-3 h-3 mr-1" />
                                    Visual
                                  </Badge>
                                ) : (
                                  <Badge variant="default" className="text-xs">
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                    Ativo
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            
                            <TableCell>
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleManualRelease(prob.id, prob.item?.name || '', chestType)}
                                  className="h-7 w-7 p-0"
                                  title="Liberar manualmente"
                                >
                                  <Gift className="w-3 h-3" />
                                </Button>
                                
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeItemFromChest(prob.id, prob.item?.name || '')}
                                  className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                  title="Remover item"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {Object.keys(filteredData).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum item encontrado com os filtros aplicados</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <CompactManualReleaseHistory />
        </TabsContent>
      </Tabs>

      <ManualReleaseDialog
        isOpen={manualReleaseDialog.isOpen}
        onClose={() => setManualReleaseDialog(prev => ({ ...prev, isOpen: false }))}
        probabilityId={manualReleaseDialog.probabilityId}
        itemName={manualReleaseDialog.itemName}
        chestType={manualReleaseDialog.chestType}
        onSuccess={() => {
          fetchProbabilities();
          onRefresh();
        }}
      />
    </div>
  );
};

export default CompactChestManager;